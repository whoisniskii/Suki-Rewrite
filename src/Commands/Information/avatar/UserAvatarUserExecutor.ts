import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ExecutorRunOptions } from '../../../Structures';
import { Executor } from '../../../Structures/Executor';
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
