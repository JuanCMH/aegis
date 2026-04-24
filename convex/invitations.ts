import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { Resend as ResendAPI } from "resend";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalQuery,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { checkPermission, populateMember } from "./roles";
import { invitationErrors } from "./errors/invitations";

const INVITATION_TTL_DAYS = 7;
const TOKEN_LENGTH = 32;
const TOKEN_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};

const generateToken = () =>
  generateRandomString(random, TOKEN_ALPHABET, TOKEN_LENGTH);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const roleArgValidator = v.union(
  v.literal("admin"),
  v.literal("member"),
  v.literal("custom"),
);

/* --------------------------------- Queries -------------------------------- */

/**
 * List pending invitations for a company. Requires `members_view`.
 * Expired invitations are returned with status `"pending"` — UI should
 * compare `expiresAt` to now and render them as expired.
 */
export const getPendingByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "members_view",
    });
    if (!allowed) return [];

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("companyId_status", (q) =>
        q.eq("companyId", args.companyId).eq("status", "pending"),
      )
      .collect();

    const populated = await Promise.all(
      invitations.map(async (inv) => {
        const [inviter, customRole] = await Promise.all([
          ctx.db.get(inv.invitedBy),
          inv.customRoleId
            ? ctx.db.get(inv.customRoleId)
            : Promise.resolve(null),
        ]);
        return {
          ...inv,
          isExpired: inv.expiresAt < Date.now(),
          inviter: inviter
            ? {
                _id: inviter._id,
                name: inviter.name ?? null,
                email: inviter.email ?? null,
              }
            : null,
          customRole: customRole
            ? { _id: customRole._id, name: customRole.name }
            : null,
        };
      }),
    );

    return populated.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** Public — resolves an invitation token to its (safe) public data. */
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("token", (q) => q.eq("token", args.token))
      .unique();
    if (!invitation) return null;

    const company = await ctx.db.get(invitation.companyId);
    if (!company) return null;

    const customRole = invitation.customRoleId
      ? await ctx.db.get(invitation.customRoleId)
      : null;

    return {
      _id: invitation._id,
      email: invitation.email,
      roleType: invitation.roleType,
      customRole: customRole
        ? { _id: customRole._id, name: customRole.name }
        : null,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      isExpired:
        invitation.status === "pending" && invitation.expiresAt < Date.now(),
      company: {
        _id: company._id,
        name: company.name,
        logo: company.logo ?? null,
        primaryColor: company.primaryColor ?? null,
      },
    };
  },
});

/* -------------------------------- Mutations ------------------------------- */

/**
 * Create an invitation. Generates a unique token, persists row, and
 * (optionally) schedules an email send when `AEGIS_SEND_INVITATIONS=true`.
 * Returns the token so the caller UI can render a copyable link immediately.
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    email: v.string(),
    roleType: roleArgValidator,
    customRoleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(invitationErrors.unauthorized);

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "members_invite",
    });
    if (!allowed) throw new ConvexError(invitationErrors.permissionDenied);

    const email = normalizeEmail(args.email);
    const self = await ctx.db.get(userId);
    if (self?.email && normalizeEmail(self.email) === email)
      throw new ConvexError(invitationErrors.cannotInviteSelf);

    // Already a member?
    const existingMember = await findMemberByEmail(ctx, args.companyId, email);
    if (existingMember) throw new ConvexError(invitationErrors.alreadyMember);

    // Pending invitation already exists?
    const existing = await ctx.db
      .query("invitations")
      .withIndex("companyId_email", (q) =>
        q.eq("companyId", args.companyId).eq("email", email),
      )
      .collect();
    const hasPending = existing.some(
      (inv) => inv.status === "pending" && inv.expiresAt > Date.now(),
    );
    if (hasPending) throw new ConvexError(invitationErrors.alreadyExists);

    if (args.roleType === "custom") {
      if (!args.customRoleId)
        throw new ConvexError(invitationErrors.customRoleMismatch);
      const customRole = await ctx.db.get(args.customRoleId);
      if (!customRole || customRole.companyId !== args.companyId)
        throw new ConvexError(invitationErrors.customRoleMismatch);
    }

    const token = generateToken();
    const expiresAt = Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000;

    const invitationId = await ctx.db.insert("invitations", {
      companyId: args.companyId,
      email,
      roleType: args.roleType,
      customRoleId: args.roleType === "custom" ? args.customRoleId : undefined,
      token,
      invitedBy: userId,
      status: "pending",
      expiresAt,
    });

    if (process.env.AEGIS_SEND_INVITATIONS === "true") {
      await ctx.scheduler.runAfter(0, internal.invitations.sendEmail, {
        invitationId,
      });
    }

    return { invitationId, token };
  },
});

/** Accept an invitation by token. Requires auth + matching email. */
export const accept = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(invitationErrors.unauthorized);

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("token", (q) => q.eq("token", args.token))
      .unique();
    if (!invitation) throw new ConvexError(invitationErrors.invalidToken);

    if (invitation.status === "accepted")
      throw new ConvexError(invitationErrors.alreadyAccepted);
    if (invitation.status === "revoked")
      throw new ConvexError(invitationErrors.revoked);
    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new ConvexError(invitationErrors.expired);
    }

    const user = await ctx.db.get(userId);
    if (!user?.email) throw new ConvexError(invitationErrors.emailMismatch);
    if (normalizeEmail(user.email) !== invitation.email)
      throw new ConvexError(invitationErrors.emailMismatch);

    // Already a member? Mark accepted + return.
    const existing = await populateMember(ctx, userId, invitation.companyId);
    if (existing) {
      await ctx.db.patch(invitation._id, {
        status: "accepted",
        acceptedAt: Date.now(),
        acceptedBy: userId,
      });
      return invitation.companyId;
    }

    await ctx.db.insert("members", {
      userId,
      companyId: invitation.companyId,
      role: invitation.roleType === "admin" ? "admin" : "member",
      customRoleId:
        invitation.roleType === "custom" ? invitation.customRoleId : undefined,
    });

    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      acceptedBy: userId,
    });

    return invitation.companyId;
  },
});

/** Revoke a pending invitation. Admin or `invitations_revoke`. */
export const revoke = mutation({
  args: { id: v.id("invitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(invitationErrors.unauthorized);

    const invitation = await ctx.db.get(args.id);
    if (!invitation) throw new ConvexError(invitationErrors.notFound);

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: invitation.companyId,
      permission: "invitations_revoke",
    });
    if (!allowed) throw new ConvexError(invitationErrors.permissionDenied);

    if (invitation.status !== "pending")
      throw new ConvexError(invitationErrors.alreadyAccepted);

    await ctx.db.patch(args.id, { status: "revoked" });
    return args.id;
  },
});

/** Regenerate token & expiry. Triggers another email if env flag is on. */
export const resend = mutation({
  args: { id: v.id("invitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(invitationErrors.unauthorized);

    const invitation = await ctx.db.get(args.id);
    if (!invitation) throw new ConvexError(invitationErrors.notFound);

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: invitation.companyId,
      permission: "members_invite",
    });
    if (!allowed) throw new ConvexError(invitationErrors.permissionDenied);

    if (invitation.status === "accepted")
      throw new ConvexError(invitationErrors.alreadyAccepted);
    if (invitation.status === "revoked")
      throw new ConvexError(invitationErrors.revoked);

    const token = generateToken();
    const expiresAt = Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.id, {
      token,
      expiresAt,
      status: "pending",
    });

    if (process.env.AEGIS_SEND_INVITATIONS === "true") {
      await ctx.scheduler.runAfter(0, internal.invitations.sendEmail, {
        invitationId: args.id,
      });
    }

    return { invitationId: args.id, token };
  },
});

/* --------------------------- Email (Internal Action) --------------------- */

export const sendEmail = internalAction({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.runQuery(internal.invitations._getForEmail, {
      id: args.invitationId,
    });
    if (!invitation) return;

    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) return;

    const siteUrl = process.env.AEGIS_SITE_URL ?? process.env.SITE_URL ?? "";
    const link = `${siteUrl}/auth?invitation=${invitation.token}`;

    const resend = new ResendAPI(apiKey);
    await resend.emails.send({
      from: "Aegis <aegis@n3xus.cloud>",
      to: [invitation.email],
      subject: `Has sido invitado a ${invitation.companyName} en Aegis`,
      html: renderInviteEmail({
        companyName: invitation.companyName,
        inviterName: invitation.inviterName,
        link,
      }),
    });
  },
});

/** Internal helper — denormalized payload for the email action. */
export const _getForEmail = internalQuery({
  args: { id: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.id);
    if (!invitation) return null;
    const [company, inviter] = await Promise.all([
      ctx.db.get(invitation.companyId),
      ctx.db.get(invitation.invitedBy),
    ]);
    return {
      email: invitation.email,
      token: invitation.token,
      companyName: company?.name ?? "tu agencia",
      inviterName: inviter?.name ?? inviter?.email ?? "Un administrador",
    };
  },
});

/* --------------------------------- Helpers -------------------------------- */

async function findMemberByEmail(
  ctx: QueryCtx,
  companyId: Id<"companies">,
  email: string,
) {
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();
  if (!user) return null;
  return await populateMember(ctx, user._id, companyId);
}

function renderInviteEmail(args: {
  companyName: string;
  inviterName: string;
  link: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111827;">
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px; color: #0D1F3C;">
        Te han invitado a unirte a ${args.companyName}
      </h1>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        ${args.inviterName} te ha invitado a colaborar en <strong>${args.companyName}</strong> a través de Aegis, el instrumento de trabajo de los profesionales del riesgo.
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Haz clic en el botón para aceptar la invitación. El enlace expira en 7 días.
      </p>
      <p style="margin: 0 0 32px;">
        <a href="${args.link}" style="display: inline-block; background: #1E5FD8; color: #fff; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
          Aceptar invitación
        </a>
      </p>
      <p style="font-size: 12px; line-height: 1.6; color: #4B5563; margin: 0;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
        <span style="word-break: break-all;">${args.link}</span>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;"/>
      <p style="font-size: 11px; color: #6b7280; margin: 0;">
        Si no esperabas esta invitación, puedes ignorar este mensaje.
      </p>
    </div>
  `;
}
