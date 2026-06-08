import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Prayer } from './prayer.schema';

@Injectable()
export class PrayerService {
  private readonly logger = new Logger(PrayerService.name);
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    @InjectModel(Prayer.name) private readonly prayerModel: Model<Prayer>,
  ) {}

  async savePrayer(whatsappId: string, request: string): Promise<void> {
    await this.prayerModel.create({
      whatsappId,
      request,
    });
  }

  async handlePrayerRequest(whatsappId: string, text: string): Promise<string> {
    try {
      // Save prayer request to DB
      await this.savePrayer(whatsappId, text);

      const prompt = `
You are Emmaus, a warm, caring, and empathetic Christian companion.
The user has shared this prayer request: "${text}"

Write a prayer that:
1. Is addressed to God/Father, praying on behalf of or with the user.
2. Is deeply empathetic, gentle, and scriptural.
3. Expresses hope, peace, and reliance on God.
4. Keep it concise, suitable for reading in a WhatsApp message, formatted in paragraph form.
5. Close the prayer with a warm word of comfort.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Error handling prayer request:', error);
      return "I hear your request, and I've noted it down. I am praying for you right now. Remember that God is always near, listening to the cries of our hearts. Is there anything else you want to share?";
    }
  }
}
