import type { APIEmbed, APIUser } from 'discord-api-types/v10';
import type { CommandContext, ExecutorRunOptions } from '../../../classes';
import { Executor } from '../../../classes/Executor';
import type { Suki } from '../../../Suki';

export default class UserInfoUserExecutor extends Executor {
  constructor(client: Suki) {
    super(client);

    this.name = 'View info';
    this.type = 'user';
  }

  async execute({ context }: ExecutorRunOptions) {
    context.showLoading(true);

    const user = await context.fetchUser(context.interaction.data.target_id);

    if (user.bot) {
      context.editInteraction({ embeds: [await this.createMemberEmbed(context, user), await this.createApplicationEmbed(context, user.id)] });
    } else context.editInteraction({ embeds: [await this.createMemberEmbed(context, user)] });
  }

  createMemberEmbed(context: CommandContext, member: APIUser): APIEmbed {
    return this.client.functions.createEmbed(
      {
        author: {
          name: 'User information'
        },
        thumbnail: {
          url: member.avatar
            ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.${member.avatar.startsWith('a_') ? 'gif' : 'png'}?size=1024`
            : `https://cdn.discordapp.com/embed/avatars/${Number(member.discriminator) % 5}.png`
        },
        description: `[**${member.username}**](https://discord.com/users/${member.id})`,
        fields: [
          {
            name: '💻 ID on Discord',
            value: `\`${member.id}\``,
            inline: true
          },
          {
            name: '🏷️ Tag on Discord',
            value: `\`${member.username}#${member.discriminator}\``,
            inline: true
          },
          {
            name: '📅 Account Creation Date',
            value: `<t:${Math.round(this.client.functions.userCreatedTimestamp(member.id))}:F> (<t:${Math.round(this.client.functions.userCreatedTimestamp(member.id))}:R>)`,
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
