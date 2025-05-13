const { ActivityType } = require('discord.js');
const chalk = require('chalk');


module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      console.log(chalk.magentaBright(`🤖 Bot conectado como ${client.user.tag}`));
      console.log(chalk.magentaBright(`📡 ID: ${client.user.id}`));
      console.log(chalk.greenBright(`🛒 Conectado em ${client.guilds.cache.size} servidor(es)`));

      // Configurar presença do bot
      client.user.setPresence({
        activities: [{
          name: 'suas compras 🛒',
          type: ActivityType.Watching
        }],
        status: 'idle'
      });
      console.log(chalk.blueBright('🎮 Status definido com sucesso!'));
      // Opcional: Verificar conexão com o servidor principal
      const guild = client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        console.warn(`⚠️ Servidor com GUILD_ID ${process.env.GUILD_ID} não encontrado`);
      } else {
        console.log(chalk.greenBright(`🏠 Servidor principal:`, (chalk.yellowBright(`${guild.name}`))));
        //console.log(`✅ Servidor principal: ${guild.name}`);
      }
    } catch (error) {
      console.error('❌ Erro no evento ready:', error.message);
    }
  }
};