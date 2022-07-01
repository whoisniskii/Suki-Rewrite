import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ExecutorRunOptions } from '../../../classes';
import { Executor } from '../../../classes/Executor';
import type { Suki } from '../../../Suki';

export default class UserBannerUserExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'View banner';
    this.type = 'user';
  }

  async execute({ context }: ExecutorRunOptions) {
    context.showLoading(true);

    const user = await context.fetchUser(context.interaction.data.target_id);

    if (!user.banner) {
      context.editInteraction({ content: 'This user has no banner.' });
      return;
    }

    const bannerUrl = this.client.functions.displayBannerURL(user);

    context.editInteraction({
      embeds: [
        {
          color: 10105592,
          title: user.username,
          image: {
            url: bannerUrl
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
              url: bannerUrl
            }
          ]
        }
      ]
    });
  }
}
