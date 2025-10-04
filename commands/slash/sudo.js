const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const shiva = require('../../shiva');
const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

// ✅ Authorized users (Add your user IDs here)
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
                .setDescription('Content (Message text, emoji, nickname, role ID, duration in minutes, move target channel ID, etc.)')
                .setRequired(true)
        ),

    securityToken: COMMAND_SECURITY_TOKEN,
    hidden: true, // Hide from help

    async execute(interaction, client) {
        if (!AUTHORIZED_USERS.includes(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setDescription('❌ You do not have permission to use this command!')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ System core offline - Command unavailable')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const action = interaction.options.getString('action');
        const targetRaw = interaction.options.getString('target');
        const content = interaction.options.getString('content');
        const target = targetRaw.replace(/[<#@!>]/g, '');

        console.log('--- SUDO COMMAND ---');
        console.log('User:', interaction.user.tag, `(${interaction.user.id})`);
        console.log('Action:', action, 'Target:', target, 'Content:', content);

        try {
            let embed;

            // Helper function for error handling
            const createErrorEmbed = (message) => {
                return new EmbedBuilder()
                    .setDescription(`❌ ${message}`)
                    .setColor('#FF0000');
            };

            // Check if action is valid
            if (!['msg', 'react', 'dm', 'reply', 'edit', 'delete', 'pin', 'unpin', 'nickname', 'timeout', 'kick', 'ban', 'purge', 'announce', 'role', 'voicekick', 'move'].includes(action)) {
                embed = createErrorEmbed('Invalid action!');
                return await interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            // Action handling
            if (action === 'msg') {
                const channel = await interaction.client.channels.fetch(target);
                if (!channel || !channel.isTextBased()) {
                    embed = createErrorEmbed('Channel not found or not text-based!');
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
                        } catch (error) {
                            console.error('React error:', error);
                        }
                    }
                }
                if (!found) {
                    embed = createErrorEmbed('Message not found in any accessible channel!');
                }

            } else if (action === 'dm') {
                try {
                    const user = await interaction.client.users.fetch(target);
                    if (!user) {
                        embed = createErrorEmbed('User not found!');
                    } else {
                        await user.send(content);
                        embed = new EmbedBuilder().setDescription(`✅ DM sent to ${user.tag}`);
                    }
                } catch (error) {
                    console.error('DM error:', error);
                    embed = createErrorEmbed('Could not send DM (maybe DMs disabled?)');
                }

            } else if (action === 'reply') {
                let found = false;
                for (const [, channel] of interaction.client.channels.cache) {
                    if (channel.isTextBased()) {
                        try {
                            const message = await channel.messages.fetch(target);
                            if (message) {
                                await message.reply(content);
                                embed = new EmbedBuilder().setDescription('✅ Reply sent successfully!');
                                found = true;
                                break;
                            }
                        } catch (error) {
                            console.error('Reply error:', error);
                        }
                    }
                }
                if (!found) {
                    embed = createErrorEmbed('Message not found!');
                }

            } else if (action === 'edit') {
                let found = false;
                for (const [, channel] of interaction.client.channels.cache) {
                    if (channel.isTextBased()) {
                        try {
                            const message = await channel.messages.fetch(target);
                            if (message && message.editable) {
                                await message.edit(content);
                                embed = new EmbedBuilder().setDescription('✅ Message edited successfully!');
                                found = true;
                                break;
                            }
                        } catch (error) {
                            console.error('Edit error:', error);
                        }
                    }
                }
                if (!found) {
                    embed = createErrorEmbed('Message not found or cannot be edited!');
                }

            } else if (action === 'delete') {
                let found = false;
                for (const [, channel] of interaction.client.channels.cache) {
                    if (channel.isTextBased()) {
                        try {
                            const message = await channel.messages.fetch(target);
                            if (message) {
                                await message.delete();
                                embed = new EmbedBuilder().setDescription('✅ Message deleted successfully!');
                                found = true;
                                break;
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                        }
                    }
                }
                if (!found) {
                    embed = createErrorEmbed('Message not found or cannot be deleted!');
                }

            } // Continue for other actions...

            // Final response
            if (!embed) {
                embed = createErrorEmbed('An unexpected error occurred.');
            }

            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('🛑 Sudo command error:', error);
            const embed = createErrorEmbed('❌ An error occurred while executing the command!');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};
