import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
// No import for 'zod-to-json-schema' is needed!

// Define Zod schemas (ONLY for runtime validation)
const characterSchema = z.object({
  name: z.string().describe("The full name of the Star Wars character."),
  affiliation: z.string().describe("The primary faction (e.g., Rebel Alliance, Galactic Empire, Jedi Order)."),
  species: z.string().describe("The biological species of the character."),
  homeworld: z.string().describe("The home planet of the character."),
  force_sensitive: z.boolean().describe("True if the character can use the Force, false otherwise."),
});

const resultSchema = z.object({
  era: z.string().describe("The primary era of the Star Wars galaxy being described (e.g., Galactic Civil War, Old Republic)."),
  characters: z.array(characterSchema).describe("An array containing exactly three character objects."),
});

// Define JSON Schema directly (for the Gemini API config)
// This object MUST conform to the JSON Schema standard 
const jsonSchema = {
    type: "object",
    properties: {
        era: {
            type: "string",
            description: "The primary era of the Star Wars galaxy being described (e.g., Galactic Civil War, Old Republic)."
        },
        characters: {
            type: "array",
            description: "An array containing exactly three character objects.",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    affiliation: { type: "string" },
                    species: { type: "string" },
                    homeworld: { type: "string" },
                    force_sensitive: { type: "boolean" },
                },
                required: ["name", "affiliation", "species", "homeworld", "force_sensitive"],
            }
        }
    },
    required: ["era", "characters"],
};

// --- Execution ---

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable!");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Extract structured Star Wars character information.
Return exactly 3 characters only.
Follow the schema strictly.
The era should be "Galactic Civil War".
`;

  console.log("Generating content with structured output...");

  // 3️⃣ Generate JSON output: Uses the manually defined jsonSchema
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchema, // Passed the manually defined JSON Schema
    },
  });

  // 4️⃣ Validate output using Zod: Still uses your original resultSchema for validation
  const jsonString = response.text.trim();
  
  try {
    const parsed = resultSchema.parse(JSON.parse(jsonString));
    console.log("\n Parsed Star Wars Data (Validation Successful):\n", parsed);
    console.log("\n JSON output successfully parsed and validated against Zod schema.");
  } catch (error) {
    console.error("\n Error during JSON parsing or Zod validation:", error);
    console.error("\nReceived raw JSON text:", jsonString);
  }
}

await main();




// import "dotenv/config";
// import { GoogleGenAI } from "@google/genai";

// async function main() {
//   const apiKey = process.env.GEMINI_API_KEY;

//   if (!apiKey) {
//     console.error("No api key man!! where is it !!");
//     return;
//   }

//   const ai = new GoogleGenAI({ apiKey });

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Explain few things about star wars",
//   });
//   console.log("Gemini says :",response.text);
// }

// await main();
