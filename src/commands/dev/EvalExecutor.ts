import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { inspect } from 'util';
import { ChatInputRunOptions, Command } from '../../classes';
import type { Suki } from '../../Suki';

export default class EvalExecutor extends Command {
  constructor(client: Suki) {
    super(client);

    this.data = {
      name: 'eval',
      description: 'Execute codes',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'code',
          description: 'The code to execute',
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    };
  }

  async execute({ context }: ChatInputRunOptions) {
    if (context.user?.id !== '847865068657836033') return;
    context.showLoading(false);

    const clean = (text: string) => {
      if (typeof text === 'string') {
        text
          .slice(0, 1970)
          .replace(/`/g, `\`${String.fromCharCode(8203)}`)
          .replace(/@/g, `@${String.fromCharCode(8203)}`);
      }
      return text;
    };

    try {
      const evaluate = await eval(context.getString('code') as string);

      context.editInteraction({
        content: `\`\`\`js\n${clean(inspect(evaluate, { depth: 0 }).slice(0, 1970))}\n\`\`\``
      });
    } catch (err) {
      context.editInteraction({ content: `\`\`\`js\n${err}\n\`\`\`` });
    }
  }
}
