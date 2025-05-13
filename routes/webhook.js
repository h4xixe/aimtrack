const express = require('express');
       const router = express.Router();
       const Payment = require('../models/Payment');
       const { EmbedBuilder } = require('discord.js');

       router.post('/payments', async (req, res) => {
           try {
               const { status, transactionId, pixCode } = req.body; // Adjust based on RisePay payload
               if (!['approved', 'completed'].includes(status.toLowerCase())) {
                   return res.status(200).send('Status not approved');
               }

               const payment = await Payment.findOne({ pixCode });
               if (!payment) {
                   console.error('❌ Pagamento não encontrado:', pixCode);
                   return res.status(404).send('Payment not found');
               }

               const client = req.app.get('client'); // Discord client
               const user = await client.users.fetch(payment.userId);
               const guild = client.guilds.cache.get('1210365349133025361'); // Replace with guild ID
               const channel = guild.channels.cache.find(ch => ch.name.startsWith(`🛒・${user.username.toLowerCase().replace(/\s+/g, '-')}`));

               const approvalEmbed = new EmbedBuilder()
                   .setTitle('Compra Aprovada! <:icons8confete64:1368730669269913721>')
                   .setDescription(`Sua compra do **${plano.nome}** do produto **${product.nome}** foi aprovada!`)
                   .addFields(
                       { name: '<:icons8shoppingcart64:1368730666333900800> Produto', value: payment.productId, inline: true },
                       { name: '<:icons8gift64:1368730665037594655> Plano', value: payment.planIndex.toString(), inline: true },
                       { name: ' <:icons8banknotes64:1368730663032983673> Valor', value: `R$ ${payment.amount.toFixed(2)}`, inline: true }
                   )
                   .setColor('#2b2d31')
                   .setFooter({ text: 'Obrigado pela sua compra!' });

               // Send DM
               try {
                   await user.send({ embeds: [approvalEmbed] });
               } catch (dmError) {
                   console.warn(`⚠️ Falha ao enviar DM para ${user.tag}:`, dmError.message);
               }

               // Send to channel
               if (channel) {
                   await channel.send({ content: `<@${user.id}>`, embeds: [approvalEmbed] });
               }

               // Update payment
               await Payment.updateOne(
                   { _id: payment._id },
                   { status: 'approved', updatedAt: new Date() }
               );

               res.status(200).send('Webhook processed');
           } catch (error) {
               console.error('❌ Erro no webhook:', error.message);
               res.status(500).send('Server error');
           }
       });

       module.exports = router;