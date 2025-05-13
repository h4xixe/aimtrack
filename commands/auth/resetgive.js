const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/User');  // Certifique-se de que o modelo User possui a propriedade resetsAvailable

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetgive')
        .setDescription('Dá uma quantidade de resets a um usuário.')
        .addStringOption(option =>
            option.setName('account')
                .setDescription('Nome de usuário')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('value')
                .setDescription('Quantidade de resets a serem adicionados')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const username = interaction.options.getString('account');
            const value = interaction.options.getInteger('value');

            if (value <= 0) {
                return interaction.editReply({
                    content: '❌ O valor de resets deve ser um número positivo.',
                    ephemeral: true
                });
            }

            // Procurar o usuário no banco de dados
            const user = await User.findOne({ username });

            if (!user) {
                return interaction.editReply({
                    content: `❌ Usuário **${username}** não encontrado.`,
                    ephemeral: true
                });
            }

            // Adicionar os resets ao usuário
            user.resetsAvailable = (user.resetsAvailable || 0) + value;

            await user.save(); // Salvar o usuário com os resets atualizados

            await interaction.editReply({
                content: `✅ **${value}** resets foram adicionados ao usuário **${username}**. Agora ele tem **${user.resetsAvailable}** resets disponíveis.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('❌ Erro ao dar resets:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao dar resets: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
