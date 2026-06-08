import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type CheckinDocument = mongoose.HydratedDocument<Checkin>;

@Schema()
export class Checkin {
  @Prop({ required: true, index: true })
  whatsappId: string;

  @Prop({ required: true })
  moodText: string;

  @Prop({ required: true, enum: ['positive', 'neutral', 'distressed'] })
  sentiment: 'positive' | 'neutral' | 'distressed';

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const CheckinSchema = SchemaFactory.createForClass(Checkin);
