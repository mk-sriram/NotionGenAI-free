import Groq from "groq-sdk";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Notion API Setup
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const notion = axios.create({
  baseURL: "https://api.notion.com/v1/",
  headers: {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    "Notion-Version": "2022-06-28",
  },
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Load your Groq API key from environment variables
});

// Function to get database tags
const getDatabaseTags = async (databaseId) => {
  try {
    const response = await notion.get(`/databases/${databaseId}`);
    const properties = response.data.properties;

    if (properties.Type && properties.Type.multi_select) {
      const tags = properties.Type.multi_select.options;
      return tags; // Return the tags
    } else {
      console.log("No Type field or options found.");
      return [];
    }
  } catch (error) {
    console.error(
      "Error fetching database tags:",
      error.response?.data || error.message
    );
    return [];
  }
};

// Function to process database row using Cerebras API
const getDatabaseRow = async (pageTitle, tags) => {
  console.log(`Processing pageTitle: ${pageTitle} with tags:`, tags);
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Refined Groq prompt for generating Notion-compatible output
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
    // Call the Groq chat completion API
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile", // Use the appropriate model
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    // Extract the raw result text
    const rawResult = chatCompletion.choices[0]?.message?.content || "";

    // Remove any extraneous content and parse the JSON
    const cleanResult = rawResult.trim().replace(/^```json|```$/g, ""); // Remove code block markers
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

// Function to update a page
const updatePage = async (pageId, updates) => {
  try {
    const response = await notion.patch(`/pages/${pageId}`, {
      properties: updates,
    });

    console.log("Page updated successfully:", response.data);
  } catch (error) {
    console.error(
      "Error updating page:",
      error.response?.data || error.message
    );
  }
};

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook received:", req.body.data.properties);

    // Extract database ID
    const databaseID = req.body.data?.parent?.database_id;
    if (!databaseID) {
      console.error("Database ID not found in webhook payload.");
      return res.status(400).send("Invalid webhook payload");
    }

    // Extract Page ID
    const pageId = req.body.data.id;

    // Extract the page name
    const pageTitle =
      req.body.data.properties?.Tasks?.title?.[0]?.plain_text || "Untitled";

    console.log(`Processing Page ID: ${pageId}, Title: ${pageTitle}`);

    // Get tags from the database
    const tags = await getDatabaseTags(databaseID);

    // Simulate processing the database row
    const databaseRow = await getDatabaseRow(pageTitle, tags);

    // Example of updating the page (uncomment when ready)
    await updatePage(pageId, databaseRow);

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error handling webhook:", error.message);
    res.status(500).send("Internal server error");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
