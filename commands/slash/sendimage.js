const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');

// Replace these with the Discord User IDs of all owners
const OWNER_IDS = ['123456789012345678', '1013832671014699130']; // Add your additional owner IDs here

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendimage')
        .setDescription('Send an image from the bot\'s local storage'),

    async execute(interaction) {
        // Check if the user is one of the owners
        if (!OWNER_IDS.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true,  // Makes it visible only to the user
            });
        }

        // Path to the image file
        const imagePath = path.join(__dirname, '../../images/image1.jpg');  // Adjust this to your image file location

        try {
            // Send only the image without a message
            await interaction.reply({
                files: [imagePath],  // Sends the image as an attachment
            });
        } catch (error) {
            console.error('Error sending image:', error);
            await interaction.reply({ content: '❌ An error occurred while sending the image.', ephemeral: true });
        }
    }
};

