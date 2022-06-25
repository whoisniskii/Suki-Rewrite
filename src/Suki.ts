import { readdir } from 'node:fs/promises';
import { request } from 'undici';
import { Command, SukiCommand, WebServer } from './Structures';
import Logger from './Utils/Logger';
// @ts-ignore
import config from '../config';

class Suki {
  config: typeof config;
  commands: Command[];
  server: WebServer;
  logger: Logger;
  request: typeof request;

  constructor() {
    this.config = config;
    this.request = request;
    this.commands = [];
    this.server = new WebServer(this);
    this.logger = new Logger();
  }

  async loadCommands() {
    const categories = await readdir('./src/Commands/');
    for await (const category of categories) {
      const commands = await readdir(`./src/Commands/${category}`);
      for await (const command of commands.filter(x => x.endsWith('.js'))) {
        const { default: CommandClass } = (await import(`./Commands/${category}/${command}`)) as SukiCommand;
        const cmd = new CommandClass(this);
        this.commands.push(cmd);
      }
    }

    this.logger.info('Commands loaded successfully.', 'COMMANDS');
  }

  registerCommands() {
    this.request(`https://discord.com/api/v10/applications/${this.config.client.id}/commands`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${this.config.client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.commands.map(x => x.data))
    }).catch(console.log);

    this.logger.info(`Posted ${this.commands.length} commands to Discord!`, 'COMMANDS');
  }

  async start() {
    await this.loadCommands();
    this.server.start();
  }
}

export { Suki };
