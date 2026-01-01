import { Injectable } from '@nestjs/common';
import { HardMomentLevel } from './hard-moments.types';

@Injectable()
export class HardMomentsService {
  analyze(text: string): HardMomentLevel {
    const msg = text.toLowerCase();

    if (
      msg.includes('kill myself') ||
      msg.includes('suicide') ||
      msg.includes('end my life')
    ) {
      return HardMomentLevel.CRISIS;
    }

    if (
      msg.includes('hopeless') ||
      msg.includes('broken') ||
      msg.includes('why does god') ||
      msg.includes('angry at god')
    ) {
      return HardMomentLevel.DISTRESS;
    }

    return HardMomentLevel.HEAVY;
  }

  respond(level: HardMomentLevel): string {
    switch (level) {
      case HardMomentLevel.CRISIS:
        return `
I’m really sorry you’re feeling this much pain.
Your life matters deeply.

I’m not able to help with harming yourself,
but I want you to have real support right now.

If you can, please reach out to someone you trust.
If you’re in immediate danger, contact your local emergency number.

If you’re open to it, I can stay here and listen.
      `.trim();

      case HardMomentLevel.DISTRESS:
        return `
I’m really sorry you’re carrying this.
It sounds heavy, and you don’t have to rush to fix it.

If you want, tell me more about what’s been weighing on you.
I’m here to listen.
      `.trim();

      case HardMomentLevel.HEAVY:
        return `
That sounds really hard.
Sometimes just naming how we feel is a step forward.

Do you want to talk about what happened today?
      `.trim();
    }
  }
}
