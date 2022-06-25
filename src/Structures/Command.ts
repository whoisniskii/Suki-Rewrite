import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import type { Suki } from '../Suki';
import type { CommandContext } from './CommandContext';

export type SukiCommand = { default: new (_client: Suki) => Command };
export type CommandExecuteOptions = { context: CommandContext };

export class Command {
  client: Suki;
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  rawName: string;

  constructor(client: Suki) {
    this.client = client;
    this.rawName = '';
  }

  execute({ context }: CommandExecuteOptions): unknown {
    return { context };
  }
}
