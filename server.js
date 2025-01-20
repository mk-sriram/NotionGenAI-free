import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { getDatabaseTags, updatePage } from "./notionFunctions.js";
import { getDatabaseRow } from "./LLamaFunctions.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Webhook endpoint
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const databaseID = req.body.data?.parent?.database_id;
      if (!databaseID) {
        return res.status(400).send("Invalid webhook payload");
      }

      const pageId = req.body.data.id;
      const pageTitle =
        req.body.data.properties?.Tasks?.title?.[0]?.plain_text || "Untitled";

      console.log(`Processing Page ID: ${pageId}, Title: ${pageTitle}`);

      const tags = await getDatabaseTags(databaseID);
      const databaseRow = await getDatabaseRow(pageTitle, tags);
      await updatePage(pageId, databaseRow);

      res.status(200).send("Webhook processed successfully");
    } catch (error) {
      console.error("Error handling webhook:", error.message);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
