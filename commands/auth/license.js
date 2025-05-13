const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AuthProduct = require('../../models/AuthProduct');
const License = require('../../models/License');

function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'WYZ';
    for (let block = 0; block < 3; block++) {
        key += '-';
        for (let i = 0; i < 4; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    return key;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('license')
        .setDescription('Cria uma licença para um produto.')
        .addStringOption(option =>
            option.setName('produto')
                .setDescription('ID do produto (formato: #123456)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tempo')
                .setDescription('Duração da licença (e.g., 30d, 1m, 1y)')
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

            // Validate product
            const product = await AuthProduct.findOne({ productId });
            if (!product) {
                return interaction.editReply({
                    content: `❌ Produto com ID ${productId} não encontrado. Certifique-se de que existe no sistema de autenticação.`,
                    ephemeral: true
                });
            }

            // Parse duration (e.g., 30d = 30 days, 1m = 1 month, 1y = 1 year)
            const duration = interaction.options.getString('tempo');
            const match = duration.match(/^(\d+)([dmy])$/);
            if (!match) {
                return interaction.editReply({
                    content: '❌ Formato de tempo inválido. Use, e.g., 30d, 1m, 1y.',
                    ephemeral: true
                });
            }

            const amount = parseInt(match[1]);
            const unit = match[2];
            let expiry = new Date();
            if (unit === 'd') {
                expiry.setDate(expiry.getDate() + amount);
            } else if (unit === 'm') {
                expiry.setMonth(expiry.getMonth() + amount);
            } else if (unit === 'y') {
                expiry.setFullYear(expiry.getFullYear() + amount);
            }

            // Generate license key
            const key = generateLicenseKey();

            // Create license
            const license = new License({
                key,
                productId,
                expiry
            });
            await license.save();

            const embed = new EmbedBuilder()
            .setDescription('**<:icons8bell64:1368736644168945684> Licença Criada**')
            .addFields( 
              {
                name: '<:icons8id64:1368735938355790025> **Produto ID:**',
                value: `> \`${productId}\``,
                inline: true
              },
              {
                name: '<:icons8time64:1368735939962339449> **Expira em:**',
                value: `> <t:${Math.floor(expiry.getTime() / 1000)}:F>`,
                inline: true
              },
              {
                name: '<:icons8keysecurity64:1369079744217354312> **Licença:**',
                value: `\`\`\`\n${key}\n\`\`\``,
                inline: false
              }
            )
            .setColor('#2b2d31');

            await interaction.editReply({
                embeds: [embed],
                components: [],
                ephemeral: true
            });

           /* await interaction.editReply({
                content: `✅ Licença criada: **${key}** para o produto **${productId}**. Expira em: <t:${Math.floor(expiry.getTime() / 1000)}:F>.`,
                ephemeral: true
            }); */

        } catch (error) {
            console.error('❌ Erro ao criar licença:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao criar licença: ${error.message}`,
                ephemeral: true
            });
        }
    }
};