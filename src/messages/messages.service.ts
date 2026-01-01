import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { IntentsService } from '../intents/intents.service';
import { Intent } from '../intents/intent.enum';
import { HardMomentsService } from '../hard-moments/hard-moments.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly intentsService: IntentsService,
    private readonly hardMomentsService: HardMomentsService,
    private readonly http: HttpService,
  ) {}

  async handleIncomingMessage(message: any) {
    if (!message) return;

    const from = message.from; // WhatsApp number
    const text = message.text?.body || '';

    // Step 1: Ensure user exists
    const user = await this.usersService.findOrCreate(from);

    // Step 2: Detect intent (hybrid AI + rule-based)
    const intent = await this.intentsService.classify(text);
    console.log(`User ${user.id} intent detected: ${intent}`);

    this.logger.log(`Message from ${from}: ${text}`);

    // Step 3: Hard-Moment handling overrides everything
    if (intent === Intent.HARD_MOMENT) {
      const level = this.hardMomentsService.analyze(text);
      const reply = this.hardMomentsService.respond(level);

      await this.sendMessage(from, reply);
      return;
    }

    // Step 4: Route to future handlers (Prayer, Bible, Devotion, General)
    // For now, temporary safe response
    switch (intent) {
      case Intent.PRAYER:
        await this.sendMessage(
          from,
          'I hear you. Would you like us to pray together?',
        );
        break;
      case Intent.BIBLE:
        await this.sendMessage(
          from,
          'Do you want a Bible verse or explanation?',
        );
        break;
      case Intent.DEVOTION:
        await this.sendMessage(from, 'Here is a short devotional for today...');
        break;
      case Intent.GENERAL:
      default:
        await this.sendMessage(from, 'Hello from Emmaus!');
    }
  }

  //   WhatsApp Sending Method
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
