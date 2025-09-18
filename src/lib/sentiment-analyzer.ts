// src/lib/sentiment-analyzer.ts
import { SentimentIntensityAnalyzer } from 'vader-sentiment';

export interface SentimentScore {
  compound: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SentimentResult {
  score: SentimentScore;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  text: string;
}

export interface AggregatedSentiment {
  overallScore: number;
  overallLabel: 'positive' | 'negative' | 'neutral';
  confidence: number;
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  totalMentions: number;
  examples: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  themes: string[];
}

class SentimentAnalyzer {
  private analyzer: SentimentIntensityAnalyzer;

  constructor() {
    this.analyzer = new SentimentIntensityAnalyzer();
  }

  /**
   * Analyze sentiment of a single text
   */
  public analyzeText(text: string): SentimentResult {
    try {
      // Clean the text for better analysis
      const cleanText = this.cleanText(text);
      
      // Get sentiment scores
      const scores = this.analyzer.polarity_scores(cleanText);
      
      // Determine label based on compound score
      let label: 'positive' | 'negative' | 'neutral';
      let confidence: number;

      if (scores.compound >= 0.05) {
        label = 'positive';
        confidence = Math.abs(scores.compound);
      } else if (scores.compound <= -0.05) {
        label = 'negative';
        confidence = Math.abs(scores.compound);
      } else {
        label = 'neutral';
        confidence = 1 - Math.abs(scores.compound);
      }

      return {
        score: scores,
        label,
        confidence,
        text: cleanText,
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        score: { compound: 0, positive: 0, negative: 0, neutral: 1 },
        label: 'neutral',
        confidence: 0,
        text: text,
      };
    }
  }

  /**
   * Analyze multiple texts and return aggregated sentiment
   */
  public analyzeMultipleTexts(texts: string[]): AggregatedSentiment {
    const results = texts.map(text => this.analyzeText(text));
    
    // Calculate overall scores
    const totalCompound = results.reduce((sum, result) => sum + result.score.compound, 0);
    const averageCompound = totalCompound / results.length;
    
    // Count by label
    const breakdown = {
      positive: results.filter(r => r.label === 'positive').length,
      negative: results.filter(r => r.label === 'negative').length,
      neutral: results.filter(r => r.label === 'neutral').length,
    };

    // Determine overall label
    let overallLabel: 'positive' | 'negative' | 'neutral';
    let confidence: number;

    if (averageCompound >= 0.05) {
      overallLabel = 'positive';
      confidence = Math.abs(averageCompound);
    } else if (averageCompound <= -0.05) {
      overallLabel = 'negative';
      confidence = Math.abs(averageCompound);
    } else {
      overallLabel = 'neutral';
      confidence = 1 - Math.abs(averageCompound);
    }

    // Get examples for each sentiment
    const examples = {
      positive: results
        .filter(r => r.label === 'positive')
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
        .map(r => r.text.substring(0, 200) + (r.text.length > 200 ? '...' : '')),
      negative: results
        .filter(r => r.label === 'negative')
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
        .map(r => r.text.substring(0, 200) + (r.text.length > 200 ? '...' : '')),
      neutral: results
        .filter(r => r.label === 'neutral')
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
        .map(r => r.text.substring(0, 200) + (r.text.length > 200 ? '...' : '')),
    };

    // Extract common themes
    const themes = this.extractThemes(texts);

    return {
      overallScore: averageCompound,
      overallLabel,
      confidence,
      breakdown,
      totalMentions: texts.length,
      examples,
      themes,
    };
  }

  /**
   * Clean text for better sentiment analysis
   */
  private cleanText(text: string): string {
    return text
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/u\/\w+/g, '') // Remove Reddit usernames
      .replace(/r\/\w+/g, '') // Remove subreddit references
      .replace(/[^\w\s.,!?;:'"-]/g, ' ') // Keep only alphanumeric and basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract common themes from texts
   */
  private extractThemes(texts: string[]): string[] {
    const themes: string[] = [];
    const allText = texts.join(' ').toLowerCase();
    
    // Define theme keywords
    const themeKeywords = {
      'Results': ['result', 'outcome', 'look', 'appearance', 'natural', 'hairline'],
      'Experience': ['experience', 'visit', 'consultation', 'procedure', 'surgery'],
      'Staff': ['staff', 'doctor', 'nurse', 'team', 'professional', 'friendly'],
      'Cost': ['cost', 'price', 'expensive', 'cheap', 'affordable', 'budget'],
      'Recovery': ['recovery', 'healing', 'pain', 'swelling', 'scabbing'],
      'Communication': ['communication', 'response', 'email', 'phone', 'contact'],
      'Location': ['location', 'clinic', 'office', 'facility', 'clean'],
    };

    // Check for theme keywords
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const keywordCount = keywords.filter(keyword => allText.includes(keyword)).length;
      if (keywordCount >= 2) { // At least 2 keywords found
        themes.push(theme);
      }
    }

    return themes;
  }

  /**
   * Get sentiment label with emoji
   */
  public getSentimentEmoji(label: 'positive' | 'negative' | 'neutral'): string {
    switch (label) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '😐';
    }
  }

  /**
   * Get sentiment color for UI
   */
  public getSentimentColor(label: 'positive' | 'negative' | 'neutral'): string {
    switch (label) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Format confidence as percentage
   */
  public formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }
}

// Export singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();
