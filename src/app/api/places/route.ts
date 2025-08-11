
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this route is dynamic

export async function GET(request: NextRequest) {
  console.log("/api/places GET request received");
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query'); // e.g., "hair transplant in sacramento"
  const radiusParam = searchParams.get('radius'); // Expected in meters
  const pageToken = searchParams.get('pagetoken'); // For fetching next page

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error("/api/places: Google Places API key (GOOGLE_PLACES_API_KEY) is not configured on the server.");
    return NextResponse.json({ error: 'API key not configured on server.' }, { status: 500 });
  }
  // console.log("/api/places: GOOGLE_PLACES_API_KEY is present.");

  let googleApiUrl = '';

  if (pageToken) {
    console.log("/api/places: Requesting next page with token:", pageToken);
    // Note: The 'fields' parameter is NOT used and NOT allowed when using a pagetoken.
    // Google returns the same fields as the original query that generated the token.
    googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${apiKey}`;
  } else if (query) {
    console.log("/api/places: Received query:", query);
    const fields = "place_id,name,formatted_address,rating,user_ratings_total,website,international_phone_number,address_components";
    googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&fields=${fields}`;
    if (radiusParam) {
      console.log("/api/places: Received radius:", radiusParam);
      googleApiUrl += `&radius=${radiusParam}`;
    }
  } else {
    console.error("/api/places: Query or pagetoken parameter is missing");
    return NextResponse.json({ error: 'Query or pagetoken parameter is required' }, { status: 400 });
  }
  
  console.log("/api/places: Requesting Google API URL:", googleApiUrl.replace(apiKey, 'REDACTED_API_KEY'));

  try {
    const apiResponse = await fetch(googleApiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await apiResponse.text();
    // console.log("/api/places: Raw response text from Google Places API:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("/api/places: Failed to parse JSON response from Google Places API. Raw text was:", responseText);
      return NextResponse.json({ error: 'Invalid response from Google Places API', details: "Could not parse JSON from Google." }, { status: 502 });
    }

    if (!apiResponse.ok) {
      console.error("/api/places: Google Places API error response (parsed):", data);
      // Pass through the status and error message from Google if available
      return NextResponse.json({ 
        error: data.error_message || data.status || `Google API request failed with status ${apiResponse.status}`,
        status_code_from_google: data.status // e.g., "INVALID_REQUEST", "ZERO_RESULTS"
      }, { status: apiResponse.status || 500 });
    }
    
    // console.log("/api/places: Successfully fetched and parsed data from Google Places API. Status:", data.status, "Next Page Token:", data.next_page_token);
    // The response from Google (data) will include `results` and `next_page_token` (if available).
    // We directly return this structure to the client.
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error("/api/places: Error fetching from Google Places API (server-side catch block):", error);
    let errorMessage = 'Failed to fetch data from Google Places API due to an internal error.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof TypeError) { // Often indicates a network issue or problem with fetch itself
        errorMessage = `Network error or failed to fetch from Google: ${errorMessage}`;
        return NextResponse.json({ error: errorMessage}, {status: 503 }); // Service Unavailable
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
