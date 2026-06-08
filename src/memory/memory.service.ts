import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory } from './memory.schema';

@Injectable()
export class MemoryService {
  constructor(
    @InjectModel(Memory.name) private readonly memoryModel: Model<Memory>,
  ) {}

  async saveMessage(
    whatsappId: string,
    role: 'user' | 'assistant',
    content: string,
    allowMemory = false,
  ): Promise<void> {
    if (!allowMemory) {
      return;
    }
    await this.memoryModel.create({
      whatsappId,
      role,
      content,
    });
  }

  async getRecentContext(
    whatsappId: string,
    limit = 10,
  ): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
    const docs = await this.memoryModel
      .find({ whatsappId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Reverse to get chronological order (oldest first)
    return docs
      .reverse()
      .map((doc) => ({
        role: doc.role,
        content: doc.content,
      }));
  }
}
