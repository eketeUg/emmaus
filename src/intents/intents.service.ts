import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Intent } from './intent.enum';

@Injectable()
export class IntentsService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async classify(text: string): Promise<Intent> {
    // 🔒 SAFETY FIRST
    if (this.isCritical(text)) {
      return Intent.HARD_MOMENT;
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    });

    try {
      const raw = response.choices[0].message.content;
      const parsed = JSON.parse(raw);

      return parsed.intent as Intent;
    } catch {
      return Intent.GENERAL;
    }
  }

  private isCritical(text: string): boolean {
    const msg = text.toLowerCase();
    return (
      msg.includes('kill myself') ||
      msg.includes('suicide') ||
      msg.includes('end my life') ||
      msg.includes('i want to die')
    );
  }
}

const SYSTEM_PROMPT = `
You are an intent classification engine for a Christian faith companion chatbot.

Classify the user's message into ONE of the following intents:

- PRAYER: asking for prayer or praying together
- HARD_MOMENT: emotional pain, doubt, anger at God, despair
- BIBLE: Bible verses, meanings, scripture questions
- DEVOTION: daily devotionals or spiritual reflections
- CHECK_IN: responding to emotional check-ins
- GENERAL: greetings or casual conversation

Rules:
- Return ONLY valid JSON
- No explanations
- No extra text

Response format:
{
  "intent": "PRAYER | HARD_MOMENT | BIBLE | DEVOTION | CHECK_IN | GENERAL"
}
`;
