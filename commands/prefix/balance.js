const fs = require('fs');
const path = require('path');

// File path to users.json (ensure the path is correct based on your folder structure)
const usersFilePath = path.join(__dirname, '../../data', 'users.json');

module.exports = {
    name: 'balance',
    description: 'Check your Berries balance.',
    async execute(message) {
        const userId = message.author.id;

        // Load user data with error handling
        let usersData;
        try {
            // Check if the file exists
            if (!fs.existsSync(usersFilePath)) {
                // If not, create it with an empty object
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

        // Send user's balance
        message.reply(`You have **${usersData[userId].berries} Berries**.`);
    },
};
