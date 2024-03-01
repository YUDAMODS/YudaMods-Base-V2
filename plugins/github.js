const axios = require('axios');
const FormData = require('form-data');

const githubUploadPlugin = (twilioClient) => {
    twilioClient.on('message', async (message) => {
        try {
            // Assuming the incoming message format: "upload repoName githubToken filePath"
            const [command, repoName, githubToken, filePath] = message.body.split(' ');

            if (command.toLowerCase() === 'upload' && repoName && githubToken && filePath) {
                // Prepare the GitHub API URL
                const apiUrl = `https://api.github.com/user/repos`;
                
                // Create a new repository on GitHub
                const repoResponse = await axios.post(apiUrl, { name: repoName }, {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const repoData = repoResponse.data;

                // Upload file to the repository
                const formData = new FormData();
                formData.append('file', filePath);

                await axios.post(`${repoData.contents_url}/${filePath}`, formData, {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        ...formData.getHeaders(),
                    },
                });

                const replyText = `Repository '${repoName}' successfully created on GitHub with file '${filePath}'.`;
                
                // Send the reply using Twilio API
                await twilioClient.messages.create({
                    body: replyText,
                    from: 'your_twilio_whatsapp_number',
                    to: message.from,
                });
            } else {
                throw new Error('Invalid command or missing parameters.');
            }
        } catch (error) {
            console.error(error);
            
            // Handle errors and send an error message back
            await twilioClient.messages.create({
                body: 'An error occurred. Please check your command and try again.',
                from: 'your_twilio_whatsapp_number',
                to: message.from,
            });
        }
    });
};

module.exports = githubUploadPlugin;
