import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; // Підключаємо стилі

const socket = io('http://localhost:4000'); // Підключення до серверу

const App = () => {
  const [messages, setMessages] = useState([]); // Зберігання повідомлень
  const [inputMessage, setInputMessage] = useState(''); // Поточне повідомлення
  const [username, setUsername] = useState(''); // Ім'я користувача
  const [isRegistered, setIsRegistered] = useState(false); // Перевірка реєстрації
  const [recipient, setRecipient] = useState('Chat Partner'); // Ім'я партнера по чату

  useEffect(() => {
    // Отримання старих повідомлень при підключенні
    socket.on('load_messages', (loadedMessages) => {
      setMessages(loadedMessages);
    });

    // Отримання нових повідомлень від сервера
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Оновлення повідомлення при лайку
    socket.on('update_message', ({ index, liked }) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[index].liked = liked;
        return updatedMessages;
      });
    });

    // Очищення чату
    socket.on('chat_cleared', () => {
      setMessages([]); // Очищуємо чат на клієнті
    });

    return () => {
      socket.off('load_messages');
      socket.off('receive_message');
      socket.off('update_message');
      socket.off('chat_cleared');
    };
  }, []);

  // Відправлення повідомлення
  const handleSendMessage = () => {
    if (inputMessage.trim() !== '' && username.trim() !== '') {
      const newMessage = { sender: username, text: inputMessage, liked: false };
      socket.emit('new_message', newMessage); // Відправляємо на сервер
      setInputMessage(''); // Очищаємо поле введення
    }
  };

  // Встановлення імені користувача
  const handleRegister = () => {
    if (username.trim() !== '') {
      setIsRegistered(true);
    }
  };

  // Лайк повідомлення при подвійному кліку
  const handleLikeMessage = (index) => {
    socket.emit('like_message', index); // Відправляємо на сервер запит на лайк повідомлення
  };

  // Очищення чату
  const handleClearChat = () => {
    socket.emit('clear_chat'); // Відправляємо запит на очищення чату
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1 className="recipient-name">{recipient}</h1>
        <button className="clear-button" onClick={handleClearChat}>
          Clear Chat
        </button>
      </div>
      {!isRegistered ? (
        <div className="register-container">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
          <button onClick={handleRegister} className="button">
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    message.sender === username ? 'self' : 'other'
                  }`}
                  onDoubleClick={() => handleLikeMessage(index)}
                >
                  <div className="message-text">
                    {message.text}
                    {message.liked && <span className="liked">❤️</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="input"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="button">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
