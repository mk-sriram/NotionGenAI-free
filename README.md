# Notion Database Integration with Llama and Groq

## 📌 Project Overview
This project is a lightweight integration that transforms natural language into structured Notion database entries using Llama and Groq. Inspired by the need to streamline task creation without paying for expensive AI tools, this system provides a cost-effective and customizable alternative to Notion AI.

## 🎯 What Does It Do?
- **Input in Natural Language**: Type tasks in plain language, like "get groceries from Target by tomorrow."
- **Automated Parsing**: The system uses Llama and Groq to:
  - Extract task titles.
  - Identify tags and categories.
  - Parse deadlines and dates.
- **Output to Notion**: Converts the parsed data into a structured format and updates your Notion database instantly.

## Why I Made This
Notion AI charges $100/year for functionality that can be achieved with a few lines of code and existing AI tools.

## Demo Video
<a href="https://www.youtube.com/watch?v=DlthUbGrWk4" target="_blank">
  <img src="https://www.youtube.com/watch?v=DlthUbGrWk4" alt="Video Demo" width="400" />
</a>


## Cost Savings
- **Notion AI**: $100/year.
- **This System**: 
  - Llama and Groq API usage (pay-as-you-go or free-tier options).
  - Significantly lower operational costs with full control over customization.

## Use Case
This is perfect for:
- **Students**: Manage assignments and projects in Notion without manual entry.
- **Professionals**: Simplify task creation with a quick, natural language input system.
- **Teams**: Enable faster collaboration by automating task parsing and tagging.


## Getting Started
1. Clone this repository.
2. Install dependencies with `npm install`.
3. Configure your `.env` file with:
   - `NOTION_API_KEY`
   - `GROQ_API_KEY`
4. Run the server with `node server.js`.

## Features
- Real-time updates to Notion.
- Smart parsing with flexible tag and deadline extraction.
- Simple setup for personal or professional use.
