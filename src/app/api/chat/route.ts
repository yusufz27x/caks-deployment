import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, cityName } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Missing message in request body" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful travel assistant called "CAKS". The user is asking about ${cityName || 'their destination'}. 
    Their question is: "${message}"
    
    Most impartant thing is to answer the question in a messages language.

    Please provide a helpful, informative, and engaging response. Focus on:
    1. Directly addressing their specific question
    2. Providing practical and actionable advice
    3. Including relevant details about ${cityName || 'the destination'}
    4. Maintaining a friendly and conversational tone
    
    Format your response using Markdown:
    - Use **bold** for important information and key points
    - Use bullet points (*) for lists and options
    - Use proper spacing between sections
    - Keep your response concise but informative
    
    Example format:
    **Important Note:** This is a key point to remember.

    Here are your options:
    * **Option 1:** Description
    * **Option 2:** Description
    
    **CAKS Tip:** Additional helpful information like pro tips, etc.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 