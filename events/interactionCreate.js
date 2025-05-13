const { InteractionType, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const ProductList = require('../models/ProductList');
const axios = require('axios');
const QRCode = require('qrcode');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.user.bot) return;

            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) {
                    return interaction.reply({
                        content: '❌ Comando não encontrado.',
                        flags: 1 << 2 // Ephemeral
                    });
                }

                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(`❌ Erro ao executar comando ${interaction.commandName}:`, error.message, error.stack);
                    const replyContent = { content: '❌ Ocorreu um erro ao executar o comando.', flags: 1 << 2 };
                    if (interaction.deferred) {
                        await interaction.editReply(replyContent);
                    } else if (!interaction.replied) {
                        await interaction.reply(replyContent);
                    }
                }
            }

            else if (interaction.isStringSelectMenu()) {
                console.log('📥 Interação com menu:', interaction.customId, 'Valores:', interaction.values);

                if (interaction.customId.startsWith('selecionar_plano_')) {
                    await interaction.deferReply({ ephemeral: true });

                    const [planName, planIndex, productId] = interaction.values[0].split('|');
                    const product = await Product.findOne({ productId });

                    if (!product) {
                        return interaction.editReply({
                            content: `❌ Produto com ID ${productId} não encontrado.`,
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }

                    const index = parseInt(planIndex);
                    if (isNaN(index) || index < 0 || index >= product.planos.length) {
                        return interaction.editReply({
                            content: '❌ Plano inválido selecionado.',
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }

                    const plano = product.planos[index];
                    if (!plano.nome || typeof plano.nome !== 'string' || !plano.valor || typeof plano.valor !== 'number' || !Number.isFinite(plano.valor) || plano.valor < 0.01) {
                        return interaction.editReply({
                            content: '❌ Dados do plano inválidos.',
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }

                    // Criar canal privado
                    const member = interaction.user;
                    const guild = interaction.guild;
                    const channelName = `🛒・${member.username.toLowerCase().replace(/\s+/g, '-')}`;

                    if (!guild.members.me.permissions.has(['ManageChannels', 'ManageRoles'])) {
                        return interaction.editReply({
                            content: '❌ O bot não tem permissões para criar canais.',
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }

                    const existingChannel = guild.channels.cache.find(
                        ch => ch.name.startsWith('🛒・') && ch.permissionOverwrites.cache.has(member.id)
                    );
                    if (existingChannel) {
                        return interaction.editReply({
                            content: `❌ Você já tem um canal privado: ${existingChannel}`,
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }

                    const newChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: guild.id, deny: ['ViewChannel'] },
                            { id: member.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
                            { id: client.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'] }
                        ]
                    });

                    // Embed com botões
                    const embed = new EmbedBuilder()
                        //.setTitle('Confirmação de Compra')
                        .setDescription(`Você selecionou: **${plano.nome}** do produto **${product.nome}** \`(${productId})\``)
                        .addFields(
                            { name: '<:icons8gift64:1368730665037594655> Plano', value: '> ' + plano.nome, inline: true },
                            { name: '<:icons8banknotes64:1368734579971850300> Valor', value: `> R$ ${plano.valor.toFixed(2)}`, inline: true }
                        )
                        .setColor('#2b2d31')
                        .setTimestamp()
                        .setFooter({ text: 'Escolha uma ação abaixo' });

                    const continueButton = new ButtonBuilder()
                        .setCustomId(`continuar_${productId}_${index}_${newChannel.id}`)
                        .setLabel('Continuar')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:icons8checkedcheckbox64:1368740099524788255>');

                    const cancelButton = new ButtonBuilder()
                        .setCustomId(`cancelar_${newChannel.id}_${productId}`)
                        .setLabel('Cancelar')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:icons8trash64:1368740097796603914>');

                    const couponButton = new ButtonBuilder()
                        .setCustomId(`cupom_${productId}_${index}_${newChannel.id}`)
                        .setLabel('Cupom')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('<:icons8etiquetadepreousd64:1368734584782459131>');

                    const row = new ActionRowBuilder().addComponents(continueButton, cancelButton, couponButton);

                    await newChannel.send({
                        content: `${member}`,
                        embeds: [embed],
                        components: [row]
                    });

                    await interaction.editReply({
                        content: `<:icons8checkedcheckbox64:1368740099524788255> Canal privado criado: ${newChannel}`,
                        flags: 1 << 2,
                        ephemeral: true
                    });
                }
            }

            else if (interaction.isButton()) {
                if (interaction.customId.startsWith('continuar_')) {
                    await interaction.deferReply({ ephemeral: false });

                    try {
                        const [, productId, planIndex, channelId] = interaction.customId.split('_');
                        const product = await Product.findOne({ productId });

                        if (!product) {
                            return interaction.editReply({
                                content: `❌ Produto com ID ${productId} não encontrado.`,
                                flags: 1 << 2,
                                ephemeral: true
                            });
                        }

                        const index = parseInt(planIndex);
                        if (isNaN(index) || index < 0 || index >= product.planos.length) {
                            return interaction.editReply({
                                content: '❌ Plano inválido.',
                                flags: 1 << 2,
                                ephemeral: true
                            });
                        }

                        const plano = product.planos[index];
                        if (!plano.nome || typeof plano.nome !== 'string' || !plano.valor || typeof plano.valor !== 'number' || !Number.isFinite(plano.valor) || plano.valor < 0.01) {
                            return interaction.editReply({
                                content: '❌ Dados do plano inválidos.',
                                flags: 1 << 2,
                                ephemeral: true
                            });
                        }

                        const cpf = '42247921841'.replace(/[^\d]/g, '');
                        if (!/^\d{11}$/.test(cpf)) {
                            return interaction.editReply({
                                content: '❌ CPF inválido.',
                                flags: 1 << 2,
                                ephemeral: true
                            });
                        }

                        const paymentData = {
                            amount: plano.valor,
                            payment: {
                                method: 'pix',
                                expiresAt: 48
                            },
                            customer: {
                                name: 'Miguel Pietro',
                                email: 'syncinterprise@gmail.com',
                                cpf: '42247921841',
                                phone: '(19) 99905-0428'
                            },
                            metadata: {
                                discordId: interaction.user.id,
                                plano: plano.nome,
                                productId
                            }
                        };

                        console.log('📋 Dados enviados ao RisePay:', JSON.stringify(paymentData, null, 2));
                        console.log('📋 URL do RisePay:', process.env.RISE_PAY_URL);
                        console.log('📋 Token do RisePay (mascarado):', process.env.RISE_PAY_TOKEN ? `${process.env.RISE_PAY_TOKEN.slice(0, 4)}...${process.env.RISE_PAY_TOKEN.slice(-4)}` : 'Ausente');

                        if (!process.env.RISE_PAY_URL || !process.env.RISE_PAY_TOKEN) {
                            console.error('❌ Configuração do RisePay ausente no .env');
                            return interaction.editReply({
                                content: '❌ Configuração de pagamento indisponível. Contate o administrador.',
                                flags: 1 << 2,
                                ephemeral: true
                            });
                        }

                        const response = await axios.post(
                            process.env.RISE_PAY_URL,
                            paymentData,
                            {
                                headers: {
                                    Authorization: process.env.RISE_PAY_TOKEN,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 10000
                            }
                        );

                        const pixCode = response.data?.object?.pix?.qrCode;

                        if (!pixCode || typeof pixCode !== 'string') {
                            console.error('❌ PIX code missing or invalid in RisePay response:', JSON.stringify(response.data, null, 2));
                            return interaction.editReply({
                                content: '❌ Erro ao gerar pagamento: Código PIX não retornado pela API.',
                                flags: 1 << 2,
                                ephemeral: true
                            });
                        }

                        const payment = new Payment({
                            userId: interaction.user.id,
                            pixCode,
                            amount: plano.valor,
                            productId,
                            planIndex: index,
                            createdAt: new Date(),
                            status: response.data.object.status || 'pending'
                        });
                        await payment.save();
                        if (!payment._id) {
                          console.error('❌ Payment document created without valid _id:', payment);
                          return interaction.editReply({
                              content: '❌ Erro interno: Pagamento não foi salvo corretamente.',
                              ephemeral: true
                          });
                      }
                        console.log(`📋 Payment created with ID: ${payment._id}`);
                        const paymentEmbed = new EmbedBuilder()
                            //.setTitle('Pagamento PIX')
                            .setDescription(`Pague **R$ ${plano.valor.toFixed(2)}** para concluir a compra.`)
                            .addFields(
                                { name: '<:icons8shoppingcart64:1368734582907605012> Produto', value: '> ' + product.nome, inline: true },
                                { name: '<:icons8gift64:1368730665037594655> Plano', value: '> ' + plano.nome, inline: true },
                                { name: '<:icons8bell64:1368736644168945684> Status', value: '> ' + '\`Pendente\`', inline: true },
                                { name: '<:icons8pix64:1368735936845971476> Código PIX', value: `\`\`\`${pixCode}\`\`\``, inline: false }
                            )
                            .setColor('#2b2d31')
                            .setTimestamp()
                            .setFooter({ text: 'Expira em 48 horas' });

                        const qrButton = new ButtonBuilder()
                            .setCustomId(`qr_code:${payment._id}`)
                            .setLabel('QR Code')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('<:icons8qrcode64:1368740101173285005>');
                            const pixButton = new ButtonBuilder()
                            .setCustomId(`pix_code:${payment._id}`)
                            .setLabel('Pix Code')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('<:icons8pix64:1368735936845971476>');
                            console.log(`📋 Pix Button created with customId: pix_code:${payment._id}`);
                        const components = [new ActionRowBuilder().addComponents(qrButton, pixButton)];

                        await interaction.editReply({
                            embeds: [paymentEmbed],
                            components,
                            flags: 0,
                            ephemeral: true
                        });

                         const webhookUrl = 'https://discord.com/api/webhooks/1368752276000342027/KuH42KWnJCxmj8gM-UqTl3FELkHNuNk9gd1J91Ob60H-kdffEiXJylOcbgnEqQSMZ4IF';
                        
                              const logEmbed = new EmbedBuilder()
                                .setTitle('<:icons8bell64:1368736644168945684> **Compra Pendente**')
                                .setColor('#2b2d31')
                                .setTimestamp()
                                .setFooter({ text: 'Log de Compra Pendente' })
                                .addFields(
                                  {
                                    name: '<:icons8user64:1368735942130794526> **Usuário**',
                                    value: `> ${interaction.user.tag} \`(${interaction.user.id})\``,
                                    inline: false
                                  },
                                  {
                                    name: '<:icons8shoppingcart64:1368734582907605012> **Produto**',
                                    value: `> ${product.nome} \`(${product.productId})\``,
                                    inline: true
                                  },
                                  {
                                    name: '<:icons8gift64:1368734581465022605> **Plano**',
                                    value: `> ${plano.nome} (Índice: ${planIndex})`,
                                    inline: true
                                  },
                                  {
                                    name: '<:icons8banknotes64:1368734579971850300> **Valor**',
                                    value: `> R$ ${plano.valor.toFixed(2)}`,
                                    inline: true
                                  },
                                  { name: '<:icons8bell64:1368736644168945684> Status', value: '> ' + '\`Pendente\`', inline: true },
                                  {
                                    name: '<:icons8id64:1368735938355790025> **Pagamento ID**',
                                    value: `> \`${payment._id}\``,
                                    inline: false
                                  },
                                  {
                                    name: '<:icons8pix64:1368735936845971476> **PIX Code**',
                                    value: `\`\`\`\n${payment.pixCode}\n\`\`\``,
                                    inline: false
                                  }
                                );
                              
                        
                              try {
                                await axios.post(webhookUrl, {
                                  embeds: [logEmbed.toJSON()]
                                }, {
                                  headers: { 'Content-Type': 'application/json' }
                                });
                                console.log(`📬 Log de compra enviado para o webhook para o usuário ${interaction.user.tag}`);
                              } catch (webhookError) {
                                console.error('❌ Erro ao enviar log para o webhook:', webhookError.message, webhookError.response?.data);
                              }

                        // Simulate payment approval (replace with webhook logic)
                        const paymentStatus = response.data.object.status || 'pending';
                        if (['approved', 'completed'].includes(paymentStatus.toLowerCase())) {
                            const approvalEmbed = new EmbedBuilder()
                                .setTitle('Compra Aprovada! 🎉')
                                .setDescription(`Sua compra do **${plano.nome}** do produto **${product.nome}** foi aprovada!`)
                                .addFields(
                                    { name: 'Produto', value: '> ' + product.nome, inline: true },
                                    { name: 'Plano', value: '> ' + plano.nome, inline: true },
                                    { name: 'Valor', value: `> R$ ${plano.valor.toFixed(2)}`, inline: true }
                                )
                                .setColor('#00ff00')
                                .setTimestamp()
                                .setFooter({ text: 'Obrigado pela sua compra!' });

                            // Send DM to user
                            try {
                                await interaction.user.send({
                                    embeds: [approvalEmbed]
                                });
                                console.log(`📩 DM enviado para ${interaction.user.tag} sobre compra aprovada`);
                            } catch (dmError) {
                                console.warn(`⚠️ Falha ao enviar DM para ${interaction.user.tag}:`, dmError.message);
                            }

                            // Send to private channel
                            const purchaseChannel = interaction.guild.channels.cache.get(channelId);
                            if (purchaseChannel) {
                                await purchaseChannel.send({
                                    content: `${interaction.user}`,
                                    embeds: [approvalEmbed]
                                });
                                console.log(`📢 Mensagem de aprovação enviada para o canal ${purchaseChannel.name}`);
                            } else {
                                console.warn(`⚠️ Canal ${channelId} não encontrado para notificação de aprovação`);
                            }

                            // Update payment status in database
                            await Payment.updateOne(
                                { _id: payment._id },
                                { status: 'approved', updatedAt: new Date() }
                            );
                        }

                        /* 
                         * TODO: Implement RisePay webhook to handle payment status updates
                         * - Create an endpoint (e.g., /webhook/payments) to receive RisePay notifications
                         * - Verify webhook signature if required by RisePay
                         * - On 'approved' status, fetch Payment by pixCode or transaction ID
                         * - Send DM and channel notifications as above
                         * - Update Payment status in database
                         */

                    } catch (error) {
                        console.error('❌ Erro ao gerar pagamento via RisePay:', error.response?.data || error.message);
                        await interaction.editReply({
                            content: `❌ Não foi possível gerar o pagamento: ${error.response?.data?.message || error.message}`,
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }
                }

                else if (interaction.customId.startsWith('cancelar_')) {
                    const [, channelId] = interaction.customId.split('_');
                    const channel = interaction.guild.channels.cache.get(channelId);

                    if (!channel) {
                        return interaction.reply({
                            content: '❌ Canal não encontrado.',
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }

                    await interaction.reply({
                        content: '❌ Compra cancelada. O canal será fechado em 5 segundos.',
                        flags: 1 << 2,
                        ephemeral: true
                    });
  
                    const payment = new Payment({
                      userId: interaction.user.id,
                  });
                  
                    const webhookUrl = 'https://discord.com/api/webhooks/1368753127800569907/P5gnDq-aAvW5AIhNakKWZAi5vtvOXtMveeSuH1IdvCVNMKyaI5eVgB830P1h9SARZ0h6';
                        
                    const logEmbed = new EmbedBuilder()
                      .setTitle('<:icons8bell64:1368736644168945684> **Compra Cancelada**')
                      .setColor('#2b2d31')
                      .setTimestamp()
                      .setFooter({ text: 'Log de Compra Cancelada' })
                      .addFields(
                        {
                          name: '<:icons8user64:1368735942130794526> **Usuário**',
                          value: `> ${interaction.user.tag} \`(${interaction.user.id})\``,
                          inline: false
                        },
                        {
                          name: '<:icons8time64:1368735939962339449> **Cancelada em**',
                          value: `> <t:${Math.floor(Date.now() / 1000)}:F>`,
                          inline: false
                        },                        
                        { name: '<:icons8bell64:1368736644168945684> Status', value: '> ' + '\`Cancelada\`', inline: false },
                        {
                          name: '<:icons8id64:1368735938355790025> **Pagamento ID**',
                          value: `> \`${payment._id}\``,
                          inline: false
                        }
                      );
                    
              
                    try {
                      await axios.post(webhookUrl, {
                        embeds: [logEmbed.toJSON()]
                      }, {
                        headers: { 'Content-Type': 'application/json' }
                      });
                      console.log(`📬 Log de compra enviado para o webhook para o usuário ${interaction.user.tag}`);
                    } catch (webhookError) {
                      console.error('❌ Erro ao enviar log para o webhook:', webhookError.message, webhookError.response?.data);
                    }

                    setTimeout(async () => {
                        try {
                            await channel.delete();
                        } catch (error) {
                            console.error('❌ Erro ao deletar canal:', error.message);
                        }
                    }, 5000);
                }

                else if (interaction.customId.startsWith('cupom_')) {
                    const [, productId, planIndex, channelId] = interaction.customId.split('_');

                    const modal = new ModalBuilder()
                        .setCustomId(`cupom_modal_${productId}_${planIndex}_${channelId}`)
                        .setTitle('Inserir Cupom');

                    const couponInput = new TextInputBuilder()
                        .setCustomId('coupon_code')
                        .setLabel('Código do Cupom')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Ex: DESCONTO10')
                        .setRequired(true)
                        .setMaxLength(20);

                    const row = new ActionRowBuilder().addComponents(couponInput);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                }

                else if (interaction.customId.startsWith('qr_code')) {
                    await interaction.deferReply({ ephemeral: false });

                    try {
                        const paymentId = interaction.customId.split(':')[1];
                        const payment = await Payment.findById(paymentId);

                        if (!payment || payment.userId !== interaction.user.id) {
                            await interaction.editReply({
                                content: '❌ Código PIX não encontrado ou não pertence a você.',
                                flags: 1 << 2,
                                ephemeral: true
                            });
                            return;
                        }

                        const qrImageBuffer = await QRCode.toBuffer(payment.pixCode);

                        const qrEmbed = new EmbedBuilder()
                            .setImage('attachment://qrcode.png')
                            .setColor('#2b2d31');

                        await interaction.editReply({
                            embeds: [qrEmbed],
                            files: [{ attachment: qrImageBuffer, name: 'qrcode.png' }],
                            flags: 0,
                            ephemeral: true
                        });

                        await Payment.deleteOne({ _id: paymentId });
                    } catch (error) {
                        console.error('❌ Erro ao exibir QR Code:', error.message);
                        await interaction.editReply({
                            content: `❌ Erro ao exibir QR Code: ${error.message}`,
                            flags: 1 << 2,
                            ephemeral: true
                        });
                    }
                }

                else if (interaction.customId.startsWith('pix_code')) {
                  await interaction.deferReply({ ephemeral: false });

                  try {
                    const paymentId = interaction.customId.split(':')[1];
                    console.log(`📋 Pix Code button clicked, customId: ${interaction.customId}, paymentId: ${paymentId}`);

                    if (!paymentId) {
                        await interaction.editReply({
                            content: '❌ ID de pagamento inválido.',
                            ephemeral: true
                        });
                        return;
                    }
                      const payment = await Payment.findById(paymentId);

                      if (!payment || payment.userId !== interaction.user.id) {
                          await interaction.editReply({
                              content: '❌ Código PIX não encontrado ou não pertence a você.',
                              flags: 1 << 2,
                              ephemeral: true
                          });
                          return;
                      }

                      await interaction.editReply({
                        content: `${payment.pixCode}`,
                          ephemeral: true
                      });

                     // await Payment.deleteOne({ _id: paymentId });
                  } catch (error) {
                      console.error('❌ Erro ao exibir Pix Code:', error.message);
                      await interaction.editReply({
                          content: `❌ Erro ao exibir Pix Code: ${error.message}`,
                          flags: 1 << 2,
                          ephemeral: true
                      });
                  }
              }

                else if (interaction.customId.startsWith('listproducts_prev_') || interaction.customId.startsWith('listproducts_next_')) {
                    await interaction.deferUpdate();

                    try {
                        // Parse customId: listproducts_[prev|next]_page_listId
                        const [, action, currentPageStr, listId] = interaction.customId.split('_');
                        const currentPage = parseInt(currentPageStr);
                        const newPage = action === 'prev' ? currentPage - 1 : currentPage + 1;

                        console.log(`📋 Processing listproducts ${action}: currentPage=${currentPage}, newPage=${newPage}, listId=${listId}`);

                        // Retrieve ProductList
                        const productList = await ProductList.findById(listId);
                        if (!productList || productList.userId !== interaction.user.id) {
                            console.error('❌ ProductList not found or unauthorized:', { listId, userId: interaction.user.id });
                            await interaction.editReply({
                                content: '❌ Lista de produtos não encontrada ou não pertence a você.',
                                ephemeral: true
                            });
                            return;
                        }

                        const totalPages = productList.productIds.length;
                        if (newPage < 0 || newPage >= totalPages) {
                            console.error('❌ Invalid page:', { newPage, totalPages });
                            await interaction.editReply({
                                content: '❌ Página inválida.',
                                ephemeral: true
                            });
                            return;
                        }

                        // Fetch product for the new page
                        const product = await Product.findById(productList.productIds[newPage]).lean();
                        if (!product) {
                            console.error('❌ Product not found:', { productId: productList.productIds[newPage] });
                            await interaction.editReply({
                                content: '❌ Produto não encontrado.',
                                ephemeral: true
                            });
                            return;
                        }

                        console.log('📋 Product data:', { productId: product._id, nome: product.nome, planos: product.planos });

                        // Create embed
                        const planosList = Array.isArray(product.planos)
                            ? product.planos.map(plano => `${plano.nome}: R$ ${plano.valor.toFixed(2)}`).join('\n')
                            : 'Nenhum plano cadastrado';

                        const embed = new EmbedBuilder()
                            .setTitle(`Produto ${product.nome} (${product.productId})`)
                            .setDescription(product.descricao || 'Sem descrição')
                            .addFields(
                                { name: 'Planos', value: planosList, inline: false },
                                { name: 'Imagem', value: product.imagem ? `[Ver imagem](${product.imagem})` : 'Nenhuma imagem', inline: false }
                            )
                            .setColor('#2b2d31')
                            .setTimestamp()
                            .setFooter({ text: `Página ${newPage + 1} de ${totalPages} | Solicitado por ${interaction.user.username}` });

                        // Create buttons
                        const prevButton = new ButtonBuilder()
                            .setCustomId(`listproducts_prev_${newPage}_${listId}`)
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️')
                            .setDisabled(newPage === 0);

                        const pageButton = new ButtonBuilder()
                            .setCustomId(`listproducts_page_${newPage}`)
                            .setLabel(`Página ${newPage + 1}/${totalPages}`)
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true);

                        const nextButton = new ButtonBuilder()
                            .setCustomId(`listproducts_next_${newPage}_${listId}`)
                            .setLabel('Próximo')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('➡️')
                            .setDisabled(newPage === totalPages - 1);

                        const buttons = new ActionRowBuilder().addComponents(prevButton, pageButton, nextButton);

                        await interaction.editReply({
                            embeds: [embed],
                            components: [buttons],
                            ephemeral: true
                        });

                        console.log(`✅ Successfully updated to page ${newPage + 1}`);
                    } catch (error) {
                        console.error('❌ Erro ao processar navegação de listproducts:', error.message, error.stack);
                        await interaction.editReply({
                            content: '❌ Erro ao mudar de página. Tente novamente.',
                            ephemeral: true
                        });
                    }
                }
            }

            else if (interaction.isModalSubmit() && interaction.customId.startsWith('cupom_modal_')) {
                const [, productId, planIndex, channelId] = interaction.customId.split('_');
                const couponCode = interaction.fields.getTextInputValue('coupon_code');

                const isValidCoupon = couponCode === 'DESCONTO10';
                if (isValidCoupon) {
                    await interaction.reply({
                        content: `<:icons8checkedcheckbox64:1368740099524788255> Cupom **${couponCode}** aplicado com sucesso! ( em beta )`,
                        flags: 1 << 2,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `❌ Cupom **${couponCode}** inválido.`,
                        flags: 1 << 2,
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erro no evento interactionCreate:', error.message, error.stack);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocorreu um erro ao processar sua interação.',
                    flags: 1 << 2,
                    ephemeral: true
                }).catch(() => {});
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ Ocorreu um erro ao processar sua interação.',
                    flags: 1 << 2,
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }
};