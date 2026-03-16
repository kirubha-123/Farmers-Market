import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import './Messages.css';

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/buyer-login');
      return;
    }
    setCurrentUser(user);
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
      markAsRead(userId);
    } else {
      setMessages([]);
      setOtherUser(null);
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch conversations error:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(`/messages/${id}`);
      setMessages(res.data);
      
      // Fetch other user details if not already in conversations
      const convo = conversations.find(c => c.user._id === id);
      if (convo) {
        setOtherUser(convo.user);
      } else {
        try {
          const userRes = await api.get(`/auth/user/${id}`);
          setOtherUser(userRes.data);
        } catch (e) {
          if (res.data.length > 0) {
            const firstMsg = res.data[0];
            const other = firstMsg.from._id === id ? firstMsg.from : firstMsg.to;
            setOtherUser(other);
          }
        }
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/messages/read/${id}`);
      // Refresh conversations list to update unread counts
      fetchConversations();
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !userId || sending) return;

    setSending(true);
    setSendError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSendError('You are not logged in. Please log in again.');
        setSending(false);
        return;
      }
      const res = await api.post('/messages', { to: userId, text: trimmed });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error('Send message error:', err);
      const msg = err.response?.data?.message || 'Failed to send. Please try again.';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading messages...</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="messages-container">
        {/* Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>
          <div className="conversations-list">
            {conversations.length === 0 && !userId ? (
              <p className="text-center text-gray-400 p-5 mt-10">No conversations yet</p>
            ) : (
              (() => {
                // Ensure current otherUser is in the sidebar even if no messages yet
                let list = [...conversations];
                if (userId && otherUser && !list.find(c => c.user._id === userId)) {
                  list.unshift({
                    user: otherUser,
                    lastMessage: { text: 'New conversation' },
                    unreadCount: 0
                  });
                }
                return list.map((convo) => (
                  <div
                    key={convo.user._id}
                    className={`conversation-item ${userId === convo.user._id ? 'active' : ''}`}
                    onClick={() => navigate(`/messages/${convo.user._id}`)}
                  >
                    <div className="user-avatar">
                      {convo.user.name.charAt(0)}
                    </div>
                    <div className="convo-info">
                      <span className="convo-name">{convo.user.name}</span>
                      <p className="last-msg">{convo.lastMessage.text}</p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="unread-badge">{convo.unreadCount}</span>
                    )}
                  </div>
                ));
              })()
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {userId ? (
            <>
              <div className="chat-header">
                <h3>{otherUser ? otherUser.name : 'Chat'}</h3>
              </div>
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <p>Start a conversation with {otherUser?.name || 'this user'}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message-bubble ${msg.from._id === currentUser?.id ? 'msg-sent' : 'msg-received'}`}
                    >
                      {msg.text}
                      <span className="msg-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-area">
                {sendError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '6px', paddingLeft: '4px' }}>
                    ⚠️ {sendError}
                  </p>
                )}
                <form onSubmit={handleSendMessage} className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message and press Enter or click Send..."
                    value={newMessage}
                    disabled={sending}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    title="Send Message"
                    disabled={sending || !newMessage.trim()}
                    style={{ opacity: (sending || !newMessage.trim()) ? 0.6 : 1 }}
                  >
                    {sending ? '...' : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h2>Select a conversation</h2>
              <p>Choose a chat from the sidebar to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
