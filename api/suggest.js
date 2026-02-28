import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, existingMoves, seasonLength } = req.body;
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: "You suggest challenge ideas for a friend group accountability app. Return exactly 8 suggestions as a JSON array of objects with 'title' (string) and 'isCollab' (boolean, true if it's better done with a partner). Be specific and actionable. Mix easy wins with ambitious ones. Scale difficulty to the season length. Never use em dashes or en dashes in your responses. Use commas, periods, or separate sentences instead.",
      messages: [{
        role: "user",
        content: `Suggest 8 challenge ideas for the "${category}" category. Season length: ${seasonLength}. Already in the pool: ${JSON.stringify(existingMoves || [])}. Return only a JSON array, no other text.`
      }]
    });
    const text = message.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggest API error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
