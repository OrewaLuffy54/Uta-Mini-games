require('dotenv').config();  // Loads environment variables from the .env file
const express = require('express'); // Added Express
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

// Prefix commands
const coinflipCommand = require('./commands/prefix/coinflip');
const rolldiceCommand = require('./commands/prefix/rolldice');
const dailyCommand = require('./commands/prefix/daily');
const balanceCommand = require('./commands/prefix/balance');
const helpCommand = require('./commands/prefix/help');
const giveberriesCommand = require('./commands/prefix/giveberries');

// Slash commands
const pingSlashCommand = require('./commands/slash/ping');
const helpSlashCommand = require('./commands/slash/help');
const sudoSlashCommand = require('./commands/slash/sudo');
const sendimageSlashCommand = require('./commands/slash/sendimage');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token = process.env.BOT_TOKEN;
const prefixes = ['Uta ', 'uta '];

// Event: Ready
client.once('ready', () => {
    console.log('Uta Mini Games Bot is Online!');
    registerSlashCommands();
});

// Register slash commands
async function registerSlashCommands() {
    const commands = [
        new SlashCommandBuilder().setName('ping').setDescription('Check the bot\'s ping'),
        new SlashCommandBuilder().setName('help').setDescription('List all available commands'),
        new SlashCommandBuilder().setName('sudo').setDescription('Perform an admin action'),
        new SlashCommandBuilder().setName('sendimage').setDescription('Send an image to a channel')
    ].map(command => command.toJSON());

    try {
        await client.application.commands.set(commands);
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

    const usedPrefix = prefixes.find(prefix => lowerContent.startsWith(prefix.toLowerCase()));
    if (!usedPrefix) return;

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
                await giveberriesCommand.execute(message, args);
                break;
            case 'help':
            case 'h':
                console.log('Help command detected.');
                await helpCommand.execute(message, args, client);
                break;
            default:
                message.reply("Unknown command. Use 'Uta help' to see commands.");
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
            await helpSlashCommand.execute(interaction);
        } else if (commandName === 'sudo') {
            await sudoSlashCommand.execute(interaction);
        } else if (commandName === 'sendimage') {
            await sendimageSlashCommand.execute(interaction);
        }
    } catch (error) {
        console.error(`Error executing slash command ${commandName}:`, error);
        await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
    }
});

// Log in to Discord
client.login(token);

// ----------------------------------
// KEEP-ALIVE SERVER FOR RENDER
// ----------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Uta Mini Games Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
