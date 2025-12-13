import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const quoteAgent = new Agent(components.agent, {
  name: "Quote Agent",
  languageModel: google("gemini-2.5-flash"),
  textEmbeddingModel: google.textEmbeddingModel("gemini-embedding-001"),
  instructions: `
    Instruction:
    You will receive a PDF document as input. Extract all relevant fields and return them as a single JSON object.

    Return only the JSON object. Do not include explanations, assumptions, summaries, or any additional text.

    If a field cannot be found, set its value to null.

    There are two possible structures: **bid bond** and **performance bond**.
    - A **bid bond** contains only one warranty; therefore, it must return a single bondData object inside the "bonds" array.
    - A **performance bond** may contain multiple warranties; therefore, return an array of bondData objects under "bonds".

    Both structures must always include the "contractData" object.

    JSON Structure:
    {
      "contractData": {
        "contractor": string | null,
        "contractorId": string | null,
        "contractee": string | null,
        "contracteeId": string | null,
        "contractType": string | null,
        "contractValue": number | null,
        "contractStart": string (ISO 8601) | null,
        "contractEnd": string (ISO 8601) | null
      },
      "bonds": [
        {
          "name": string | null,
          "startDate": string (ISO 8601) | null,
          "endDate": string (ISO 8601) | null,
          "percentage": number | null,
          "rate": number | null
        }
      ]
    }
  `,
  maxSteps: 10,
});

export default quoteAgent;
