import { NextRequest, NextResponse } from 'next/server';
import { redditSentimentService } from '@/lib/reddit-sentiment-service';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a scheduled function call or admin request
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    
    // Allow cron jobs or admin users
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { surgeonNames, updateDatabase = true } = await request.json();

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get surgeon names from database if not provided
    let surgeonsToProcess: string[] = surgeonNames || [];
    
    if (surgeonsToProcess.length === 0) {
      // Fetch all surgeons from database
      const surgeonsSnapshot = await adminDb.collection('surgeons').get();
      surgeonsToProcess = surgeonsSnapshot.docs.map(doc => {
        const data = doc.data();
        return data.name || doc.id;
      });
    }

    if (surgeonsToProcess.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No surgeons to process',
        processed: 0 
      });
    }

    console.log(`Starting background sentiment analysis for ${surgeonsToProcess.length} surgeons`);

    // Process surgeons in batches to avoid rate limits
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < surgeonsToProcess.length; i += batchSize) {
      const batch = surgeonsToProcess.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(surgeonsToProcess.length / batchSize)}`);
      
      try {
        const batchResults = await redditSentimentService.batchAnalyzeSurgeons(batch, {
          limit: 30,
          timeRange: 'month',
          includeComments: true,
        });

        results.push(...batchResults);

        // Update database if requested
        if (updateDatabase) {
          for (const result of batchResults) {
            await updateSurgeonSentimentInDatabase(result);
          }
        }

        // Add delay between batches
        if (i + batchSize < surgeonsToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        }
      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        // Continue with next batch
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: surgeonsToProcess.length,
      results: results.map(r => ({
        surgeonName: r.surgeonName,
        totalMentions: r.totalMentions,
        sentiment: r.sentiment.overallLabel,
        confidence: r.sentiment.confidence,
      })),
    });
  } catch (error) {
    console.error('Background agent error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Background processing failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * Update surgeon sentiment data in the database
 */
async function updateSurgeonSentimentInDatabase(sentimentData: any) {
  if (!adminDb) return;

  try {
    const { surgeonName, ...data } = sentimentData;
    
    // Find the surgeon document
    const surgeonsSnapshot = await adminDb
      .collection('surgeons')
      .where('name', '==', surgeonName)
      .limit(1)
      .get();

    if (surgeonsSnapshot.empty) {
      console.log(`Surgeon ${surgeonName} not found in database`);
      return;
    }

    const surgeonDoc = surgeonsSnapshot.docs[0];
    
    // Update with sentiment data
    await surgeonDoc.ref.update({
      redditSentiment: {
        ...data,
        lastUpdated: new Date(),
      },
    });

    console.log(`Updated sentiment data for ${surgeonName}`);
  } catch (error) {
    console.error(`Failed to update database for ${sentimentData.surgeonName}:`, error);
  }
}

// GET endpoint to check agent status
export async function GET() {
  try {
    const testResult = await redditSentimentService.testService();
    
    return NextResponse.json({
      success: true,
      status: {
        redditConnected: testResult.redditConnected,
        sentimentWorking: testResult.sentimentWorking,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Status check failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
