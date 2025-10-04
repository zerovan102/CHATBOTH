document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const sendButton = chatForm.querySelector('button[type="submit"]');
  const suggestionsBar = document.getElementById('suggestions-bar');

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

  async function fetchAndDisplaySuggestions() {
    try {
      const response = await fetch('/generate-suggestions', { method: 'POST' });
      if (!response.ok) return;
      const data = await response.json();
      if (data.suggestions) {
        suggestionsBar.innerHTML = '';
        data.suggestions.forEach(text => {
          const button = document.createElement('button');
          button.classList.add('suggestion-button');
          button.textContent = `✨ ${text}`;
          button.onclick = () => {
            messageInput.value = text;
            chatForm.requestSubmit();
          };
          suggestionsBar.appendChild(button);
        });
      }
    } catch (error) {
      console.error('Gagal mengambil saran:', error);
    }
  }

  async function handleChatSubmit(event) {
    event.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    messageInput.disabled = true;
    sendButton.disabled = true;
    suggestionsBar.innerHTML = '';

    addMessageToChatbox('user', userMessage);
    chatHistory.push({ role: 'user', content: userMessage });
    messageInput.value = '';

    const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [...chatHistory] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.data) {
        thinkingMessageElement.querySelector('.message-content').textContent = data.data;
        chatHistory.push({ role: 'model', content: data.data });
      } else {
        throw new Error('Respons dari server kosong.');
      }
    } catch (error) {
      console.error('Error di Frontend:', error);
      thinkingMessageElement.querySelector('.message-content').textContent = `Error: ${error.message}`;
    } finally {
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
      if (chatHistory.length < 5) {
        fetchAndDisplaySuggestions();
      }
    }
  }

  chatForm.addEventListener('submit', handleChatSubmit);
  fetchAndDisplaySuggestions();
});