import fastifyRateLimit from '@fastify/rate-limit';
import { APIChatInputApplicationCommandInteraction, APIInteraction, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CommandContext } from '.';
import type { Suki } from '../Suki';

class WebServer {
  client: Suki;
  router: FastifyInstance;

  constructor(client: Suki) {
    this.client = client;
    this.router = fastify({ logger: false, trustProxy: 1 });
  }

  async start() {
    await this.router.register(fastifyRateLimit, { global: false });

    this.router.get('/', (_, res) => res.redirect('https://github.com/whoisniskii/Suki-Rewrite'));

    this.router.post('/interactions', (request, response) => this.handleRequest(request, response));

    this.router.listen({ port: this.client.config.interactions.port, host: '0.0.0.0' }, (err, address) => {
      if (err) throw err;
      this.client.logger.info(`Slash Commands Web Server started on ${address}.`, 'WEBSERVER');
    });
  }

  handleRequest(request: FastifyRequest, response: FastifyReply) {
    const signature = request.headers['x-signature-ed25519'] as string;
    const timestamp = request.headers['x-signature-timestamp'] as string;

    if (!signature || !timestamp || !request.body) return response.status(401).send('Invalid signature');

    const rawBody = JSON.stringify(request.body);
    const isValidRequest = verifyKey(rawBody, signature, timestamp, this.client.config.interactions.publicKey);

    if (!isValidRequest) return response.code(401).send('Invalid signature');

    const interaction = request.body as APIInteraction;

    const ctx = new CommandContext(interaction as APIChatInputApplicationCommandInteraction, this.client, response);

    switch (interaction.type) {
      case InteractionType.Ping:
        response.status(200).send({ type: InteractionResponseType.Pong });
        break;
      case InteractionType.ApplicationCommand:
        this.handleApplicationCommand(ctx);
        break;
      default:
        response.status(400).send({ error: 'Unknown Type' });
    }

    return null;
  }

  async handleApplicationCommand(context: CommandContext) {
    const command = this.client.commands.find(x => x.data.name === context.rawData.name);
    if (!command) return;

    try {
      await command.execute({ context });
    } catch (e) {
      console.log(e);
    }
  }
}

export { WebServer };
