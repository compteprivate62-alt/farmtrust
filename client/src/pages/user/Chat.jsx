import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth, useLang } from '../../context';
import { getMyMessages, sendMessage } from '../../services/api';

export default function Chat() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = async () => {
    try {
      const d = await getMyMessages();
      if (Array.isArray(d)) setMessages(d);
    } catch {}
  };

  useEffect(() => {
    loadMessages().finally(() => setLoading(false));
    // Poll every 5 seconds for new messages
    pollRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage({ text, user_id: user._id });
      setMessages(prev => [...prev, msg]);
      setText('');
    } catch {} finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ width:36, height:36, border:'4px solid #1B5E20', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'28px 16px' }}>
      <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a1a', marginBottom:4 }}>
        💬 {lang==='ar'?'تواصل مع المزرعة':lang==='fr'?'Chat avec la ferme':'Chat with Farm'}
      </h1>
      <p style={{ color:'#888', fontSize:13, marginBottom:20 }}>
        {lang==='ar'?'يتجدد تلقائياً كل 5 ثوانٍ':lang==='fr'?'Actualisation automatique toutes les 5s':'Auto-refreshes every 5s'}
      </p>

      <div style={{ background:'white', borderRadius:20, border:'1px solid #f0f0f0', boxShadow:'0 4px 20px #0001', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ background:'#1B5E20', padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'white' }}>FT</div>
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:14 }}>FarmTrust Support</div>
            <div style={{ color:'#a5d6a7', fontSize:11 }}>
              {lang==='ar'?'متصل':'En ligne'} 🟢
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ height:380, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10, background:'#FAFAFA' }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', color:'#bbb', paddingTop:60 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>👋</div>
              <p style={{ fontSize:13 }}>
                {lang==='ar'?'أرسل رسالة للبدء!':lang==='fr'?'Envoyez un message pour commencer!':'Send a message to start!'}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div key={msg._id || i}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', justifyContent:msg.sender==='client'?'flex-end':'flex-start' }}>
              <div style={{
                maxWidth:'72%', padding:'10px 14px', borderRadius:16, fontSize:13,
                background: msg.sender==='client' ? '#1B5E20' : 'white',
                color: msg.sender==='client' ? 'white' : '#333',
                boxShadow: '0 1px 4px #0001',
                borderBottomRightRadius: msg.sender==='client' ? 4 : 16,
                borderBottomLeftRadius:  msg.sender==='admin'  ? 4 : 16,
              }}>
                <p style={{ margin:0 }}>{msg.text}</p>
                <p style={{ margin:0, marginTop:4, fontSize:10, opacity:0.6 }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <form onSubmit={send} style={{ padding:'12px 14px', borderTop:'1px solid #f0f0f0', display:'flex', gap:8, background:'white' }}>
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder={lang==='ar'?'اكتب رسالتك...':lang==='fr'?'Votre message...':'Type a message...'}
            style={{ flex:1, border:'1.5px solid #e0e0e0', borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none' }}
            onFocus={e => e.target.style.borderColor='#1B5E20'}
            onBlur={e  => e.target.style.borderColor='#e0e0e0'}/>
          <button type="submit" disabled={!text.trim() || sending}
            style={{ background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', opacity:(!text.trim()||sending)?0.5:1 }}>
            {sending ? '...' : (lang==='ar'?'إرسال':lang==='fr'?'Envoyer':'Send')}
          </button>
        </form>
      </div>
    </div>
  );
}
