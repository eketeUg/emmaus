import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type PrayerDocument = mongoose.HydratedDocument<Prayer>;

@Schema()
export class Prayer {
  @Prop({ required: true, index: true })
  whatsappId: string;

  @Prop({ required: true })
  request: string;

  @Prop({ default: false })
  answered: boolean;

  @Prop()
  answeredAt?: Date;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const PrayerSchema = SchemaFactory.createForClass(Prayer);
