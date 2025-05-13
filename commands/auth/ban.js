const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const License = require('../../models/License');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um usuário ou licença.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nome de usuário'))
        .addStringOption(option =>
            option.setName('license')
                .setDescription('Chave de licença')),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const username = interaction.options.getString('username');
            const licenseKey = interaction.options.getString('license');

            if (!username && !licenseKey) {
                return interaction.editReply({
                    content: '❌ Forneça um nome de usuário ou chave de licença.',
                    ephemeral: true
                });
            }

            if (username) {
                const user = await User.findOneAndUpdate(
                    { username },
                    { banned: true },
                    { new: true }
                );
                if (!user) {
                    return interaction.editReply({
                        content: `❌ Usuário **${username}** não encontrado.`,
                        ephemeral: true
                    });
                }
                await interaction.editReply({
                    content: `✅ Usuário **${username}** banido.`,
                    ephemeral: true
                });
            } else {
                const license = await License.findOneAndUpdate(
                    { key: licenseKey },
                    { banned: true },
                    { new: true }
                );
                if (!license) {
                    return interaction.editReply({
                        content: `❌ Licença **${licenseKey}** não encontrada.`,
                        ephemeral: true
                    });
                }
                await interaction.editReply({
                    content: `✅ Licença **${licenseKey}** banida.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('❌ Erro ao banir:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao banir: ${error.message}`,
                ephemeral: true
            });
        }
    }
};