const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, StringSelectMenuBuilder, ActionRowBuilder, ChannelType } = require('discord.js');
const Product = require('../../models/Product');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('publicar')
    .setDescription('Publica um produto com planos e valores em um canal especificado')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('canal')
        .setDescription('Canal onde o produto será publicado')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;

      await interaction.deferReply({ ephemeral: true });

      // Get channel
      const channel = interaction.options.getChannel('canal');
      if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.editReply({
          content: '❌ Selecione um canal de texto válido.',
          ephemeral: true
        });
      }

      // Check bot permissions in the channel
      const botPermissions = channel.permissionsFor(interaction.guild.members.me);
      const requiredPermissions = [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks
      ];
      if (!requiredPermissions.every(perm => botPermissions.has(perm))) {
        return interaction.editReply({
          content: '❌ O bot não tem permissões suficientes no canal selecionado (necessário: Ver Canal, Enviar Mensagens, Inserir Links).',
          ephemeral: true
        });
      }

      // Fetch all products
      const products = await Product.find().lean();
      if (!products || products.length === 0) {
        return interaction.editReply({
          content: '❌ Nenhum produto cadastrado. Use /produto para cadastrar um novo produto.',
          ephemeral: true
        });
      }

      // Filter valid products
      const validProducts = products.filter(product => {
        const isValid = (
          product.nome &&
          typeof product.nome === 'string' &&
          product.nome.trim().length > 0 &&
          product.productId &&
          typeof product.productId === 'string' &&
          product.descricao &&
          typeof product.descricao === 'string' &&
          Array.isArray(product.planos)
        );
        if (!isValid) {
          console.warn(`⚠️ Produto inválido encontrado:`, JSON.stringify(product, null, 2));
        }
        return isValid;
      });

      if (!validProducts.length) {
        return interaction.editReply({
          content: '❌ Nenhum produto válido encontrado. Verifique os dados cadastrados.',
          ephemeral: true
        });
      }

      console.log('📋 Produtos válidos:', validProducts.map(p => ({ nome: p.nome, productId: p.productId })));

      // Create product selection menu
      const productOptions = validProducts.map(product => ({
        label: (product.nome || 'Sem Nome').slice(0, 100),
        description: (product.productId || 'Sem ID').slice(0, 100),
        value: product.productId
      }));

      const productSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(`selecionar_produto_${interaction.user.id}`)
        .setPlaceholder('Escolha um produto')
        .addOptions(productOptions.slice(0, 25)); // Discord limit

      const productRow = new ActionRowBuilder().addComponents(productSelectMenu);

      // Send product selection menu
      await interaction.editReply({
        content: 'Selecione o produto para publicar:',
        components: [productRow],
        ephemeral: true
      });

      // Collector for product selection
      const filter = i => i.customId === `selecionar_produto_${interaction.user.id}` && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

      collector.on('collect', async i => {
        try {
          await i.deferUpdate();

          const selectedProductId = i.values[0];
          const product = validProducts.find(p => p.productId === selectedProductId);

          if (!product) {
            return i.editReply({
              content: `❌ Produto com ID ${selectedProductId} não encontrado.`,
              components: [],
              ephemeral: true
            });
          }

          // Filter valid plans
          const validPlanos = product.planos.filter(plano => {
            const isValid = (
              plano.nome &&
              typeof plano.nome === 'string' &&
              plano.nome.trim().length > 0 &&
              plano.nome.length <= 50 &&
              plano.valor != null &&
              typeof plano.valor === 'number' &&
              Number.isFinite(plano.valor) &&
              plano.valor >= 0.01
            );
            if (!isValid) {
              console.warn(`⚠️ Plano inválido encontrado no produto ${selectedProductId}:`, JSON.stringify(plano, null, 2));
            }
            return isValid;
          });

          if (!validPlanos.length) {
            return i.editReply({
              content: '❌ Nenhum plano válido encontrado para este produto.',
              components: [],
              ephemeral: true
            });
          }

          console.log('📋 Produto selecionado:', { productId: selectedProductId, nome: product.nome });
          console.log('📋 Planos válidos:', JSON.stringify(validPlanos, null, 2));

          // Create options for plan menu
          const planOptions = validPlanos.map((plano, index) => {
            const label = plano.nome.length > 50 ? `${plano.nome.slice(0, 47)}...` : plano.nome;
            const valueBase = plano.nome.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 50);
            const value = `${valueBase}|${index}|${product.productId}`;

            if (value.length > 100) {
              console.warn(`⚠️ Value muito longo para plano ${plano.nome}: ${value}`);
              throw new Error(`Value do plano ${plano.nome} excede 100 caracteres`);
            }

            return {
              label,
              description: `R$ ${plano.valor.toFixed(2)}`.slice(0, 100),
              value
            };
          });

          // Check for duplicates
          const values = planOptions.map(opt => opt.value);
          if (new Set(values).size !== values.length) {
            console.warn('⚠️ Valores duplicados detectados:', values);
            throw new Error('Planos com nomes duplicados após normalização');
          }

          // Create fields for embed
          const fields = validPlanos.map((plano, index) => {
            const name = '<:icons8gift64:1368730665037594655> ' + plano.nome.slice(0, 256) + ':' || 'Plano Sem Nome';
            const value = `> R$ ${plano.valor.toFixed(2)}`.slice(0, 1024);
            if (!name || !value) {
              console.warn(`⚠️ Campo inválido gerado:`, { name, value });
              throw new Error('Campo inválido para o embed');
            }
            return { name, value, inline: true };
          });

        //  fields.unshift({ name: 'ID do Produto', value: product.productId, inline: true });

          console.log('📋 Campos do embed:', JSON.stringify(fields, null, 2));

          // Create embed for plan selection
          const embed = new EmbedBuilder()
            .setTitle((product.nome + ' <:icons8confete64:1368734588511322155>' || 'Produto Sem Nome').slice(0, 256))
            .setDescription('Selecione um plano para continuar com a compra:')
            .addFields(fields)
            .setImage(product.imagem || null)
            .setColor('#2b2d31')
            .setTimestamp()
            .setFooter({ text: 'Escolha um plano para prosseguir' });

          // Create plan selection menu
          const planSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(`selecionar_plano_${interaction.user.id}`)
            .setPlaceholder('Escolha um plano')
            .addOptions(planOptions);

          const planRow = new ActionRowBuilder().addComponents(planSelectMenu);

          console.log('📋 Opções do menu de planos:', JSON.stringify(planOptions, null, 2));
          console.log('📤 Payload do menu:', JSON.stringify(planRow.toJSON(), null, 2));

          // Send to specified channel
          await channel.send({
            embeds: [embed],
            components: [planRow]
          });

          await i.editReply({
            content: `<:icons8checkedcheckbox64:1368740099524788255> Produto "${product.nome || product.productId}" publicado com sucesso no canal ${channel}!`,
            components: [],
            ephemeral: true
          });
        } catch (error) {
          console.error('❌ Erro ao processar seleção de produto:', error.message, error.stack);
          await i.editReply({
            content: '❌ Ocorreu um erro ao publicar o produto. Tente novamente.',
            components: [],
            ephemeral: true
          });
        }
      });

      collector.on('end', collected => {
        if (!collected.size) {
          interaction.editReply({
            content: '❌ Tempo esgotado para selecionar um produto.',
            components: [],
            ephemeral: true
          });
        }
      });

    } catch (error) {
      console.error('❌ Erro ao executar comando /publicar:', error.message, error.stack);
      await interaction.editReply({
        content: '❌ Ocorreu um erro ao processar o comando. Tente novamente.',
        ephemeral: true
      });
    }
  }
};