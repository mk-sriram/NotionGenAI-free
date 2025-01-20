// import Cerebras from "@cerebras/cerebras_cloud_sdk";
// import dotenv from "dotenv";
// dotenv.config();

// const client = new Cerebras({
//   apiKey: process.env["CEREBRAS_API_KEY"], // This is the default and can be omitted
// });

// export async function getDatabaseRow(pageTitle, tags) {
//   console.log(`Processing pageTitle: ${pageTitle} with tags:`, tags);

//   const notionPrompt = ```
// You are a task parser designed to extract structured information from natural language input. Your goal is to:

// 1. Analyze the pageTitle to extract meaningful information about the task, such as the core summary and the deadline.
// 2. Match the tags from the provided list that are relevant to the task in the pageTitle.
// 3. Output the result as a structured JSON object suitable for patching a Notion database entry.

// **Output JSON Format:**
// {
//   "summary_title": "<Short and clear summary of the task>",
//   "tags": [
//     {
//       "id": "<Tag ID>",
//       "name": "<Tag Name>",
//       "color": "<Tag Color>"
//     }
//   ],
//   "deadline": "<ISO 8601 formatted date or null if not found>"
// }

// **Guidelines:**
// - Extract tags from the provided tags list. Match based on keywords or context from the pageTitle.
// - Parse the pageTitle for any deadline-related phrases (e.g., "by January 20th" or "due tomorrow") and convert the deadline into ISO 8601 format (e.g., "2025-01-20").
// - If no deadline is found, set "deadline": null".
// - Ensure the output JSON matches the specified format, with valid keys and values.

// **Input:**
// 1. pageTitle: "${pageTitle}"
// 2. tags: ${tags}

// **Your task:**
// 1. Understand the intention of the task from the pageTitle.
// 2. Select and include relevant tags from the tags list.
// 3. Extract and format the deadline, if present, or return null.
// 4. Output a valid JSON object in the specified format.

// ```;

//   try {
//     // Call the Cerebras API
//     const completion = await client.completions.create({
//       prompt: notionPrompt,
//       model: "llama3.1-8b", // Use the appropriate model
//     });

//     const result = completion?.choices?.[0]?.text;

//     // Log and return the result from the Cerebras API
//     console.log("Cerebras API completion result:", result);
//     return {
//       analysis: result,
//     };
//   } catch (error) {
//     console.error("Error calling Cerebras API:", error.message);
//     return {
//       analysis: "Error in processing",
//     };
//   }
// }
