const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and uptime'),

    async execute(interaction) {
        try {
            // Ensure `client` is available
            const client = interaction.client;

            // Calculate latency and uptime
            const latency = Date.now() - interaction.createdTimestamp;
            const uptimeSeconds = Math.floor(client.uptime / 1000);
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = uptimeSeconds % 60;

            // Build the embed response
            const embed = new EmbedBuilder()
                .setTitle('📡 Pong!')
                .setColor(0x1DB954)
                .setDescription(
                    `• **Latency:** ${latency} ms\n` +
                    `• **API Ping:** ${Math.round(client.ws.ping)} ms\n` +
                    `• **Uptime:** ${hours}h ${minutes}m ${seconds}s`
                )
                .setTimestamp()
                .setFooter({ text: 'Uta • Developed by Luffy' });

            // Reply with the embed (Visible to everyone in the channel)
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ping command error:', error);
            await interaction.reply({ content: '❌ An error occurred while checking ping.', ephemeral: true });
        }
    }
};
