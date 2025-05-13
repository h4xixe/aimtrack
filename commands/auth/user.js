const { SlashCommandBuilder, EmbedBuilder  } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Cria um novo usuário.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Nome de usuário')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('password')
                .setDescription('Senha')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('email')
                .setDescription('Email')
                .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const username = interaction.options.getString('username');
            const password = interaction.options.getString('password');
            const email = interaction.options.getString('email');

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return interaction.editReply({
                    content: '❌ Email inválido.',
                    ephemeral: true
                });
            }

            // Check if user exists
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return interaction.editReply({
                    content: '❌ Usuário ou email já existe.',
                    ephemeral: true
                });
            }

            // Create user
            const user = new User({
                username,
                password,
                email
            });
            await user.save();

             const embed = new EmbedBuilder()
                        .setDescription('**<:icons8bell64:1368736644168945684> Usuário Criada**')
                        .addFields( 
                          {
                            name: '<:icons8id64:1368735938355790025> **Usuário:**',
                            value: `> \`${username}\``,
                            inline: true
                          },
                          {
                            name: '<:icons8time64:1368735939962339449> **Senha:**',
                            value: `> \`${password}\``,
                            inline: true
                          },
                          {
                            name: '<:icons8keysecurity64:1369079744217354312> **Email:**',
                            value: `\`\`\`\n${email}\n\`\`\``,
                            inline: false
                          }
                        )
                        .setColor('#2b2d31');
            
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                            ephemeral: true
                        });
            /*
            await interaction.editReply({
                content: `✅ Usuário **${username}** criado com sucesso.`,
                ephemeral: true
            });*/
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error.message);
            await interaction.editReply({
                content: `❌ Erro ao criar usuário: ${error.message}`,
                ephemeral: true
            });
        }
    }
};