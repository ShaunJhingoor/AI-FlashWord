import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  try {
    const openai = new OpenAI();
    const { deckContent, numberCards } = await req.json(); // Parse JSON body

    // Update the system prompt to generate the specified number of cards
    const systemPrompt = `
      You are a flashcard creator. You take in text and create multiple flashcards from it. 
      Make sure to create exactly ${numberCards} flashcards. Both front and back should be one sentence long.
      You should return in the following JSON format:
      {
        "flashcards": [
          {
            "question": "front text",
            "answer": "back text"
          }
        ]
      }
    `;

    // Use a ReadableStream to stream data to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Start streaming the response from OpenAI
          const completion = await openai.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: deckContent } // User's deck content
            ],
            model: "gpt-3.5-turbo",
            stream: true,  // Enable streaming
          });

          // Read chunks from the OpenAI stream and send them to the client
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || '';  // Extract chunked content
            controller.enqueue(new TextEncoder().encode(text));   // Send chunk to client
          }
          

          controller.close();
        } catch (error) {
          controller.error(error);  
        }
      }
    });


    return new NextResponse(stream);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
