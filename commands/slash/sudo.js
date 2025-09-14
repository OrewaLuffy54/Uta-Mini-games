const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags } = require('discord.js');

// ✅ Authorized users (Add your user IDs here)
const AUTHORIZED_USERS = ['868853678868680734', '1013832671014699130'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sudo')
        .setDescription('Perform an admin action')
        .setDefaultMemberPermissions(0) // ❗ Hide from non-admins by default
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
                    { name: 'purge', value: 'purge' },
                    { name: 'announce', value: 'announce' },
                    { name: 'role', value: 'role' },
                    { name: 'voicekick', value: 'voicekick' },
                    { name: 'move', value: 'move' }
                )
        )
        .addStringOption(option =>
            option.setName('target')
                .setDescription('Target ID (Channel ID, Message ID, User ID)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Content (Message text, emoji, nickname, role ID, duration in minutes, etc.)')
                .setRequired(true)
        ),

    async execute(interaction) {
        // ✅ Restrict usage to specific authorized users
        if (!AUTHORIZED_USERS.includes(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setDescription('❌ You do not have permission to use this command!')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Check if target is valid
        const targetRaw = interaction.options.getString('target');
        if (!targetRaw) {
            return interaction.reply({ content: '❌ Target is missing or invalid.', ephemeral: true });
        }
        const target = targetRaw.replace(/[<#@!>]/g, '');

        // Ensure that interaction is not already replied to or deferred
        try {
            // Defer reply first to avoid errors later
            await interaction.deferReply({ flags: InteractionResponseFlags.Ephemeral });

            const action = interaction.options.getString('action');
            const content = interaction.options.getString('content');

            console.log('--- SUDO COMMAND ---');
            console.log('User:', interaction.user.tag, `(${interaction.user.id})`);
            console.log('Action:', action, 'Target:', target, 'Content:', content);

            let embed;

            // Action-based commands
            if (action === 'msg') {
                const channel = await interaction.client.channels.fetch(target);
                if (!channel || !channel.isTextBased()) {
                    embed = new EmbedBuilder().setDescription('❌ Channel not found or not text‑based!');
                } else {
                    await channel.send(content);
                    embed = new EmbedBuilder().setDescription('✅ Message sent successfully!');
                }
            } else if (action === 'react') {
                let found = false;
                for (const [, channel] of interaction.client.channels.cache) {
                    if (channel.isTextBased()) {
                        try {
                            const message = await channel.messages.fetch(target);
                            if (message) {
                                await message.react(content);
                                embed = new EmbedBuilder().setDescription('✅ Reaction added successfully!');
                                found = true;
                                break;
                            }
                        } catch {}
                    }
                }
                if (!found) {
                    embed = new EmbedBuilder().setDescription('❌ Message not found in any accessible channel!');
                }

            } else if (action === 'dm') {
                try {
                    const user = await interaction.client.users.fetch(target);
                    if (!user) {
                        embed = new EmbedBuilder().setDescription('❌ User not found!');
                    } else {
                        await user.send(content);
                        embed = new EmbedBuilder().setDescription(`✅ DM sent to ${user.tag}`);
                    }
                } catch {
                    embed = new EmbedBuilder().setDescription('❌ Could not send DM (maybe DMs disabled?)');
                }

            } else {
                embed = new EmbedBuilder().setDescription('❌ Invalid action!');
            }

            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('🛑 Sudo command error:', error);
            const embed = new EmbedBuilder().setDescription('❌ An error occurred while executing the command!');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};
