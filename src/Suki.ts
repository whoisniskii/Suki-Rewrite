import * as sentry from '@sentry/node';
import { lstat, readdir } from 'node:fs/promises';
import { request } from 'undici';
import { Command, Database, ExecutorManager, SukiCommand, SukiExecutor, WebServer } from './Structures';
import Logger from './Utils/Logger';
// @ts-ignore
import config from '../config';

class Suki {
  config: typeof config;
  logger: Logger;
  request: typeof request;
  database: Database;
  commands: Command[];
  executors: ExecutorManager;
  server: WebServer;

  constructor() {
    this.config = config;
    this.logger = new Logger();
    this.request = request;
    this.database = new Database(this);

    this.commands = [];
    this.executors = new ExecutorManager();
    this.server = new WebServer(this);
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

  registerCommands() {
    const rawCmds = this.commands.filter(x => x.data).map(x => x.data);
    const rawExecutors = this.commands.filter(x => x.executorData).map(x => x.executorData);

    this.request(`https://discord.com/api/v10/applications/${this.config.client.id}/commands`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${this.config.client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...rawCmds, ...rawExecutors])
    }).catch(console.log);

    this.logger.info(`Posted ${this.commands.length} commands to Discord!`, 'COMMANDS');
  }

  async start() {
    await this.loadSlashCommands();
    await this.loadCommandExecutors();
    if (this.config.interactions.sentryDSN) {
      sentry.init({
        dsn: this.config.interactions.sentryDSN,
        release: 'Suki v0.0.1'
      });
      process.on('unhandledRejection', err => {
        sentry.captureException(err);
      });

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
