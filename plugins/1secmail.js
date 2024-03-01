const axios = require('axios');

const generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
};

const oneSecMailPlugin = (twilioClient) => {
    twilioClient.on('message', async (message) => {
        try {
            const apiUrl = 'https://www.1secmail.com/api/v1/';
            const randomString = generateRandomString(10);

            const response = await axios.get(apiUrl + randomString);
            const data = response.data;

            if (data) {
                const emailAddress = `${randomString}@1secmail.org`;
                const replyText = `Here is your temporary email address:\n\n*${emailAddress}*`;

                // Send the reply using Twilio API
                await twilioClient.messages.create({
                    body: replyText,
                    from: 'your_twilio_whatsapp_number',
                    to: message.from,
                });
            } else {
                throw new Error('Invalid response from 1secmail API.');
            }
        } catch (error) {
            console.error(error);
            // Handle errors and send an error message back
            await twilioClient.messages.create({
                body: 'An error occurred. Please try again later.',
                from: 'your_twilio_whatsapp_number',
                to: message.from,
            });
        }
    });
};

module.exports = oneSecMailPlugin;
