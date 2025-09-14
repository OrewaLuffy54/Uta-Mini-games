// /events/messageCreate.js

module.exports = (client) => {
    client.on('messageCreate', (message) => {
        // Your event handling logic here
        if (message.author.bot) return; // Ignore bot messages
        console.log('New message:', message.content);

        // Example: Respond to a simple command
        if (message.content === '!ping') {
            message.channel.send('Pong!');
        }
    });
};
