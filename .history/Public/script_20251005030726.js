document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const sendButton = chatForm.querySelector('button[type="submit"]');
  const chatFooter = document.querySelector('.chat-footer');

  // Riwayat percakapan akan disimpan di sini
  const chatHistory = [];

  // --- Fungsi Bantuan untuk UI ---
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

  // --- Fitur Baru: Saran Pertanyaan Dinamis ---
  const suggestionsBar = document.createElement('div');
  suggestionsBar.id = 'suggestions-bar';
  suggestionsBar.classList.add('suggestions-bar');
  // Menyisipkan bar saran sebelum form input, tanpa mengubah index.html
  chatFooter.insertBefore(suggestionsBar, chatForm);

  async function fetchAndDisplaySuggestions() {
    try {
      const response = await fetch('/generate-suggestions', { method: 'POST' });
      if (!response.ok) return;
      const data = await response.json();

      if (data.suggestions) {
        suggestionsBar.innerHTML = '';
        data.suggestions.forEach(suggestionText => {
          const button = document.createElement('button');
          button.classList.add('suggestion-button');
          button.textContent = `✨ ${suggestionText}`;
          button.onclick = () => {
            messageInput.value = suggestionText;
            chatForm.requestSubmit();
          };
          suggestionsBar.appendChild(button);
        });
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      suggestionsBar.innerHTML = '';
    }
  }

  // --- Logika Utama Pengiriman Chat ---
  async function handleChatSubmit(event) {
    event.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    messageInput.disabled = true;
    sendButton.disabled = true;
    suggestionsBar.innerHTML = '';

    // Tambahkan pesan pengguna ke riwayat dan UI
    addMessageToChatbox('user', userMessage);
    chatHistory.push({ role: 'user', content: userMessage });
    messageInput.value = '';

    const thinkingMessageElement = addMessageToChatbox('bot', 'Thinking...');

    try {
      // KIRIM SELURUH RIWAYAT ke backend, sesuai yang diharapkan index.js
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [...chatHistory] }), // Kirim salinan riwayat
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.data) {
        thinkingMessageElement.querySelector('.message-content').textContent = data.data;
        // Tambahkan balasan AI ke riwayat
        chatHistory.push({ role: 'model', content: data.data });
      } else {
        throw new Error('Response from server was empty.');
      }
    } catch (error) {
      console.error('Frontend Error:', error);
      thinkingMessageElement.querySelector('.message-content').textContent = `Error: ${error.message}`;
    } finally {
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
      // Hanya tampilkan saran di awal percakapan agar tidak mengganggu
      if (chatHistory.length < 5) {
        fetchAndDisplaySuggestions();
      }
    }
  }

  chatForm.addEventListener('submit', handleChatSubmit);

  // Ambil saran saat halaman pertama kali dimuat
  fetchAndDisplaySuggestions();
});

