import { APIApplicationCommandInteraction, ApplicationCommandType } from 'discord-api-types/v10';
import type { Executor } from './Executor';

export type ExecutorType = 'slash' | 'user' | 'message';

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

    switch (type) {
      case ApplicationCommandType.ChatInput:
        return this.get(name, 'slash');
      case ApplicationCommandType.User:
        return this.get(name, 'user');
      case ApplicationCommandType.Message:
        return this.get(name, 'message');
      default:
        return null;
    }
  }
}
