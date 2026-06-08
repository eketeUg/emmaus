import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import OpenAI from 'openai';
import { UsersService } from '../users/users.service';
import { IntentsService } from '../intents/intents.service';
import { HardMomentsService } from '../hard-moments/hard-moments.service';
import { MemoryService } from '../memory/memory.service';
import { BibleService } from '../bible/bible.service';
import { PrayerService } from '../prayer/prayer.service';
import { CheckinsService } from '../checkins/checkins.service';
import { HardMomentLevel } from '../hard-moments/hard-moments.types';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    private readonly usersService: UsersService,
    private readonly intentsService: IntentsService,
    private readonly hardMomentsService: HardMomentsService,
    private readonly memoryService: MemoryService,
    private readonly bibleService: BibleService,
    private readonly prayerService: PrayerService,
    @Inject(forwardRef(() => CheckinsService))
    private readonly checkinsService: CheckinsService,
    private readonly http: HttpService,
  ) {}

  async handleIncomingMessage(message: any) {
    if (!message) return;

    const from = message.from; // WhatsApp number
    const text = message.text?.body || '';

    // Step 1: Ensure user exists
    const user = await this.usersService.findOrCreate(from);
    this.logger.log(`Message from ${from}: ${text}`);

    // Step 2: Critical crisis safety check (immediate bypass)
    if (this.isCrisis(text)) {
      const reply = this.hardMomentsService.respond(HardMomentLevel.CRISIS);
      console.log(`Generated reply for ${from}:\n${reply}`);
      await this.sendMessage(from, reply);
      await this.memoryService.saveMessage(
        from,
        'user',
        text,
        user.allowMemory,
      );
      await this.memoryService.saveMessage(
        from,
        'assistant',
        reply,
        user.allowMemory,
      );
      return;
    }

    // Step 3: Load recent memory context
    const recentMessages = await this.memoryService.getRecentContext(from);

    let reply = '';

    // Step 4: Run agentic OpenAI loop with Tool Calling
    try {
      const messages: any[] = [
        {
          role: 'system',
          content: `You are Emmaus, a warm, empathetic, and wise Christian faith companion chatbot.
Your goal is to walk with the user in their faith journey, offering loving support, spiritual wisdom, and gentle guidance.

When a user shares they are overwhelmed, stressed, lonely, or struggling, be deeply encouraging, listen actively, pray with them, and recommend a comforting Bible verse.

You have access to the following tools:
1. 'fetch_bible_verse' (reference): Fetch the exact text of a Bible verse/passage from bible-api.com to ensure absolute accuracy of God's Word. Always use this tool if you want to quote scripture, to ensure you do not make mistakes or hallucinate.
2. 'save_prayer_request' (request): Record a user's prayer request in the database if they ask for prayer or share a struggle they want prayer for.
3. 'log_mood_checkin' (moodText, sentiment): Log the user's emotional state if they share how they are feeling today (moodText: explanation of feelings, sentiment: 'positive' | 'neutral' | 'distressed').

Be agentic: reason about what the user needs, call the appropriate tools, and then synthesize a warm, comforting, Christ-centered response. Use bold formatting for scripture references and headings, and format with paragraphs for WhatsApp.`,
        },
        ...recentMessages,
        { role: 'user', content: text },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'fetch_bible_verse',
              description:
                'Fetch the exact text of a Bible verse or passage (e.g. John 3:16, Romans 8:28) to ensure textual accuracy.',
              parameters: {
                type: 'object',
                properties: {
                  reference: {
                    type: 'string',
                    description:
                      'The Bible scripture reference to look up, e.g., "John 3:16" or "Psalm 23:1-3".',
                  },
                },
                required: ['reference'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'save_prayer_request',
              description:
                "Record a user's prayer request in the database so we can pray for them and follow up on it later.",
              parameters: {
                type: 'object',
                properties: {
                  request: {
                    type: 'string',
                    description: 'The detailed prayer request description.',
                  },
                },
                required: ['request'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'log_mood_checkin',
              description:
                "Log the user's current emotional/spiritual mood and sentiment in the database to track their well-being.",
              parameters: {
                type: 'object',
                properties: {
                  moodText: {
                    type: 'string',
                    description: 'The details of how the user is feeling today.',
                  },
                  sentiment: {
                    type: 'string',
                    enum: ['positive', 'neutral', 'distressed'],
                    description:
                      'The classified emotional sentiment of the user.',
                  },
                },
                required: ['moodText', 'sentiment'],
              },
            },
          },
        ],
      });

      const assistantMessage = response.choices[0].message;
      messages.push(assistantMessage);

      if (
        assistantMessage.tool_calls &&
        assistantMessage.tool_calls.length > 0
      ) {
        for (const toolCall of assistantMessage.tool_calls) {
          const tc = toolCall as any;
          const args = JSON.parse(tc.function.arguments);
          let toolOutput = '';

          if (tc.function.name === 'fetch_bible_verse') {
            const verse = await this.bibleService.fetchVerse(args.reference);
            toolOutput = verse
              ? `[${args.reference}]: "${verse}"`
              : `Could not retrieve verse ${args.reference}.`;
          } else if (tc.function.name === 'save_prayer_request') {
            await this.prayerService.savePrayer(from, args.request);
            toolOutput = 'Prayer request successfully recorded in the database.';
          } else if (tc.function.name === 'log_mood_checkin') {
            await this.checkinsService.logCheckin(
              from,
              args.moodText,
              args.sentiment,
            );
            toolOutput = 'Mood check-in successfully logged in the database.';
          }

          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: tc.function.name,
            content: toolOutput,
          });
        }

        const secondResponse = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
        });

        reply = secondResponse.choices[0].message.content || '';
      } else {
        reply = assistantMessage.content || '';
      }
    } catch (error) {
      this.logger.error('Error in agentic reasoning loop:', error);
      reply =
        "Hello! I am Emmaus. I am here walking with you. How is your heart doing today?";
    }

    console.log(`Generated reply for ${from}:\n${reply}`);

    // Step 5: Send response via WhatsApp
    await this.sendMessage(from, reply);

    // Step 6: Save user message and reply to memory
    await this.memoryService.saveMessage(from, 'user', text, user.allowMemory);
    await this.memoryService.saveMessage(
      from,
      'assistant',
      reply,
      user.allowMemory,
    );
  }

  private isCrisis(text: string): boolean {
    const msg = text.toLowerCase();
    return (
      msg.includes('kill myself') ||
      msg.includes('suicide') ||
      msg.includes('end my life') ||
      msg.includes('i want to die')
    );
  }

  // WhatsApp Sending Method
  async sendMessage(to: string, message: string) {
    try {
      const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        type: 'text',
        to: to,
        text: { body: message },
      };

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      };

      const response = await firstValueFrom(
        this.http.post(url, payload, { headers }),
      );

      console.log(`Sent message to ${to}: ${message}`);
      console.log('WhatsApp API response:', response.data);
    } catch (error) {
      console.error(
        'Failed to send message:',
        error.response?.data || error.message,
      );
    }
  }
}
