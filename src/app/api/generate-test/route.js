// pages/api/generate-test.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a multiple choice quiz creator. You take in a list of flashcards. For each flashcard, use the question and create 3 incorrect answers and return the question and answer as well as all 4 answers in JSON. For the correct answer, remove the punctuation mark at the end of the answer.
You should return in the following JSON format:
{
  "Questions": [
    {
      "question": "question 1",
      "answer": "answer 3",
      "a": "answer 1",
      "b": "answer 2",
      "c": "answer 3",
      "d": "answer 4"
    }
  ]
}
`;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.text();



  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: data }
      ]
    });

    const message = completion.choices[0].message.content;


    return NextResponse.json(JSON.parse(message));
  } catch (error) {
    console.error('Error generating test:', error);
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
  }
}
