const fs = require('fs');
const path = require('path');

// File path to users.json (ensure the path is correct based on your folder structure)
const usersFilePath = path.join(__dirname, '../../data', 'users.json');

module.exports = {
    name: 'rolldice',
    description: 'Bet on Odd or Even for the dice roll!',
    async execute(message, args) {
        const userId = message.author.id;

        // Load user data with error handling
        let usersData;
        try {
            if (!fs.existsSync(usersFilePath)) {
                fs.writeFileSync(usersFilePath, JSON.stringify({}, null, 2));
            }
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (err) {
            console.error('Error loading user data:', err);
            message.reply('There was an error with the data file. Please try again later.');
            return;
        }

        // Check if user exists, if not, create a new entry for the user
        if (!usersData[userId]) {
            usersData[userId] = { berries: 0, winStreak: 0 };
        }

        // Check if arguments are provided
        if (!args[0] || !args[1]) {
            message.reply('Please specify both your bet choice (odd/even) and the amount to bet.');
            return;
        }

        const betChoice = args[0].toLowerCase();  // 'odd' or 'even'
        let betAmount = args[1].toLowerCase(); // Amount to bet

        if (betAmount === 'all') {
            betAmount = usersData[userId].berries;
            if (betAmount > 250000) betAmount = 250000;
        } else {
            betAmount = parseInt(betAmount);
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            message.reply('Please enter a valid bet amount.');
            return;
        }

        const maxBet = 250000;
        if (betAmount > maxBet && betAmount !== usersData[userId].berries) {
            message.reply(`The maximum bet is **${maxBet} Berries**. Or you can bet "all" to wager all your berries.`);
            return;
        }

        if (usersData[userId].berries < betAmount) {
            message.reply("You don't have enough Berries to bet!");
            return;
        }

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const isOdd = diceRoll % 2 !== 0;
        const isEven = diceRoll % 2 === 0;

        let resultMessage;
        let isWin = false;
        const winChance = Math.random(); // Random value between 0 and 1

        // Apply win streak logic (after 4 wins, the win rate will drop to 40%)
        if (usersData[userId].winStreak >= 4) {
            isWin = winChance < 0.4;
        } else {
            isWin = (betChoice === 'odd' && isOdd) || (betChoice === 'even' && isEven);
        }

        if (betAmount > 150000) {
            if (winChance > 0.3) {
                isWin = false;  // Force a loss for 70% chance
            }
        }

        if (isWin) {
            const winAmount = betAmount * 2;
            usersData[userId].berries += winAmount;
            usersData[userId].winStreak += 1;
            resultMessage = `You won! The dice rolled a **${diceRoll}**. It's **${betChoice}**. You win **${winAmount} Berries**!`;
        } else {
            usersData[userId].berries -= betAmount;
            usersData[userId].winStreak = 0; // Reset win streak after loss
            resultMessage = `You lost! The dice rolled a **${diceRoll}**. It's **${isOdd ? 'odd' : 'even'}**. You lose **${betAmount} Berries**.`;
        }

        await message.reply(resultMessage);

        try {
            fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
        } catch (err) {
            console.error('Error saving user data:', err);
            message.reply('There was an error saving your data. Please try again later.');
        }
    },
};
