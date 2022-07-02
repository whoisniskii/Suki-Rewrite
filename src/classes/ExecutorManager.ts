import { APIApplicationCommandInteraction, APIContextMenuInteraction, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { BaseCommandExecuteOptions } from './Command';
import type { Executor } from './Executor';

export type ExecutorType = 'slash' | 'user' | 'message';
export type ExecutorRunOptions = Omit<BaseCommandExecuteOptions & BaseCommandExecuteOptions['context'], 'interaction'> & { context: { interaction: APIContextMenuInteraction } };

export { ExecutorManager };

class ExecutorManager {
  #data: Map<string, Executor>;
  constructor() {
    this.#data = new Map();
  }

  get(name: string, type: ExecutorType) {
    return this.#data.get(`${name}-${type}`);
  }

  set(name: string, type: ExecutorType, executor: Executor) {
    this.#data.set(`${name}-${type}`, executor);
  }

  retreive(data: APIApplicationCommandInteraction) {
    const { name, type } = data.data;

    let commandName = name;

    if (data.data.type === ApplicationCommandType.ChatInput) {
      const subcommandName = data.data.options?.find(x => x.type === ApplicationCommandOptionType.Subcommand)?.name;

      if (data.data.options?.find(x => x.type === ApplicationCommandOptionType.Subcommand)) {
        commandName = `${name} ${subcommandName}`;
      }
    }

    switch (type) {
      case ApplicationCommandType.ChatInput:
        return this.get(commandName, 'slash');
      case ApplicationCommandType.User:
        return this.get(name, 'user');
      case ApplicationCommandType.Message:
        return this.get(name, 'message');
      default:
        return null;
    }
  }
}
