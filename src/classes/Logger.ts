export { Logger };

class Logger {
  static readonly Colors = {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\u001b[34m'
  };

  static get currentTime() {
    const currentDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    return `${Logger.Colors.BLUE}${currentDate}${Logger.Colors.RESET}`;
  }

  error(content: unknown, path = 'ERROR') {
    return console.error(`${Logger.currentTime} - ${Logger.Colors.RED}[ERROR]${Logger.Colors.RESET} - ${Logger.Colors.RED}[${path}]${Logger.Colors.RESET}: ${content}`);
  }

  info(content: unknown, path = 'INFO') {
    return console.log(`${Logger.currentTime} - ${Logger.Colors.GREEN}[INFO]${Logger.Colors.RESET} - ${Logger.Colors.BLUE}[${path}]${Logger.Colors.RESET}: ${content}`);
  }

  warn(content: unknown, path = 'WARN') {
    return console.warn(`${Logger.currentTime} - ${Logger.Colors.YELLOW}[WARN]${Logger.Colors.RESET} - ${Logger.Colors.YELLOW}[${path}]${Logger.Colors.RESET}: ${content}`);
  }
}
