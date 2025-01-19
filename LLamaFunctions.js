import Cerebras from "@cerebras/cerebras_cloud_sdk";
import notionPrompt from "./notionPrompt.js";
const client = new Cerebras({
  apiKey: process.env["CEREBRAS_API_KEY"], // This is the default and can be omitted
});

export async function getDatabaseRow(pageTitle, tags) {
  console.log(`Processing pageTitle: ${pageTitle} with tags:`, tags);

  try {
    // Call the Cerebras API
    const completion = await client.completions.create({
      prompt: notionPrompt,
      model: "llama3.1-8b", // Use the appropriate model
    });

    const result = completion?.choices?.[0]?.text;

    // Log and return the result from the Cerebras API
    console.log("Cerebras API completion result:", result);
    return {
      analysis: result,
    };
  } catch (error) {
    console.error("Error calling Cerebras API:", error.message);
    return {
      analysis: "Error in processing",
    };
  }
}
