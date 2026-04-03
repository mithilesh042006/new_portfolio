import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Mail, MailOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getMessages, updateMessage, deleteMessage, type Message,
} from '../../lib/firestore';

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const data = await getMessages();
    // Sort newest first
    setMessages(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const toggleExpand = async (msg: Message) => {
    if (expandedId === msg.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(msg.id!);

    // Mark as read
    if (!msg.read && msg.id) {
      await updateMessage(msg.id, { read: true });
      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, read: true } : m)
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await deleteMessage(id);
    toast.success('Message deleted');
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const unreadCount = messages.filter(m => !m.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? (
              <span className="text-blue-400">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
            ) : (
              'Contact form submissions'
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600">No messages yet.</p>
          <p className="text-gray-700 text-sm mt-1">Messages from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 ${
                msg.read ? 'border-gray-800' : 'border-blue-500/30 bg-blue-500/[0.02]'
              }`}
            >
              {/* Header row */}
              <button
                onClick={() => toggleExpand(msg)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-shrink-0">
                  {msg.read ? (
                    <MailOpen className="w-5 h-5 text-gray-600" />
                  ) : (
                    <div className="relative">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold truncate ${msg.read ? 'text-gray-300' : 'text-white'}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs text-gray-600 hidden md:inline">
                      &lt;{msg.email}&gt;
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${msg.read ? 'text-gray-500' : 'text-gray-300'}`}>
                    {msg.subject}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {timeAgo(msg.createdAt)}
                  </span>
                  {expandedId === msg.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {expandedId === msg.id && (
                <div className="px-5 pb-5 border-t border-gray-800/50">
                  <div className="grid grid-cols-2 gap-4 mt-4 mb-5">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">From</label>
                      <p className="text-sm text-white mt-1">{msg.name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Email</label>
                      <a href={`mailto:${msg.email}`} className="text-sm text-blue-400 hover:text-blue-300 mt-1 block transition-colors">
                        {msg.email}
                      </a>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Subject</label>
                      <p className="text-sm text-white mt-1">{msg.subject}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Received</label>
                      <p className="text-sm text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Message</label>
                    <div className="mt-2 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                      className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold text-center hover:bg-gray-100 transition-colors"
                    >
                      Reply via Email
                    </a>
                    <button
                      onClick={() => handleDelete(msg.id!)}
                      className="px-4 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
