const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags } = require('discord.js');

// List of authorized user IDs
const AUTHORIZED_USERS = ['868853678868680734', '1013832671014699130'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sudo')
        .setDescription('Admin Command')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Select an action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'msg', value: 'msg' },
                    { name: 'react', value: 'react' },
                    { name: 'dm', value: 'dm' },
                    { name: 'reply', value: 'reply' },
                    { name: 'edit', value: 'edit' },
                    { name: 'delete', value: 'delete' },
                    { name: 'pin', value: 'pin' },
                    { name: 'unpin', value: 'unpin' },
                    { name: 'nickname', value: 'nickname' },
                    { name: 'timeout', value: 'timeout' },
                    { name: 'kick', value: 'kick' },
                    { name: 'ban', value: 'ban' },
                    { name: 'announce', value: 'announce' },
                    { name: 'role', value: 'role' },
                    { name: 'voicekick', value: 'voicekick' },
                    { name: 'move', value: 'move' }
                )
        )
        .addStringOption(option =>
            option.setName('target')
                .setDescription('Target ID (Channel ID, Message ID, User ID, etc.)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Content (Message text, emoji, nickname, role ID, duration in minutes, etc.)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const action = interaction.options.getString('action');
        const targetRaw = interaction.options.getString('target');
        const content = interaction.options.getString('content');

        // ✅ SAFETY CHECK: Avoid .replace on null
        if (!targetRaw) {
            return interaction.reply({
                content: '❌ Target ID is missing.',
                flags: InteractionResponseFlags.Ephemeral
            });
        }

        const target = targetRaw.replace(/[<#@!>]/g, '');

        // Check if user is authorized
        if (!AUTHORIZED_USERS.includes(userId)) {
            const embed = new EmbedBuilder()
                .setDescription('❌ You do not have permission to use this command!')
                .setColor('#FF0000');

            return interaction.reply({
                embeds: [embed],
                flags: InteractionResponseFlags.Ephemeral
            });
        }

        // ✅ Replace deprecated ephemeral usage
        await interaction.deferReply({ flags: InteractionResponseFlags.Ephemeral });

        let embed;

        try {
            // [Rest of your long command logic remains unchanged]
            // You don't need to change the rest unless more errors occur.

            // At the very end:
            await interaction.editReply({ embeds: [embed], flags: InteractionResponseFlags.Ephemeral });

        } catch (error) {
            console.error('🛑 Sudo command error:', error);
            const errorEmbed = new EmbedBuilder().setDescription('❌ An error occurred while executing the command!');
            await interaction.editReply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
        }
    }
};
