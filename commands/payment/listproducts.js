const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Product = require('../../models/Product');
const ProductList = require('../../models/ProductList');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listproducts')
    .setDescription('Lista todos os produtos cadastrados')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // Buscar todos os produtos
      const products = await Product.find().lean();
      
      if (!products || products.length === 0) {
        return interaction.editReply({
          content: '❌ Nenhum produto cadastrado. Use /produto para cadastrar um novo produto.',
          ephemeral: true
        });
      }

      // Salvar lista de product IDs no ProductList
      const productList = new ProductList({
        userId: interaction.user.id,
        productIds: products.map(p => p._id),
        createdAt: new Date()
      });
      await productList.save();

      // Função para criar embed de uma página
      const createProductEmbed = (product, page, totalPages) => {
        const planosList = product.planos
          .map(plano => `${plano.nome}: R$ ${plano.valor.toFixed(2)}`)
          .join('\n') || 'Nenhum plano cadastrado';

        const embed = new EmbedBuilder()
          .setTitle(`Produto ${product.nome} (${product.productId})`)
          .setDescription(product.descricao || 'Sem descrição')
          .addFields(
            { name: 'Planos', value: planosList, inline: false },
            { name: 'Imagem', value: product.imagem ? `[Ver imagem](${product.imagem})` : 'Nenhuma imagem', inline: false }
          )
          .setColor('#2b2d31')
          .setTimestamp()
          .setFooter({ text: `Página ${page + 1} de ${totalPages} | Solicitado por ${interaction.user.username}` });

        return embed;
      };

      // Função para criar botões de navegação
      const createButtons = (page, totalPages, listId) => {
        const prevButton = new ButtonBuilder()
          .setCustomId(`listproducts_prev_${page}_${listId}`)
          .setLabel('Anterior')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⬅️')
          .setDisabled(page === 0);

        const pageButton = new ButtonBuilder()
          .setCustomId(`listproducts_page_${page}`)
          .setLabel(`Página ${page + 1}/${totalPages}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true);

        const nextButton = new ButtonBuilder()
          .setCustomId(`listproducts_next_${page}_${listId}`)
          .setLabel('Próximo')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('➡️')
          .setDisabled(page === totalPages - 1);

        return new ActionRowBuilder().addComponents(prevButton, pageButton, nextButton);
      };

      // Enviar primeira página
      const page = 0;
      const totalPages = products.length;
      const embed = createProductEmbed(products[page], page, totalPages);
      const buttons = createButtons(page, totalPages, productList._id);

      await interaction.editReply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true
      });

    } catch (error) {
      console.error('❌ Erro ao executar comando /listproducts:', error.message);
      await interaction.editReply({
        content: '❌ Ocorreu um erro ao listar os produtos. Tente novamente.',
        ephemeral: true
      });
    }
  }
};