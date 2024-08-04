import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request) {
  const { ingredients } = await request.json();
  
  try {
    const prompt = ingredients.includes('surprise me')
      ? "Generate a surprise recipe with random ingredients."
      : `Generate a recipe using some or all of these ingredients: ${ingredients.join(', ')}. Include a title for the recipe.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant that generates recipes."},
        {role: "user", content: prompt}
      ],
    });

    const recipeText = completion.choices[0].message.content;
    const [title, ...content] = recipeText.split('\n').filter(line => line.trim() !== '');

    const ingredientsIndex = content.findIndex(line => line.toLowerCase().includes('ingredients:'));
    const instructionsIndex = content.findIndex(line => line.toLowerCase().includes('instructions:'));

    const ingredientsList = content.slice(ingredientsIndex + 1, instructionsIndex).join('\n').trim();
    const instructionsList = content.slice(instructionsIndex + 1).join('\n').trim();

    return NextResponse.json({ 
        recipe: {
          title: title.replace('Title: ', ''),
          ingredients: ingredientsList,
          instructions: instructionsList
        }
      });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}
