// src/events/messageCreate.js

module.exports = (client) => {
    // Event listener for 'messageCreate'
    client.on('messageCreate', (message) => {
        // Ignore messages from the bot itself
        if (message.author.bot) return;

        console.log('New message received:', message.content);

        // Example of a command trigger
        if (message.content.startsWith('!hello')) {
            message.channel.send('Hello, world!');
        }

        // You can add more custom logic here
    });
};
