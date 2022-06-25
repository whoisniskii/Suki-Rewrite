import {
  APIApplicationCommandInteraction,
  APIInteractionResponseCallbackData,
  InteractionResponseType,
  RESTPatchAPIChannelMessageResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult
} from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import type { Suki } from '../Suki';

export type MessageSend = string | RESTPostAPIChannelMessageJSONBody;

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

  replyMessage(content: string | APIInteractionResponseCallbackData) {
    const data = typeof content === 'string' ? { content } : content;

    this.response.status(200).send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data
    });
  }

  async createMessage(channelId: string, content: MessageSend): Promise<RESTPostAPIChannelMessageResult | null> {
    const data = await this.client
      .request(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (https://github.com/whoisniskii/Suki-Rewrite, 0.0.1)'
        },
        body: this.#transformContent(content)
      })
      .then(res => res.body.json());

    return data;
  }

  async editOriginalMessage(channelId: string, messageId: string, content: MessageSend): Promise<RESTPatchAPIChannelMessageResult | null> {
    const data = await this.client
      .request(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${this.client.config.client.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (https://github.com/whoisniskii/Suki-Rewrite, 0.0.1)'
        },
        body: this.#transformContent(content)
      })
      .then(res => res.body.json());

    return data;
  }

  #transformContent(content: MessageSend) {
    if (typeof content === 'string') {
      return content;
    }

    return JSON.stringify(content);
  }
}

export { CommandContext };
