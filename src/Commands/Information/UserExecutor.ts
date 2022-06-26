import { ApplicationCommandType } from 'discord-api-types/v10';
import { Command, CommandExecuteOptions } from '../../Structures';
import type { Suki } from '../../Suki';

export default class UserExecutor extends Command {
  constructor(client: Suki) {
    super(client);

    this.data = { name: 'avatar', description: 'Shows the user avatar', type: ApplicationCommandType.ChatInput, options: [] };
    this.executorData = [
      {
        name: 'View avatar',
        type: ApplicationCommandType.User
      }
    ];
  }

  async execute({ context }: CommandExecuteOptions) {
    await this.client.executors.retreive(context.interaction)?.execute({ context });
  }
}
