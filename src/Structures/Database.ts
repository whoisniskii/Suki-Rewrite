import { PrismaClient } from '@prisma/client';
import type { Suki } from '../Suki';

class Database {
  client: Suki;
  prisma: PrismaClient;

  constructor(client: Suki) {
    this.client = client;
    this.prisma = new PrismaClient();

    this.client.logger.info('Database successfully connected', 'PRISMA');
  }

  async createGuildSchema(guildId: string) {
    const newGuild = await this.prisma.guild.create({
      data: {
        guild_id: parseInt(guildId),
        created_at: new Date()
      }
    });

    return newGuild;
  }

  async deleteGuildSchema(guildId: string) {
    const guild = await this.prisma.guild.delete({
      where: {
        guild_id: parseInt(guildId)
      }
    });

    return guild;
  }

  async createUserSchema(userId: string) {
    const newUser = await this.prisma.user.create({
      data: {
        user_id: parseInt(userId),
        created_at: new Date()
      }
    });

    return newUser;
  }

  async deleteUserSchema(userId: string) {
    const user = await this.prisma.user.delete({
      where: {
        user_id: parseInt(userId)
      }
    });

    return user;
  }

  async getPing() {
    const start = Date.now();
    await this.prisma.guild.count();

    return Date.now() - start;
  }
}

export { Database };
