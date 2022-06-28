import { APIApplicationCommandInteractionDataSubcommandOption, ApplicationCommandOptionType, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ChatInputRunOptions } from '../../../Structures';
import { Executor } from '../../../Structures/Executor';
import type { Suki } from '../../../Suki';

export default class UserBannerSlashExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'user';
    this.type = 'slash';
  }

  async execute({ context }: ChatInputRunOptions) {
    context.showLoading(false);

    const data = context.interaction.data.options?.find(x => x.type === ApplicationCommandOptionType.Subcommand && x.name === 'banner') as APIApplicationCommandInteractionDataSubcommandOption;

    const userId = (data.options?.find(x => x.type === ApplicationCommandOptionType.User)?.value as string) ?? context.user?.id;

    const user = await context.fetchUser(userId);

    if (!user.banner) {
      context.editInteraction({ content: 'This user has no banner.' });
    }

    const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner?.startsWith('a_') ? 'gif' : 'png'}?size=512`;

    context.editInteraction({
      embeds: [
        {
          color: 10105592,
          title: user.username,
          image: {
            url: bannerUrl
          },
          footer: {
            text: `${context.user?.username}#${context.user?.discriminator}`,
            icon_url:
              `https://cdn.discordapp.com/avatars/${context.user?.id}/${context.user?.avatar}.${context.user?.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=512` ??
              `https://cdn.discordapp.com/embed/avatars/${Number(context.user?.discriminator) % 5}.png`
          },
          timestamp: new Date().toISOString()
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
              url: bannerUrl
            }
          ]
        }
      ]
    });
  }
}
