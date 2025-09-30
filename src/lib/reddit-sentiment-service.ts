// src/lib/reddit-sentiment-service.ts
import { redditAPI, RedditMention, RedditSearchResult } from './reddit-api';
import { sentimentAnalyzer, AggregatedSentiment } from './sentiment-analyzer';

export interface SurgeonSentimentData {
  surgeonName: string;
  lastUpdated: number;
  totalMentions: number;
  sentiment: AggregatedSentiment;
  rawMentions: RedditMention[];
  searchQuery: string;
  subreddits: string[];
}

export interface SentimentAnalysisOptions {
  limit?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  includeComments?: boolean;
  subreddits?: string[];
  minScore?: number; // Minimum Reddit score to include
  clinicName?: string; // Optional clinic name to include in search
}

class RedditSentimentService {
  /**
   * Analyze Reddit sentiment for a surgeon
   */
  public async analyzeSurgeonSentiment(
    surgeonName: string,
    options: SentimentAnalysisOptions = {}
  ): Promise<SurgeonSentimentData> {
    const {
      limit = 50,
      timeRange = 'year',
      includeComments = true,
      subreddits = ['HairTransplants', 'tressless', 'hair', 'all'],
      minScore = -5, // Include posts with score >= -5
    } = options;

    try {
      // Search Reddit for mentions
      const redditResults = await redditAPI.searchSurgeonMentions(surgeonName, {
        limit,
        timeRange,
        includeComments,
        subreddits,
        clinicName: options.clinicName,
      });

      // Filter out low-quality mentions
      const filteredMentions = redditResults.mentions.filter(mention => 
        mention.score >= minScore && 
        mention.content.length > 10 && // Minimum content length
        this.isRelevantMention(mention.content, surgeonName, options.clinicName)
      );

      // Extract text content for sentiment analysis
      const texts = filteredMentions.map(mention => mention.content);

      // Perform sentiment analysis
      const sentiment = sentimentAnalyzer.analyzeMultipleTexts(texts);

      return {
        surgeonName,
        lastUpdated: Date.now(),
        totalMentions: filteredMentions.length,
        sentiment,
        rawMentions: filteredMentions,
        searchQuery: redditResults.searchQuery,
        subreddits,
      };
    } catch (error) {
      console.error(`Error analyzing sentiment for ${surgeonName}:`, error);
      throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a mention is relevant to the surgeon
   */
  private isRelevantMention(content: string, surgeonName: string, clinicName?: string): boolean {
    const contentLower = content.toLowerCase();
    const nameLower = surgeonName.toLowerCase();
    
    // Extract just the name part (remove titles like "Dr.")
    const nameParts = nameLower.replace(/dr\.?\s*/g, '').split(' ');
    const lastName = nameParts[nameParts.length - 1];
    
    // Check if the content contains the surgeon's name or last name
    const containsFullName = contentLower.includes(nameLower);
    const containsLastName = lastName.length > 2 && contentLower.includes(lastName);
    const clinicLower = (clinicName || '').toLowerCase();
    const containsClinic = clinicLower.length > 2 && contentLower.includes(clinicLower);
    
    // Also check for hair transplant related terms
    const hairTerms = ['hair transplant', 'hair restoration', 'fue', 'fut', 'hair loss', 'bald'];
    const containsHairTerms = hairTerms.some(term => contentLower.includes(term));
    
    return (containsFullName || containsLastName || containsClinic) && containsHairTerms;
  }

  /**
   * Get sentiment summary for display
   */
  public getSentimentSummary(data: SurgeonSentimentData): {
    emoji: string;
    label: string;
    confidence: string;
    summary: string;
    color: string;
  } {
    const { sentiment } = data;
    const emoji = sentimentAnalyzer.getSentimentEmoji(sentiment.overallLabel);
    const confidence = sentimentAnalyzer.formatConfidence(sentiment.confidence);
    const color = sentimentAnalyzer.getSentimentColor(sentiment.overallLabel);
    
    let summary = '';
    if (data.totalMentions === 0) {
      summary = 'No Reddit mentions found';
    } else if (data.totalMentions < 3) {
      summary = `Limited data (${data.totalMentions} mentions)`;
    } else {
      const { positive, negative, neutral } = sentiment.breakdown;
      summary = `${positive} positive, ${negative} negative, ${neutral} neutral mentions`;
    }

    return {
      emoji,
      label: sentiment.overallLabel,
      confidence,
      summary,
      color,
    };
  }

  /**
   * Test the service
   */
  public async testService(): Promise<{
    redditConnected: boolean;
    sentimentWorking: boolean;
    testResult?: SurgeonSentimentData;
  }> {
    const redditConnected = redditAPI.isReady();
    let sentimentWorking = false;
    let testResult: SurgeonSentimentData | undefined;

    try {
      // Test sentiment analysis
      const testTexts = [
        'Great experience with Dr. Smith, very professional!',
        'Terrible results, would not recommend.',
        'The consultation was okay, still deciding.',
      ];
      sentimentAnalyzer.analyzeMultipleTexts(testTexts);
      sentimentWorking = true;

      // Test Reddit search if connected
      if (redditConnected) {
        testResult = await this.analyzeSurgeonSentiment('Dr. Test Surgeon', {
          limit: 5,
          timeRange: 'month',
        });
      }
    } catch (error) {
      console.error('Service test failed:', error);
    }

    return {
      redditConnected,
      sentimentWorking,
      testResult,
    };
  }

  /**
   * Batch analyze multiple surgeons
   */
  public async batchAnalyzeSurgeons(
    surgeonNames: string[],
    options: SentimentAnalysisOptions = {}
  ): Promise<SurgeonSentimentData[]> {
    const results: SurgeonSentimentData[] = [];
    
    // Process surgeons with delay to respect rate limits
    for (let i = 0; i < surgeonNames.length; i++) {
      const surgeonName = surgeonNames[i];
      
      try {
        console.log(`Analyzing sentiment for ${surgeonName} (${i + 1}/${surgeonNames.length})`);
        const result = await this.analyzeSurgeonSentiment(surgeonName, options);
        results.push(result);
        
        // Add delay between requests to respect rate limits
        if (i < surgeonNames.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      } catch (error) {
        console.error(`Failed to analyze ${surgeonName}:`, error);
        // Continue with next surgeon
      }
    }
    
    return results;
  }

  /**
   * Get trending sentiment (compare recent vs older mentions)
   */
  public async getTrendingSentiment(
    surgeonName: string,
    options: SentimentAnalysisOptions = {}
  ): Promise<{
    recent: SurgeonSentimentData;
    older: SurgeonSentimentData;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    // Get recent mentions (last month)
    const recent = await this.analyzeSurgeonSentiment(surgeonName, {
      ...options,
      timeRange: 'month',
    });

    // Get older mentions (2-12 months ago)
    const older = await this.analyzeSurgeonSentiment(surgeonName, {
      ...options,
      timeRange: 'year',
    });

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recent.totalMentions >= 3 && older.totalMentions >= 3) {
      const recentScore = recent.sentiment.overallScore;
      const olderScore = older.sentiment.overallScore;
      
      if (recentScore > olderScore + 0.1) {
        trend = 'improving';
      } else if (recentScore < olderScore - 0.1) {
        trend = 'declining';
      }
    }

    return { recent, older, trend };
  }
}

// Export singleton instance
export const redditSentimentService = new RedditSentimentService();
