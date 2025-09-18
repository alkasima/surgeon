// src/lib/reddit-api.ts
import Snoowrap from 'snoowrap';

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  is_self: boolean;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
  parent_id: string;
}

export interface RedditMention {
  type: 'post' | 'comment';
  content: string;
  author: string;
  subreddit: string;
  score: number;
  created_utc: number;
  permalink: string;
  url?: string;
}

export interface RedditSearchResult {
  mentions: RedditMention[];
  totalFound: number;
  searchQuery: string;
  timestamp: number;
}

class RedditAPIService {
  private snoowrap: Snoowrap | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Reddit API credentials from environment variables
      const clientId = process.env.REDDIT_CLIENT_ID;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET;
      const username = process.env.REDDIT_USERNAME;
      const password = process.env.REDDIT_PASSWORD;
      const userAgent = process.env.REDDIT_USER_AGENT || 'HairTransplantCRM/1.0';

      if (!clientId || !clientSecret || !username || !password) {
        console.warn('Reddit API credentials not found. Reddit sentiment analysis will be disabled.');
        return;
      }

      this.snoowrap = new Snoowrap({
        userAgent,
        clientId,
        clientSecret,
        username,
        password,
      });

      this.isInitialized = true;
      console.log('Reddit API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Reddit API:', error);
      this.isInitialized = false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.snoowrap !== null;
  }

  /**
   * Search Reddit for mentions of a surgeon
   */
  public async searchSurgeonMentions(
    surgeonName: string,
    options: {
      limit?: number;
      timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
      includeComments?: boolean;
      subreddits?: string[];
    } = {}
  ): Promise<RedditSearchResult> {
    if (!this.isReady()) {
      throw new Error('Reddit API not initialized');
    }

    const {
      limit = 50,
      timeRange = 'year',
      includeComments = true,
      subreddits = []
    } = options;

    const mentions: RedditMention[] = [];
    let totalFound = 0;

    try {
      // Search in specific subreddits or all of Reddit
      const searchTarget = subreddits.length > 0 ? subreddits : ['all'];
      
      for (const subreddit of searchTarget) {
        // Search for posts
        const posts = await this.searchPosts(surgeonName, subreddit, limit, timeRange);
        
        for (const post of posts) {
          mentions.push({
            type: 'post',
            content: `${post.title} ${post.selftext}`.trim(),
            author: post.author,
            subreddit: post.subreddit,
            score: post.score,
            created_utc: post.created_utc,
            permalink: post.permalink,
            url: post.url,
          });
        }

        // Search for comments if requested
        if (includeComments) {
          const comments = await this.searchComments(surgeonName, subreddit, limit, timeRange);
          
          for (const comment of comments) {
            mentions.push({
              type: 'comment',
              content: comment.body,
              author: comment.author,
              subreddit: subreddit,
              score: comment.score,
              created_utc: comment.created_utc,
              permalink: comment.permalink,
            });
          }
        }
      }

      totalFound = mentions.length;

      return {
        mentions,
        totalFound,
        searchQuery: surgeonName,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error searching Reddit:', error);
      throw new Error(`Reddit search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for posts mentioning the surgeon
   */
  private async searchPosts(
    query: string,
    subreddit: string,
    limit: number,
    timeRange: string
  ): Promise<RedditPost[]> {
    if (!this.snoowrap) throw new Error('Reddit API not initialized');

    try {
      const searchQuery = this.buildSearchQuery(query);
      const subredditObj = subreddit === 'all' ? this.snoowrap.getSubreddit('all') : this.snoowrap.getSubreddit(subreddit);
      
      const results = await subredditObj.search({
        query: searchQuery,
        sort: 'relevance',
        time: timeRange,
        limit: limit,
      });

      return results.map((post: any) => ({
        id: post.id,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author.name,
        subreddit: post.subreddit.display_name,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        permalink: post.permalink,
        url: post.url,
        is_self: post.is_self,
      }));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  /**
   * Search for comments mentioning the surgeon
   */
  private async searchComments(
    query: string,
    subreddit: string,
    limit: number,
    timeRange: string
  ): Promise<RedditComment[]> {
    if (!this.snoowrap) throw new Error('Reddit API not initialized');

    try {
      const searchQuery = this.buildSearchQuery(query);
      const subredditObj = subreddit === 'all' ? this.snoowrap.getSubreddit('all') : this.snoowrap.getSubreddit(subreddit);
      
      const results = await subredditObj.search({
        query: searchQuery,
        sort: 'relevance',
        time: timeRange,
        limit: limit,
        type: 'comment',
      });

      return results.map((comment: any) => ({
        id: comment.id,
        body: comment.body,
        author: comment.author.name,
        score: comment.score,
        created_utc: comment.created_utc,
        permalink: comment.permalink,
        parent_id: comment.parent_id,
      }));
    } catch (error) {
      console.error('Error searching comments:', error);
      return [];
    }
  }

  /**
   * Build a search query optimized for finding surgeon mentions
   */
  private buildSearchQuery(surgeonName: string): string {
    // Clean and optimize the surgeon name for Reddit search
    const cleanName = surgeonName
      .replace(/[^\w\s.-]/g, '') // Remove special characters except dots and dashes
      .trim();

    // Add hair transplant related terms to improve relevance
    const hairTerms = ['hair transplant', 'hair restoration', 'FUE', 'FUT', 'hair loss'];
    const queryTerms = [cleanName, ...hairTerms];
    
    return queryTerms.join(' ');
  }

  /**
   * Get comments from a specific post
   */
  public async getPostComments(postId: string, limit: number = 100): Promise<RedditComment[]> {
    if (!this.snoowrap) throw new Error('Reddit API not initialized');

    try {
      const post = this.snoowrap.getSubmission(postId);
      const comments = await post.comments.fetchMore({ amount: limit });

      return comments.map((comment: any) => ({
        id: comment.id,
        body: comment.body,
        author: comment.author.name,
        score: comment.score,
        created_utc: comment.created_utc,
        permalink: comment.permalink,
        parent_id: comment.parent_id,
      }));
    } catch (error) {
      console.error('Error fetching post comments:', error);
      return [];
    }
  }

  /**
   * Test Reddit API connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      // Try to fetch a simple post to test the connection
      const testPost = await this.snoowrap!.getSubmission('test');
      return true;
    } catch (error) {
      console.error('Reddit API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const redditAPI = new RedditAPIService();
