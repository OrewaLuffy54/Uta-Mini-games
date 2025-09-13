const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

// File path to users.json (ensure the path is correct based on your folder structure)
const usersFilePath = path.join(__dirname, '../../data', 'users.json');

module.exports = {
    name: 'giveberries',
    description: 'Give Berries to another user.',
    async execute(message, args) {
        const giverId = message.author.id;
        let usersData;

        try {
            // Load user data
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (err) {
            console.error('Error loading user data:', err);
            return message.reply('There was an error loading the user data. Please try again later.');
        }

        // Ensure both arguments are provided
        if (args.length < 2) {
            return message.reply('Please specify the recipient (mention) and the amount of Berries you want to give.');
        }

        // Get the recipient mention and amount
        const recipientMention = args[0];  // The mention
        const amountToGive = parseInt(args[1]);  // The amount to give

        // Validate the amount
        if (isNaN(amountToGive) || amountToGive <= 0) {
            return message.reply('Please provide a valid amount of Berries to give.');
        }

        // Extract recipient's Discord ID from the mention (e.g., @username)
        const recipientId = recipientMention.replace(/[<@!>]/g, ''); // Remove the mention tags

        // Ensure the recipient exists
        if (!usersData[recipientId]) {
            return message.reply(`User with mention **${recipientMention}** not found in the database!`);
        }

        // Check if the giver has enough Berries
        if (!usersData[giverId] || usersData[giverId].berries < amountToGive) {
            return message.reply("You don't have enough Berries to give!");
        }

        // Create a confirmation embed
        const confirmationEmbed = new EmbedBuilder()
            .setTitle('Give Berries - Confirmation')
            .setDescription(`Are you sure you want to give **${amountToGive} Berries** to <@${recipientId}>?`)
            .setColor(0x1DB954)
            .setFooter({ text: 'Click ✅ to confirm or ❌ to cancel' })
            .setTimestamp();

        // Create buttons for confirmation
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('✅ Confirm')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Danger);

        // Create an action row and add the buttons
        const actionRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        // Send the confirmation embed to the channel
        const confirmationMessage = await message.reply({
            embeds: [confirmationEmbed],
            components: [actionRow],
        });

        console.log('Confirmation embed sent. Waiting for user interaction...');

        // Flag to track if the interaction has been completed
        let interactionCompleted = false;

        // Set up button interaction handler
        const filter = (interaction) => interaction.user.id === giverId;

        const collector = confirmationMessage.createMessageComponentCollector({
            filter,
            time: 60000, // 1 minute timeout
        });

        collector.on('collect', async (interaction) => {
            console.log('Interaction collected:', interaction.customId);

            if (interaction.customId === 'confirm') {
                // Confirm the transfer
                console.log('Confirming transaction...');
                usersData[giverId].berries -= amountToGive;
                if (!usersData[recipientId]) {
                    // If the recipient doesn't exist, create an entry
                    usersData[recipientId] = { berries: 0, winStreak: 0 };
                }
                usersData[recipientId].berries += amountToGive; // Add to recipient

                try {
                    // Save updated user data
                    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
                    await interaction.update({ content: `Successfully gave **${amountToGive} Berries** to <@${recipientId}>.`, embeds: [], components: [] });
                } catch (err) {
                    console.error('Error saving user data:', err);
                    interaction.update({ content: 'There was an error saving your data. Please try again later.', embeds: [], components: [] });
                }
                interactionCompleted = true;  // Set the flag to true when the interaction is done
            } else if (interaction.customId === 'cancel') {
                // Reject the transfer
                console.log('Transaction cancelled by user.');
                await interaction.update({ content: 'Transaction cancelled. No Berries were transferred.', embeds: [], components: [] });
                interactionCompleted = true;  // Set the flag to true when the interaction is done
            }
        });

        // If no response in 1 minute, automatically cancel the transaction
        collector.on('end', (collected, reason) => {
            console.log('Collector ended:', reason);

            if (reason === 'time' && !interactionCompleted) {
                confirmationMessage.reactions.removeAll();
                message.reply('Transaction timed out. No Berries were transferred.');
            }
        });
    },
};
