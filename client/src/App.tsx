import React, { useState } from 'react';
import './App.css';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  avatar: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

interface User {
  id: string;
  username: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatar: string;
}

const App: React.FC = () => {
  const [currentChannel, setCurrentChannel] = useState('general');
  const [messageInput, setMessageInput] = useState('');

  // Sample data - replace with your real data
  const channels: Channel[] = [
    { id: 'general', name: 'general', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
    { id: 'dev-chat', name: 'dev-chat', type: 'text' },
    { id: 'voice-general', name: 'General', type: 'voice' },
  ];

  const messages: Message[] = [
    {
      id: '1',
      author: 'Iron3456',
      content: 'Hey everyone!',
      timestamp: new Date(),
      avatar: 'I'
    },
    {
      id: '2',
      author: 'CodeMaster',
      content: 'How\'s the project going?',
      timestamp: new Date(),
      avatar: 'C'
    },
    {
      id: '3',
      author: 'SkyCoder',
      content: 'Just pushed some new changes to the repo',
      timestamp: new Date(),
      avatar: 'S'
    }
  ];

  const users: User[] = [
    { id: '1', username: 'Iron3456', status: 'online', avatar: 'I' },
    { id: '2', username: 'CodeMaster', status: 'offline', avatar: 'C' },
    { id: '3', username: 'SkyCoder', status: 'online', avatar: 'S' },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add your message sending logic here
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      {/* Server Sidebar */}
      <div className="servers-sidebar">
        <div className="server-icon active">DC</div>
        <div className="server-icon">+</div>
      </div>

      {/* Channels Sidebar */}
      <div className="channels-sidebar">
        <div className="server-header">
          <span>DevChat</span>
          <span>▼</span>
        </div>
        
        <div className="channels-list">
          <div className="channel-category">
            <div className="category-header">
              <span>▼</span>
              <span>Direct Messages</span>
            </div>
            <ul className="channel-list">
              <li className="channel-item">
                <span className="channel-icon">@</span>
                <span className="channel-name">Iron3456</span>
              </li>
              <li className="channel-item">
                <span className="channel-icon">@</span>
                <span className="channel-name">CodeMaster</span>
              </li>
              <li className="channel-item">
                <span className="channel-icon">@</span>
                <span className="channel-name">SkyCoder</span>
              </li>
            </ul>
          </div>

          <div className="channel-category">
            <div className="category-header">
              <span>▼</span>
              <span>Voice Channels</span>
            </div>
            <ul className="channel-list">
              <li className="channel-item">
                <span className="channel-icon">🔊</span>
                <span className="channel-name">General</span>
              </li>
            </ul>
          </div>

          <div className="channel-category">
            <div className="category-header">
              <span>▼</span>
              <span>Communities</span>
            </div>
          </div>

          <div className="channel-category">
            <div className="category-header">
              <span>▼</span>
              <span>Teams</span>
            </div>
          </div>
        </div>

        <div className="user-area">
          <div className="user-avatar">I</div>
          <div className="user-info">
            <div className="username">Iron3456</div>
            <div className="user-status">Online</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="chat-header">
          <div className="channel-info">
            <span className="channel-icon">@</span>
            <span className="chat-channel-name">SkyCoder</span>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className="message">
              <div className="message-avatar">{message.avatar}</div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{message.author}</span>
                  <span className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="message-input-container">
          <div className="message-input-wrapper">
            <textarea
              className="message-input"
              placeholder="Message @SkyCoder"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;