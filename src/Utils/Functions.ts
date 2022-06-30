import { DiscordSnowflake } from '@sapphire/snowflake';
import * as sentry from '@sentry/node';
import { APIApplication, APIEmbed, APIUser, Routes } from 'discord-api-types/v10';
import { DISCORD_API_URL } from '../Structures';
import type { Suki } from '../Suki';

export class Functions {
  client: Suki;

  constructor(client: Suki) {
    this.client = client;

    client.logger.info('Functions loaded successfully.', 'FUNCTIONS');
  }

  async getApplication(applicationId: string) {
    return (await this.client.request(`https://discord.com/api/v10/applications/${applicationId}/rpc`, { method: 'GET' }).then(data => data.body.json())) as APIApplication;
  }

  async registerCommands() {
    const rawCmds = this.client.commands.map(x => x.data).filter(x => typeof x !== 'undefined');
    const rawExecutors = this.client.commands
      .map(x => x.executorData)
      .filter(x => typeof x !== 'undefined')
      .flat(Infinity);

    await this.client
      .request(DISCORD_API_URL + Routes.applicationCommands(this.client.config.client.id), {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...rawCmds, ...rawExecutors])
      })
      .catch(err => {
        if (this.client.config.sentryConfig.sentryDSN && this.client.config.sentryConfig.useSentry) {
          sentry.captureException(err);
        }

        this.client.logger.error(err, 'REGISTER');
      });

    this.client.logger.info(`Posted ${this.client.commands.length} commands to Discord!`, 'COMMANDS');
  }

  userCreatedTimestamp(userId: string) {
    return Math.round(DiscordSnowflake.timestampFrom(userId) / 1000);
  }

  displayAvatarURL(user: APIUser | undefined, size?: number) {
    if (!user?.avatar && !user) return 'https://cdn.discordapp.com/embed/avatars/0.png';

    return (
      `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=${size?.toString() ?? '512'}` ??
      `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
    );
  }

  createEmbed(data: Partial<APIEmbed>, user?: APIUser): APIEmbed {
    if (!user)
      return {
        ...data
      };

    return {
      ...data,
      color: 10105592,
      footer: {
        text: `${user.username}#${user.discriminator}`,
        icon_url: this.displayAvatarURL(user)
      },
      timestamp: new Date().toISOString()
    };
  }
}
