import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { ChatInputRunOptions, Command } from '../../structures';
import type { Suki } from '../../Suki';

export default class UserExecutor extends Command {
  constructor(client: Suki) {
    super(client);

    this.data = {
      name: 'user',
      description: 'Shows the user infos',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'avatar',
          type: ApplicationCommandOptionType.Subcommand,
          description: 'Shows the user avatar',
          options: [
            {
              name: 'user',
              description: 'The user to show the avatar',
              type: ApplicationCommandOptionType.User,
              required: false
            }
          ]
        },
        {
          name: 'banner',
          type: ApplicationCommandOptionType.Subcommand,
          description: 'Shows the user banner',
          options: [
            {
              name: 'user',
              description: 'The user to show the banner',
              type: ApplicationCommandOptionType.User,
              required: false
            }
          ]
        },
        {
          name: 'info',
          type: ApplicationCommandOptionType.Subcommand,
          description: 'Shows the user info',
          options: [
            {
              name: 'user',
              description: 'The user to show the info',
              type: ApplicationCommandOptionType.User,
              required: false
            }
          ]
        }
      ]
    };
    this.executorData = [
      {
        name: 'View avatar',
        type: ApplicationCommandType.User
      },
      {
        name: 'View banner',
        type: ApplicationCommandType.User
      },
      {
        name: 'View info',
        type: ApplicationCommandType.User
      }
    ];
  }

  async execute({ context }: ChatInputRunOptions) {
    await this.client.executors.retreive(context.interaction)?.execute({ context });
  }
}
