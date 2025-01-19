import express from "express";
import bodyParser from "body-parser";
import { getDatabaseTags, updatePage } from "./notionFunctions.js";
import { getDatabaseRow } from "./LLamaFunctions.js";

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook received:", req.body);

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

    // Example of updating the page (uncomment when needed)
    //await updatePage(pageId, databaseRow);

    // Respond to the webhook
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
