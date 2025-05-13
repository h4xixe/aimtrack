const { REST, Routes } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

module.exports = async function registerCommands() {
  try {
    // Validar variáveis de ambiente
    if (!process.env.CLIENT_ID || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) {
      throw new Error('CLIENT_ID, GUILD_ID ou DISCORD_TOKEN não configurados no .env');
    }

    const commands = [];
    const commandFolders = await fs.readdir(path.join(__dirname, '../commands'));

    console.log('📂 Pastas de comandos encontradas:', commandFolders);

    for (const folder of commandFolders) {
      const commandFiles = (await fs.readdir(path.join(__dirname, '../commands', folder)))
        .filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const commandPath = path.join(__dirname, '../commands', folder, file);
        try {
          const command = require(commandPath);
          if (command.data && command.data.toJSON) {
            commands.push(command.data.toJSON());
            console.log(`✅ Comando preparado: ${command.data.name}`);
          } else {
            console.warn(`⚠️ Comando inválido: ${file}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao carregar comando ${file}:`, error.message);
        }
      }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    console.log(`📤 Iniciando registro de ${commands.length} comandos...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('✅ Todos os comandos foram registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error.message);
    throw error;
  }
};