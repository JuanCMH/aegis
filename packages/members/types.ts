import type { Doc, Id } from "@/convex/_generated/dataModel";

export type MemberRoleType = "admin" | "member" | "custom";

export type MemberRow = Doc<"members"> & {
  isOwner: boolean;
  user: {
    _id: Id<"users">;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  customRole: { _id: Id<"roles">; name: string } | null;
};

export type PendingInvitation = Doc<"invitations"> & {
  isExpired: boolean;
  inviter: {
    _id: Id<"users">;
    name: string | null;
    email: string | null;
  } | null;
  customRole: { _id: Id<"roles">; name: string } | null;
};

export type PublicInvitation = {
  _id: Id<"invitations">;
  email: string;
  roleType: MemberRoleType;
  customRole: { _id: Id<"roles">; name: string } | null;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: number;
  isExpired: boolean;
  company: {
    _id: Id<"companies">;
    name: string;
    logo: Id<"_storage"> | null;
    primaryColor: string | null;
  };
};
