import { ApplicationCommandType } from 'discord-api-types/v10';
import { ChatInputRunOptions, Command } from '../../Structures';
import type { Suki } from '../../Suki';

export default class PingExecutor extends Command {
  constructor(client: Suki) {
    super(client);

    this.data = { name: 'ping', description: 'Shows the bot ping', type: ApplicationCommandType.ChatInput, options: [] };
  }

  execute({ context }: ChatInputRunOptions) {
    context.replyInteraction({ content: 'Pong' });
  }
}
