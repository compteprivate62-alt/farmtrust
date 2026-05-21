import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getProducts, createProduct, deleteProduct, getAnimals, getPromotions, createPromotion, deletePromotion, getAllMessages, getUserMessages, sendMessage } from '../../services/api';
import { AdminLayout } from './Dashboard';
import { useLang, useAuth } from '../../context';

// ─── Admin Products ──────────────────────────────────────
export function AdminProducts() {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [animals, setAnimals]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ animal_id:'', name:'', price:'', unit:'liter', stock:'' });
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([getProducts(), getAnimals()])
    .then(([p,a]) => {
      Array.isArray(p) && setProducts(p);
      Array.isArray(a) && setAnimals(a);
    }).catch(()=>{});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createProduct(form); toast.success('✅ Product added!'); setShowForm(false); load(); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title={t.admin.products}>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
        <button onClick={() => setShowForm(true)}
          style={{ background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + Add Product
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <motion.div initial={{ scale:0.95,y:20 }} animate={{ scale:1,y:0 }} exit={{ scale:0.95 }}
              style={{ background:'white', borderRadius:22, padding:28, width:'100%', maxWidth:440 }}>
              <h2 style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Add Product</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Animal *</label>
                  <select value={form.animal_id} onChange={e=>setForm({...form,animal_id:e.target.value})} required
                    style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none' }}>
                    <option value="">Select animal</option>
                    {animals.map(a => <option key={a._id} value={a._id}>{a.name} ({a.type})</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Name *</label>
                    <input style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}
                      placeholder="Milk, Eggs..." value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Unit</label>
                    <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}
                      style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none' }}>
                      <option value="liter">Liter</option>
                      <option value="kg">Kg</option>
                      <option value="unit">Unit</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Price (MAD) *</label>
                    <input type="number" style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}
                      value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Stock</label>
                    <input type="number" style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}
                      value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={()=>setShowForm(false)}
                    style={{ flex:1, background:'#f5f5f5', color:'#555', border:'none', borderRadius:12, padding:'11px', fontWeight:700, fontSize:13, cursor:'pointer' }}>Cancel</button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'11px', fontWeight:700, fontSize:13, cursor:'pointer', opacity:saving?0.7:1 }}>
                    {saving?'...':'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
        {products.map((p,i) => (
          <motion.div key={p._id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
            style={{ background:'white', borderRadius:16, padding:'18px', border:'1px solid #f0f0f0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, color:'#333', fontSize:15 }}>{p.name}</div>
                <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{p.animal_id?.name||'—'} • {p.unit}</div>
              </div>
              {p.discount && <span style={{ background:'#FFEB3B', color:'#E65100', fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:20 }}>-{p.discount}%</span>}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                {p.discount
                  ? <><span style={{ textDecoration:'line-through', color:'#bbb', fontSize:12 }}>{p.price}</span> <span style={{ fontWeight:800, color:'#1B5E20', fontSize:16 }}>{p.final_price} MAD</span></>
                  : <span style={{ fontWeight:800, color:'#1B5E20', fontSize:16 }}>{p.price} MAD</span>
                }
              </div>
              <button onClick={async()=>{ await deleteProduct(p._id); toast.success('Deleted'); load(); }}
                style={{ background:'#FFEBEE', color:'#C62828', border:'none', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                🗑️ Del
              </button>
            </div>
          </motion.div>
        ))}
        {products.length===0 && <p style={{ color:'#aaa', gridColumn:'1/-1', textAlign:'center', padding:40 }}>No products yet</p>}
      </div>
    </AdminLayout>
  );
}

// ─── Admin Promotions ────────────────────────────────────
export function AdminPromotions() {
  const { t } = useLang();
  const [promos, setPromos]     = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id:'', discount_percentage:'', start_date:'', end_date:'' });
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([getPromotions(), getProducts()])
    .then(([pr,p]) => {
      Array.isArray(pr) && setPromos(pr);
      Array.isArray(p) && setProducts(p);
    }).catch(()=>{});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createPromotion(form); toast.success('✅ Promotion created!'); setShowForm(false); load(); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title={t.admin.promotions}>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
        <button onClick={()=>setShowForm(true)}
          style={{ background:'#E65100', color:'white', border:'none', borderRadius:12, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + Add Promotion 🎁
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              style={{ background:'white', borderRadius:22, padding:28, width:'100%', maxWidth:420 }}>
              <h2 style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Add Promotion</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Product *</label>
                  <select value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})} required
                    style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none' }}>
                    <option value="">Select product</option>
                    {products.map(p=><option key={p._id} value={p._id}>{p.name} — {p.price} MAD</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Discount % *</label>
                  <input type="number" min="1" max="99" value={form.discount_percentage} onChange={e=>setForm({...form,discount_percentage:e.target.value})} required
                    style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>Start</label>
                    <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required
                      style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#555', display:'block', marginBottom:4 }}>End</label>
                    <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} required
                      style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={()=>setShowForm(false)}
                    style={{ flex:1, background:'#f5f5f5', color:'#555', border:'none', borderRadius:12, padding:'11px', fontWeight:700, fontSize:13, cursor:'pointer' }}>Cancel</button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, background:'#E65100', color:'white', border:'none', borderRadius:12, padding:'11px', fontWeight:700, fontSize:13, cursor:'pointer', opacity:saving?0.7:1 }}>
                    {saving?'...':'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {promos.map((p,i) => (
          <motion.div key={p._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}
            style={{ background:'white', borderRadius:16, padding:'18px 22px', border:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontWeight:700, color:'#333', fontSize:15 }}>{p.product_id?.name||'Product'}</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#E65100', marginTop:4 }}>-{p.discount_percentage}%</div>
              <div style={{ fontSize:11, color:'#aaa' }}>{new Date(p.start_date).toLocaleDateString()} → {new Date(p.end_date).toLocaleDateString()}</div>
            </div>
            <button onClick={async()=>{ await deletePromotion(p._id); toast.success('Removed'); load(); }}
              style={{ background:'#FFEBEE', color:'#C62828', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              🗑️ Remove
            </button>
          </motion.div>
        ))}
        {promos.length===0 && <p style={{ color:'#aaa', textAlign:'center', padding:40 }}>No active promotions</p>}
      </div>
    </AdminLayout>
  );
}

// ─── Admin Messages ──────────────────────────────────────
export function AdminMessages() {
  const { t, lang } = useLang();
  // socket not needed - using polling
  const [convos, setConvos]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgs, setMsgs]         = useState([]);
  const [text, setText]         = useState('');

  useEffect(() => {
    getAllMessages().then(d => {
      if (!Array.isArray(d)) return;
      const map = {};
      d.forEach(m => {
        const uid = m.user_id?._id||m.user_id;
        if (!map[uid]) map[uid] = { user:m.user_id, messages:[] };
        map[uid].messages.push(m);
      });
      setConvos(Object.values(map));
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!selected) return;
    const poll = setInterval(async () => {
      try {
        const d = await getUserMessages(selected.user?._id);
        if (Array.isArray(d)) setMsgs(d);
      } catch {}
    }, 4000);
    return () => clearInterval(poll);
  }, [selected]);

  const openConvo = (c) => { setSelected(c); setMsgs(c.messages); };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()||!selected) return;
    try {
      const msg = await sendMessage({ text, user_id: selected.user?._id });
      setMsgs(prev => [...prev, msg]);
      setText('');
    } catch {}
  };

  return (
    <AdminLayout title={t.admin.messages}>
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:20, height:'70vh' }}>
        {/* Conversations */}
        <div style={{ background:'white', borderRadius:16, border:'1px solid #f0f0f0', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #f0f0f0', fontWeight:700, fontSize:13, color:'#333' }}>
            Conversations ({convos.length})
          </div>
          <div style={{ overflow:'auto', flex:1 }}>
            {convos.length===0 && <p style={{ color:'#aaa', fontSize:13, textAlign:'center', padding:20 }}>No messages</p>}
            {convos.map(c => (
              <button key={c.user?._id} onClick={()=>openConvo(c)}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 16px', background:selected?.user?._id===c.user?._id?'#E8F5E9':'transparent', border:'none', borderBottom:'1px solid #f5f5f5', cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:34, height:34, background:'#E8F5E9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#1B5E20', fontSize:13, flexShrink:0 }}>
                  {c.user?.name?.[0]?.toUpperCase()||'U'}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.user?.name||'User'}</div>
                  <div style={{ fontSize:11, color:'#aaa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.messages.slice(-1)[0]?.text||''}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        {!selected
          ? <div style={{ background:'white', borderRadius:16, border:'1px solid #f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:40 }}>💬</span>
              <span style={{ fontSize:14 }}>Select a conversation</span>
            </div>
          : <div style={{ background:'white', borderRadius:16, border:'1px solid #f0f0f0', display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #f0f0f0', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, background:'#E8F5E9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#1B5E20', fontSize:13 }}>
                  {selected.user?.name?.[0]?.toUpperCase()||'U'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'#333' }}>{selected.user?.name}</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{selected.user?.email}</div>
                </div>
              </div>
              <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                {msgs.map((m,i) => (
                  <div key={m._id||i} style={{ display:'flex', justifyContent:m.sender==='admin'?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'70%', padding:'10px 14px', borderRadius:16, fontSize:13, background:m.sender==='admin'?'#1B5E20':'#f5f5f5', color:m.sender==='admin'?'white':'#333' }}>
                      {m.text}
                      <div style={{ fontSize:10, marginTop:4, opacity:0.6 }}>
                        {new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} style={{ padding:12, borderTop:'1px solid #f0f0f0', display:'flex', gap:8 }}>
                <input value={text} onChange={e=>setText(e.target.value)} placeholder="Reply..."
                  style={{ flex:1, border:'1.5px solid #e0e0e0', borderRadius:12, padding:'9px 14px', fontSize:13, outline:'none' }}/>
                <button type="submit" style={{ background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  Send
                </button>
              </form>
            </div>
        }
      </div>
    </AdminLayout>
  );
}

export { AdminProducts as default };
