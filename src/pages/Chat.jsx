import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { API_BASE } from '../utils/apiConfig.js';
import * as signalR from '@microsoft/signalr';
import Navbar from '../components/Navbar.jsx';
import '../styles/global.css';
import '../styles/chat.css';

function formatTime(ts) {
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function Chat() 
{
  const { user, logout, setForceLogoutHandler } = useApp();
  const nav = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const boxRef = useRef(null);
  const connectionRef = useRef(null);

  const isAdmin = user?.role === 'Admin';

  useEffect(() =>
  {
    if (!user) { nav('/login', { replace: true }); return; }

    setForceLogoutHandler(() =>
    {
      logout();
      nav('/login', { replace: true });
    });

    fetch(`${API_BASE}/api/chat/messages?count=100`)
      .then(r => r.json())
      .then(data => setMessages(data.messages));

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/floudyhub`)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveChatMessage', (msg) =>
    {
      setMessages(prev => [...prev, msg]);
    });

    connection.on('ChatMessageDeleted', (id) =>
    {
      setMessages(prev => prev.filter(m => m.id !== id));
    });

    connection.start().then(() =>
    {
      connection.invoke('JoinChat');
      connection.invoke('JoinGroup', user.username);
    });

    connectionRef.current = connection;

    return () =>
    {
      if (connectionRef.current)
      {
        connectionRef.current.invoke('LeaveChat').catch(() => {});
        connectionRef.current.invoke('LeaveGroup', user.username).catch(() => {});
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      setForceLogoutHandler(null);
    };
  }, []);

  useEffect(() =>
  {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  function send()
  {
    if (!text.trim() || !connectionRef.current) return;
    connectionRef.current.invoke('SendChatMessage', user.username, text.trim());
    setText('');
  }

  function remove(id)
  {
    if (!connectionRef.current) return;
    connectionRef.current.invoke('DeleteChatMessage', id, user.username);
  }

  function handleKey(e)
  {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div>
      <Navbar />
      <div className="chat page-in">
        <h1 className="chat__title">Chat</h1>

        <div className="chat__box" ref={boxRef}>
          {messages.length === 0 && (
            <div className="chat__empty">No messages yet.</div>
          )}
          {messages.map(m => {
            const isSelf = m.username === user.username;
            return (
              <div key={m.id} className={`chat__msg ${isSelf ? 'chat__msg--self' : 'chat__msg--other'}`}>
                <span className="chat__msg-author">{m.username}</span>
                <div className="chat__msg-bubble-wrap">
                  <div className="chat__msg-bubble">{m.text}</div>
                  {isAdmin && (
                    <div className="chat__msg-del" title="Delete message" onClick={() => remove(m.id)}>✕</div>
                  )}
                </div>
                <span className="chat__msg-time">{formatTime(m.timestamp)}</span>
              </div>
            );
          })}
        </div>

        <div className="chat__input-bar">
          <input
            className="chat__input"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
          />
          <button className="chat__send" onClick={send}>SEND</button>
        </div>
      </div>
    </div>
  );
}
