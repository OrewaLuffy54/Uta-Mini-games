const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');  // Make sure your clientId and guildId are correct

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Check the bot\'s latency and uptime'),
    new SlashCommandBuilder()
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
    // Add other commands here
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
