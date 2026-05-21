import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAnimals, getOrders, getProducts, updateOrderStatus } from '../../services/api';
import { useLang, useAuth } from '../../context';
import toast from 'react-hot-toast';

export function AdminLayout({ children, title }) {
  const { t, lang } = useLang();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = lang === 'ar';
  const NAV = [
    { path:'/admin',            label:t.admin.dashboard,  icon:'📊' },
    { path:'/admin/animals',    label:t.admin.animals,    icon:'🐄' },
    { path:'/admin/products',   label:t.admin.products,   icon:'🧴' },
    { path:'/admin/orders',     label:t.admin.orders,     icon:'📦' },
    { path:'/admin/promotions', label:t.admin.promotions, icon:'🎁' },
    { path:'/admin/messages',   label:t.admin.messages,   icon:'💬' },
    { path:'/admin/video',      label:t.admin.video,      icon:'🎬' },
  ];
  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ display:'flex', minHeight:'100vh', background:'#F8FAFB' }}>
      <aside style={{ width:220, background:'white', borderRight:'1px solid #f0f0f0', display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0 }}>
        <div style={{ padding:'0 18px 20px', borderBottom:'1px solid #f0f0f0', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:34, height:34, background:'#1B5E20', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'white', fontWeight:900, fontSize:13 }}>FT</span>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:900, color:'#1B5E20' }}>FarmTrust</div>
              <div style={{ fontSize:9, color:'#FFA726', fontWeight:800, letterSpacing:2 }}>ADMIN</div>
            </div>
          </div>
        </div>
        {NAV.map(n => (
          <Link key={n.path} to={n.path}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 18px', fontSize:13, fontWeight:location.pathname===n.path?700:500, color:location.pathname===n.path?'#1B5E20':'#666', background:location.pathname===n.path?'#E8F5E9':'transparent', borderRight:location.pathname===n.path&&!isRTL?'3px solid #1B5E20':'none', borderLeft:location.pathname===n.path&&isRTL?'3px solid #1B5E20':'none', textDecoration:'none', transition:'all 0.15s' }}>
            <span style={{ fontSize:16 }}>{n.icon}</span>{n.label}
          </Link>
        ))}
        <div style={{ marginTop:'auto', padding:'16px 18px', borderTop:'1px solid #f0f0f0' }}>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ width:'100%', padding:'9px', background:'#FFF3E0', color:'#E65100', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            🚪 {lang==='ar'?'خروج':lang==='fr'?'Déconnexion':'Logout'}
          </button>
        </div>
      </aside>
      <main style={{ flex:1, padding:28, overflowY:'auto' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          {title && <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a1a', marginBottom:24 }}>{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, link }) {
  return (
    <Link to={link} style={{ textDecoration:'none' }}>
      <motion.div whileHover={{ y:-3 }} style={{ background:'white', borderRadius:18, padding:'22px', textAlign:'center', border:'1px solid #f0f0f0', boxShadow:'0 2px 12px #0001', cursor:'pointer' }}>
        <div style={{ fontSize:34, marginBottom:6 }}>{icon}</div>
        <div style={{ fontSize:28, fontWeight:900, color }}>{value}</div>
        <div style={{ fontSize:12, color:'#888', fontWeight:600, marginTop:4 }}>{label}</div>
      </motion.div>
    </Link>
  );
}

export function AdminDashboard() {
  const { t } = useLang();
  const [animals, setAnimals]   = useState([]);
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAnimals().then(d  => Array.isArray(d) && setAnimals(d)).catch(()=>{});
    getOrders().then(d   => Array.isArray(d) && setOrders(d)).catch(()=>{});
    getProducts().then(d => Array.isArray(d) && setProducts(d)).catch(()=>{});
  }, []);

  const revenue = orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total_price,0);

  return (
    <AdminLayout title={t.admin.dashboard}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard icon="🐄" label={t.admin.animals}  value={animals.length}  color="#1B5E20" link="/admin/animals"/>
        <StatCard icon="🧴" label={t.admin.products} value={products.length} color="#1565C0" link="/admin/products"/>
        <StatCard icon="📦" label={t.admin.orders}   value={orders.length}   color="#E65100" link="/admin/orders"/>
        <StatCard icon="💰" label="Revenue" value={`${revenue.toFixed(0)} MAD`} color="#6A1B9A" link="/admin/orders"/>
      </div>
      <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #f0f0f0' }}>
        <h2 style={{ fontWeight:800, fontSize:16, color:'#333', marginBottom:16 }}>📦 {t.admin.orders}</h2>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #f0f0f0', color:'#888' }}>
              {['ID','Client','Total','Status','Date'].map(h=>(
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.slice(0,8).map(o=>(
              <tr key={o._id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                <td style={{ padding:'10px 12px', fontFamily:'monospace', fontSize:11, color:'#888' }}>#{o._id.slice(-6).toUpperCase()}</td>
                <td style={{ padding:'10px 12px', fontWeight:600 }}>{o.user_id?.name||'—'}</td>
                <td style={{ padding:'10px 12px', fontWeight:700, color:'#1B5E20' }}>{o.total_price} MAD</td>
                <td style={{ padding:'10px 12px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:o.status==='delivered'?'#E8F5E9':o.status==='confirmed'?'#FFF8E1':o.status==='cancelled'?'#FFEBEE':'#F5F5F5', color:o.status==='delivered'?'#1B5E20':o.status==='confirmed'?'#E65100':o.status==='cancelled'?'#C62828':'#666' }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding:'10px 12px', color:'#888' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/admin/orders" style={{ fontSize:13, color:'#1B5E20', fontWeight:700, textDecoration:'none', display:'block', marginTop:12 }}>Voir toutes →</Link>
      </div>
    </AdminLayout>
  );
}

export function AdminOrders() {
  const { t } = useLang();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const STATUSES = ['pending','confirmed','delivered','cancelled'];

  useEffect(() => {
    getOrders().then(d => Array.isArray(d) && setOrders(d)).finally(()=>setLoading(false));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id===id ? {...o,status} : o));
      toast.success('Updated ✅');
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title={t.admin.orders}>
      {loading
        ? <div style={{ textAlign:'center', padding:60, color:'#888' }}>Loading...</div>
        : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {orders.map((o,i)=>(
              <motion.div key={o._id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
                style={{ background:'white', borderRadius:16, padding:'18px 22px', border:'1px solid #f0f0f0', display:'flex', flexWrap:'wrap', alignItems:'center', gap:16, justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:700, color:'#333' }}>#{o._id.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{o.user_id?.name||'—'} • {new Date(o.createdAt).toLocaleDateString()}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#1B5E20', marginTop:4 }}>{o.total_price} MAD</div>
                  {o.note && <div style={{ fontSize:11, color:'#aaa', fontStyle:'italic' }}>"{o.note}"</div>}
                </div>
                <select value={o.status} onChange={e=>changeStatus(o._id,e.target.value)}
                  style={{ border:'1.5px solid #e0e0e0', borderRadius:10, padding:'8px 12px', fontSize:13, fontWeight:600, outline:'none', cursor:'pointer' }}>
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </motion.div>
            ))}
            {orders.length===0 && <div style={{ textAlign:'center', padding:60, color:'#888' }}>No orders yet</div>}
          </div>
      }
    </AdminLayout>
  );
}

export default AdminDashboard;
