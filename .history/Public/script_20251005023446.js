document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const sendButton = form.querySelector('button');

  // This array will store the conversation history
  const chatHistory = [];

  /**
   * Appends a new message to the chat box UI.
   * @param {string} sender - 'user' or 'bot'.
   * @param {string} text - The message content.
   * @returns {HTMLElement} The created message element.
   */
  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', `${sender}-message`);

    const msgContent = document.createElement('div');
    msgContent.classList.add('message-content');
    msgContent.textContent = text;

    msg.appendChild(msgContent);
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
  }

  /**
   * Handles the form submission, sends data to the backend, and updates the UI.
   * @param {Event} e - The form submission event.
   */
  async function handleChatSubmit(e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Disable form to prevent multiple submissions
    input.disabled = true;
    sendButton.disabled = true;

    // Add user message to UI and history
    appendMessage('user', userMessage);
    chatHistory.push({ role: 'user', content: userMessage });
    input.value = '';

    // Add a temporary "thinking" message
    const thinkingMessage = appendMessage('bot', 'Thinking...');

    try {
      // Send the entire history to the backend
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'An error occurred on the server.');
      }

      const result = await response.json();

      // Parse Markdown ke HTML dan bersihkan untuk keamanan
      // lalu update pesan "Thinking..." dengan respons yang sebenarnya
      const sanitizedHtml = DOMPurify.sanitize(marked.parse(result.data));
      thinkingMessage.querySelector('.message-content').innerHTML = sanitizedHtml;

      // Add the bot's response to our history for context in the next message
      // Kita simpan versi mentah (unparsed) ke dalam history
      chatHistory.push({ role: 'model', content: result.data });

    } catch (error) {
      console.error('Error fetching chat response:', error);
      thinkingMessage.querySelector('.message-content').textContent = `Error: ${error.message}`;
    } finally {
      // Re-enable the form
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', handleChatSubmit);
});
