import * as sentry from '@sentry/node';
import { Routes } from 'discord-api-types/v10';
import { lstat, readdir } from 'node:fs/promises';
import { request } from 'undici';
import { Command, DISCORD_API_URL, ExecutorManager, SukiCommand, SukiExecutor, WebServer } from './Structures';
import Logger from './Utils/Logger';
// @ts-ignore
import config from '../config';

class Suki {
  config: typeof config;
  logger: Logger;
  request: typeof request;
  commands: Command[];
  executors: ExecutorManager;
  server: WebServer;

  constructor() {
    this.config = config;
    this.logger = new Logger();
    this.request = request;

    this.commands = [];
    this.executors = new ExecutorManager();
    this.server = new WebServer(this);
  }

  get inviteUrl() {
    return `https://discord.com/api/oauth2/authorize?client_id=${this.config.client.id}&permissions=1516056734967&scope=applications.commands%20bot`;
  }

  async loadSlashCommands() {
    const categories = await readdir('./src/Commands/');
    // Load commands from the category
    for await (const category of categories) {
      const commands = await readdir(`./src/Commands/${category}`);
      // Filter items that aren't commands
      for await (const command of commands.filter(x => x.endsWith('.js'))) {
        const { default: CommandClass } = (await import(`./Commands/${category}/${command}`)) as SukiCommand;
        const cmd = new CommandClass(this);
        this.commands.push(cmd);
      }
    }

    this.logger.info('Commands loaded successfully.', 'COMMANDS');
  }

  async loadCommandExecutors() {
    const categories = await readdir('./src/Commands/');
    for await (const category of categories) {
      // Load executors from the category
      const executors = await readdir(`./src/Commands/${category}`);
      // Filter items that aren't directories
      const executorDirs = await Promise.all(
        executors.map(async x => {
          const r = await this.#isDir(`./src/Commands/${category}/${x}`);
          return r ? x : undefined;
        })
      );

      for await (const executorFolder of executorDirs.filter(x => x !== undefined)) {
        // Get the list of executors
        const executorList = await readdir(`./src/Commands/${category}/${executorFolder}`);
        for await (const executor of executorList) {
          const { default: ExecutorClass } = (await import(`./Commands/${category}/${executorFolder}/${executor}`)) as SukiExecutor;
          const exec = new ExecutorClass(this);
          this.executors.set(exec.name, exec.type, exec);
        }
      }
    }

    this.logger.info('Executors loaded successfully.', 'EXECUTORS');
  }

  async registerCommands() {
    const rawCmds = this.commands.map(x => x.data).filter(x => typeof x !== 'undefined');
    const rawExecutors = this.commands
      .map(x => x.executorData)
      .filter(x => typeof x !== 'undefined')
      .flat(Infinity);

    await this.request(DISCORD_API_URL + Routes.applicationCommands(this.config.client.id), {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${this.config.client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...rawCmds, ...rawExecutors])
    }).catch(err => {
      if (this.config.sentryConfig.sentryDSN && this.config.sentryConfig.useSentry) {
        sentry.captureException(err);
      }

      this.logger.error(err, 'REGISTER');
    });

    this.logger.info(`Posted ${this.commands.length} commands to Discord!`, 'COMMANDS');
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
