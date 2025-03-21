import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import ReactMarkdown from 'react-markdown';
import { ArrowUpIcon, XMarkIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const CoachAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      sender: 'ai',
      text: "Hello! I'm your AI Fitness Coach. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is shown
  useEffect(() => {
    if (!showWelcome) {
      inputRef.current?.focus();
    }
  }, [showWelcome]);

  // Load chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/coach/history');
        
        if (response.data.chatHistory && response.data.chatHistory.length > 0) {
          const formattedHistory = response.data.chatHistory
            .map((chat: any) => [
              {
                id: chat._id + '-user',
                sender: 'user',
                text: chat.userMessage,
                timestamp: new Date(chat.createdAt)
              },
              {
                id: chat._id + '-ai',
                sender: 'ai',
                text: chat.aiResponse,
                timestamp: new Date(chat.createdAt)
              }
            ])
            .flat()
            .sort((a: Message, b: Message) => a.timestamp.getTime() - b.timestamp.getTime());
          
          setMessages([messages[0], ...formattedHistory]);
        }
      } catch (err: any) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Show loading indicator
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/coach/chat', { message: userMessage });
      
      // Add AI response to chat
      const newAIMessage: Message = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: response.data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete('/coach/history');
      setMessages([messages[0]]);
    } catch (err: any) {
      console.error('Error clearing chat history:', err);
      setError('Failed to clear chat history. Please try again.');
    }
  };

  // Format timestamp to readable time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showWelcome) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg rounded-xl p-8 flex flex-col items-center justify-center h-full text-white">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">AI Fitness Coach</h2>
        <p className="text-indigo-100 mb-8 text-center max-w-md">
          Your personal AI fitness assistant is ready to help you with workout plans, nutrition advice, and fitness tips.
        </p>
        <button
          onClick={() => setShowWelcome(false)}
          className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-full shadow-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
        >
          Start Chatting
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold mr-3 shadow-md">
            AI
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Fitness Coach</h2>
            <p className="text-xs text-indigo-200">
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="text-indigo-200 hover:text-white transition-colors p-2 rounded-full hover:bg-indigo-500"
          title="Clear conversation"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-grow p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")' }}
      >
        <div className="space-y-4 px-2">
          {messages.map((message, index) => {
            const showTimestamp = index === 0 || 
              messages[index-1].timestamp.getTime() < message.timestamp.getTime() - 5 * 60 * 1000;
            
            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                      {message.timestamp.toLocaleDateString()} {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div 
                  className={`flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                        AI
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className={`py-2 px-4 rounded-2xl max-w-[85%] shadow-sm ${
                      message.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    {message.sender === 'ai' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                    <span className={`text-xs block text-right mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold shadow-sm">
                        You
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  AI
                </div>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none py-3 px-4 shadow-sm border border-gray-200">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                  <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-sm mx-auto max-w-md" role="alert">
              <div className="flex">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 border-0 focus:ring-2 focus:ring-indigo-500 rounded-full py-3 px-4 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 focus:bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            disabled={isLoading || !inputMessage.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
        
        <div className="mt-3 px-2">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Workout for upper body?",
              "Nutrition tips?",
              "Improve endurance?",
              "Best exercises for beginners?",
              "Recovery advice?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(question);
                  inputRef.current?.focus();
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachAI;
