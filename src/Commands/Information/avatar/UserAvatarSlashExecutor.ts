import { APIApplicationCommandInteractionDataSubcommandOption, ApplicationCommandOptionType, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ChatInputRunOptions } from '../../../Structures';
import { Executor } from '../../../Structures/Executor';
import type { Suki } from '../../../Suki';

export default class UserAvatarSlashExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'user';
    this.type = 'slash';
  }

  async execute({ context }: ChatInputRunOptions) {
    context.showLoading(false);

    const data = context.interaction.data.options?.find(x => x.type === ApplicationCommandOptionType.Subcommand) as APIApplicationCommandInteractionDataSubcommandOption;

    const userId = (data.options?.find(x => x.type === ApplicationCommandOptionType.User)?.value as string) ?? context.user?.id;

    const user = await context.fetchUser(userId);

    let avatarUrl: string;

    if (user.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=512`;
    } else {
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;
    }

    context.editInteraction({
      embeds: [
        {
          color: 10105592,
          title: user.username,
          image: {
            url: avatarUrl
          },
          footer: {
            text: `${context.user?.username}#${context.user?.discriminator}`,
            icon_url:
              `https://cdn.discordapp.com/avatars/${context.user?.id}/${context.user?.avatar}.${context.user?.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=512` ??
              `https://cdn.discordapp.com/embed/avatars/${Number(context.user?.discriminator) % 5}.png`
          }
        }
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Link,
              label: 'Open in browser',
              url: avatarUrl
            }
          ]
        }
      ]
    });
  }
}
