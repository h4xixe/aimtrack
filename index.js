const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs').promises;
const chalk = require('chalk');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
client.commands = new Collection();

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  mongoUri: process.env.MONGO_URI,
  risepay: {
    token: process.env.RISE_PAY_TOKEN,
    url: process.env.RISE_PAY_URL
  }
};

async function connectMongoDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
     console.log(chalk.magentaBright('🌐 MongoDB conectado com sucesso'));
  } catch (error) {
    console.error(chalk.bgRed.white(' ❌ Erro ao conectar ao MongoDB: '), chalk.yellow(error.message));
    process.exit(1);
  }
}

app.use(express.json());
const corsOptions = {
  origin: ['https://api.aimtrack.pro', 'http://aimtrack.pro'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use('/api', require('./routes/auth'));
app.use('/webhook', require('./routes/webhook'));
app.use('/uploads', express.static('uploads'));
app.use('/reset', require('./routes/reset.js'));
app.use('/fetchhwid', require('./routes/hwid.js'));

app.listen(3000, () => {
  console.log(chalk.greenBright('🔒 API online na porta 3000'));
  console.log(chalk.greenBright('📪 WebHook online na porta 3000'));
});

async function loadCommands() {
  try {
    const commandFolders = await fs.readdir(path.join(__dirname, 'commands'));
    console.log(chalk.cyanBright('📂 Pastas de comandos encontradas:', commandFolders));
    //console.log('📂 Pastas de comandos encontradas:', commandFolders);
    for (const folder of commandFolders) {
      const commandFiles = (await fs.readdir(path.join(__dirname, 'commands', folder)))
        .filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const commandPath = path.join(__dirname, 'commands', folder, file);
        try {
          const command = require(commandPath);
          if (command.data?.name) {
            client.commands.set(command.data.name, command);
            console.log(chalk.blueBright(`📦 Comando carregado: ${command.data.name}`));
           // console.log(`✅ Comando carregado: ${command.data.name}`);
          } else {
            console.log(chalk.red(`⚠️ Comando inválido: ${file}`));
           // console.warn(`⚠️ Comando inválido: ${file}`);
          }
        } catch (error) {
          console.log(chalk.red(`❌ Erro ao carregar comando ${file}:`, error.message));
         // console.error(`❌ Erro ao carregar comando ${file}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar comandos:', error.message);
  }
}

async function loadEvents() {
  try {
    const eventFiles = (await fs.readdir(path.join(__dirname, 'events')))
      .filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const eventPath = path.join(__dirname, 'events', file);
      const event = require(eventPath);
      const execute = (...args) => event.execute(...args, client);
      if (event.once) {
        client.once(event.name, execute);
      } else {
        client.on(event.name, execute);
      }
      console.log(chalk.magentaBright(`⏰ Evento carregado: ${event.name}`));
     // console.log(`✅ Evento carregado: ${event.name}`);
    }
  } catch (error) {
    console.error('❌ Erro ao carregar eventos:', error.message);
  }
}

async function initializeBot() {
  try {
    if (process.argv.includes('--register')) {
      const registerCommands = require('./utils/registerCommands.js');
      await registerCommands();
      console.log('✅ Comandos registrados com sucesso');
      process.exit(0);
    }

    await connectMongoDB();

    await Promise.all([
      loadCommands(),
      loadEvents()
    ]);

    await client.login(config.token);
    console.log(chalk.cyanBright('🚀 Bot conectado ao Discord!'));
   // console.log('✅ Bot conectado ao Discord');
  } catch (error) {
    console.error('❌ Erro na inicialização do bot:', error.message);
    process.exit(1);
  }
}

initializeBot();

process.on('unhandledRejection', error => {
  console.error('❌ Erro não capturado:', error.message);
});
process.on('uncaughtException', error => {
  console.error('❌ Exceção não capturada:', error.message);
});