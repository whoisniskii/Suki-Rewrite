import type { RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/v10';
import type { Suki } from '../Suki';
import type { CommandContext } from './CommandContext';

export type SukiCommand = { default: new (_client: Suki) => Command };
export type BaseCommandExecuteOptions = { context: CommandContext };

export class Command {
  client: Suki;
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  executorData?: RESTPostAPIContextMenuApplicationCommandsJSONBody[];

  constructor(client: Suki) {
    this.client = client;
  }

  execute({ context }: BaseCommandExecuteOptions): unknown {
    return { context };
  }
}
