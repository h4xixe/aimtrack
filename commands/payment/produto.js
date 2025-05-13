const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Product = require('../../models/Product');

// Função para gerar um productId no formato #XXXXXX
function generateProductId() {
  const digits = Math.floor(100000 + Math.random() * 900000); // Gera número de 6 dígitos
  return `#${digits}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('produto')
    .setDescription('Cadastra ou atualiza um produto')
    .setDMPermission(false)
    .addStringOption(opt =>
      opt.setName('nome')
        .setDescription('Nome do produto')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(opt =>
      opt.setName('descricao')
        .setDescription('Descrição do produto')
        .setRequired(true)
        .setMaxLength(200)
    )
    .addStringOption(opt =>
      opt.setName('planos')
        .setDescription('Planos (Ex: Unico ou Semanal,Mensal,Permanente)')
        .setRequired(true)
        .setMaxLength(200)
    )
    .addStringOption(opt =>
      opt.setName('imagem')
        .setDescription('URL da imagem do produto')
        .setRequired(true)
    )
    .addNumberOption(opt =>
      opt.setName('valor')
        .setDescription('Valor do plano único (usado se planos=Unico)')
        .setRequired(false)
        .setMinValue(0.01)
    )
    .addNumberOption(opt =>
      opt.setName('valor_plano1')
        .setDescription('Valor do primeiro plano (ex: Semanal)')
        .setRequired(false)
        .setMinValue(0.01)
    )
    .addNumberOption(opt =>
      opt.setName('valor_plano2')
        .setDescription('Valor do segundo plano (ex: Mensal)')
        .setRequired(false)
        .setMinValue(0.01)
    )
    .addNumberOption(opt =>
      opt.setName('valor_plano3')
        .setDescription('Valor do terceiro plano (ex: Permanente)')
        .setRequired(false)
        .setMinValue(0.01)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const nome = interaction.options.getString('nome');
      const descricao = interaction.options.getString('descricao');
      const planosRaw = interaction.options.getString('planos');
      const valor = interaction.options.getNumber('valor');
      const valorPlano1 = interaction.options.getNumber('valor_plano1');
      const valorPlano2 = interaction.options.getNumber('valor_plano2');
      const valorPlano3 = interaction.options.getNumber('valor_plano3');
      const imagem = interaction.options.getString('imagem');

      // Validar nome do produto
      if (!nome || nome.trim().length === 0) {
        return interaction.editReply({
          content: '❌ O nome do produto não pode ser vazio.',
          ephemeral: true
        });
      }

      // Validar descrição
      if (!descricao || descricao.trim().length === 0) {
        return interaction.editReply({
          content: '❌ A descrição do produto não pode ser vazia.',
          ephemeral: true
        });
      }

      // Validar planos
      const planos = planosRaw.split(',').map(p => p.trim()).filter(p => p);
      if (planos.length === 0) {
        return interaction.editReply({
          content: '❌ Nenhum plano válido fornecido.',
          ephemeral: true
        });
      }

      // Validar nomes dos planos
      for (const plano of planos) {
        if (plano.length > 50) {
          return interaction.editReply({
            content: `❌ O plano "${plano}" excede 50 caracteres.`,
            ephemeral: true
          });
        }
        if (!plano || plano.trim().length === 0) {
          return interaction.editReply({
            content: '❌ Os nomes dos planos não podem ser vazios.',
            ephemeral: true
          });
        }
      }
      const uniquePlanos = new Set(planos);
      if (uniquePlanos.size !== planos.length) {
        return interaction.editReply({
          content: '❌ Os nomes dos planos devem ser únicos.',
          ephemeral: true
        });
      }

      // Validar URL da imagem
      try {
        new URL(imagem);
      } catch {
        return interaction.editReply({
          content: '❌ A URL da imagem é inválida.',
          ephemeral: true
        });
      }

      // Validar planos e valores
      let valores = [];
      if (planos.length === 1 && planos[0].toLowerCase() === 'unico') {
        if (!valor) {
          return interaction.editReply({
            content: '❌ O campo "valor" é obrigatório para plano único.',
            ephemeral: true
          });
        }
        if (valorPlano1 || valorPlano2 || valorPlano3) {
          return interaction.editReply({
            content: '❌ Não forneça valores de planos adicionais para plano único.',
            ephemeral: true
          });
        }
        valores = [valor];
      } else {
        if (valor) {
          return interaction.editReply({
            content: '❌ O campo "valor" deve ser usado apenas para plano único.',
            ephemeral: true
          });
        }
        valores = [valorPlano1, valorPlano2, valorPlano3].filter(v => v !== null);
        if (valores.length !== planos.length) {
          return interaction.editReply({
            content: '❌ O número de valores fornecidos deve corresponder ao número de planos.',
            ephemeral: true
          });
        }
        // Validar que todos os valores são válidos
        for (const val of valores) {
          if (val == null || isNaN(val) || val < 0.01) {
            return interaction.editReply({
              content: '❌ Todos os valores dos planos devem ser números válidos maiores ou iguais a 0.01.',
              ephemeral: true
            });
          }
        }
      }

      // Estruturar planos com valores
      const planosComValores = planos.map((plano, index) => {
        const valor = valores[index];
        if (!plano || !valor) {
          throw new Error(`Plano ou valor inválido: ${plano}, ${valor}`);
        }
        return {
          nome: plano,
          valor: valor
        };
      });

      // Gerar productId único
      let productId;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        productId = generateProductId();
        const existingProduct = await Product.findOne({ productId });
        if (!existingProduct) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return interaction.editReply({
          content: '❌ Não foi possível gerar um ID único para o produto. Tente novamente.',
          ephemeral: true
        });
      }

      // Criar e salvar novo produto
      const novoProduto = new Product({
        productId,
        nome,
        descricao,
        planos: planosComValores,
        imagem,
        createdBy: interaction.user.id,
        createdAt: new Date()
      });
      await novoProduto.save();

      // Criar embed de confirmação
      const embed = new EmbedBuilder()
        .setTitle('Produto Cadastrado')
        .setDescription(`**${nome}** cadastrado com sucesso!`)
        .addFields(
          { name: 'ID do Produto', value: productId, inline: true },
          { name: 'Descrição', value: descricao, inline: true },
          {
            name: 'Planos',
            value: planosComValores.map(p => `${p.nome}: R$ ${p.valor.toFixed(2)}`).join('\n'),
            inline: false
          },
          { name: 'Imagem', value: `[Ver imagem](${imagem})`, inline: false }
        )
        .setColor('#2b2d31')
        .setTimestamp()
        .setFooter({ text: `Cadastrado por ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Erro ao cadastrar produto:', error.message, error.stack);
      await interaction.editReply({
        content: '❌ Ocorreu um erro ao cadastrar o produto. Tente novamente.',
        ephemeral: true
      });
    }
  }
};