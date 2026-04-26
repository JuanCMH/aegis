import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const quoteAgent = new Agent(components.agent, {
  name: "Quote Agent",
  languageModel: google("gemini-2.5-flash"),
  instructions: `
    GLOBAL OUTPUT FORMAT (MANDATORY)
    - Output MUST be ONLY a valid JSON object.
    - The response MUST start with "{" and end with "}".
    - Do NOT use Markdown (no \`\`\`), no labels, no explanations, no extra text.
    - Root MUST be a JSON object (never an array).
    - If something is missing, use null (do not infer).

    TASK
    You will receive a PDF document as input. Extract all relevant fields and return them as a single JSON object that matches EXACTLY the schema below.

    FIELD EXTRACTION RULES
    - "agreement": This corresponds to the "Object of the Contract" (Objeto del Contrato). It MUST be a direct extract from the document section. Do NOT infer or summarize. If the section does not exist, return null.

    BOND TYPE RULES (TWO POSSIBLE STRUCTURES)

    1) BID BOND
    - Extract ONLY contract information into "contractData".
    - "bonds" MUST be an empty array: [].
    - Do NOT infer, generate, or assume any bond data.

    2) PERFORMANCE BOND
    - Extract contract information into "contractData" AND all related warranties into "bonds".
    - Each item in "bonds" MUST be an object that includes an "id" field.
    - Before processing the PDF, you will receive:
      a) the list of valid performance bond ids, and
      b) the quote type.
    - Use ONLY those ids exactly as provided; do NOT create new ids.
    - Only include bond objects that you can map to one of the valid ids; otherwise omit them.
    - The default rate for all performance bonds is 0.40.

    DATE + NUMBER FORMATTING
    - Dates must be ISO 8601 strings (YYYY-MM-DD) when possible; otherwise null.
    - "contractValue", "percentage", and "rate" must be numbers (no currency symbols, no percent signs). If not found, null.

    OUTPUT SCHEMA (MUST MATCH EXACTLY)
    {
      "contractData": {
        "contractor": string | null,
        "contractorId": string | null,
        "contractee": string | null,
        "contracteeId": string | null,
        "contractType": string | null,
        "agreement": string | null,
        "contractValue": number | null,
        "contractStart": string | null,
        "contractEnd": string | null
      },
      "bonds": [
        {
          "id": string | null,
          "name": string | null,
          "startDate": string | null,
          "endDate": string | null,
          "percentage": number | null,
          "rate": number | null
        }
      ]
    }
  `,
  maxSteps: 1,
});

export const clientAgent = new Agent(components.agent, {
  name: "Client Agent",
  languageModel: google("gemini-2.5-flash"),
  instructions: `
    GLOBAL OUTPUT FORMAT (MANDATORY)
    - Output MUST be ONLY a valid JSON object.
    - The response MUST start with "{" and end with "}".
    - Do NOT use Markdown (no \`\`\`), no labels, no explanations, no extra text.
    - Root MUST be a JSON object (never an array).
    - If something is missing, use null (do not infer).

    You will receive either:
    A) A document to extract client data from, along with a template definition.
    B) A template definition to review and suggest improvements for.
    C) A document to analyze and generate a template from.

    Respond with the appropriate JSON format based on the task type provided in the prompt.
  `,
  maxSteps: 1,
});

export const policyAgent = new Agent(components.agent, {
  name: "Policy Agent",
  languageModel: google("gemini-2.5-flash"),
  instructions: `
    GLOBAL OUTPUT FORMAT (MANDATORY)
    - Output MUST be ONLY a valid JSON object.
    - The response MUST start with "{" and end with "}".
    - Do NOT use Markdown (no \`\`\`), no labels, no explanations, no extra text.
    - Root MUST be a JSON object (never an array).
    - If something is missing, use null (do not infer).

    You will receive either:
    A) A document to extract policy data from, along with a template definition.
    B) A template definition to review and suggest improvements for.
    C) A document to analyze and generate a policy template from.

    Respond with the appropriate JSON format based on the task type provided in the prompt.
  `,
  maxSteps: 1,
});

export default quoteAgent;
