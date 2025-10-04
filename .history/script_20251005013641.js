document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = chatForm.querySelector('button[type="submit"]');

    // Chat history (opsional untuk versi sederhana ini, tapi bagus untuk masa depan)
    const chatHistory = [];

    function addMessageToChatbox(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;

        messageElement.appendChild(messageContent);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }

    async function handleChatSubmit(event) {
        event.preventDefault();
        const userMessage = messageInput.value.trim();

        if (!userMessage) return;

        messageInput.disabled = true;
        sendButton.disabled = true;

        addMessageToChatbox('user', userMessage);
        messageInput.value = '';

        const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Backend Anda mengharapkan objek { message: "..." }
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            // MEMBACA PROPERTI YANG BENAR: data.data
            if (data.data) {
                thinkingMessageElement.querySelector('.message-content').textContent = data.data;
            } else {
                throw new Error(data.message || 'Sorry, an empty response was received.');
            }
        } catch (error) {
            console.error('Failed to get response:', error);
            thinkingMessageElement.querySelector('.message-content').textContent = 'Failed to get response from server. Please check the console.';
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }

    chatForm.addEventListener('submit', handleChatSubmit);
});

