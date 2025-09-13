require('dotenv').config();  // Loads environment variables from the .env file
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create the client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token = process.env.BOT_TOKEN;  // Load the bot token from .env
const prefixes = ['Uta ', 'uta '];    // Prefixes for command detection

// Load prefix commands
const coinflipCommand = require('./commands/prefix/coinflip');
const rolldiceCommand = require('./commands/prefix/rolldice');
const dailyCommand = require('./commands/prefix/daily');
const balanceCommand = require('./commands/prefix/balance');
const helpCommand = require('./commands/prefix/help');
const giveberriesCommand = require('./commands/prefix/giveberries');  // Add the giveberries command

// Load slash commands
const pingSlashCommand = require('./commands/slash/ping');
const helpSlashCommand = require('./commands/slash/help');  // Add help slash command
const sudoSlashCommand = require('./commands/slash/sudo');  // Added sudo command
const sendimageSlashCommand = require('./commands/slash/sendimage');  // Added sendimage command

client.once('ready', () => {
    console.log('Uta Mini Games Bot is Online!');
    registerSlashCommands();
});

// Registering slash commands
async function registerSlashCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Check the bot\'s ping'),
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('List all available commands'),
        new SlashCommandBuilder()
            .setName('sudo')
            .setDescription('Perform an admin action'), // Added sudo command
        new SlashCommandBuilder()
            .setName('sendimage')
            .setDescription('Send an image to a channel')  // Added sendimage command
    ]
    .map(command => command.toJSON());

    try {
        await client.application.commands.set(commands);  // Register commands globally
        console.log('Slash commands registered!');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
}

// Handle prefix commands
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content;
    const lowerContent = content.toLowerCase();

    // Check which prefix was used
    const usedPrefix = prefixes.find(prefix => lowerContent.startsWith(prefix.toLowerCase()));
    if (!usedPrefix) return;

    // Remove prefix and split args
    const args = content.slice(usedPrefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    try {
        switch (commandName) {
            case 'cf':
            case 'coinflip':
                console.log('Coinflip command detected.');
                await coinflipCommand.execute(message, args);
                break;

            case 'rd':
            case 'rolldice':
                console.log('Rolldice command detected.');
                await rolldiceCommand.execute(message, args);
                break;

            case 'daily':
                console.log('Daily command detected.');
                await dailyCommand.execute(message, args);
                break;

            case 'balance':
                console.log('Balance command detected.');
                await balanceCommand.execute(message, args);
                break;

            case 'giveberries':
                console.log('Giveberries command detected.');
                await giveberriesCommand.execute(message, args); // Added the giveberries command
                break;

            case 'help':
            case 'h':
                console.log('Help command detected.');
                // Pass client to help command if it needs it
                await helpCommand.execute(message, args, client);
                break;

            default:
                // Unknown prefix command (optional)
                message.reply("Unknown command. Use 'Uta help' to see commands.");
                break;
        }
    } catch (error) {
        console.error(`Error executing ${commandName} command:`, error);
        message.reply('There was an error executing that command.');
    }
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    console.log(`Slash command received: ${commandName}`);

    try {
        if (commandName === 'ping') {
            await pingSlashCommand.execute(interaction);
        } else if (commandName === 'help') {
            await helpSlashCommand.execute(interaction);  // Handle /help command
        } else if (commandName === 'sudo') {
            await sudoSlashCommand.execute(interaction);  // Handle /sudo command
        } else if (commandName === 'sendimage') {
            await sendimageSlashCommand.execute(interaction);  // Handle /sendimage command
        }
        // Add other slash commands here if needed
    } catch (error) {
        console.error(`Error executing slash command ${commandName}:`, error);
        await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
    }
});

// Log in the bot using the token from the .env file
client.login(token);
