import { APIApplicationCommandInteractionDataSubcommandOption, ApplicationCommandOptionType, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type { ChatInputRunOptions } from '../../../structures';
import { Executor } from '../../../structures/Executor';
import type { Suki } from '../../../Suki';

export default class UserAvatarSlashExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'user';
    this.type = 'slash';
  }

  async execute({ context }: ChatInputRunOptions) {
    context.showLoading(false);

    const data = context.interaction.data.options?.find(x => x.type === ApplicationCommandOptionType.Subcommand && x.name === 'avatar') as APIApplicationCommandInteractionDataSubcommandOption;

    const userId = (data.options?.find(x => x.type === ApplicationCommandOptionType.User)?.value as string) ?? context.user?.id;

    const user = await context.fetchUser(userId);

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
