const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const License = require('../../models/License');
const AuthProduct = require('../../models/AuthProduct');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('licenseinfo')
        .setDescription('Mostra informações de uma licença.')
        .addStringOption(option =>
            option.setName('license')
                .setDescription('Chave da licença (e.g., WXYZ-ABCD-EFGH-IJKL)')
                .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const licenseKey = interaction.options.getString('license');
            const license = await License.findOne({ key: licenseKey }).populate('userId');

            if (!license) {
                return interaction.editReply({
                    content: `❌ Licença **${licenseKey}** não encontrada.`,
                    ephemeral: true
                });
            }

            const product = await AuthProduct.findOne({ productId: license.productId });
            const productName = product ? product.name : 'Desconhecido';
            const user = license.userId ? license.userId.username : 'Não vinculado';

            const embed = new EmbedBuilder()
                .setDescription('**<:icons8bell64:1368736644168945684> Informações da Licença**')
                .addFields(
                    {
                        name: '<:icons8keysecurity64:1369079744217354312> **Licença:**',
                        value: `\`\`\`\n${license.key}\n\`\`\``,
                        inline: false
                    },
                    {
                        name: '<:icons8id64:1368735938355790025> **Produto ID:**',
                        value: `> \`${license.productId}\``,
                        inline: true
                    },
                    {
                        name: '<:icons8boximportant64:1368735941598658583> **Produto:**',
                        value: `> ${productName}`,
                        inline: true
                    },
                    {
                        name: '<:icons8time64:1368735939962339449> **Expira em:**',
                        value: `> <t:${Math.floor(license.expiry.getTime() / 1000)}:F>`,
                        inline: true
                    },
                    {
                        name: '<:icons8lock64:1368735943192490088> **HWID:**',
                        value: `> ${license.hwid || 'Não definido'}`,
                        inline: true
                    },
                    {
                        name: '<:icons8globe64:1368735944786311198> **IP:**',
                        value: `> ${license.ip || 'Não definido'}`,
                        inline: true
                    },
                    {
                        name: '<:icons8cancel64:1368735946380152878> **Banido:**',
                        value: `> ${license.banned ? 'Sim' : 'Não'}`,
                        inline: true
                    },
                    {
                        name: '<:icons8user64:1368735947988185118> **Usuário:**',
                        value: `> ${user}`,
                        inline: true
                    }
                )
                .setColor('#2b2d31');

            await interaction.editReply({
                embeds: [embed],
                components: [],
                ephemeral: true
            });
        } catch (error) {
            console.error('❌ Erro ao buscar informações da licença:', error.message, error.stack);
            await interaction.editReply({
                content: `❌ Erro ao buscar informações da licença: ${error.message}`,
                ephemeral: true
            });
        }
    }
};