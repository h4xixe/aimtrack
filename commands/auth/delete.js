const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');
const License = require('../../models/License');
const Session = require('../../models/Session');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deleta um usuário ou licença.')
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
                const user = await User.findOne({ username });
                if (!user) {
                    return interaction.editReply({
                        content: `❌ Usuário **${username}** não encontrado.`,
                        ephemeral: true
                    });
                }
                await License.deleteMany({ userId: user._id });
                await Session.deleteMany({ userId: user._id });
                await User.deleteOne({ username });
                await interaction.editReply({
                    content: `<:icons8checkedcheckbox64:1368740099524788255> Usuário **${username}** e suas licenças deletados.`,
                    ephemeral: true
                });
            } else {
                const license = await License.findOneAndDelete({ key: licenseKey });
                if (!license) {
                    return interaction.editReply({
                        content: `❌ Licença **${licenseKey}** não encontrada.`,
                        ephemeral: true
                    });
                }
                await interaction.editReply({
                    content: `✅ Licença **${licenseKey}** deletada.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('❌ Erro ao deletar:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao deletar: ${error.message}`,
                ephemeral: true
            });
        }
    }
};