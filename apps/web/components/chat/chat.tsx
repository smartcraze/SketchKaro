"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Users } from 'lucide-react';
import { HTTP_BACKEND } from '@/Config';

interface ChatMessage {
  id: string;
  message: string;
  from: string;
  name: string;
  timestamp: Date;
  roomId: string;
}

interface ChatProps {
  socket: WebSocket | null;
  roomId: string;
  isOpen: boolean;
  onToggle: () => void;
}

function Chat({ socket, roomId, isOpen, onToggle }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setUnreadCount(0); // Reset unread count when chat is opened
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser(payload.userId);
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    }
  }, []);

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!roomId) return;
      
      try {
        setIsLoading(true);
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          console.error('No token found for chat history');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${HTTP_BACKEND}/room/${roomId}/chat`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const chatHistory = await response.json();
          const formattedHistory = chatHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(formattedHistory);
        } else {
          console.error('Failed to load chat history:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [roomId]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message' && data.roomId === roomId) {
          const newMsg: ChatMessage = {
            id: `${data.from}-${Date.now()}`,
            message: data.message,
            from: data.from,
            name: data.name || 'Unknown User',
            timestamp: new Date(),
            roomId: data.roomId,
          };
          
          setMessages(prev => [...prev, newMsg]);
          
          // Increment unread count if chat is closed and message is not from current user
          if (!isOpen && data.from !== currentUser) {
            setUnreadCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, roomId, isOpen, currentUser]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !roomId) return;

    const messageData = {
      type: 'chat_message',
      roomId: roomId,
      message: newMessage.trim(),
    };

    socket.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Prevent event from bubbling up to canvas shortcuts
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    // Prevent all key events from bubbling up to prevent canvas shortcuts
    e.stopPropagation();
  };

  const handleInputFocus = (e: React.FocusEvent) => {
    // Ensure the input stays focused and doesn't lose focus to canvas
    e.stopPropagation();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userId: string) => {
    // Generate a consistent color based on userId
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Open Chat"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span className="font-medium">Room Chat</span>
          <span className="text-blue-200 text-sm">({messages.length})</span>
        </div>
        <button
          onClick={onToggle}
          className="hover:bg-blue-700 p-1 rounded transition-colors"
          title="Close Chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p>No messages yet.</p>
            <p>Be the first to say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.from === currentUser;
            const showAvatar = index === 0 || messages[index - 1].from !== msg.from;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
              >
                <div className={`flex max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {showAvatar && !isOwnMessage && (
                    <div className={`w-8 h-8 rounded-full ${getUserColor(msg.from)} flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0`}>
                      {getInitials(msg.name)}
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className={`${isOwnMessage ? 'mr-2' : showAvatar ? '' : 'ml-10'}`}>
                    {/* Name and time */}
                    {showAvatar && (
                      <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {isOwnMessage ? 'You' : msg.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div
                      className={`px-3 py-2 rounded-lg text-sm break-words ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            maxLength={500}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Press Enter to send • {500 - newMessage.length} characters left
        </div>
      </div>
    </div>
  );
}

export default Chat;

