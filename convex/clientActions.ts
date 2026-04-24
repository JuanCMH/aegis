"use node";

import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { clientAgent } from "./agents";
import { clientErrors } from "./errors/clients";

type FieldDescriptor = {
  id: string;
  type: string;
  label: string;
  config?: { options?: Array<{ label: string; value: string }> };
};

type SectionDescriptor = {
  label: string;
  fields: FieldDescriptor[];
};

function describeFields(sections: SectionDescriptor[]): string {
  return sections
    .flatMap((s) => s.fields)
    .map((f) => {
      let desc = `- "${f.id}" (${f.type}): ${f.label}`;
      if (f.type === "select" && f.config?.options?.length) {
        const opts = f.config.options.map((o) => o.value).join(", ");
        desc += ` [opciones: ${opts}]`;
      }
      return desc;
    })
    .join("\n");
}

/**
 * Extract client data from a document using the template field definitions.
 * Receives the document text + template sections, returns a JSON string
 * with field_id → extracted value mappings.
 */
export const extractFromDoc = action({
  args: {
    companyId: v.id("companies"),
    prompt: v.string(),
    templateSections: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const canUseAI = await ctx.runQuery(api.roles.hasPermission, {
      companyId: args.companyId,
      permission: "clients_useAI",
    });
    if (!canUseAI) throw new ConvexError(clientErrors.permissionDenied);

    const fieldsDescription = describeFields(
      args.templateSections as SectionDescriptor[],
    );

    const fullPrompt = `
TASK: Extract client data from the following document text.

TEMPLATE FIELDS:
${fieldsDescription}

DOCUMENT TEXT:
${args.prompt}

OUTPUT: Return a JSON object where keys are field IDs and values are the extracted data.
Only include fields where you found relevant data. Use null for fields you're unsure about.
For date fields, use ISO 8601 format (YYYY-MM-DD).
For currency/number fields, use numbers only (no symbols).
For switch fields, use true/false.
    `;

    const { thread } = await clientAgent.createThread(ctx);
    const result = await thread.generateText({ prompt: fullPrompt });
    return result.text;
  },
});

/**
 * Generate a template from a document — analyzes the document structure
 * and suggests sections + fields appropriate for the data it contains.
 */
export const generateFromDoc = action({
  args: {
    companyId: v.id("companies"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const canUseAI = await ctx.runQuery(api.roles.hasPermission, {
      companyId: args.companyId,
      permission: "clients_useAI",
    });
    if (!canUseAI) throw new ConvexError(clientErrors.permissionDenied);

    const fullPrompt = `
TASK: Analyze the following document and generate a client template.

The template should have sections, and each section should have fields appropriate for the data found.

AVAILABLE FIELD TYPES:
text, textarea, number, currency, date, select, phone, email, file, image, switch, url

AVAILABLE FIELD SIZES:
small (quarter width), medium (half width), large (three quarters), full (full width)

RULES:
- The first section MUST be named "Información Básica"
- The first section MUST include these two fixed fields:
  1. { "id": "field_name", "type": "text", "label": "Nombre", "required": true, "size": "medium", "showInTable": true, "isFixed": true, "config": {} }
  2. { "id": "field_identificationNumber", "type": "text", "label": "N° Identificación", "required": true, "size": "medium", "showInTable": true, "isFixed": true, "config": {} }
- Additional fields must NOT use "field_name" or "field_identificationNumber" as id
- Field IDs should be descriptive (e.g. "field_email", "field_phone", "field_address")
- For "select" type fields, include { "options": [{ "label": "...", "value": "..." }] } in config
- All other field types should have config: {}
- Use "placeholder" for helpful hints
- Group related fields into logical sections

DOCUMENT TEXT:
${args.prompt}

OUTPUT: Return a JSON object with this exact structure:
{
  "sections": [
    {
      "id": "<uuid>",
      "label": "Section Name",
      "order": 0,
      "fields": [
        {
          "id": "field_xxx",
          "type": "text",
          "label": "Field Label",
          "placeholder": "...",
          "required": true/false,
          "size": "medium",
          "showInTable": true/false,
          "isFixed": true/false,
          "config": {}
        }
      ]
    }
  ]
}
    `;

    const { thread } = await clientAgent.createThread(ctx);
    const result = await thread.generateText({ prompt: fullPrompt });
    return result.text;
  },
});

/**
 * Review an existing template and suggest improvements.
 * Receives current sections + optional user instruction.
 */
export const reviewTemplate = action({
  args: {
    companyId: v.id("companies"),
    sections: v.any(),
    instruction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const canUseAI = await ctx.runQuery(api.roles.hasPermission, {
      companyId: args.companyId,
      permission: "clients_useAI",
    });
    if (!canUseAI) throw new ConvexError(clientErrors.permissionDenied);

    const sectionsJson = JSON.stringify(args.sections, null, 2);
    const userInstruction = args.instruction
      ? `\nUSER INSTRUCTION: ${args.instruction}`
      : "";

    const fullPrompt = `
TASK: Review the following client template and suggest improvements.${userInstruction}

CURRENT TEMPLATE:
${sectionsJson}

AVAILABLE FIELD TYPES:
text, textarea, number, currency, date, select, phone, email, file, image, switch, url

AVAILABLE FIELD SIZES:
small (quarter width), medium (half width), large (three quarters), full (full width)

RULES:
- Do NOT modify or remove fields with "isFixed": true
- Suggest adding, modifying, or removing fields
- Each suggestion must be a concrete, actionable change
- For "select" type fields, include options in config

OUTPUT: Return a JSON object with this structure:
{
  "suggestions": [
    {
      "type": "add" | "modify" | "remove",
      "sectionId": "target section id",
      "sectionLabel": "target section label (for new sections use the new name)",
      "field": {
        "id": "field_xxx",
        "type": "text",
        "label": "Field Label",
        "placeholder": "...",
        "required": true/false,
        "size": "medium",
        "showInTable": true/false,
        "isFixed": false,
        "config": {}
      },
      "reason": "Brief explanation of why this change is suggested"
    }
  ]
}
    `;

    const { thread } = await clientAgent.createThread(ctx);
    const result = await thread.generateText({ prompt: fullPrompt });
    return result.text;
  },
});
