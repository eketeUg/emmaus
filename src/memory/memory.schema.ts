import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MemoryDocument = mongoose.HydratedDocument<Memory>;

@Schema()
export class Memory {
  @Prop({ required: true, index: true })
  whatsappId: string;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now, index: { expires: '30d' } })
  createdAt?: Date;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);
