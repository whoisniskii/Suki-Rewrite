import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ExecutorRunOptions } from '../../../classes';
import { Executor } from '../../../classes/Executor';
import type { Suki } from '../../../Suki';

export default class UserAvatarUserExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'View avatar';
    this.type = 'user';
  }

  async execute({ context }: ExecutorRunOptions) {
    context.showLoading(true);

    const user = await context.fetchUser(context.interaction.data.target_id);

    const avatarUrl = this.client.functions.displayAvatarURL(user);

    context.editInteraction({
      embeds: [
        {
          color: 10105592,
          title: user.username,
          image: {
            url: avatarUrl
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
