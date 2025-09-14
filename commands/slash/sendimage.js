const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

const OWNER_IDS = ['868853678868680734', '1013832671014699130']; // Your owners

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendimage')
        .setDescription('Send an image from the bot\'s local storage'),

    async execute(interaction) {
        if (!OWNER_IDS.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true,
            });
        }

        const imagePath = path.join(__dirname, '../../images/image1.jpg');

        // Defer reply silently so owner sees nothing public
        await interaction.deferReply({ ephemeral: true });

        try {
            // Send image publicly in the channel
            await interaction.channel.send({ files: [imagePath] });

            // Confirm to owner privately (or keep it blank)
            await interaction.editReply({ content: '✅ Image sent!', ephemeral: true });
        } catch (error) {
            console.error('Error sending image:', error);
            await interaction.editReply({ content: '❌ Failed to send image.', ephemeral: true });
        }
    }
};
