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

    // Send the prompt to OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: deckContent } // User's deck content
      ],
      model: "gpt-3.5-turbo"
    });

    // Check if the response is valid and parse it correctly
    let flashcards;
    try {
      flashcards = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      throw new Error("Invalid JSON response from OpenAI.");
    }

    return NextResponse.json(flashcards.flashcards);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
