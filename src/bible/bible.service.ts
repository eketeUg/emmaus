import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import OpenAI from 'openai';

@Injectable()
export class BibleService {
  private readonly logger = new Logger(BibleService.name);
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(private readonly http: HttpService) {}

  async handleBibleRequest(text: string): Promise<string> {
    try {
      const prompt = `
You are a Bible study assistant. Analyze the user's message.
Determine if they are asking for:
1. A specific Bible reference (e.g., "What does John 3:16 say?", "read Romans 12:1").
2. A thematic/topical query (e.g., "verses for anxiety", "what does God say about peace?").

Response format:
Return ONLY valid JSON:
{
  "type": "specific" | "thematic",
  "reference": "extracted reference or null if thematic (e.g., 'John 3:16')",
  "topic": "topic query or null if specific"
}
`;

      const analysis = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text },
        ],
      });

      const parsed = JSON.parse(analysis.choices[0].message.content || '{}');

      if (parsed.type === 'specific' && parsed.reference) {
        const verseText = await this.fetchVerse(parsed.reference);
        if (verseText) {
          return await this.generateReflection(
            parsed.reference,
            verseText,
            text,
          );
        }
      }

      return await this.generateThematicResponse(text);
    } catch (error) {
      this.logger.error('Error handling Bible request:', error);
      return "I couldn't look up that scripture right now, but God's Word is always full of hope. Let me know if there is another passage you'd like to explore.";
    }
  }

  async fetchVerse(reference: string): Promise<string | null> {
    try {
      const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=web`;
      const response = await firstValueFrom(this.http.get(url));
      if (response.data && response.data.text) {
        return response.data.text.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  private async generateReflection(
    reference: string,
    verseText: string,
    userQuery: string,
  ): Promise<string> {
    const prompt = `
You are Emmaus, a warm, empathetic Christian companion.
The user asked: "${userQuery}"
We found this scripture:
---
${reference}:
"${verseText}"
---
Write a reply that:
1. Presents the scripture clearly.
2. Offers a brief, encouraging, and warm reflection on the passage, aligning it to their query if relevant.
3. Keeps it concise, conversational, and suitable for a WhatsApp message. Use paragraphs and bold text for emphasis.
`;
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content || '';
  }

  private async generateThematicResponse(query: string): Promise<string> {
    const prompt = `
You are Emmaus, a warm, empathetic Christian companion.
The user is asking about a scriptural theme or has a Bible question: "${query}"

Write a reply that:
1. Recommends 1-2 relevant scriptures (citing book, chapter, and verse).
2. Explains how they apply to the user's situation/question.
3. Keep the tone loving, encouraging, and conversational.
4. Keep it concise and suitable for a WhatsApp message.
`;
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content || '';
  }
}
