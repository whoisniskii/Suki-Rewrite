import type { APIEmbed, APIUser } from 'discord-api-types/v10';
import type { ChatInputRunOptions, CommandContext } from '../../../classes';
import { Executor } from '../../../classes/Executor';
import type { Suki } from '../../../Suki';

export default class UserInfoSlashExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'user info';
    this.type = 'slash';
  }

  async execute({ context }: ChatInputRunOptions) {
    context.showLoading(false);

    const userId = context.targetUser()?.id ?? context.user?.id;

    const user = await context.fetchUser(userId as string);

    if (!user) {
      context.editInteraction({ content: 'User not found.' });
      return;
    }

    if (user.bot) {
      context.editInteraction({ embeds: [await this.createMemberEmbed(context, user), await this.createApplicationEmbed(context, user.id)] });
    } else context.editInteraction({ embeds: [await this.createMemberEmbed(context, user)] });
  }

  createMemberEmbed(context: CommandContext, user: APIUser): APIEmbed {
    return this.client.functions.createEmbed(
      {
        author: {
          name: 'User information'
        },
        thumbnail: {
          url: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=1024`
            : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
        },
        description: `[**${user.username}**](https://discord.com/users/${user.id})`,
        fields: [
          {
            name: '💻 ID on Discord',
            value: `\`${user.id}\``,
            inline: true
          },
          {
            name: '🏷️ Tag on Discord',
            value: `\`${user.username}#${user.discriminator}\``,
            inline: true
          },
          {
            name: '📅 Account Creation Date',
            value: `<t:${Math.round(this.client.functions.userCreatedTimestamp(user.id))}:F> (<t:${Math.round(this.client.functions.userCreatedTimestamp(user.id))}:R>)`,
            inline: false
          }
        ]
      },
      context.user
    );
  }

  async createApplicationEmbed(context: CommandContext, applicationId: string): Promise<APIEmbed> {
    const application = await this.client.functions.getApplication(applicationId);

    const data = this.client.functions.createEmbed(
      {
        author: {
          name: 'Application information'
        },
        title: application.name,
        fields: [
          {
            name: '💻 Support Server ID',
            value: application.guild_id ? `\`${application.guild_id}\`` : `\`No support server\``,
            inline: true
          },
          {
            name: '🏷️ Tags',
            value: application.tags ? application.tags.join(', ') : `\`No tags\``,
            inline: true
          },
          {
            name: '💻 HTTP Request Public Key',
            value: `\`${application.verify_key}\``,
            inline: true
          }
        ]
      },
      context.user
    );

    if (application.description) Object.assign(data, { description: `${application.description.replace(/\n/g, '\n')}` });
    if (application.icon)
      Object.assign(data, {
        thumbnail: {
          url: `https://cdn.discordapp.com/app-icons/${application.id}/${application.icon}`
        }
      });

    return data;
  }
}
