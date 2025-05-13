const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa todas as mensagens enviadas pelo bot nas suas DMs.'),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Get the user's DM channel
            const dmChannel = await interaction.user.createDM();
            console.log(`📋 Fetching DM channel for user ${interaction.user.tag} (${interaction.user.id})`);

            // Fetch all messages in the DM channel
            let messages = [];
            let lastMessageId = null;
            let fetchCount = 0;

            do {
                const fetchedMessages = await dmChannel.messages.fetch({
                    limit: 100, // Max messages per fetch
                    before: lastMessageId
                });
                fetchCount++;
                messages = messages.concat(
                    Array.from(fetchedMessages.values()).filter(
                        msg => msg.author.id === client.user.id
                    )
                );
                lastMessageId = fetchedMessages.size > 0 ? fetchedMessages.last().id : null;
            } while (lastMessageId && fetchCount < 10); // Limit to 10 fetches to prevent abuse

            console.log(`📋 Found ${messages.length} bot messages in DMs for ${interaction.user.tag}`);

            if (messages.length === 0) {
                await interaction.editReply({
                    content: '<:icons8checkedcheckbox64:1368740099524788255> Não encontrei nenhuma mensagem minha nas suas DMs.',
                    ephemeral: true
                });
                return;
            }

            // Delete each bot message
            let deletedCount = 0;
            for (const message of messages) {
                try {
                    await message.delete();
                    deletedCount++;
                    // Add a small delay to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`❌ Erro ao deletar mensagem ${message.id}:`, error.message);
                }
            }

            console.log(`📋 Deleted ${deletedCount} of ${messages.length} bot messages in DMs for ${interaction.user.tag}`);

            await interaction.editReply({
                content: `<:icons8checkedcheckbox64:1368740099524788255> Limpei ${deletedCount} mensagem${deletedCount !== 1 ? 's' : ''} enviada${deletedCount !== 1 ? 's' : ''} por mim nas suas DMs.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('❌ Erro ao limpar DMs:', error.message, error.stack);
            await interaction.editReply({
                content: `❌ Ocorreu um erro ao limpar suas DMs: ${error.message}`,
                ephemeral: true
            });
        }
    }
};