import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../lib/api';
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
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxTotalPages, setInboxTotalPages] = useState(1);
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);
  const socketRef = React.useRef(null);

  // Fetch inbox (list of conversations)
  const fetchInbox = async (page = 1, { silent = false } = {}) => {
    if (!user) return;
    
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/messages/inbox', { params: { page, limit: 10 } });
      const threads = response.data?.threads || [];
      const normalized = threads.map(t => ({
        otherUser: t.correspondant,
        lastMessage: t.dernierMessage,
        unreadCount: t.nonLus || 0,
      }));
      setConversations(page === 1 ? normalized : [...conversations, ...normalized]);
      setInboxPage(response.data?.page || page);
      setInboxTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching inbox:', error);
      toast.error('Erreur lors du chargement de la boîte de réception');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch messages with a specific user
  const fetchMessagesWithUser = async (userId, page = 1, { silent = false } = {}) => {
    if (!user) return;
    
    try {
      if (!silent) setLoading(true);
      const response = await api.get(`/messages/${userId}`, { params: { page, limit: 20 } });
      const list = response.data?.messages || response.data || [];
      setMessages(page === 1 ? list : [...list, ...messages]);
      setCurrentConversation(userId);
      setConvPage(response.data?.page || page);
      setConvTotalPages(response.data?.totalPages || 1);
      await markThreadAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Send message to user
  const sendMessage = async (receiverId, content) => {
    if (!user) return { success: false };
    
    try {
      const response = await api.post(`/messages/${receiverId}`, {
        contenu: content
      });
      const sent = response.data;
      if (currentConversation === receiverId) {
        setMessages(prev => [...prev, sent]);
      }
      
      // Refresh inbox to update conversation list
      fetchInbox(1, { silent: true });
      
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
      const response = await api.post('/messages/ophrus', {
        sujet: subject,
        contenu: content
      });
      
      toast.success("Message envoyé à l'administration");
      
      // Refresh inbox
      fetchInbox(1, { silent: true });
      
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
      const response = await api.get('/messages/unread');
      setUnreadCount(response.data?.unread || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      
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
      await api.patch(`/messages/thread/${userId}/read`);
      setMessages(prev => prev.map(msg => ({ ...msg, lu: true })));
      setConversations(prev => prev.map(conv => conv.otherUser._id === userId ? { ...conv, unreadCount: 0 } : conv));
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

  // Socket.IO temps réel
  useEffect(() => {
    if (!user) return;
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    import('socket.io-client')
      .then(({ io }) => {
        const base = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
        const token = localStorage.getItem('token');
        const socket = io(base, { auth: { token }, transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join', user._id || user.id);
        });

        socket.on('message:new', (msg) => {
          const otherId =
            msg.expediteur?._id === (user._id || user.id)
              ? msg.destinataire?._id
              : msg.expediteur?._id;

          if (currentConversation && otherId === currentConversation) {
            setMessages(prev => [...prev, msg]);
            fetchMessagesWithUser(currentConversation, 1, { silent: true });
          } else {
            fetchInbox(1, { silent: true });
            fetchUnreadCount();
          }
        });

        socket.on('thread:read', ({ userId }) => {
          if (currentConversation === userId) {
            setMessages(prev => prev.map(m => ({ ...m, lu: true })));
          } else {
            fetchInbox(1, { silent: true });
          }
        });

        return () => {
          if (socketRef.current) socketRef.current.disconnect();
          socketRef.current = null;
        };
      })
      .catch((e) => {
        console.warn("⚠️ socket.io-client non installé ou erreur d'import:", e);
      });

  }, [user, currentConversation]);

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      fetchInbox(1, { silent: true });
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
    inboxPage,
    inboxTotalPages,
    convPage,
    convTotalPages,
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
