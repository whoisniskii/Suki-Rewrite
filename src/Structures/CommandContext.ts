import {
  APIApplicationCommandInteraction,
  APIInteractionResponseCallbackData,
  APIUser,
  InteractionResponseType,
  RESTPatchAPIChannelMessageResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
  Routes
} from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import type { Suki } from '../Suki';

export type MessageSend = string | RESTPostAPIChannelMessageJSONBody;

export const DISCORD_API_URL = 'https://discord.com/api/v10';

class CommandContext {
  interaction: APIApplicationCommandInteraction;
  rawData: APIApplicationCommandInteraction['data'];
  client: Suki;
  response: FastifyReply;

  constructor(interaction: APIApplicationCommandInteraction, client: Suki, response: FastifyReply) {
    this.interaction = interaction;
    this.rawData = interaction.data;
    this.client = client;
    this.response = response;
  }

  get user() {
    return this.interaction.user;
  }

  get member() {
    return this.interaction.member;
  }

  get channelId() {
    return this.interaction.channel_id;
  }

  get guildId() {
    return this.interaction.guild_id;
  }

  get database() {
    return this.client.database;
  }

  replyInteraction(data: APIInteractionResponseCallbackData) {
    this.response.status(200).send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data
    });
  }

  async editInteraction(content: string | APIInteractionResponseCallbackData) {
    const response = (await this.client
      .request(DISCORD_API_URL + Routes.webhookMessage(this.interaction.application_id, this.interaction.token, '@original'), {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (https://github.com/whoisniskii/Suki-Rewrite, 0.0.1)'
        },
        body: this.#transformContent(content)
      })
      .then(res => res.body.json())) as APIInteractionResponseCallbackData;

    return response;
  }

  showLoading(ephemeral = false) {
    this.response.status(200).send({
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: {
        flags: ephemeral ? 64 : undefined
      }
    });
  }

  async createMessage(channelId: string, content: MessageSend): Promise<RESTPostAPIChannelMessageResult | null> {
    const data = (await this.client
      .request(DISCORD_API_URL + Routes.channelMessages(channelId), {
        method: 'POST',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (https://github.com/whoisniskii/Suki-Rewrite, 0.0.1)'
        },
        body: this.#transformContent(content)
      })
      .then(res => res.body.json())) as RESTPostAPIChannelMessageResult;

    return data;
  }

  async editOriginalMessage(channelId: string, messageId: string, content: MessageSend): Promise<RESTPatchAPIChannelMessageResult | null> {
    const data = (await this.client
      .request(DISCORD_API_URL + Routes.channelMessage(channelId, messageId), {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (https://github.com/whoisniskii/Suki-Rewrite, 0.0.1)'
        },
        body: this.#transformContent(content)
      })
      .then(res => res.body.json())) as RESTPatchAPIChannelMessageResult;

    return data;
  }

  async fetchUser(userId: string) {
    const data = (await this.client
      .request(DISCORD_API_URL + Routes.user(userId), {
        method: 'GET',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (https://github.com/whoisniskii/Suki-Rewrite, 0.0.1)'
        }
      })
      .then(res => res.body.json())) as APIUser;

    return data;
  }

  #transformContent(content: MessageSend) {
    if (typeof content === 'string') return content;
    return JSON.stringify(content);
  }
}

export { CommandContext };
