const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'List all available commands',

    async execute(message, args, client) {
        try {
            const msgCommandsPath = path.join(__dirname, '..', 'prefix');
            const msgFiles = fs.readdirSync(msgCommandsPath).filter(file => file.endsWith('.js'));

            const messageCommands = msgFiles.map(file => {
                try {
                    const cmd = require(path.join(msgCommandsPath, file));
                    return { name: cmd.name || 'Unknown', description: cmd.description || 'No description' };
                } catch (err) {
                    console.error(`Error loading message command file ${file}:`, err);
                    return null;  // Skip invalid command
                }
            }).filter(cmd => cmd !== null);  // Filter out invalid commands

            const slashCommandsPath = path.join(__dirname, '..', 'slash');
            const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

            const slashCommands = slashFiles.map(file => {
                try {
                    const cmd = require(path.join(slashCommandsPath, file));
                    if (!cmd.data || !cmd.data.name || !cmd.data.description) {
                        console.warn(`Invalid slash command file (missing name/description): ${file}`);
                        return null;
                    }
                    return { name: cmd.data.name, description: cmd.data.description };
                } catch (err) {
                    console.error(`Error loading slash command file ${file}:`, err);
                    return null;  // Skip invalid command
                }
            }).filter(cmd => cmd !== null);

            let description = `**🌐 Bot Stats:** Serving in **${client.guilds.cache.size}** servers.\n\n`;

            description += `**💬 Message Commands [${messageCommands.length}]:**\n`;
            if (messageCommands.length > 0) {
                messageCommands.forEach(cmd => {
                    description += `- \`uta ${cmd.name}\` - ${cmd.description}\n`; // Using `uta ` as prefix
                });
            } else {
                description += 'No message commands available.\n';
            }

            description += `\n**⚡ Slash Commands [${slashCommands.length}]:**\n`;
            if (slashCommands.length > 0) {
                slashCommands.forEach(cmd => {
                    description += `- \`/${cmd.name}\` - ${cmd.description}\n`;
                });
            } else {
                description += 'No slash commands available.\n';
            }

            if (description.length > 4096) {
                description = description.slice(0, 4093) + '...';
            }

            const embed = new EmbedBuilder()
                .setTitle('📖 Uta Mini Games Bot - Command List')
                .setColor(0x1DB954)
                .setDescription(description)
                .setFooter({ text: 'Developed by Luffy' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Help command error:', error);
            await message.reply('❌ An error occurred while fetching commands.');
        }
    }
};
