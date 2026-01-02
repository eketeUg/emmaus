import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    // @Req() request: any,
  ) {
    // console.log('hereee');
    // console.log(request);
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }
    return 'Verification failed';
  }

  @Post('webhook')
  async receiveMessage(@Body() body: any) {
    console.log(body);
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    console.log(message);
    if (!message) return;

    await this.messagesService.handleIncomingMessage(message);
  }
}
