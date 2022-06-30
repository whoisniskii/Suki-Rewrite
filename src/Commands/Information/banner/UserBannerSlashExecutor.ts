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
      return;
    }

    const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner?.startsWith('a_') ? 'gif' : 'png'}?size=512`;

    context.editInteraction({
      embeds: [
        this.client.functions.createEmbed(
          {
            title: user.username,
            image: {
              url: bannerUrl
            }
          },
          user
        )
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
