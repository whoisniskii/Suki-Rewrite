import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ChatInputRunOptions } from '../../../classes';
import { Executor } from '../../../classes/Executor';
import type { Suki } from '../../../Suki';

export default class UserBannerSlashExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'user banner';
    this.type = 'slash';
  }

  async execute({ context }: ChatInputRunOptions) {
    context.showLoading(false);

    const userId = context.targetUsers()?.id ?? context.user?.id;

    const user = await context.fetchUser(userId as string);

    if (!user.banner) {
      context.editInteraction({ content: 'This user has no banner.' });
      return;
    }

    const bannerUrl = this.client.functions.displayBannerURL(user);

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
