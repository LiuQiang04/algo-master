import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import TimeAgo from '../components/common/TimeAgo';
import { Send, ArrowLeft, Search, MessageCircle } from 'lucide-react';

interface Conversation {
  user: { id: string; username: string; avatarUrl?: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; username: string; avatarUrl?: string };
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user');
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(selectedUserId);
  const [newMessage, setNewMessage] = useState('');
  const [_loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchInbox = useCallback(async () => {
    try {
      const { data } = await api.get('/messages');
      setConversations(data.data);
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data.data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchInbox().finally(() => setLoading(false));
  }, [fetchInbox]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      const interval = setInterval(() => fetchMessages(activeChat), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    if (selectedUserId) setActiveChat(selectedUserId);
  }, [selectedUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    setSending(true);
    try {
      await api.post('/messages', { receiverId: activeChat, content: newMessage });
      setNewMessage('');
      fetchMessages(activeChat);
      fetchInbox();
    } finally {
      setSending(false);
    }
  };

  const activeUser = conversations.find((c) => c.user.id === activeChat)?.user;

  return (
    <div className="container" style={{ padding: '24px 24px', maxWidth: 1000 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageCircle size={24} />
        Messages
      </h1>

      <div style={{
        display: 'flex', height: 600, border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        background: 'var(--bg-card)',
      }}>
        {/* Conversation List */}
        <div style={{
          width: 300, borderRight: '1px solid var(--border-light)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }} className="hidden md:flex">
          <div style={{ padding: 12, borderBottom: '1px solid var(--border-light)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No conversations yet
              </div>
            ) : conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => setActiveChat(conv.user.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '12px 16px', textAlign: 'left',
                  background: activeChat === conv.user.id ? 'var(--primary-50)' : 'transparent',
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {conv.user.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {conv.user.username}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <TimeAgo date={conv.lastMessageAt} />
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2,
                  }}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-600)', color: 'white', fontSize: 10,
                    fontWeight: 700, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '0 5px',
                  }}>
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <Link to="/messages" className="md:hidden" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={20} />
                </Link>
                {activeUser && (
                  <>
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-100)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--primary-600)', fontWeight: 600, fontSize: 13,
                    }}>
                      {activeUser.username[0].toUpperCase()}
                    </div>
                    <Link to={`/users/${activeUser.id}`} style={{
                      fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                    }}>
                      {activeUser.username}
                    </Link>
                  </>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        background: isMine ? 'var(--primary-600)' : 'var(--bg-secondary)',
                        color: isMine ? 'white' : 'var(--text-primary)',
                        fontSize: 14, lineHeight: 1.5,
                      }}>
                        <div>{msg.content}</div>
                        <div style={{
                          fontSize: 11, marginTop: 4, opacity: 0.7,
                          textAlign: isMine ? 'right' : 'left',
                        }}>
                          <TimeAgo date={msg.createdAt} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{
                display: 'flex', gap: 8, padding: 12,
                borderTop: '1px solid var(--border-light)',
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                  }}
                />
                <button type="submit" disabled={sending || !newMessage.trim()} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary-600)', color: 'white',
                  opacity: sending || !newMessage.trim() ? 0.5 : 1,
                }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12, color: 'var(--text-muted)',
            }}>
              <MessageCircle size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 16 }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
