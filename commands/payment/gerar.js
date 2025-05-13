const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const Payment = require('../../models/Payment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gerar')
        .setDescription('Gera um pagamento via PIX')
        .addNumberOption(option =>
            option.setName('valor')
                .setDescription('Valor do pagamento em reais')
                .setRequired(true)
                .setMinValue(0.01)),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const valor = interaction.options.getNumber('valor');

            if (valor <= 0) {
                await interaction.editReply({ content: '❌ O valor deve ser maior que zero.', ephemeral: true });
                return;
            }

            if (!process.env.RISE_PAY_URL || !process.env.RISE_PAY_TOKEN) {
                console.error('❌ Configuração do RisePay ausente no .env');
                await interaction.editReply({ content: '❌ Configuração de pagamento indisponível. Contate o administrador.', ephemeral: true });
                return;
            }

            const response = await axios.post(process.env.RISE_PAY_URL, {
                amount: valor,
                payment: { method: 'pix', expiresAt: 48 },
                customer: {
                    name: 'Miguel Pietro',
                    email: 'syncinterprise@gmail.com',
                    cpf: '42247921841',
                    phone: '(19) 99905-0428'
                },
                metadata: { discordId: interaction.user.id, plano: 'Padrão' }
            }, {
                headers: {
                    Authorization: process.env.RISE_PAY_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            const pixCode = response.data?.object?.pix?.qrCode;

            if (!pixCode) {
                console.error('❌ PIX code missing in RisePay response:', JSON.stringify(response.data, null, 2));
                await interaction.editReply({ content: '❌ Erro ao gerar pagamento: Código PIX não retornado pela API.', ephemeral: true });
                return;
            }

            // Store PIX code in Payment model
            const payment = new Payment({
                userId: interaction.user.id,
                pixCode,
                amount: valor,
                createdAt: new Date()
            });
            await payment.save();

            const embed = new EmbedBuilder()
                .setTitle('Pagamento PIX Gerado')
                .setDescription('Use o código abaixo ou clique no botão para visualizar o QR Code.')
                .addFields(
                    { name: 'Plano', value: 'Padrão', inline: true },
                    { name: 'Valor', value: `R$ ${response.data.object.amount.toFixed(2)}`, inline: true },
                    { name: 'Status', value: response.data.object.status, inline: true },
                    { name: 'Código PIX', value: `\`\`\`${pixCode}\`\`\``, inline: false }
                )
                .setColor('#2b2d31')
                .setTimestamp()
                .setFooter({ text: 'Expira em 48 horas' });

            const qrButton = new ButtonBuilder()
                .setCustomId(`qr_code:${payment._id}`)
                .setLabel('QR Code')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📷');
            const components = [new ActionRowBuilder().addComponents(qrButton)];

            await interaction.editReply({ embeds: [embed], components, ephemeral: true });
        } catch (error) {
            console.error('Error in /gerar:', error.response?.data || error.message);
            await interaction.editReply({ content: `❌ Erro ao gerar pagamento: ${error.response?.data?.message || error.message}`, ephemeral: true });
        }
    }
};