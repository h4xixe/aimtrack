const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const License = require('../../models/License');
const AuthProduct = require('../../models/AuthProduct');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informações de um usuário ou licença')
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('ID do Discord, username ou chave de licença')
                .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const identifier = interaction.options.getString('identifier');
            let embed;
            
            // Verifica se é uma license key (começa com WYZ e tem traços)
            if (identifier.startsWith('WYZ') && identifier.includes('-')) {
                const license = await License.findOne({ key: identifier }).populate('userId');
                if (!license) {
                    return interaction.editReply({
                        content: `❌ Licença **${identifier}** não encontrada.`,
                        ephemeral: true
                    });
                }

                const product = await AuthProduct.findOne({ productId: license.productId });
                const productName = product ? product.name : 'Desconhecido';
                const user = license.userId ? license.userId.username : 'Não vinculado';

                embed = new EmbedBuilder()
                    .setDescription('**<:icons8bell64:1368736644168945684> Informações da Licença**')
                    .addFields(
                        {
                            name: '<:icons8keysecurity64:1369079744217354312> **Licença:**',
                            value: `\`\`\`\n${license.key}\n\`\`\``,
                            inline: false
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
                        }
                    )
                    .setColor('#2b2d31');
            } 
            // Verifica se é um ID do Discord (apenas números)
            else if (/^\d+$/.test(identifier)) {
                const user = await User.findOne({ discordId: identifier });
                if (!user) {
                    return interaction.editReply({
                        content: `❌ Usuário com Discord ID **${identifier}** não encontrado.`,
                        ephemeral: true
                    });
                }

                const license = await License.findOne({ key: user.licenseKey });
                const product = license ? await AuthProduct.findOne({ productId: license.productId }) : null;
                const productName = product ? product.name : 'Desconhecido';
                const expiry = license ? `<t:${Math.floor(license.expiry.getTime() / 1000)}:F>` : 'Não vinculado';

                embed = new EmbedBuilder()
                    .setDescription('**<:icons8bell64:1368736644168945684> Informações do Usuário**')
                    .addFields(
                        {
                            name: '<:icons8user64:1368735947988185118> **Usuário:**',
                            value: `> ${user.username}`,
                            inline: true
                        },
                        {
                            name: '<:icons8discord64:1368735949584027658> **Discord ID:**',
                            value: `> ${user.discordId}`,
                            inline: true
                        },
                        {
                            name: '<:icons8keysecurity64:1369079744217354312> **Licença:**',
                            value: `> ${user.licenseKey || 'Não vinculada'}`,
                            inline: true
                        },
                        {
                            name: '<:icons8boximportant64:1368735941598658583> **Produto:**',
                            value: `> ${productName}`,
                            inline: true
                        },
                        {
                            name: '<:icons8time64:1368735939962339449> **Expira em:**',
                            value: `> ${expiry}`,
                            inline: true
                        }
                    )
                    .setColor('#2b2d31');
            } 
            // Assume que é um username
            else {
                const user = await User.findOne({ username: identifier });
                if (!user) {
                    return interaction.editReply({
                        content: `❌ Usuário **${identifier}** não encontrado.`,
                        ephemeral: true
                    });
                }

                const license = await License.findOne({ key: user.licenseKey });
                const product = license ? await AuthProduct.findOne({ productId: license.productId }) : null;
                const productName = product ? product.name : 'Desconhecido';
                const expiry = license ? `<t:${Math.floor(license.expiry.getTime() / 1000)}:F>` : 'Não vinculado';

                embed = new EmbedBuilder()
                    .setDescription('**<:icons8bell64:1368736644168945684> Informações do Usuário**')
                    .addFields(
                        {
                            name: '<:icons8user64:1368735947988185118> **Username:**',
                            value: `> ${user.username}`,
                            inline: true
                        },
                        {
                            name: '<:icons8email64:1368735946380152879> **Email:**',
                            value: `> ${user.email}`,
                            inline: true
                        },
                        {
                            name: '<:icons8keysecurity64:1369079744217354312> **Licença:**',
                            value: `> ${user.licenseKey || 'Não vinculada'}`,
                            inline: true
                        },
                        {
                        name: '<:icons8lock64:1368735943192490088> **HWID:**',
                        value: `> ${user.hwid || 'Não definido'}`,
                        inline: true
                    },
                        {
                            name: '<:icons8boximportant64:1368735941598658583> **Produto:**',
                            value: `> ${productName}`,
                            inline: true
                        },
                        {
                            name: '<:icons8time64:1368735939962339449> **Expira em:**',
                            value: `> ${expiry}`,
                            inline: true
                        }
                    )
                    .setColor('#2b2d31');
            }

            await interaction.editReply({
                embeds: [embed],
                components: [],
                ephemeral: true
            });
        } catch (error) {
            console.error('❌ Erro ao buscar informações:', error.message, error.stack);
            await interaction.editReply({
                content: `❌ Erro ao buscar informações: ${error.message}`,
                ephemeral: true
            });
        }
    }
};