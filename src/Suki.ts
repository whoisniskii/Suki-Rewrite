import * as sentry from '@sentry/node';
import { lstat, readdir } from 'node:fs/promises';
import { request } from 'undici';
import { Command, ExecutorManager, SukiCommand, SukiExecutor, WebServer } from './structures';
import { Functions } from './utils/Functions';
import Logger from './utils/Logger';
// @ts-ignore
import config from '../config';

class Suki {
  config: typeof config;
  logger: Logger;
  request: typeof request;
  functions: Functions;
  commands: Command[];
  executors: ExecutorManager;
  server: WebServer;

  constructor() {
    this.config = config;
    this.logger = new Logger();
    this.request = request;
    this.functions = new Functions(this);

    this.commands = [];
    this.executors = new ExecutorManager();
    this.server = new WebServer(this);
  }

  get inviteUrl() {
    return `https://discord.com/api/oauth2/authorize?client_id=${this.config.client.id}&permissions=1516056734967&scope=applications.commands%20bot`;
  }

  async loadSlashCommands() {
    const categories = await readdir('./src/commands/');
    // Load commands from the category
    for await (const category of categories) {
      const commands = await readdir(`./src/commands/${category}`);
      // Filter items that aren't commands
      for await (const command of commands.filter(x => x.endsWith('.js'))) {
        const { default: CommandClass } = (await import(`./commands/${category}/${command}`)) as SukiCommand;
        const cmd = new CommandClass(this);
        this.commands.push(cmd);
      }
    }

    this.logger.info('Commands loaded successfully.', 'COMMANDS');
  }

  async loadCommandExecutors() {
    const categories = await readdir('./src/commands/');
    for await (const category of categories) {
      // Load executors from the category
      const executors = await readdir(`./src/commands/${category}`);
      // Filter items that aren't directories
      const executorDirs = await Promise.all(
        executors.map(async x => {
          const r = await this.#isDir(`./src/commands/${category}/${x}`);
          return r ? x : undefined;
        })
      );

      for await (const executorFolder of executorDirs.filter(x => x !== undefined)) {
        // Get the list of executors
        const executorList = await readdir(`./src/commands/${category}/${executorFolder}`);
        for await (const executor of executorList) {
          const { default: ExecutorClass } = (await import(`./commands/${category}/${executorFolder}/${executor}`)) as SukiExecutor;
          const exec = new ExecutorClass(this);
          this.executors.set(exec.name, exec.type, exec);
        }
      }
    }

    this.logger.info('Executors loaded successfully.', 'EXECUTORS');
  }

  async start() {
    await this.loadSlashCommands();
    await this.loadCommandExecutors();

    if (this.config.sentryConfig.sentryDSN && this.config.sentryConfig.useSentry) {
      sentry.init({
        dsn: this.config.sentryConfig.sentryDSN
      });
      process.on('unhandledRejection', err => sentry.captureException(err));
      this.logger.info('Sentry initialized successfully.', 'SENTRY');
    }

    this.server.start();
  }

  #isDir(path: string) {
    return lstat(path)
      .then(s => s.isDirectory())
      .catch(() => false);
  }
}

export { Suki };
