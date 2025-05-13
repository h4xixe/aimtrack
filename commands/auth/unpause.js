const { SlashCommandBuilder } = require('discord.js');
const AuthProduct = require('../../models/AuthProduct');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unpause')
        .setDescription('Despausa um produto.')
        .addStringOption(option =>
            option.setName('produto')
                .setDescription('ID do produto (formato: #123456)')
                .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const productId = interaction.options.getString('produto');
            if (!/^#\d{6}$/.test(productId)) {
                return interaction.editReply({
                    content: '❌ Formato de ID do produto inválido. Use # seguido de 6 dígitos (e.g., #123456).',
                    ephemeral: true
                });
            }

            const product = await AuthProduct.findOneAndUpdate(
                { productId },
                { status: 'active' },
                { new: true }
            );

            if (!product) {
                return interaction.editReply({
                    content: `❌ Produto com ID ${productId} não encontrado.`,
                    ephemeral: true
                });
            }

            await interaction.editReply({
                content: `<:icons8checkedcheckbox64:1368740099524788255> Produto **${productId}** despausado.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('❌ Erro ao despausar produto:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao despausar produto: ${error.message}`,
                ephemeral: true
            });
        }
    }
};