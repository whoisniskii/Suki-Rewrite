import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ChatInputRunOptions } from '../../../classes';
import { Executor } from '../../../classes/Executor';
import type { Suki } from '../../../Suki';

export default class UserAvatarSlashExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'user avatar';
    this.type = 'slash';
  }

  async execute({ context }: ChatInputRunOptions) {
    context.showLoading(false);

    const userId = context.targetUser()?.id ?? context.user?.id;

    const user = await context.fetchUser(userId as string);

    const avatarUrl = this.client.functions.displayAvatarURL(user);

    context.editInteraction({
      embeds: [
        this.client.functions.createEmbed(
          {
            title: user.username,
            image: {
              url: avatarUrl
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
              url: avatarUrl
            }
          ]
        }
      ]
    });
  }
}
