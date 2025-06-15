import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getCachedResponse, setCachedResponse } from '@/lib/cityCache';

// Gemini API anahtarınızı ortam değişkenlerinden alın
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

    // Önce önbelleği kontrol et
    try {
      const cachedResponse = await getCachedResponse(endpoint, cacheParams);
      if (cachedResponse) {
        console.log('Returning cached Gemini data for:', locationQuery);
        return NextResponse.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed for Gemini, proceeding with API call:', cacheError);
    }

    // gemini-2.0-flash modelini kullanın. Bu model hız için optimize edilmiştir.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // İstemi sadeleştirilmiş ve daha doğrudan hale getirilmiş hali
    const prompt = `Provide detailed information for the location "${locationQuery}" as a single JSON object.
The JSON object must contain the following top-level keys:
- "cityName": string
- "country": string
- "region": string (geographical region or state/province, e.g., "Marmara Region", "California", "Île-de-France")
- "state": string (administrative state/province if different from region, e.g., "Istanbul", "New York", "Hauts-de-Seine")
- "cityDescription": string (2-3 sentences, concise general description)
- "coordinates": object with "latitude": number and "longitude": number
- "attractions": array of objects
- "kitchens": array of objects
- "stays": array of objects

For each item within "attractions", "kitchens", and "stays" arrays, each object must have:
- "name": string
- "description": string (1-2 sentences, brief description)
- "website": string (URL or "N/A" if not available)
- "googleMapsLink": string (URL or "N/A" if not available)

Provide 6-12 relevant suggestions for each category (attractions, kitchens, stays) if possible.
If information for a category or specific field is not found, use an empty array for categories or "N/A" for fields.
Ensure geographical coordinates are accurate. If the location query is ambiguous, use the most common interpretation.

Example JSON structure:
{
  "cityName": "Istanbul",
  "country": "Turkey",
  "region": "Marmara Region",
  "state": "Istanbul",
  "cityDescription": "Istanbul, Turkey's largest city, is a vibrant metropolis that bridges Europe and Asia, known for its rich history, stunning architecture, and diverse culture.",
  "coordinates": {
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "attractions": [
    {
      "name": "Hagia Sophia",
      "description": "Historic Byzantine cathedral turned mosque, now a museum showcasing stunning architecture.",
      "website": "https://ayasofyacamii.gov.tr/",
      "googleMapsLink": "https://maps.google.com/maps?q=Hagia+Sophia"
    }
  ],
  "kitchens": [],
  "stays": []
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Gemini yanıtını JSON formatına uygun hale getir
    let cleanedText = text;
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7); // "```json" kısmını kaldır
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3); // Sondaki "```" kısmını kaldır
    }
    cleanedText = cleanedText.trim(); // Baştaki/sondaki boşlukları temizle

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // JSON ayrıştırma hatası durumunda ham yanıtı hata mesajıyla birlikte döndür
      return NextResponse.json(
        {
          error: "Failed to parse response from Gemini. Raw response included.",
          geminiRawResponse: text // Hata ayıklama için orijinal metni geri gönder
        },
        { status: 500 }
      );
    }

    // Başarılı yanıtı önbelleğe al
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