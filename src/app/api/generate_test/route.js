import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a mulitple choice quiz creator, you take in multiple flashcards. For each flashcard use the question and create 3 incorrect answers and return the question and answer as well as all 4 asnwers in JSON
You should return in the following JSON format:
{
  "Questions": [
    {
      "question": "",
      "answer": "answer 3",
      "a": "answer 1",
      "b": "answer 2",
      "c": "answer 3",
      "d": "answer 4",
    }
  ]
}
`

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.text()

    const completion = await openai.chat.completions.create({
        messages: [
            {role: "system", content: systemPrompt},
            {role: "user", content: data}
        ],
        model: "gpt-3.5-turbo",
        response_format: {type:"json_object"}
    })

    const flashcards = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(flashcards.flashcards)
}
