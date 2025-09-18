# Reddit Sentiment Analysis Setup Guide

## Overview

This system analyzes Reddit discussions about hair transplant surgeons to provide sentiment insights. It searches Reddit for mentions of surgeons and uses AI to determine if the sentiment is positive, negative, or neutral.

## Features

- 🔍 **Reddit Search**: Search all of Reddit for surgeon mentions
- 🤖 **AI Sentiment Analysis**: Analyze sentiment using VADER sentiment analysis
- 📊 **Comprehensive Reports**: Get breakdowns, examples, and themes
- 🔄 **Background Agent**: Automated updates for all surgeons
- 🎯 **Smart Filtering**: Filter out irrelevant mentions
- 📱 **UI Integration**: Built-in components for easy integration

## Setup Instructions

### 1. Install Dependencies

The required packages are already installed:
```bash
npm install snoowrap vader-sentiment
```

### 2. Reddit API Setup

1. **Create Reddit App**:
   - Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
   - Click "Create App" or "Create Another App"
   - Choose "script" as the app type
   - Note down your `client_id` and `client_secret`

2. **Get Reddit Credentials**:
   - Use your Reddit username and password
   - Create a user agent string (e.g., "HairTransplantCRM/1.0")

### 3. Environment Variables

Add these to your `.env.local` file:

```bash
# Reddit API Credentials
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=HairTransplantCRM/1.0

# Optional: For background agent
CRON_SECRET=your_secret_key_for_cron_jobs
```

### 4. Test the Setup

1. **Go to Test Page**: Navigate to `/reddit-sentiment-test`
2. **Test API Connection**: Click "Test Reddit API"
3. **Test Analysis**: Enter a surgeon name and analyze sentiment

## Usage

### 1. Individual Surgeon Analysis

```typescript
import { redditSentimentService } from '@/lib/reddit-sentiment-service';

const result = await redditSentimentService.analyzeSurgeonSentiment('Dr. John Doe', {
  limit: 50,
  timeRange: 'year',
  includeComments: true,
  subreddits: ['HairTransplants', 'tressless', 'hair', 'all'],
});
```

### 2. Batch Analysis

```typescript
const surgeons = ['Dr. John Doe', 'Dr. Jane Smith', 'Dr. Bob Johnson'];
const results = await redditSentimentService.batchAnalyzeSurgeons(surgeons);
```

### 3. UI Component

```tsx
import { RedditSentimentCard } from '@/components/reddit-sentiment';

<RedditSentimentCard surgeonName="Dr. John Doe" />
```

### 4. API Endpoints

- `POST /api/reddit/sentiment` - Analyze single surgeon
- `POST /api/reddit/batch-sentiment` - Analyze multiple surgeons
- `POST /api/reddit/background-agent` - Run background updates
- `GET /api/reddit/sentiment` - Test API connection

## Integration Examples

### 1. Surgeon Modal Integration

The Reddit sentiment analysis is already integrated into the surgeon modal. Users can:
- Click on any surgeon
- Go to the "Reddit Sentiment" tab
- View sentiment analysis and examples

### 2. Dashboard Integration

Add sentiment data to your surgeon cards:

```tsx
// In your surgeon card component
const [sentimentData, setSentimentData] = useState(null);

useEffect(() => {
  // Load sentiment data for surgeon
  loadSentimentData(surgeon.name);
}, [surgeon.name]);
```

### 3. Background Agent

Set up automated updates using cron jobs or scheduled functions:

```bash
# Example cron job (runs daily at 2 AM)
0 2 * * * curl -X POST https://your-domain.com/api/reddit/background-agent \
  -H "x-cron-secret: your_secret_key"
```

## Data Structure

### Sentiment Analysis Result

```typescript
interface SurgeonSentimentData {
  surgeonName: string;
  lastUpdated: number;
  totalMentions: number;
  sentiment: {
    overallScore: number;        // -1 to 1
    overallLabel: 'positive' | 'negative' | 'neutral';
    confidence: number;          // 0 to 1
    breakdown: {
      positive: number;
      negative: number;
      neutral: number;
    };
    examples: {
      positive: string[];
      negative: string[];
      neutral: string[];
    };
    themes: string[];           // Common themes like 'Results', 'Experience'
  };
  rawMentions: RedditMention[];
}
```

### Reddit Mention

```typescript
interface RedditMention {
  type: 'post' | 'comment';
  content: string;
  author: string;
  subreddit: string;
  score: number;
  created_utc: number;
  permalink: string;
  url?: string;
}
```

## Configuration Options

### Search Options

```typescript
interface SentimentAnalysisOptions {
  limit?: number;                    // Max mentions to analyze (default: 50)
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';  // Time range
  includeComments?: boolean;         // Include comments (default: true)
  subreddits?: string[];            // Specific subreddits to search
  minScore?: number;                // Minimum Reddit score to include
}
```

### Default Subreddits

The system searches these subreddits by default:
- `HairTransplants` - Main hair transplant community
- `tressless` - Hair loss discussion
- `hair` - General hair discussion
- `all` - All of Reddit

## Rate Limits and Best Practices

### Reddit API Limits

- **Unauthenticated**: 60 requests per minute
- **Authenticated**: 100 requests per minute
- **Best Practice**: Add 2-10 second delays between requests

### Background Agent

- Processes surgeons in batches of 5
- 10-second delay between batches
- Respects rate limits automatically

### Caching

- Results are cached in the database
- Background agent updates data regularly
- UI shows "Last updated" timestamp

## Troubleshooting

### Common Issues

1. **"Reddit API not initialized"**
   - Check environment variables
   - Verify Reddit app credentials
   - Ensure user agent is set

2. **"No mentions found"**
   - Surgeon name might be too common
   - Try different search terms
   - Check if surgeon is known on Reddit

3. **Rate limit errors**
   - Reduce batch sizes
   - Increase delays between requests
   - Use background agent for large batches

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=reddit-sentiment
```

### Test Commands

```bash
# Test Reddit API connection
curl -X GET https://your-domain.com/api/reddit/sentiment

# Test sentiment analysis
curl -X POST https://your-domain.com/api/reddit/sentiment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"surgeonName": "Dr. Test Surgeon"}'
```

## Security Considerations

1. **API Keys**: Store Reddit credentials securely
2. **Rate Limiting**: Implement proper rate limiting
3. **Authentication**: Protect API endpoints with authentication
4. **Data Privacy**: Be mindful of Reddit's terms of service

## Future Enhancements

- **Trending Analysis**: Compare sentiment over time
- **Advanced AI**: Use LLMs for better context understanding
- **More Platforms**: Extend to other social media platforms
- **Real-time Updates**: WebSocket updates for live sentiment
- **Sentiment Alerts**: Notifications for significant sentiment changes

## Support

For issues or questions:
1. Check the test page at `/reddit-sentiment-test`
2. Review the console logs for errors
3. Verify Reddit API credentials
4. Check rate limit status

The system is designed to be robust and handle errors gracefully, providing fallbacks when Reddit API is unavailable.
