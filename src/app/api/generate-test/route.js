// pages/api/generate-test.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a multiple-choice quiz creator. From the list of flashcards provided, generate a total of 10 multiple-choice questions. Each question should include:
- The question text.
- The correct answer.
- Three incorrect answers.

Ensure that the correct answer is always included among the choices and is randomly placed. Label the choices as 'a', 'b', 'c', and 'd'. The output should be in the following JSON format:
{
  "Questions": [
    {
      "question": "question 1",
      "answer": "correct answer",
      "a": "incorrect answer 1",
      "b": "incorrect answer 2",
      "c": "incorrect answer 3",
      "d": "correct answer"
    },
    ...
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
    console.log(message)

    return NextResponse.json(JSON.parse(message));
  } catch (error) {
    console.error('Error generating test:', error);
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
  }
}
