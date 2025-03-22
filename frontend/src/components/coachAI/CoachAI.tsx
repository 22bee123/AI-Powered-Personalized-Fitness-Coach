import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import ReactMarkdown from 'react-markdown';
import { 
  PaperAirplaneIcon, 
  TrashIcon, 
  XMarkIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/solid';
import { 
  FireIcon, 
  HeartIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

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
      text: "Hey there! 💪 I'm your AI Fitness Coach. How can I help with your fitness journey today?",
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

  const quickQuestions = [
    { text: "Daily workout plan", icon: <BoltIcon className="h-4 w-4 mr-1" /> },
    { text: "Nutrition advice", icon: <HeartIcon className="h-4 w-4 mr-1" /> },
    { text: "Cardio tips", icon: <FireIcon className="h-4 w-4 mr-1" /> },
    { text: "Recovery help", icon: <SparklesIcon className="h-4 w-4 mr-1" /> }
  ];

  if (showWelcome) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center h-full text-white">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-lg border border-white/30">
          <FireIcon className="h-14 w-14 text-white" />
        </div>
        <h2 className="text-4xl font-bold mb-4 tracking-tight">FitCoach AI</h2>
        <p className="text-emerald-50 mb-8 text-center max-w-md text-lg">
          Your 24/7 fitness companion ready to transform your workout journey with personalized advice.
        </p>
        <button
          onClick={() => setShowWelcome(false)}
          className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 text-lg"
        >
          Start Your Fitness Journey
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 shadow-xl rounded-2xl flex flex-col h-full overflow-hidden border border-gray-100">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold mr-3 shadow-md border border-white/30">
            <FireIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">FitCoach AI</h2>
            <div className="flex items-center">
              <span className="h-2 w-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
              <p className="text-xs text-emerald-50">
                {isLoading ? 'Analyzing your fitness needs...' : 'Ready to coach'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleClearChat}
            className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            title="Clear conversation"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-grow p-4 overflow-y-auto bg-gray-50"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239EE6B4" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")' }}
      >
        <div className="space-y-4 px-2">
          {messages.map((message, index) => {
            const showTimestamp = index === 0 || 
              messages[index-1].timestamp.getTime() < message.timestamp.getTime() - 5 * 60 * 1000;
            
            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-gray-200/70 backdrop-blur-sm text-gray-500 px-3 py-1 rounded-full">
                      {message.timestamp.toLocaleDateString()} {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div 
                  className={`flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                        <FireIcon className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className={`py-3 px-5 rounded-2xl max-w-[85%] shadow-sm ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    {message.sender === 'ai' ? (
                      <div className="prose prose-sm max-w-none prose-headings:text-emerald-600 prose-a:text-blue-600 prose-strong:text-emerald-700">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                    <span className={`text-xs block text-right mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold shadow-sm">
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
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <FireIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none py-4 px-5 shadow-sm border border-gray-100">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl shadow-sm mx-auto max-w-md" role="alert">
              <div className="flex">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="block sm:inline">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-xs flex items-center text-red-500 hover:text-red-600"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" /> Try again
              </button>
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
            placeholder="Ask your fitness coach..."
            className="flex-1 bg-gray-100 border-0 focus:ring-2 focus:ring-emerald-500 rounded-full py-3 px-5 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 focus:bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-200 ${!inputMessage.trim() ? 'opacity-70' : 'hover:scale-105'}`}
            disabled={isLoading || !inputMessage.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
        
        <div className="mt-4 px-1">
          <p className="text-xs text-gray-500 mb-2 font-medium">Quick fitness questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(question.text);
                  inputRef.current?.focus();
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors flex items-center"
              >
                {question.icon}
                {question.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachAI;