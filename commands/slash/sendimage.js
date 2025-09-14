const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_IDS = ['868853678868680734', '1013832671014699130'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendimage')
        .setDescription('Send an image publicly from a URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Image URL to send')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!OWNER_IDS.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true,
            });
        }

        const imageUrl = interaction.options.getString('url');

        // Basic validation for image URL
        if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return interaction.reply({
                content: '❌ Please provide a valid image URL ending with jpg, jpeg, png, gif, or webp.',
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            await interaction.channel.send({ files: [imageUrl] });
            await interaction.editReply({ content: '✅ Image sent publicly!', ephemeral: true });
        } catch (error) {
            console.error('Error sending image:', error);
            await interaction.editReply({ content: '❌ Failed to send image.', ephemeral: true });
        }
    }
};
