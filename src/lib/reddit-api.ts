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
      clinicName?: string;
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
      const queryVariants = this.buildSearchQueryVariants(surgeonName, options.clinicName);
      const perVariantLimit = Math.max(10, Math.ceil(limit / Math.max(1, queryVariants.length)));
      
      for (const subreddit of searchTarget) {
        for (const variant of queryVariants) {
          // Search for posts
          const posts = await this.searchPosts(variant, subreddit, perVariantLimit, timeRange);
          
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
            const comments = await this.searchComments(variant, subreddit, perVariantLimit, timeRange);
            
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
      }

      // Dedupe by type+permalink
      const seen = new Set<string>();
      const deduped: RedditMention[] = [];
      for (const m of mentions) {
        const key = `${m.type}:${m.permalink}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(m);
        }
      }
      totalFound = deduped.length;

      return {
        mentions: deduped,
        totalFound,
        searchQuery: queryVariants.join(' | '),
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
      const searchQuery = query; // Already built by caller
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
      const searchQuery = query; // Already built by caller
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
  private buildSearchQuery(surgeonName: string, clinicName?: string): string {
    // Clean and optimize the surgeon and clinic names for Reddit search
    const cleanName = surgeonName
      .replace(/[^\w\s.-]/g, '')
      .trim();
    const nameNoTitle = cleanName.replace(/^(dr\.?\s*)/i, '').trim();
    const lastName = nameNoTitle.split(/\s+/).pop() || '';
    const cleanClinic = (clinicName || '')
      .replace(/[^\w\s.-]/g, '')
      .trim();

    // Hair transplant related terms
    const hairTerms = ['hair transplant', 'hair restoration', 'FUE', 'FUT', 'hair loss'];

    // Build OR group for name/clinic variants
    const nameVariants = [cleanName, nameNoTitle, lastName].filter(v => v && v.length > 2);
    const clinicVariants = cleanClinic ? [cleanClinic] : [];
    const nameOrClinic = [...nameVariants, ...clinicVariants]
      .map(term => (term.includes(' ') ? `"${term}"` : term))
      .join(' OR ');

    const hairOr = hairTerms
      .map(term => (term.includes(' ') ? `"${term}"` : term))
      .join(' OR ');

    // Require at least one of (name OR clinic) AND at least one hair term
    return `(${nameOrClinic}) (${hairOr})`;
  }

  /**
   * Build multiple simple variants to increase recall
   */
  private buildSearchQueryVariants(surgeonName: string, clinicName?: string): string[] {
    const clean = (s: string) => s.replace(/[^\w\s.-]/g, '').trim();
    const cleanName = clean(surgeonName);
    const nameNoTitle = cleanName.replace(/^(dr\.?\s*)/i, '').trim();
    const lastName = (nameNoTitle.split(/\s+/).pop() || '').trim();
    const cleanClinic = clinicName ? clean(clinicName) : '';

    const hair = ['"hair transplant"', 'FUE', 'FUT', 'hairline', 'grafts'];

    const bases: string[] = [];
    if (cleanName) bases.push(`"${cleanName}"`);
    if (nameNoTitle && nameNoTitle !== cleanName) bases.push(`"${nameNoTitle}"`);
    if (lastName && lastName.length > 2) bases.push(lastName);
    if (cleanClinic) bases.push(`"${cleanClinic}"`);

    const variants: string[] = [];
    for (const b of bases) {
      variants.push(`${b} ${hair[0]}`);
      variants.push(`${b} ${hair[1]}`);
    }
    if (cleanName && cleanClinic) {
      variants.push(`"${cleanName}" "${cleanClinic}" ${hair[0]}`);
    }

    return Array.from(new Set(variants));
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
