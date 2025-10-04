document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Store the chat history in an array
    const chatHistory = [];

    /**
     * Appends a message to the chat box.
     * @param {string} sender - 'user' or 'bot'.
     * @param {string} message - The message content.
     * @returns {HTMLElement} The created message element.
     */
    function addMessageToChatbox(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        // Sanitize message to prevent HTML injection
        const messageText = document.createElement('p');
        messageText.textContent = message;
        messageElement.appendChild(messageText);

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
        return messageElement;
    }

    /**
     * Handles the form submission to send a message to the bot.
     * @param {Event} event - The form submission event.
     */
    async function handleChatSubmit(event) {
        event.preventDefault();
        const userMessage = userInput.value.trim();

        if (!userMessage) {
            return;
        }

        // Add user message to UI and history
        addMessageToChatbox('user', userMessage);
        chatHistory.push({ role: 'user', content: userMessage });

        // Clear the input
        userInput.value = '';

        // Show a "Thinking..." message
        const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send the entire history as 'message'
                body: JSON.stringify({ message: chatHistory }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.result) {
                // Update the "Thinking..." message with the actual response
                thinkingMessageElement.querySelector('p').textContent = data.result;
                // Add the bot's response to the history
                chatHistory.push({ role: 'model', content: data.result });
            } else {
                thinkingMessageElement.querySelector('p').textContent = 'Sorry, no response received.';
            }
        } catch (error) {
            console.error('Failed to get response:', error);
            thinkingMessageElement.querySelector('p').textContent = 'Failed to get response from server.';
        }
    }

    chatForm.addEventListener('submit', handleChatSubmit);
});

// You can add some basic CSS for styling
/*
<style>
    #chat-box {
        border: 1px solid #ccc;
        height: 300px;
        overflow-y: scroll;
        padding: 10px;
        margin-bottom: 10px;
    }
    .message {
        margin-bottom: 10px;
    }
    .user-message {
        text-align: right;
    }
    .bot-message {
        text-align: left;
    }
</style>
*/