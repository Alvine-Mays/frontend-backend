import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as messageAPI from '../lib/api';
import toast from 'react-hot-toast';

const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch inbox (list of conversations)
  const fetchInbox = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await messageAPI.get('/messages/inbox');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching inbox:', error);
      toast.error('Erreur lors du chargement de la boîte de réception');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages with a specific user
  const fetchMessagesWithUser = async (userId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await messageAPI.get(`/messages/${userId}`);
      setMessages(response.data.messages || []);
      setCurrentConversation(userId);
      
      // Mark thread as read
      await markThreadAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message to user
  const sendMessage = async (receiverId, content) => {
    if (!user) return { success: false };
    
    try {
      const response = await messageAPI.post(`/messages/${receiverId}`, {
        contenu: content
      });
      
      // Add the new message to current conversation
      if (currentConversation === receiverId) {
        setMessages(prev => [...prev, response.data.message]);
      }
      
      // Refresh inbox to update conversation list
      fetchInbox();
      
      toast.success('Message envoyé avec succès');
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi du message");
      return { success: false, error: error.response?.data?.message || 'Erreur inconnue' };
    }
  };

  // Contact Ophrus administration
  const contactOphrus = async (subject, content) => {
    if (!user) return { success: false };
    
    try {
      const response = await messageAPI.post('/messages/ophrus', {
        sujet: subject,
        contenu: content
      });
      
      toast.success("Message envoyé à l'administration");
      
      // Refresh inbox
      fetchInbox();
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error contacting Ophrus:', error);
      toast.error("Erreur lors de l'envoi du message à l'administration");
      return { success: false, error: error.response?.data?.message || 'Erreur inconnue' };
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await messageAPI.get('/messages/unread');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await messageAPI.patch(`/messages/${messageId}/read`);
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, lu: true } : msg
        )
      );
      
      // Update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark thread as read
  const markThreadAsRead = async (userId) => {
    try {
      await messageAPI.patch(`/messages/thread/${userId}/read`);
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => ({ ...msg, lu: true }))
      );
      
      // Update conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.otherUser._id === userId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      // Update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  // Clear current conversation
  const clearCurrentConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      fetchInbox();
      fetchUnreadCount();
    } else {
      setConversations([]);
      setMessages([]);
      setCurrentConversation(null);
      setUnreadCount(0);
    }
  }, [user]);

  const value = {
    messages,
    conversations,
    currentConversation,
    unreadCount,
    loading,
    fetchInbox,
    fetchMessagesWithUser,
    sendMessage,
    contactOphrus,
    fetchUnreadCount,
    markMessageAsRead,
    markThreadAsRead,
    clearCurrentConversation,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;

