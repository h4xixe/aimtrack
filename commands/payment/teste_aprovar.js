const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const axios = require('axios');
const Product = require('../../models/Product');
const Payment = require('../../models/Payment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teste_aprovar')
    .setDescription('Simula a aprovação de uma compra para testar notificações')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addStringOption(opt =>
      opt.setName('produto')
        .setDescription('Produto para simular a aprovação (selecione via autocomplete)')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(opt =>
      opt.setName('plano')
        .setDescription('Índice do plano (0 para o primeiro plano)')
        .setRequired(true)
        .setMinValue(0)
    ),

  async autocomplete(interaction) {
    try {
      const focusedValue = interaction.options.getFocused();
      const products = await Product.find().lean();

      const validProducts = products.filter(product =>
        product.nome &&
        typeof product.nome === 'string' &&
        product.productId &&
        typeof product.productId === 'string'
      );

      const choices = validProducts.map(product => ({
        name: `${product.nome} (${product.productId})`.slice(0, 100),
        value: product.productId
      }));

      const filtered = choices.filter(choice =>
        choice.name.toLowerCase().includes(focusedValue.toLowerCase())
      ).slice(0, 25); // Discord limit

      await interaction.respond(filtered);
    } catch (error) {
      console.error('❌ Erro no autocomplete de /teste_aprovar:', error.message, error.stack);
    }
  },

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const productId = interaction.options.getString('produto');
      const planIndex = interaction.options.getInteger('plano');

      // Fetch product
      const product = await Product.findOne({ productId }).lean();
      if (!product) {
        return interaction.editReply({
          content: `❌ Produto com ID ${productId} não encontrado.`,
          ephemeral: true
        });
      }

      // Validate plan
      if (!Array.isArray(product.planos) || planIndex < 0 || planIndex >= product.planos.length) {
        return interaction.editReply({
          content: `❌ Plano inválido. Escolha um índice entre 0 e ${product.planos.length - 1}.`,
          ephemeral: true
        });
      }

      const plano = product.planos[planIndex];
      if (!plano.nome || typeof plano.nome !== 'string' || !plano.valor || typeof plano.valor !== 'number' || !Number.isFinite(plano.valor) || plano.valor < 0.01) {
        return interaction.editReply({
          content: '❌ Dados do plano inválidos.',
          ephemeral: true
        });
      }

      // Find or create private channel
      const guild = interaction.guild;
      const member = interaction.user;
      const channelName = `🛒・${member.username.toLowerCase().replace(/\s+/g, '-')}`;

      if (!guild.members.me.permissions.has(['ManageChannels', 'ManageRoles'])) {
        return interaction.editReply({
          content: '❌ O bot não tem permissões para criar canais.',
          ephemeral: true
        });
      }

      let purchaseChannel = guild.channels.cache.find(
        ch => ch.name.startsWith('🛒・') && ch.permissionOverwrites.cache.has(member.id)
      );

      if (!purchaseChannel) {
        purchaseChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: guild.id, deny: ['ViewChannel'] },
            { id: member.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
            { id: interaction.client.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'] }
          ]
        });
      }

      // Create mock payment
      const payment = new Payment({
        userId: interaction.user.id,
        pixCode: '00020101021226860014br.gov.bcb.pix2564qrcode.fitbank.com.br/QR/cob/E3D01CBC40AC0A0CD016FDD3EF2D48C955B5204000053039865802BR5925RISEPAY EDUCACAO E TECNOL6009SAO PAULO61080412100262070503***630459D8',
        amount: plano.valor,
        productId,
        planIndex,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await payment.save();

      // Create approval embed
      const approvalEmbed = new EmbedBuilder()
        .setTitle('Compra Aprovada! <:icons8confete64:1368734588511322155>')
        .setDescription(`Sua compra do **${plano.nome}** do produto **${product.nome}** foi aprovada!`)
        .addFields(
          { name: '<:icons8shoppingcart64:1368734582907605012> Produto', value: '> ' + product.nome, inline: true },
          { name: '<:icons8gift64:1368734581465022605> Plano', value: '> ' + plano.nome, inline: true },
          { name: '<:icons8banknotes64:1368734579971850300> Valor', value: `> R$ ${plano.valor.toFixed(2)}`, inline: true }
        )
        .setColor('#2b2d31')
        .setFooter({ text: 'Obrigado pela sua compra!' });

      // Send DM to user
      try {
        await interaction.user.send({
          embeds: [approvalEmbed]
        });
        console.log(`📩 DM enviado para ${interaction.user.tag} sobre compra aprovada (teste)`);
      } catch (dmError) {
        console.warn(`⚠️ Falha ao enviar DM para ${interaction.user.tag}:`, dmError.message);
      }

      // Send to private channel
      try {
        await purchaseChannel.send({
          content: `${interaction.user}`,
          embeds: [approvalEmbed]
        });
        console.log(`📢 Mensagem de aprovação enviada para o canal ${purchaseChannel.name} (teste)`);
      } catch (channelError) {
        console.warn(`⚠️ Falha ao enviar mensagem para o canal ${purchaseChannel.name}:`, channelError.message);
        return interaction.editReply({
          content: `❌ Falha ao enviar notificação para o canal ${purchaseChannel}. Verifique as permissões.`,
          ephemeral: true
        });
      }

      // Send log to webhook
      const webhookUrl = 'https://discord.com/api/webhooks/1368739126018310267/7U1U41uiN1l1BRKz3arJg380GecY84757LFfGn9-P-fr0O2-vDje_28Ts_kKXLIk8wOi';

      const logEmbed = new EmbedBuilder()
        .setTitle('<:icons8bell64:1368736644168945684> **Compra Aprovada com Sucesso**')
        .setColor('#2b2d31')
        .setTimestamp()
        .setFooter({ text: 'Log de Compra' })
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
          {
            name: '<:icons8time64:1368735939962339449> **Aprovado em**',
            value: `> <t:${Math.floor(payment.updatedAt.getTime() / 1000)}:F>`,
            inline: true
          },
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

      await interaction.editReply({
        content: `✅ Compra simulada aprovada! Notificações enviadas para DM e canal ${purchaseChannel}.`,
        ephemeral: true
      });

    } catch (error) {
      console.error('❌ Erro ao executar comando /teste_aprovar:', error.message, error.stack);
      await interaction.editReply({
        content: '❌ Ocorreu um erro ao simular a aprovação. Tente novamente.',
        ephemeral: true
      });
    }
  }
};