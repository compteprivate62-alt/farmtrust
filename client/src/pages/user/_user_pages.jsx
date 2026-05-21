import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrders, getNotifications, markAllRead } from '../../services/api';
import { useAuth, useLang } from '../../context';

export function UserDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const isRTL = lang === 'ar';
  const [orders, setOrders] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    getOrders().then(d => Array.isArray(d) && setOrders(d)).catch(() => {});
    getNotifications().then(d => Array.isArray(d) && setNotifs(d)).catch(() => {});
  }, []);

  const stats = [
    { label:t.dashboard.orders,  value:orders.length,                                  icon:'📦', link:'/orders' },
    { label:t.dashboard.pending, value:orders.filter(o=>o.status==='pending').length,   icon:'⏳', link:'/orders' },
    { label:t.dashboard.notifs,  value:notifs.filter(n=>!n.read).length,                icon:'🔔', link:'/notifications' },
    { label:'Chat',              value:'💬',                                            icon:'💬', link:'/chat' },
  ];

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ maxWidth:1000, margin:'0 auto', padding:'32px 16px' }}>
      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a1a', marginBottom:4 }}>
          {t.dashboard.welcome}, {user?.name} 👋
        </h1>
        <p style={{ color:'#888', fontSize:14, marginBottom:28 }}>FarmTrust by RSHD</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:28 }}>
          {stats.map((s,i) => (
            <Link key={s.label} to={s.link} style={{ textDecoration:'none' }}>
              <motion.div initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.08 }} whileHover={{ y:-3 }}
                style={{ background:'white', borderRadius:18, padding:'22px', textAlign:'center', border:'1px solid #f0f0f0', boxShadow:'0 2px 12px #0001', cursor:'pointer' }}>
                <div style={{ fontSize:32, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:900, color:'#1B5E20' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'#888', fontWeight:600, marginTop:4 }}>{s.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          <div style={{ background:'white', borderRadius:18, padding:22, border:'1px solid #f0f0f0' }}>
            <h2 style={{ fontWeight:800, fontSize:15, color:'#333', marginBottom:14 }}>{t.dashboard.orders}</h2>
            {orders.length === 0
              ? <p style={{ color:'#aaa', fontSize:13, textAlign:'center', padding:'20px 0' }}>
                  {lang==='ar'?'لا توجد طلبات':lang==='fr'?'Aucune commande':'No orders yet'}
                </p>
              : orders.slice(0,4).map(o => (
                <div key={o._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                  <div>
                    <div style={{ fontSize:12, fontFamily:'monospace', color:'#888' }}>#{o._id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize:11, color:'#bbb', marginTop:1 }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:800, color:'#1B5E20' }}>{o.total_price} MAD</div>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:700, background:o.status==='delivered'?'#E8F5E9':o.status==='confirmed'?'#FFF8E1':'#F5F5F5', color:o.status==='delivered'?'#1B5E20':o.status==='confirmed'?'#E65100':'#888' }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            }
            <Link to="/orders" style={{ fontSize:13, color:'#1B5E20', fontWeight:700, textDecoration:'none', display:'block', marginTop:10 }}>
              {lang==='ar'?'عرض الكل':lang==='fr'?'Voir tout':'View all'} →
            </Link>
          </div>

          <div style={{ background:'white', borderRadius:18, padding:22, border:'1px solid #f0f0f0' }}>
            <h2 style={{ fontWeight:800, fontSize:15, color:'#333', marginBottom:14 }}>{t.dashboard.quickActions}</h2>
            {[
              { icon:'🐄', label:lang==='ar'?'تصفح الحيوانات':lang==='fr'?'Voir les animaux':'Browse Animals', to:'/animals' },
              { icon:'🛒', label:lang==='ar'?'سلة التسوق':lang==='fr'?'Panier':'Cart', to:'/cart' },
              { icon:'💬', label:'Chat', to:'/chat' },
              { icon:'🔔', label:lang==='ar'?'الإشعارات':lang==='fr'?'Notifications':'Notifications', to:'/notifications' },
            ].map(a => (
              <Link key={a.to} to={a.to}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:12, marginBottom:6, textDecoration:'none', color:'#555', background:'#FAFAFA' }}
                onMouseEnter={e=>e.currentTarget.style.background='#E8F5E9'}
                onMouseLeave={e=>e.currentTarget.style.background='#FAFAFA'}>
                <span style={{ fontSize:20 }}>{a.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function UserOrders() {
  const { t, lang } = useLang();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(d => Array.isArray(d) && setOrders(d)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 16px' }}>
      <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a1a', marginBottom:24 }}>📦 {t.dashboard.orders}</h1>
      {loading
        ? <div style={{ textAlign:'center', padding:60, color:'#888' }}>Loading...</div>
        : orders.length === 0
          ? <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
              <p style={{ color:'#888', fontSize:14 }}>{lang==='ar'?'لا توجد طلبات':lang==='fr'?'Aucune commande':'No orders yet'}</p>
              <Link to="/animals" style={{ color:'#1B5E20', fontWeight:700, textDecoration:'none', marginTop:8, display:'block' }}>
                {lang==='ar'?'تسوق الآن':lang==='fr'?'Commencer':'Start shopping'} →
              </Link>
            </div>
          : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {orders.map((o,i) => (
                <motion.div key={o._id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
                  style={{ background:'white', borderRadius:16, padding:'18px 22px', border:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#333' }}>#{o._id.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                    {o.note && <div style={{ fontSize:11, color:'#aaa', fontStyle:'italic' }}>"{o.note}"</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:900, color:'#1B5E20' }}>{o.total_price} MAD</div>
                    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:700, background:o.status==='delivered'?'#E8F5E9':o.status==='confirmed'?'#FFF8E1':o.status==='cancelled'?'#FFEBEE':'#F5F5F5', color:o.status==='delivered'?'#1B5E20':o.status==='confirmed'?'#E65100':o.status==='cancelled'?'#C62828':'#888' }}>
                      {o.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
      }
    </div>
  );
}

export function UserNotifications() {
  const { lang } = useLang();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(d => Array.isArray(d) && setNotifs(d)).finally(() => setLoading(false));
  }, []);

  const handleReadAll = async () => {
    try { await markAllRead(); setNotifs(prev => prev.map(n => ({ ...n, read:true }))); } catch {}
  };

  const icons = { promotion:'🎁', order:'📦', message:'💬' };

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a1a' }}>
          🔔 {lang==='ar'?'الإشعارات':lang==='fr'?'Notifications':'Notifications'}
        </h1>
        {notifs.some(n=>!n.read) && (
          <button onClick={handleReadAll}
            style={{ fontSize:12, color:'#1B5E20', fontWeight:700, background:'#E8F5E9', border:'none', borderRadius:10, padding:'7px 14px', cursor:'pointer' }}>
            {lang==='ar'?'قراءة الكل':lang==='fr'?'Tout lire':'Mark all read'}
          </button>
        )}
      </div>
      {loading
        ? <div style={{ textAlign:'center', padding:60, color:'#888' }}>Loading...</div>
        : notifs.length === 0
          ? <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
              <p style={{ color:'#888', fontSize:14 }}>{lang==='ar'?'لا إشعارات':lang==='fr'?'Aucune notification':'No notifications'}</p>
            </div>
          : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {notifs.map((n,i) => (
                <motion.div key={n._id} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.04 }}
                  style={{ background:'white', borderRadius:14, padding:'14px 18px', border:`1.5px solid ${!n.read?'#A5D6A7':'#f0f0f0'}`, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{icons[n.type]||'🔔'}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, color:'#333', margin:0 }}>{n.text}</p>
                    <p style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && <div style={{ width:8, height:8, background:'#4CAF50', borderRadius:'50%', flexShrink:0, marginTop:4 }}/>}
                </motion.div>
              ))}
            </div>
      }
    </div>
  );
}

export default UserDashboard;
