import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import OpenAI from 'openai';
import { Checkin } from './checkins.schema';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class CheckinsService {
  private readonly logger = new Logger(CheckinsService.name);
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    @InjectModel(Checkin.name) private readonly checkinModel: Model<Checkin>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}

  async logCheckin(
    whatsappId: string,
    moodText: string,
    sentiment: 'positive' | 'neutral' | 'distressed',
  ): Promise<void> {
    await this.checkinModel.create({
      whatsappId,
      moodText,
      sentiment,
    });
  }

  async handleCheckInResponse(
    whatsappId: string,
    text: string,
  ): Promise<string> {
    try {
      const prompt = `
You are an emotional sentiment analysis engine. Analyze the following user mood check-in response:
"${text}"

Classify their sentiment into exactly one of: 'positive', 'neutral', or 'distressed'.

Return ONLY valid JSON:
{
  "sentiment": "positive" | "neutral" | "distressed"
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      const sentiment = parsed.sentiment || 'neutral';

      await this.logCheckin(whatsappId, text, sentiment);

      const replyPrompt = `
You are Emmaus, a warm, caring, and empathetic Christian companion.
The user responded to a heart check-in: "${text}"
Their emotional sentiment is analyzed as: "${sentiment}".

Write a gentle, conversational WhatsApp response that:
1. Validates their feelings and shows that you hear them.
2. If positive, celebrates with them.
3. If neutral, offers a warm, steady presence.
4. If distressed, responds with deep gentleness, offering a listening ear or suggesting a brief moment of quiet/reflection.
5. Keeps it concise (1-2 paragraphs), conversational, and caring.
`;

      const replyResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: replyPrompt }],
      });

      return replyResponse.choices[0].message.content || '';
    } catch (error) {
      this.logger.error('Error handling check-in response:', error);
      return "Thank you for sharing how you are doing. I'm here walking with you. How can I support you today?";
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyCheckins() {
    this.logger.log('Starting daily outbound check-ins...');
    try {
      const users = await this.usersService.findAll();
      for (const user of users) {
        const message = `Hi ${user.name || 'friend'}, this is Emmaus. 🌅 Just checking in—how is your heart doing today?`;
        await this.messagesService.sendMessage(user.whatsappId, message);
      }
      this.logger.log(`Successfully sent check-ins to ${users.length} users.`);
    } catch (error) {
      this.logger.error('Error sending scheduled check-ins:', error);
    }
  }
}
