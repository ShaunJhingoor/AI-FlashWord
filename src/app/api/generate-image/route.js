// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// // Initialize OpenAI client with your API key
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function POST(req) {
//     const { deckId } = await req.json();
//     const prompt = `Generate an image related to the deck ID: ${deckId}`;
  
//     try {
//         // Correct method to call image generation
//         const response = await openai.images.generate({
//             prompt,
//             n: 1,              // Number of images
//             size: "1024x1024"  // Image size
//         });

//         const imageUrl = response.data[0].url;
//         return NextResponse.json({ imageUrl });
//     } catch (error) {
//         console.error('Error generating image:', error);
//         return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
//     }
// }
