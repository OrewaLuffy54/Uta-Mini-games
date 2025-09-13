const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

// File path to users.json (ensure the path is correct based on your folder structure)
const usersFilePath = path.join(__dirname, '../../data', 'users.json');

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin and bet on Heads (h) or Tails (t)!',
    async execute(message, args) {
        const userId = message.author.id;
        let usersData;

        try {
            // Load user data
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (err) {
            console.error('Error loading user data:', err);
            return message.reply('There was an error loading the user data. Please try again later.');
        }

        // Ensure the user exists
        if (!usersData[userId]) {
            usersData[userId] = { berries: 0, winStreak: 0 };
        }

        // Check if arguments are provided
        if (!args[0] || !args[1]) {
            return message.reply('Please specify both your bet choice (h/t or head/tail) and the amount to bet.');
        }

        // Normalize the bet choice (h/t or head/tail)
        const betChoice = args[0].toLowerCase();  // 'h' or 't'
        let betAmount = args[1].toLowerCase(); // Amount to bet

        // If the user bet 'all', they are betting all their berries
        if (betAmount === 'all') {
            betAmount = usersData[userId].berries;
            // Cap the bet to 250,000 Berries (maximum bet)
            if (betAmount > 250000) {
                betAmount = 250000;
            }
        } else {
            // Convert betAmount to an integer
            betAmount = parseInt(betAmount);
        }

        // Validate the bet amount
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid bet amount.');
        }

        // Maximum bet is 250,000 or all berries (up to the user's total)
        const maxBet = 250000;
        if (betAmount > maxBet && betAmount !== usersData[userId].berries) {
            return message.reply(`The maximum bet is **${maxBet} Berries**. Or you can bet "all" to wager all your berries.`);
        }

        // Check if user has enough Berries to bet
        if (usersData[userId].berries < betAmount) {
            return message.reply("You don't have enough Berries to bet!");
        }

        // Roll the coin (heads or tails)
        const coinResult = Math.random() < 0.5 ? 'h' : 't'; // Random result (h or t)

        // If user has a win streak, decrease win chance (example: 40% chance after 4 wins)
        const winChance = usersData[userId].winStreak >= 4 ? 0.4 : 0.5;  // 40% win chance after 4 wins, else 50%

        // Adjust the win/loss chance based on the bet amount (if higher bet, chance decreases)
        if (betAmount > 150000) {
            // Lower the chance to 30% if the bet is higher than 150,000
            if (Math.random() > 0.3) { // 70% chance of loss
                coinResult = coinResult === 'h' ? 't' : 'h'; // Force a loss
            }
        }

        let resultMessage;
        let isWin = false;

        // Check if the coin result matches the user's bet choice
        if (
            (coinResult === 'h' && (betChoice === 'h' || betChoice === 'head')) ||
            (coinResult === 't' && (betChoice === 't' || betChoice === 'tail'))
        ) {
            // User wins, double their bet amount
            isWin = true;
        }

        if (isWin) {
            const winAmount = betAmount * 2; // Winning doubles the bet amount
            usersData[userId].berries += winAmount;
            usersData[userId].winStreak += 1; // Increase win streak
            resultMessage = `You won! The coin landed on **${coinResult === 'h' ? 'Heads' : 'Tails'}**. You win **${winAmount} Berries**!`;
        } else {
            usersData[userId].berries -= betAmount;
            usersData[userId].winStreak = 0; // Reset win streak after loss
            resultMessage = `You lost! The coin landed on **${coinResult === 'h' ? 'Heads' : 'Tails'}**. You lose **${betAmount} Berries**.`;
        }

        // Send the outcome message to the user
        await message.reply(resultMessage);

        // Save updated user data with error handling
        try {
            fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
        } catch (err) {
            console.error('Error saving user data:', err);
            message.reply('There was an error saving your data. Please try again later.');
        }
    },
};
