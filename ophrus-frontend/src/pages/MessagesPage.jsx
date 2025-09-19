import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input'; 
import { Textarea } from '../components/ui/Textarea'; 
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { formatDate, formatTime } from '../lib/utils';

const MessagesPage = () => {
  const { user } = useAuth();
  const {
    messages,
    conversations,
    currentConversation,
    unreadCount,
    loading,
    fetchMessagesWithUser,
    sendMessage,
    contactOphrus,
    markMessageAsRead,
    clearCurrentConversation,
  } = useMessage();

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageForm, setNewMessageForm] = useState({
    subject: '',
    content: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showConversationList, setShowConversationList] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // On mobile, hide conversation list when a conversation is selected
  useEffect(() => {
    if (isMobile && currentConversation) {
      setShowConversationList(false);
    }
  }, [currentConversation, isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    const result = await sendMessage(currentConversation, newMessage);
    if (result.success) {
      setNewMessage('');
    }
  };

  const handleContactOphrus = async (e) => {
    e.preventDefault();
    if (!newMessageForm.subject.trim() || !newMessageForm.content.trim()) return;

    const result = await contactOphrus(newMessageForm.subject, newMessageForm.content);
    if (result.success) {
      setNewMessageForm({ subject: '', content: '' });
      setShowNewMessageModal(false);
    }
  };

  const handleConversationClick = (userId) => {
    fetchMessagesWithUser(userId);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    clearCurrentConversation();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConversationList = () => (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <Button
            size="sm"
            onClick={() => setShowNewMessageModal(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune conversation</p>
            <Button
              size="sm"
              onClick={() => setShowNewMessageModal(true)}
              className="mt-4"
            >
              Commencer une conversation
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.otherUser._id}
                onClick={() => handleConversationClick(conversation.otherUser._id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  currentConversation === conversation.otherUser._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {conversation.otherUser.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.otherUser.nom}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage.contenu}
                      </p>
                    )}
                    
                    {conversation.unreadCount > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {conversation.unreadCount} non lu{conversation.unreadCount > 1 ? 's' : ''}
                        </span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderConversation = () => (
    <div className="flex-1 flex flex-col bg-gray-50">
      {currentConversation ? (
        <>
          {/* Conversation Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="mr-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {conversations.find(c => c.otherUser._id === currentConversation)?.otherUser.nom.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {conversations.find(c => c.otherUser._id === currentConversation)?.otherUser.nom || 'Administration'}
                  </h2>
                  <p className="text-sm text-gray-500">En ligne</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun message dans cette conversation</p>
                <p className="text-sm text-gray-500 mt-2">Commencez la conversation en envoyant un message</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.expediteur._id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.expediteur._id === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.contenu}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.expediteur._id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                      {!message.lu && message.expediteur._id !== user?.id && (
                        <span className="ml-2">•</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  rows={1}
                  className="resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sélectionnez une conversation
            </h3>
            <p className="text-gray-600 mb-6">
              Choisissez une conversation existante ou commencez-en une nouvelle
            </p>
            <Button onClick={() => setShowNewMessageModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle conversation
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen">
          {/* Conversation List */}
          {(!isMobile || showConversationList) && renderConversationList()}
          
          {/* Conversation View */}
          {(!isMobile || !showConversationList) && renderConversation()}
        </div>
      </div>

      {/* New Message Modal */}
      <Modal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        title="Contacter l'administration"
      >
        <form onSubmit={handleContactOphrus} className="space-y-4">
          <Input
            label="Sujet"
            value={newMessageForm.subject}
            onChange={(e) => setNewMessageForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Objet de votre message"
            required
          />
          
          <Textarea
            label="Message"
            value={newMessageForm.content}
            onChange={(e) => setNewMessageForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Votre message..."
            rows={4}
            required
          />
          
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">
              Envoyer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewMessageModal(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MessagesPage;

