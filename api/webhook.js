import Groq from "groq-sdk";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Environment Variable Validation
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!NOTION_API_KEY || !GROQ_API_KEY) {
  throw new Error(
    "Environment variables NOTION_API_KEY or GROQ_API_KEY are missing."
  );
}

// Notion API Setup
const notion = axios.create({
  baseURL: "https://api.notion.com/v1/",
  headers: {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    "Notion-Version": "2022-06-28",
  },
});

// Groq API Setup
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Function to get database tags
const getDatabaseTags = async (databaseId) => {
  try {
    const response = await notion.get(`/databases/${databaseId}`);
    const properties = response.data.properties;
    if (properties.Type && properties.Type.multi_select) {
      return properties.Type.multi_select.options;
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

// Function to process database row using Groq API
const getDatabaseRow = async (pageTitle, tags) => {
  const today = new Date().toISOString().split("T")[0];
  const messages = [
    {
      role: "system",
      content: `You are a task parser designed to create structured data for Notion pages. Use today's date (${today}) as a fallback.`,
    },
    {
      role: "user",
      content: JSON.stringify({ pageTitle, tags }),
    },
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
    });

    const rawResult = chatCompletion.choices[0]?.message?.content || "";
    return JSON.parse(rawResult.trim());
  } catch (error) {
    console.error("Error calling Groq API:", error.message);
    return null;
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

// Webhook Endpoint
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const databaseID = req.body.data?.parent?.database_id;
      const pageId = req.body.data?.id;
      const pageTitle =
        req.body.data?.properties?.Tasks?.title?.[0]?.plain_text || "Untitled";

      if (!databaseID || !pageId) {
        return res.status(400).send("Invalid webhook payload");
      }

      const tags = await getDatabaseTags(databaseID);
      const databaseRow = await getDatabaseRow(pageTitle, tags);

      if (databaseRow) {
        await updatePage(pageId, databaseRow);
        res.status(200).send("Webhook processed successfully");
      } else {
        res.status(500).send("Error processing Groq response");
      }
    } catch (error) {
      console.error("Error handling webhook:", error.message);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}
