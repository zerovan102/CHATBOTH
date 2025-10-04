document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = chatForm.querySelector('button[type="submit"]');

    // Store the chat history locally for display purposes.
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

        const messageText = document.createElement('p');
        messageText.textContent = message; // Safely sets text content
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
        const userMessage = messageInput.value.trim();

        if (!userMessage) {
            return;
        }

        // Disable form to prevent multiple submissions
        messageInput.disabled = true;
        sendButton.disabled = true;

        // Add user message to UI and history
        addMessageToChatbox('user', userMessage);
        chatHistory.push({ role: 'user', content: userMessage });
        messageInput.value = '';

        // Show a "Thinking..." message
        const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // FIXED: Send only the last user message as a simple string,
                // which matches what the backend expects.
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                // Try to parse error from backend, or use status text.
                const errorText = await response.text();
                throw new Error(errorText || `Server error: ${response.status}`);
            }

            const data = await response.json();

            // Your backend sends the result in the 'data' property.
            const botReply = data.data;

            if (botReply) {
                // Update "Thinking..." with the actual response
                thinkingMessageElement.querySelector('p').textContent = botReply;
                // Add the bot's response to the local history
                chatHistory.push({ role: 'model', content: botReply });
            } else {
                throw new Error('Sorry, an empty response was received.');
            }
        } catch (error) {
            console.error('Failed to get response:', error);
            thinkingMessageElement.querySelector('p').textContent = error.message || 'Failed to get response from server.';
        } finally {
            // Re-enable form controls
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }

    chatForm.addEventListener('submit', handleChatSubmit);
});
// npm install --save-dev jest