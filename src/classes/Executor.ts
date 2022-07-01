import type { Suki } from '../Suki';
import type { BaseCommandExecuteOptions } from './Command';

export type SukiExecutor = { default: new (_client: Suki) => Executor };

export { Executor };

class Executor {
  client: Suki;
  name: string;
  type: 'slash' | 'user' | 'message';

  constructor(client: Suki) {
    this.client = client;
  }

  execute({ context }: BaseCommandExecuteOptions): unknown {
    return { context };
  }
}
