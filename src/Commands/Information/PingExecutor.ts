import { ApplicationCommandType } from 'discord-api-types/v10';
import { Command, CommandExecuteOptions } from '../../Structures';
import type { Suki } from '../../Suki';

export default class PingExecutor extends Command {
  constructor(client: Suki) {
    super(client);

    this.data = { name: 'ping', description: 'Shows the bot ping', type: ApplicationCommandType.ChatInput, options: [] };
  }

  execute({ context }: CommandExecuteOptions) {
    context.replyInteraction({ content: 'pong' });
  }
}
