import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimals, getPromotions, getRecentComments, addComment, getStats, getVideo } from '../../services/api';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api','');
import { useLang, useAuth } from '../../context';
import toast from 'react-hot-toast';

const EMOJI = { cow:'🐄', sheep:'🐑', chicken:'🐓', rabbit:'🐇', other:'🐾' };

/* ── Farmer SVG ──────────────────────────────────────── */
const Farmer = () => (
  <svg width="80" height="100" viewBox="0 0 80 100">
    <rect x="18" y="10" width="44" height="12" rx="3" fill="#8B4513"/>
    <rect x="12" y="18" width="56" height="6" rx="3" fill="#A0522D"/>
    <circle cx="40" cy="38" r="20" fill="#FFCC80"/>
    <circle cx="33" cy="35" r="2.5" fill="#333"/>
    <circle cx="47" cy="35" r="2.5" fill="#333"/>
    <path d="M33 45 Q40 51 47 45" stroke="#795548" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <rect x="22" y="57" width="36" height="30" rx="6" fill="#2E7D32"/>
    <rect x="6"  y="59" width="18" height="9" rx="5" fill="#2E7D32"/>
    <rect x="56" y="59" width="18" height="9" rx="5" fill="#2E7D32"/>
    <circle cx="9"  cy="63" r="6" fill="#FFCC80"/>
    <circle cx="71" cy="63" r="6" fill="#FFCC80"/>
    <rect x="25" y="86" width="13" height="14" rx="4" fill="#5D4037"/>
    <rect x="42" y="86" width="13" height="14" rx="4" fill="#5D4037"/>
  </svg>
);

/* ── Stars ───────────────────────────────────────────── */
const Stars = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} onClick={() => onChange?.(s)}
        style={{ fontSize:20, color:s<=value?'#FFA726':'#e0e0e0', cursor:onChange?'pointer':'default', transition:'color 0.15s' }}>★</span>
    ))}
  </div>
);

/* ── Animated number (no hooks in map!) ─────────────── */
function AnimNum({ target, started }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!started || !target) return;
    let startTs = null;
    const dur = 1800;
    const step = ts => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / dur, 1);
      setN(Math.floor((1 - Math.pow(1-p,3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, started]);
  return <>{n}+</>;
}

/* ── Farm scene CSS ──────────────────────────────────── */
const SceneCSS = `
  @keyframes walkR{from{left:-100px}to{left:110%}}
  @keyframes walkR2{from{left:-80px}to{left:110%}}
  @keyframes walkL{from{right:-80px}to{right:110%}}
  @keyframes hopR{0%{left:-60px;bottom:114px}4%{bottom:142px}8%{bottom:114px}12%{bottom:140px}16%{bottom:114px}100%{left:110%;bottom:114px}}
  @keyframes floatC{from{left:-180px}to{left:110%}}
  @keyframes flyB{from{transform:translateX(-100px)}to{transform:translateX(1400px)}}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .ft-cow{position:absolute;bottom:114px;animation:walkR 22s linear infinite}
  .ft-sheep{position:absolute;bottom:118px;animation:walkR2 27s linear infinite;animation-delay:-12s}
  .ft-chicken{position:absolute;bottom:110px;right:-80px;animation:walkL 15s linear infinite;animation-delay:-5s}
  .ft-rabbit{position:absolute;animation:hopR 23s linear infinite;animation-delay:-18s}
  .ft-cloud{position:absolute;background:white;border-radius:50px;opacity:.88;animation:floatC linear infinite}
  .ft-cloud::before,.ft-cloud::after{content:'';position:absolute;background:white;border-radius:50%}
  .ft-c1{width:115px;height:32px;top:55px;animation-duration:29s}
  .ft-c1::before{width:54px;height:54px;top:-22px;left:15px}.ft-c1::after{width:38px;height:38px;top:-15px;left:52px}
  .ft-c2{width:88px;height:26px;top:100px;animation-duration:37s;animation-delay:-15s}
  .ft-c2::before{width:42px;height:42px;top:-17px;left:12px}.ft-c2::after{width:30px;height:30px;top:-12px;left:37px}
  .ft-c3{width:130px;height:33px;top:40px;animation-duration:23s;animation-delay:-9s}
  .ft-c3::before{width:58px;height:58px;top:-24px;left:18px}.ft-c3::after{width:42px;height:42px;top:-17px;left:56px}
  .ft-bird{width:14px;height:5px;border-top:2px solid #455A64;border-radius:50% 50% 0 0;display:inline-block;margin:0 4px}
  .ft-birds{position:absolute;animation:flyB linear infinite}
  .bob{animation:bob 2.5s ease-in-out infinite}
`;

/* ════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate  = useNavigate();
  const { t, lang } = useLang();
  const { user }  = useAuth();
  const isRTL = lang === 'ar';

  const [promos,   setPromos]   = useState([]);
  const [comments, setComments] = useState([]);
  const [animals,  setAnimals]  = useState([]);
  const [stats,    setStats]    = useState({ animals:0, farmers:0, orders:0, clients:0 });
  const [newCom,   setNewCom]   = useState({ text:'', rating:5, animal_id:'' });
  const [sending,  setSending]  = useState(false);
  const [statsOn,  setStatsOn]  = useState(false);
  const [video,    setVideo]    = useState(null);
  const statsRef = useRef(null);

  useEffect(() => {
    getAnimals().then(d => {
      const data = Array.isArray(d) ? d : [];
      setAnimals(data);
      setStats(prev => ({ ...prev, animals:data.length, farmers:Math.max(1,Math.floor(data.length/3)) }));
      if (data[0]) setNewCom(p => ({ ...p, animal_id:data[0]._id }));
    }).catch(() => {});

    getPromotions().then(d => { if (Array.isArray(d)) setPromos(d); }).catch(() => {});

    getRecentComments().then(d => { if (Array.isArray(d)) setComments(d.slice(0,5)); }).catch(() => {});

    getStats().then(d => { if (d?.orders) setStats(prev => ({ ...prev, orders:d.orders, clients:d.clients||prev.clients })); }).catch(() => {});

    getVideo().then(d => { if (d?.src) setVideo(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true); }, { threshold:0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSending(true);
    try {
      const c = await addComment(newCom);
      setComments(prev => [c, ...prev].slice(0,5));
      setNewCom(p => ({ ...p, text:'', rating:5 }));
      toast.success('✅ Avis ajouté!');
    } catch { toast.error('Erreur'); }
    finally { setSending(false); }
  };

  const STAT_DATA = [
    { icon:'🐄', val:stats.animals||12,  label:t.landing.statsAnimals },
    { icon:'👨‍🌾', val:stats.farmers||4,   label:t.landing.statsFarmers },
    { icon:'📦', val:stats.orders||150,  label:t.landing.statsOrders  },
    { icon:'👥', val:stats.clients||80,  label:t.landing.statsClients  },
  ];

  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <style>{SceneCSS}</style>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{ position:'relative', height:'100vh', minHeight:520, overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,#FF8F00 0%,#FFA726 12%,#87CEEB 38%,#e0f7fa 100%)' }}/>
        <div style={{ position:'absolute', top:30, left:'50%', transform:'translateX(-50%)', width:76, height:76, background:'#FFD700', borderRadius:'50%', boxShadow:'0 0 60px #FFD70077' }}/>

        <div className="ft-cloud ft-c1"/><div className="ft-cloud ft-c2"/><div className="ft-cloud ft-c3"/>

        <div className="ft-birds" style={{top:75,left:'8%',animationDuration:'21s'}}>
          <div className="ft-bird"/><div className="ft-bird"/><div className="ft-bird"/>
        </div>
        <div className="ft-birds" style={{top:98,left:'55%',animationDuration:'27s',animationDelay:'-11s'}}>
          <div className="ft-bird"/><div className="ft-bird"/>
        </div>

        {/* Hills */}
        <div style={{position:'absolute',bottom:100,left:'-5%',width:'56%',height:175,background:'#43A047',borderRadius:'50% 50% 0 0'}}/>
        <div style={{position:'absolute',bottom:100,right:'-5%',width:'60%',height:155,background:'#388E3C',borderRadius:'50% 50% 0 0'}}/>
        <div style={{position:'absolute',bottom:100,left:'24%',width:'56%',height:138,background:'#66BB6A',borderRadius:'50% 50% 0 0'}}/>

        {/* Barn */}
        <div style={{position:'absolute',bottom:112,right:70}}>
          <div style={{width:0,height:0,borderLeft:'50px solid transparent',borderRight:'50px solid transparent',borderBottom:'44px solid #C62828',position:'absolute',top:-44,left:-8}}/>
          <div style={{width:88,height:70,background:'#8B2500',border:'2px solid #5D1A00',position:'relative'}}>
            <div style={{width:20,height:14,background:'#FFF9C4',position:'absolute',top:12,left:9,border:'2px solid #5D1A00'}}/>
            <div style={{width:24,height:38,background:'#5D1A00',position:'absolute',bottom:0,left:32,borderRadius:'12px 12px 0 0'}}/>
          </div>
        </div>

        {/* Trees */}
        {[{r:200},{l:25,sc:0.75}].map((tr,i) => (
          <div key={i} style={{position:'absolute',bottom:112,...(tr.r?{right:tr.r}:{left:tr.l}),transform:tr.sc?`scale(${tr.sc})`:undefined}}>
            <div style={{width:0,height:0,borderLeft:'23px solid transparent',borderRight:'23px solid transparent',borderBottom:'42px solid #388E3C',position:'absolute',top:-62,left:-16}}/>
            <div style={{width:0,height:0,borderLeft:'29px solid transparent',borderRight:'29px solid transparent',borderBottom:'52px solid #2E7D32',position:'absolute',top:-46,left:-22}}/>
            <div style={{width:14,height:32,background:'#795548',margin:'0 auto',borderRadius:2}}/>
          </div>
        ))}

        {/* Fence */}
        <div style={{position:'absolute',bottom:112,left:0,right:0,height:36}}>
          <div style={{position:'absolute',left:0,right:0,top:7,height:5,background:'#A1887F',borderRadius:2}}/>
          <div style={{position:'absolute',left:0,right:0,top:21,height:5,background:'#A1887F',borderRadius:2}}/>
          <div style={{display:'flex'}}>
            {Array.from({length:26}).map((_,i)=><div key={i} style={{width:8,height:36,background:'#8D6E63',margin:'0 21px',borderRadius:'2px 2px 0 0',flexShrink:0}}/>)}
          </div>
        </div>
        <div style={{position:'absolute',bottom:0,width:'100%',height:108,background:'#5D4037'}}/>
        <div style={{position:'absolute',bottom:106,width:'100%',height:14,background:'#2E7D32',borderRadius:'8px 8px 0 0'}}/>

        {/* Animals */}
        <div className="ft-cow">
          <svg width="72" height="52" viewBox="0 0 72 52" style={{overflow:'visible'}}>
            <ellipse cx="33" cy="31" rx="23" ry="15" fill="#EFEBE9" stroke="#5D4037" strokeWidth="1"/>
            <circle cx="54" cy="22" r="12" fill="#EFEBE9" stroke="#5D4037" strokeWidth="1"/>
            <ellipse cx="29" cy="29" rx="8" ry="5" fill="#5D4037" opacity="0.22"/>
            <line x1="17" y1="45" x2="15" y2="52" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
            <line x1="26" y1="46" x2="24" y2="52" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
            <line x1="40" y1="46" x2="38" y2="52" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
            <line x1="49" y1="45" x2="47" y2="52" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
            <line x1="55" y1="11" x2="59" y2="5" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="51" y1="10" x2="47" y2="5" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="57" cy="22" r="2" fill="#333"/>
          </svg>
        </div>
        <div className="ft-sheep" style={{bottom:120}}>
          <svg width="62" height="46" viewBox="0 0 62 46" style={{overflow:'visible'}}>
            <ellipse cx="29" cy="29" rx="19" ry="13" fill="#F5F5F5" stroke="#9E9E9E" strokeWidth="0.8"/>
            <circle cx="21" cy="23" r="10" fill="#FAFAFA" stroke="#BDBDBD" strokeWidth="0.6"/>
            <circle cx="29" cy="20" r="10" fill="#FAFAFA" stroke="#BDBDBD" strokeWidth="0.6"/>
            <circle cx="37" cy="23" r="9" fill="#FAFAFA" stroke="#BDBDBD" strokeWidth="0.6"/>
            <circle cx="48" cy="27" r="9" fill="#EFEBE9" stroke="#9E9E9E" strokeWidth="0.8"/>
            <circle cx="50" cy="26" r="2" fill="#333"/>
            <line x1="19" y1="41" x2="17" y2="46" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"/>
            <line x1="27" y1="42" x2="25" y2="46" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"/>
            <line x1="35" y1="42" x2="33" y2="46" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="ft-chicken" style={{bottom:111}}>
          <svg width="42" height="40" viewBox="0 0 42 40" style={{overflow:'visible'}}>
            <ellipse cx="18" cy="26" rx="14" ry="11" fill="#FFF9C4" stroke="#F9A825" strokeWidth="0.8"/>
            <circle cx="29" cy="17" r="10" fill="#FFF9C4" stroke="#F9A825" strokeWidth="0.8"/>
            <path d="M27 10 Q29 6 31 10" fill="#E53935"/>
            <polygon points="34,18 38,19 34,20" fill="#F9A825"/>
            <circle cx="31" cy="16" r="1.8" fill="#212121"/>
            <line x1="16" y1="36" x2="14" y2="40" stroke="#F9A825" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="36" x2="21" y2="40" stroke="#F9A825" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="ft-rabbit">
          <svg width="40" height="48" viewBox="0 0 40 48" style={{overflow:'visible'}}>
            <ellipse cx="20" cy="34" rx="13" ry="11" fill="#F8F8F8" stroke="#BDBDBD" strokeWidth="0.8"/>
            <circle cx="25" cy="24" r="9" fill="#F8F8F8" stroke="#BDBDBD" strokeWidth="0.8"/>
            <ellipse cx="22" cy="13" rx="3.5" ry="9" fill="#F8F8F8" stroke="#BDBDBD" strokeWidth="0.7"/>
            <ellipse cx="29" cy="12" rx="3.5" ry="9" fill="#F8F8F8" stroke="#BDBDBD" strokeWidth="0.7"/>
            <ellipse cx="22" cy="13" rx="1.8" ry="6" fill="#F48FB1"/>
            <ellipse cx="29" cy="12" rx="1.8" ry="6" fill="#F48FB1"/>
            <circle cx="27" cy="24" r="1.8" fill="#333"/>
          </svg>
        </div>

        {/* Farmer */}
        <div style={{position:'absolute',bottom:107,[isRTL?'right':'left']:20,zIndex:10}}>
          <Farmer/>
          <div className="bob" style={{position:'absolute',top:-52,[isRTL?'right':'left']:-10,background:'white',borderRadius:12,padding:'8px 14px',whiteSpace:'nowrap',fontSize:12,fontWeight:700,color:'#1B5E20',boxShadow:'0 4px 16px #0002',border:'2px solid #C8E6C9',zIndex:20}}>
            👋 {t.landing.welcomeMsg}
            <div style={{position:'absolute',bottom:-8,[isRTL?'right':'left']:18,width:14,height:8,background:'white',clipPath:'polygon(0 0,100% 0,50% 100%)'}}/>
          </div>
        </div>

        {/* Hero card */}
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:5}}>
          <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{duration:0.6}}
            style={{background:'rgba(255,255,255,0.94)',borderRadius:24,padding:'32px 40px',textAlign:'center',maxWidth:420,width:'90%',backdropFilter:'blur(6px)',border:'2px solid rgba(255,255,255,0.7)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12}}>
              <div style={{width:44,height:44,background:'#1B5E20',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{color:'white',fontWeight:900,fontSize:16}}>FT</span>
              </div>
              <div style={{textAlign:isRTL?'right':'left'}}>
                <div style={{fontSize:28,fontWeight:900,color:'#1B5E20',letterSpacing:-1,lineHeight:1}}>FarmTrust</div>
                <div style={{fontSize:10,fontWeight:800,color:'#FFA726',letterSpacing:4}}>BY RSHD</div>
              </div>
            </div>
            <div style={{height:3,background:'linear-gradient(90deg,#2E7D32,#FFA726)',borderRadius:2,marginBottom:10}}/>
            <div style={{fontSize:13,color:'#43A047',fontWeight:700,marginBottom:6}}>{t.landing.tagline}</div>
            <div style={{fontSize:13,color:'#757575',marginBottom:22,lineHeight:1.65}}>{t.landing.subtitle}</div>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>navigate('/animals')}
                style={{background:'#1B5E20',color:'white',border:'none',borderRadius:14,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                {t.landing.browse} →
              </button>
              <button onClick={()=>navigate('/register')}
                style={{background:'white',color:'#1B5E20',border:'2.5px solid #1B5E20',borderRadius:14,padding:'12px 22px',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                {t.landing.getStarted}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div animate={{y:[0,7,0]}} transition={{repeat:Infinity,duration:2}}
          style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',color:'white',fontSize:13,fontWeight:600,textShadow:'0 1px 6px #0005',zIndex:10}}>
          {t.landing.scrollMore}
        </motion.div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════ */}
      <section ref={statsRef} style={{background:'linear-gradient(135deg,#1B5E20,#2E7D32)',padding:'48px 20px'}}>
        <div style={{maxWidth:800,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:24,textAlign:'center'}}>
          {STAT_DATA.map((s,i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}>
              <div style={{fontSize:36,marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:34,fontWeight:900,color:'white',lineHeight:1}}>
                <AnimNum target={s.val} started={statsOn}/>
              </div>
              <div style={{fontSize:13,color:'#a5d6a7',fontWeight:600,marginTop:4}}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ VIDEO AD ══════════════════════════════════════ */}
      {video?.src && (
        <section style={{background:'#0a0a0a',padding:'52px 20px'}}>
          <div style={{maxWidth:900,margin:'0 auto'}}>
            <h2 style={{color:'white',textAlign:'center',fontSize:24,fontWeight:800,marginBottom:24}}>
              🎬 {lang==='ar'?'فيديو المزرعة':lang==='fr'?'Vidéo de la ferme':'Farm Video'}
            </h2>
            {/* 16:9 ratio */}
            <div style={{position:'relative',paddingBottom:'56.25%',height:0,borderRadius:18,overflow:'hidden',boxShadow:'0 20px 60px #0009'}}>
              {(video.type==='url' && (video.src.includes('youtube')||video.src.includes('youtu.be'))) ? (
                <iframe
                  src={video.src.replace('watch?v=','embed/').replace('youtu.be/','www.youtube.com/embed/')}
                  style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                  allowFullScreen title="FarmTrust Video"/>
              ) : (
                <video
                  src={video.type==='upload' ? `${API_BASE}${video.src}` : video.src}
                  controls autoPlay muted loop
                  style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover'}}/>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ PROMOTIONS ═════════════════════════════════════ */}      {Array.isArray(promos) && promos.length > 0 && (
        <section style={{background:'#FFFDE7',padding:'56px 20px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <h2 style={{textAlign:'center',fontSize:26,fontWeight:800,color:'#333',marginBottom:28}}>{t.landing.promoTitle}</h2>
            <div style={{display:'flex',gap:16,overflowX:'auto',paddingBottom:12}}>
              {promos.map((pr,i) => (
                <motion.div key={pr._id} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                  whileHover={{y:-4}}
                  onClick={()=>navigate('/animals')}
                  style={{flexShrink:0,background:'white',borderRadius:18,padding:'22px 24px',minWidth:200,textAlign:'center',border:'2px solid #FFF176',cursor:'pointer',transition:'all 0.2s'}}>
                  <div style={{fontSize:36,marginBottom:8}}>🎁</div>
                  <div style={{fontWeight:700,color:'#333',marginBottom:4}}>{pr.product_id?.name||'Produit'}</div>
                  <div style={{background:'#FFEB3B',color:'#E65100',padding:'4px 14px',borderRadius:30,fontWeight:900,fontSize:20,marginBottom:8,display:'inline-block'}}>
                    -{pr.discount_percentage}%
                  </div>
                  <div style={{fontSize:11,color:'#999'}}>→ {new Date(pr.end_date).toLocaleDateString()}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ FEATURES ═══════════════════════════════════════ */}
      <section style={{padding:'56px 20px',background:'white'}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <h2 style={{textAlign:'center',fontSize:26,fontWeight:800,color:'#1B5E20',marginBottom:36}}>
            {lang==='ar'?'كل ما تحتاجه':lang==='fr'?'Tout ce dont vous avez besoin':'Everything you need'}
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
            {[
              {icon:'🛒',t:t.landing.f1t,d:t.landing.f1d,bg:'#E8F5E9'},
              {icon:'🐄',t:t.landing.f2t,d:t.landing.f2d,bg:'#FFF8E1'},
              {icon:'🎁',t:t.landing.f3t,d:t.landing.f3d,bg:'#FCE4EC'},
              {icon:'💬',t:t.landing.f4t,d:t.landing.f4d,bg:'#E3F2FD'},
            ].map((f,i) => (
              <motion.div key={i} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.09}}
                whileHover={{y:-4}}
                style={{background:f.bg,borderRadius:18,padding:'22px',display:'flex',alignItems:'flex-start',gap:14,transition:'transform 0.2s'}}>
                <div style={{fontSize:28,flexShrink:0}}>{f.icon}</div>
                <div>
                  <div style={{fontWeight:700,color:'#333',marginBottom:4}}>{f.t}</div>
                  <div style={{fontSize:13,color:'#666',lineHeight:1.5}}>{f.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMENTS ═══════════════════════════════════════ */}
      <section style={{padding:'56px 20px',background:'#F9FAFB'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <h2 style={{textAlign:'center',fontSize:26,fontWeight:800,color:'#333',marginBottom:32}}>{t.landing.commentsTitle} ⭐</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:28}}>
            {Array.isArray(comments) && comments.map((c,i) => (
              <motion.div key={c._id||i} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}
                style={{background:'white',borderRadius:16,padding:'18px',boxShadow:'0 2px 12px #0001',border:'1px solid #f0f0f0'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,background:'#E8F5E9',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#2E7D32',fontSize:14,flexShrink:0}}>
                    {c.user_id?.name?.[0]?.toUpperCase()||'U'}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:'#333'}}>{c.user_id?.name||'Client'}</div>
                    <Stars value={c.rating}/>
                  </div>
                </div>
                <p style={{fontSize:13,color:'#555',lineHeight:1.6,fontStyle:'italic'}}>"{c.text}"</p>
              </motion.div>
            ))}
          </div>

          {/* Comment form */}
          <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            style={{background:'white',borderRadius:20,padding:'28px',maxWidth:500,margin:'0 auto',boxShadow:'0 4px 20px #0001',border:'1px solid #e8e8e8'}}>
            <h3 style={{fontWeight:700,color:'#333',marginBottom:16,textAlign:'center'}}>{t.landing.leaveComment} ✍️</h3>
            {user ? (
              <form onSubmit={submitComment}>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:12,color:'#888',fontWeight:600,display:'block',marginBottom:4}}>
                    {lang==='ar'?'الحيوان':lang==='fr'?'Animal':'Animal'}
                  </label>
                  <select value={newCom.animal_id} onChange={e=>setNewCom(p=>({...p,animal_id:e.target.value}))}
                    style={{width:'100%',border:'1.5px solid #e0e0e0',borderRadius:10,padding:'9px 12px',fontSize:13,outline:'none'}}>
                    {Array.isArray(animals) && animals.map(a=><option key={a._id} value={a._id}>{EMOJI[a.type]||'🐾'} {a.name}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:12}}>
                  <Stars value={newCom.rating} onChange={r=>setNewCom(p=>({...p,rating:r}))}/>
                </div>
                <textarea value={newCom.text} onChange={e=>setNewCom(p=>({...p,text:e.target.value}))} required
                  placeholder={lang==='ar'?'اكتب تعليقك...':lang==='fr'?'Votre avis...':'Your comment...'}
                  style={{width:'100%',border:'1.5px solid #e0e0e0',borderRadius:10,padding:'10px 12px',fontSize:13,outline:'none',resize:'vertical',minHeight:80,boxSizing:'border-box'}}/>
                <button type="submit" disabled={sending}
                  style={{width:'100%',background:'#1B5E20',color:'white',border:'none',borderRadius:12,padding:'11px',fontWeight:700,fontSize:14,cursor:'pointer',marginTop:10,opacity:sending?0.7:1}}>
                  {sending?'...':t.landing.leaveComment}
                </button>
              </form>
            ) : (
              <div style={{textAlign:'center'}}>
                <p style={{color:'#888',fontSize:14,marginBottom:12}}>{t.landing.loginToComment}</p>
                <Link to="/login" style={{background:'#1B5E20',color:'white',padding:'10px 24px',borderRadius:12,fontWeight:700,fontSize:14,textDecoration:'none'}}>
                  {t.nav.login}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#111',color:'#888',textAlign:'center',padding:'28px 20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:6}}>
          <div style={{width:28,height:28,background:'#2E7D32',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'white',fontWeight:900,fontSize:11}}>FT</span>
          </div>
          <span style={{color:'white',fontWeight:700}}>FarmTrust <span style={{color:'#FFA726'}}>by RSHD</span></span>
        </div>
        <p style={{fontSize:12}}>© 2024 FarmTrust by RSHD 🌿</p>
      </footer>
    </div>
  );
}
