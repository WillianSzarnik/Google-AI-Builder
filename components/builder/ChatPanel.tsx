
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';

const ChatPanel: React.FC = () => {
  const { chatHistory, refineCode } = useAppContext();
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (message.trim()) {
      refineCode(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  }

  return (
    <div className="w-1/4 max-w-sm flex flex-col h-full bg-gray-800">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700'
                } ${msg.role === 'system' ? 'text-center w-full bg-transparent text-gray-400 text-xs italic' : ''}`}
              >
                <p className="text-sm break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Refine the code..."
            rows={2}
            className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Button onClick={handleSendMessage} className="self-end">Send</Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
