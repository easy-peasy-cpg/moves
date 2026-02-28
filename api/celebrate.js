import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { moveTitle, category } = req.body;
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: "You are a hype friend celebrating someone completing a challenge. Be warm, fun, and specific to what they did. Keep it to 2-3 sentences. Ask them one fun question about the experience. Never use em dashes or en dashes in your responses. Use commas, periods, or separate sentences instead.",
      messages: [{
        role: "user",
        content: `My friend just completed this challenge: "${moveTitle}" (category: ${category}). Write a celebration prompt for them.`
      }]
    });
    res.json({ prompt: message.content[0].text });
  } catch (error) {
    console.error('Celebrate API error:', error);
    res.status(500).json({ error: 'Failed to generate celebration' });
  }
}
