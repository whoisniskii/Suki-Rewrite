import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ExecutorRunOptions } from '../../../Structures';
import { Executor } from '../../../Structures/Executor';
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
    }

    const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner?.startsWith('a_') ? 'gif' : 'png'}?size=512`;

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
