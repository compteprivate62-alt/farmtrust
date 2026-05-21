import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useCart, useLang } from '../../context';

const LANGS = [
  { code:'ar', label:'العربية', flag:'🇲🇦' },
  { code:'fr', label:'Français', flag:'🇫🇷' },
  { code:'en', label:'English',  flag:'🇬🇧' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { lang, t, changeLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isRTL = lang === 'ar';
  const cur = LANGS.find(l => l.code === lang);

  const NavLink = ({ to, label }) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      style={{ color: location.pathname === to ? '#2E7D32' : '#555', fontWeight: location.pathname === to ? 700 : 500, fontSize:14, textDecoration:'none', transition:'color 0.15s' }}
      onMouseEnter={e => e.target.style.color='#2E7D32'} onMouseLeave={e => e.target.style.color=location.pathname===to?'#2E7D32':'#555'}>
      {label}
    </Link>
  );

  return (
    <nav dir={isRTL?'rtl':'ltr'} style={{ position:'sticky', top:0, zIndex:100, background:'white', borderBottom:'1px solid #f0f0f0', boxShadow:'0 1px 8px #0001' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', height:62, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:36, height:36, background:'#1B5E20', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px #1B5E2033' }}>
            <span style={{ color:'white', fontWeight:900, fontSize:14 }}>FT</span>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:900, color:'#1B5E20', lineHeight:1, letterSpacing:-0.5 }}>FarmTrust</div>
            <div style={{ fontSize:8, fontWeight:800, color:'#FFA726', letterSpacing:3, lineHeight:1 }}>BY RSHD</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display:'flex', gap:24, alignItems:'center' }} className="hidden md:flex">
          <NavLink to="/animals" label={t.nav.animals}/>
          {user && <NavLink to="/dashboard" label={t.nav.dashboard}/>}
          {user?.role==='admin' && <NavLink to="/admin" label={t.nav.admin}/>}
        </div>

        {/* Right controls */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>

          {/* Lang switcher */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setLangOpen(!langOpen); setMenuOpen(false); }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:10, border:'1.5px solid #e8e8e8', background:'white', cursor:'pointer', fontSize:13, fontWeight:600, color:'#555' }}>
              <span>{cur?.flag}</span>
              <span style={{ display:'none' }} className="sm:inline">{cur?.label}</span>
              <span style={{ fontSize:10, color:'#aaa' }}>▾</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                  style={{ position:'absolute', top:42, [isRTL?'left':'right']:0, background:'white', border:'1px solid #e8e8e8', borderRadius:14, boxShadow:'0 8px 32px #0002', overflow:'hidden', zIndex:200, minWidth:140 }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => { changeLang(l.code); setLangOpen(false); }}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 16px', background: lang===l.code ? '#E8F5E9' : 'white', color: lang===l.code ? '#1B5E20' : '#555', fontWeight: lang===l.code ? 700 : 500, border:'none', cursor:'pointer', fontSize:13, textAlign:isRTL?'right':'left' }}>
                      <span>{l.flag}</span>{l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <>
              {/* Cart */}
              <Link to="/cart" style={{ position:'relative', padding:8, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', background: cart.length ? '#E8F5E9' : 'transparent' }}>
                <span style={{ fontSize:18 }}>🛒</span>
                {cart.length > 0 && (
                  <span style={{ position:'absolute', top:2, right:2, background:'#E53935', color:'white', fontSize:9, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
                    {cart.length}
                  </span>
                )}
              </Link>
              {/* Notifs */}
              <Link to="/notifications" style={{ padding:8, borderRadius:10, display:'flex', alignItems:'center', textDecoration:'none' }}>
                <span style={{ fontSize:18 }}>🔔</span>
              </Link>
              {/* Avatar */}
              <div style={{ width:34, height:34, background:'#E8F5E9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#1B5E20', fontSize:14, cursor:'default', flexShrink:0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              {/* Logout */}
              <button onClick={() => { logout(); navigate('/'); }}
                style={{ padding:'7px 14px', borderRadius:10, background:'#FFF3E0', color:'#E65100', border:'none', cursor:'pointer', fontSize:13, fontWeight:700 }}>
                {t.nav.logout}
              </button>
            </>
          ) : (
            <div style={{ display:'flex', gap:8 }} className="hidden md:flex">
              <Link to="/login" style={{ padding:'8px 16px', borderRadius:11, border:'2px solid #1B5E20', color:'#1B5E20', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                {t.nav.login}
              </Link>
              <Link to="/register" style={{ padding:'8px 16px', borderRadius:11, background:'#1B5E20', color:'white', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Mobile menu btn */}
          <button onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false); }}
            style={{ padding:8, borderRadius:10, background:'#f5f5f5', border:'none', cursor:'pointer', fontSize:18 }} className="md:hidden">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'white', borderTop:'1px solid #f0f0f0', padding:'12px 16px', display:'flex', flexDirection:'column', gap:12 }}>
            <NavLink to="/animals" label={t.nav.animals}/>
            {user && <NavLink to="/dashboard" label={t.nav.dashboard}/>}
            {user?.role==='admin' && <NavLink to="/admin" label={t.nav.admin}/>}
            {!user && (
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex:1, textAlign:'center', padding:'9px', borderRadius:11, border:'2px solid #1B5E20', color:'#1B5E20', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                  {t.nav.login}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex:1, textAlign:'center', padding:'9px', borderRadius:11, background:'#1B5E20', color:'white', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                  {t.nav.register}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
