import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getCachedResponse, setCachedResponse } from '@/lib/amadeusCache';

// Get your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { locationQuery } = await request.json();

    if (!locationQuery) {
      return NextResponse.json(
        { error: "Missing locationQuery in request body" },
        { status: 400 }
      );
    }

    const endpoint = 'gemini';
    const cacheParams = { locationQuery };

    // Check cache first
    try {
      const cachedResponse = await getCachedResponse(endpoint, cacheParams);
      if (cachedResponse) {
        console.log('Returning cached Gemini data for:', locationQuery);
        return NextResponse.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed for Gemini, proceeding with API call:', cacheError);
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Based on the location "${locationQuery}", provide the following information:
1.  Canonical City Name
2.  Country
3.  A concise general description of the city (2-3 sentences).
4.  Geographical Coordinates (latitude and longitude).
5.  Top attractions
6.  Top kitchens (restaurants or local eateries)
7.  Top stays (hotels, guesthouses, or unique accommodations)

For each attraction, kitchen, and stay, provide:
    a. Name
    b. A brief description (1-2 sentences)
    c. Website (if available, otherwise "N/A")
    d. Google Maps Link

Format the output as a single JSON object with the following top-level keys:
- "cityName": string
- "country": string
- "cityDescription": string
- "coordinates": object with "latitude": number and "longitude": number
- "attractions": array of objects (each with "name", "description", "website", "googleMapsLink")
- "kitchens": array of objects (each with "name", "description", "website", "googleMapsLink")
- "stays": array of objects (each with "name", "description", "website", "googleMapsLink")

Example for the top-level structure and one attraction:
{
  "cityName": "Paris",
  "country": "France",
  "cityDescription": "Paris, France's capital, is a major European city and a global center for art, fashion, gastronomy and culture.",
  "coordinates": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "attractions": [
    {
      "name": "Eiffel Tower",
      "description": "Iconic Parisian landmark offering breathtaking city views.",
      "website": "https://www.toureiffel.paris/",
      "googleMapsLink": "https://maps.app.goo.gl/..."
    }
  ],
  "kitchens": [],
  "stays": []
}

Provide at least 3-5 suggestions for each category (attractions, kitchens, stays) if possible. If you cannot find information for a category or a specific field (like website), use an empty array for categories or appropriate placeholders like "N/A" for fields. Ensure coordinates are accurate. If the location query is ambiguous, use the most common interpretation.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the text response from Gemini
    let cleanedText = text;
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7); // Remove ```json

    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim(); // Trim any leading/trailing whitespace

    // Attempt to parse the text as JSON. If it fails, return the raw text.
    let data;
    try {
        data = JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error parsing Gemini response:", error);
        // If parsing fails, we'll return the raw text along with an error message.
        // This helps in debugging the prompt or the model's output format.
        return NextResponse.json(
            { 
                error: "Failed to parse response from Gemini. Raw response included.",
                geminiRawResponse: text // send back the original text for debugging
            },
            { status: 500 }
        );
    }

    // Cache the successful response
    try {
      await setCachedResponse(endpoint, cacheParams, data);
      console.log('Cached new Gemini data for:', locationQuery);
    } catch (cacheError) {
      console.warn('Failed to cache Gemini response:', cacheError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 