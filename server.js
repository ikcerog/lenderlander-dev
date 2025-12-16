// server.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Anthropic = require("@anthropic-ai/sdk");
const Parser = require('rss-parser'); // <-- NEW: RSS Parser dependency
const parser = new Parser({
    // Add a custom user-agent to avoid being blocked by some servers
    headers: { 'User-Agent': 'News-Aggregator-App/1.0' }
});

// Load environment variables locally (Render ignores this but it's good for local testing)
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// --- ANTHROPIC CLAUDE API SETUP ---
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey: apiKey });
// ------------------------------------------

// Middleware setup
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public'))); 

// 1. Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- NEW ENDPOINT 1: Fetch and Parse Standard RSS Feeds ---
app.post('/api/fetch-rss', async (req, res) => {
    const { feedUrl } = req.body;

    if (!feedUrl) {
        return res.status(400).json({ error: 'Missing feedUrl in request body.' });
    }

    try {
        console.log(`Fetching RSS feed: ${feedUrl}`);
        // rss-parser fetches the feed, parses the XML, and returns a JSON object
        let feed = await parser.parseURL(feedUrl);
        
        // Return only the items array to the frontend
        res.json({ items: feed.items });
    } catch (error) {
        console.error("RSS Fetch Error:", error.message);
        // Return a 404 to the client to match the expected error handling
        res.status(404).json({ error: `Failed to fetch or parse RSS feed: ${error.message}` });
    }
});

// --- NEW ENDPOINT 2: Fetch and Parse Reddit RSS Feeds ---
app.post('/api/fetch-reddit', async (req, res) => {
    const { subreddit } = req.body;

    if (!subreddit) {
        return res.status(400).json({ error: 'Missing subreddit in request body.' });
    }

    // Reddit's RSS URL format is consistent (e.g., https://www.reddit.com/r/mortgages/.rss)
    const feedUrl = `https://www.reddit.com/r/${subreddit}/.rss`;

    try {
        console.log(`Fetching Reddit feed for: ${subreddit}`);
        let feed = await parser.parseURL(feedUrl);
        
        // Reddit RSS feeds can be large; we limit the items returned
        res.json({ items: feed.items.slice(0, 15) });
    } catch (error) {
        console.error("Reddit Fetch Error:", error.message);
        // Return a 404 to the client to match the expected error handling
        res.status(404).json({ error: `Failed to fetch Reddit feed: ${error.message}` });
    }
});

// 2. AI Summary Endpoint (Now using Claude API)
app.post('/api/summarize-news', async (req, res) => {
    const htmlContent = req.body.htmlContent;

    if (!htmlContent) {
        return res.status(400).json({ error: 'Missing HTML content in request body.' });
    }

    // --- PROMPT ENGINEERING: MORTGAGE INDUSTRY FOCUS ---
    const modelName = "claude-3-5-sonnet-20241022"; // Claude Sonnet for fast and capable text analysis
    const inputPrompt = `You are a **senior strategic analyst specializing in the U.S. Residential Mortgage Industry**.
Your task is to analyze the following HTML content, which contains recent news articles from major industry feeds (MND, HousingWire, CFPB, Reddit).

1. **SCAN** the provided HTML content for all titles, sources, and descriptions within the '.news-card' elements.
2. **IGNORE** all hidden elements or administrative content (like 'Hide Forever' buttons).
3. **GENERATE** a strategic summary in Markdown format that is ready to be directly displayed in a dashboard panel.

Your output MUST be structured using Markdown headings and lists, focusing on actionable insights for mortgage professionals:

## 📈 Rate & Housing Market Outlook
* **Interest Rate Momentum**: Summarize the current trajectory of 30-year fixed rates (rising, falling, steady) and the primary driver (e.g., inflation, Fed statements).
* **Housing Inventory/Prices**: Describe the immediate status of housing inventory and its effect on affordability and sales volume.

## ⚖️ Regulatory & Compliance Watch
* **Key Regulatory Focus**: What is the most active regulatory body (CFPB, FHFA, state AGs) and what specific rules or enforcement actions are dominating the news?
* **Litigation & Risk**: Identify any emerging litigation trends or compliance blindspots (e.g., servicing errors, data privacy).

## 💻 Industry Strategy & Technology (FinTech)
* **Lender Response**: What are large lenders (Rocket, UWM) or regional lenders doing strategically (e.g., staffing, new products, M&A)?
* **Tech/AI Integration**: What specific technology area (AI underwriting, LOS platforms, blockchain) requires immediate attention or investment or planning?

---
HTML Content to Analyze:
---
${htmlContent}`;

    try {
        const message = await anthropic.messages.create({
            model: modelName,
            max_tokens: 2048,
            messages: [
                {
                    role: "user",
                    content: inputPrompt
                }
            ]
        });

        // Extract the text content from Claude's response
        const summary = message.content[0].text;

        res.json({ summary: summary });
    } catch (error) {
        console.error("Claude API Error:", error);
        res.status(500).json({ error: 'Failed to generate AI summary. Check server logs.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
