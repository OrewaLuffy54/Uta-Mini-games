const fs = require('fs');
const path = require('path');

// File path to users.json (ensure the path is correct based on your folder structure)
const usersFilePath = path.join(__dirname, '../../data', 'users.json');

// Function to generate random berries amount with 7% chance for >2000
function generateRandomBerries() {
    const randomChance = Math.random(); // Random number between 0 and 1

    // 7% chance of getting more than 2000 berries
    if (randomChance <= 0.07) {
        // Random number between 2001 and 5000
        return Math.floor(Math.random() * 3000) + 2001;
    } else {
        // 93% chance of getting between 1 and 2000 berries
        return Math.floor(Math.random() * 2000) + 1;
    }
}

module.exports = {
    name: 'daily',
    description: 'Claim your daily Berries.',
    async execute(message) {
        const userId = message.author.id;

        // Load user data with error handling
        let usersData;
        try {
            // Check if the file exists
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
            usersData[userId] = {
                berries: 0,
                lastClaimTime: 0,
            };
        }

        const now = Date.now();
        const lastClaimTime = usersData[userId].lastClaimTime;
        
        // 24 hours in milliseconds
        const oneDay = 24 * 60 * 60 * 1000;

        // Check if the user has already claimed today
        if (now - lastClaimTime < oneDay) {
            const timeRemaining = oneDay - (now - lastClaimTime);
            const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            return message.reply(`You have already claimed your daily Berries. Please try again in ${hoursRemaining} hours and ${minutesRemaining} minutes.`);
        }

        // Grant the daily berries
        const dailyBerries = generateRandomBerries();
        usersData[userId].berries += dailyBerries;
        usersData[userId].lastClaimTime = now;

        // Save updated user data with error handling
        try {
            fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
        } catch (err) {
            console.error('Error saving user data:', err);
            return message.reply('There was an error saving your data. Please try again later.');
        }

        // Inform the user they have claimed their daily berries
        message.reply(`You have claimed **${dailyBerries} Berries** for today!`);
    },
};
