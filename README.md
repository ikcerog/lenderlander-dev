# Mortgage News Aggregator with Claude AI

A mortgage industry news aggregator powered by Claude AI that provides strategic summaries of the latest mortgage news, regulations, and market insights.

## Features

- 📈 **Core Mortgage News & Rates** - Real-time feeds from Mortgage News Daily, HousingWire, and National Mortgage News
- ✍️ **Key Author Insights** - Curated content from industry-leading journalists
- 🏛️ **Company Focus** - Press releases and news from major lenders (Rocket, UWM)
- 🏘️ **Real Estate Market** - Economic influencers and market analysis
- ⚖️ **Regulation & Compliance** - CFPB newsroom and legal updates
- 💻 **FinTech & Finance Innovation** - Latest technology trends in mortgage
- 🗣️ **Community Pulse** - Reddit discussions from mortgage communities
- ✨ **Claude AI Strategic Summary** - Intelligent analysis powered by Anthropic's Claude

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lenderlander-dev
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3000
```

### Running the Application

**Development mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` (required) - Your Anthropic Claude API key
- `PORT` (optional) - Server port (defaults to 3000)

### Claude AI Model

The application uses `claude-3-5-sonnet-20241022` for generating strategic summaries. You can modify the model in `server.js` if needed:

```javascript
const modelName = "claude-3-5-sonnet-20241022";
```

## API Endpoints

### `POST /api/fetch-rss`
Fetches and parses standard RSS feeds.

**Request body:**
```json
{
  "feedUrl": "https://example.com/feed.rss"
}
```

### `POST /api/fetch-reddit`
Fetches and parses Reddit RSS feeds.

**Request body:**
```json
{
  "subreddit": "Mortgage"
}
```

### `POST /api/summarize-news`
Generates Claude AI strategic summary from news content.

**Request body:**
```json
{
  "htmlContent": "<div class='news-card'>...</div>"
}
```

## Features

### Theme Support
- ☀️ Light Mode
- 🌙 Dark Mode
- 🌌 Midnight Mode

### View Options
- Grid View (default)
- List View

### Filtering & Search
- Real-time search across all news items
- Section-based filtering
- Persistent hiding of unwanted news items

## Technologies Used

- **Backend:** Node.js, Express.js
- **AI:** Anthropic Claude API (claude-3-5-sonnet)
- **RSS Parsing:** rss-parser
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Content Rendering:** marked.js, DOMPurify

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
