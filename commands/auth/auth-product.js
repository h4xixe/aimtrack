const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const AuthProduct = require('../../models/AuthProduct');
const Product = require('../../models/Product');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-auth-product')
        .setDescription('Cria um produto de autenticação baseado em um produto da loja.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
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

            // Check if store product exists
            const storeProduct = await Product.findOne({ productId });
            if (!storeProduct) {
                return interaction.editReply({
                    content: `❌ Produto da loja com ID ${productId} não encontrado.`,
                    ephemeral: true
                });
            }

            // Check if auth product already exists
            const existingAuthProduct = await AuthProduct.findOne({ productId });
            if (existingAuthProduct) {
                return interaction.editReply({
                    content: `❌ Produto de autenticação com ID ${productId} já existe.`,
                    ephemeral: true
                });
            }

            // Create auth product
            const authProduct = new AuthProduct({
                productId,
                name: storeProduct.nome,
                status: 'active'
            });
            await authProduct.save();

            await interaction.editReply({
                content: `✅ Produto de autenticação **${productId}** criado com sucesso.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('❌ Erro ao criar produto de autenticação:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao criar produto de autenticação: ${error.message}`,
                ephemeral: true
            });
        }
    }
};