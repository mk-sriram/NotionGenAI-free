// LLamaFunctions.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Load your Groq API key from environment variables
});

export const getDatabaseRow = async (pageTitle, tags) => {
  console.log(`Processing pageTitle: ${pageTitle} with tags:`, tags);
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const messages = [
    {
      role: "system",
      content: `
      You are a task parser designed to create structured data for a Notion page. Your goal is to:

      1. Analyze the pageTitle to extract a clear and concise summary of the task.
      2. Identify relevant tags from the provided list based on context in the pageTitle.
      3. Extract any deadline mentioned in the pageTitle and format it as an ISO 8601 date (e.g., "2025-01-31"). If no deadline is found, set "deadline": null.
      4. Output a JSON object in a format directly usable for Notion's API.
    5. tasks with "get" could be categorized into travel tag
    6. today's date is ${today}, any date relative should be that, if no deadline provide, just use ${today} for start date
      **Output JSON Format:**
    {
        "Tasks": {
            "title": [
            {
                "type": "text",
                "text": {
                "content": "Insert summary of the title, fix grammar",
                }
            }
            ]
        },
        "Type": {
            "multi_select": [
            { "name": "Tag1" },
            { "name": "Tag2" }
            ]
        },
        "deadline": {
            "date": {
            "start": "2024-03-16", // ISO 8601 format
            "end": null            // Optional, use null if not applicable
            }
        },
        "Status Update": {
            "status": {
            "name": "Not started" // Must match the exact status name in your database schema
            }
        }
    };

      Ensure the output JSON is properly formatted without additional text or code blocks.
      `,
    },
    {
      role: "user",
      content: `
      Input:
      1. pageTitle: "${pageTitle}"
      2. tags: ${JSON.stringify(tags)}

      Your task:
      - Generate a valid JSON object matching the specified format for Notion's API.
      - Include only the relevant tags and deadline, if found.
      - Return a clean JSON object as the output.
      `,
    },
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    const rawResult = chatCompletion.choices[0]?.message?.content || "";
    const cleanResult = rawResult.trim().replace(/^```json|```$/g, "");
    const parsedResult = JSON.parse(cleanResult);

    console.log("Groq API completion result (parsed):", parsedResult);
    return parsedResult;
  } catch (error) {
    console.error("Error calling Groq API:", error.message);
    return {
      summary_title: "Error in processing",
      tags: [],
      deadline: null,
    };
  }
};
