import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ unique: true, required: true })
  whatsappId: string;

  @Prop()
  name: string;

  @Prop({ default: false })
  allowMemory?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
