import axios from "axios";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const notion = axios.create({
  baseURL: "https://api.notion.com/v1/",
  headers: {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    "Notion-Version": "2022-06-28",
  },
});

export async function getDatabaseTags(databaseId) {
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
    return []; // Return an empty array in case of error
  }
}

export async function updatePage(pageId, updates) {
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
}
