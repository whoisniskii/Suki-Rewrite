import { ApplicationCommandType } from 'discord-api-types/v10';
import { Command, CommandExecuteOptions } from '../../Structures';
import type { Suki } from '../../Suki';

export default class PingCommand extends Command {
  constructor(client: Suki) {
    super(client);

    this.rawName = 'ping';
    this.data = { name: 'ping', description: 'Shows the bot ping', type: ApplicationCommandType.ChatInput, options: [] };
  }

  async execute({ context }: CommandExecuteOptions) {
    await context.replyMessage('Pong!');
  }
}
