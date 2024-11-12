// app/api/search/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query"); // The search keyword
  const start = searchParams.get("start") || 1; // The start index, default to 1 if not provided

  const googleSearchAPIKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleSearchEngineID = process.env.GOOGLE_SEARCH_ENGINE_ID;

  // Ensure API key and search engine ID are set
  if (!googleSearchAPIKey || !googleSearchEngineID) {
    return NextResponse.json(
      { error: "API key or Search Engine ID not set" },
      { status: 500 }
    );
  }

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&start=${start}&key=${googleSearchAPIKey}&cx=${googleSearchEngineID}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check if there is an error from Google Search API
    if (data.error) {
      console.error("Google Search API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
