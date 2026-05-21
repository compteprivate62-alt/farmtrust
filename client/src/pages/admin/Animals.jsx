import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAnimals, createAnimal, updateAnimal, deleteAnimal } from '../../services/api';
import { AdminLayout } from './Dashboard';
import { useLang } from '../../context';

const EMPTY = { name:'', type:'cow', birth_date:'', description:'', for_sale:false, sale_price:'', sale_age:'', sale_weight:'' };
const TYPES  = ['cow','sheep','chicken','rabbit','other'];
const EMOJI  = { cow:'🐄', sheep:'🐑', chicken:'🐓', rabbit:'🐇', other:'🐾' };
const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api','');

const inp = { width:'100%', border:'1.5px solid #e0e0e0', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 };

export default function AdminAnimals() {
  const { t, lang } = useLang();
  const [animals,  setAnimals]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving,   setSaving]   = useState(false);

  const load = () => {
    getAnimals()
      .then(d => Array.isArray(d) && setAnimals(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(EMPTY); setImages([]); setPreviews([]); setShowForm(true);
  };
  const openEdit = (a) => {
    setEditing(a._id);
    setForm({ ...a, birth_date: a.birth_date?.slice(0,10) || '' });
    setImages([]); setPreviews([]); setShowForm(true);
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    // preview
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // append all form fields
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          fd.append(k, v);
        }
      });
      // append images
      images.forEach(img => fd.append('images', img));

      if (editing) {
        await updateAnimal(editing, fd);
        toast.success('✅ Animal updated!');
      } else {
        await createAnimal(fd);
        toast.success('✅ Animal added!');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this animal?')) return;
    try {
      await deleteAnimal(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title={lang==='ar'?'إدارة الحيوانات':lang==='fr'?'Gestion des animaux':'Animals Management'}>

      {/* Add button */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
        <button onClick={openAdd}
          style={{ background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'11px 22px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          + {lang==='ar'?'إضافة حيوان':lang==='fr'?'Ajouter animal':'Add Animal'}
        </button>
      </div>

      {/* ── Modal Form ──────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95 }}
              style={{ background:'white', borderRadius:24, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>

              <h2 style={{ fontSize:20, fontWeight:800, color:'#1a1a1a', marginBottom:22 }}>
                {editing
                  ? (lang==='ar'?'تعديل الحيوان':lang==='fr'?'Modifier animal':'Edit Animal')
                  : (lang==='ar'?'إضافة حيوان جديد':lang==='fr'?'Ajouter un animal':'Add New Animal')
                }
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Name + Type */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={lbl}>{lang==='ar'?'الاسم':'Nom'} *</label>
                    <input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required
                      onFocus={e=>e.target.style.borderColor='#1B5E20'} onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                  </div>
                  <div>
                    <label style={lbl}>{lang==='ar'?'النوع':'Type'} *</label>
                    <select style={inp} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                      {TYPES.map(tp=><option key={tp} value={tp}>{EMOJI[tp]} {tp}</option>)}
                    </select>
                  </div>
                </div>

                {/* Birth date */}
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>{lang==='ar'?'تاريخ الميلاد':'Date de naissance'}</label>
                  <input type="date" style={inp} value={form.birth_date} onChange={e=>setForm({...form,birth_date:e.target.value})}
                    onFocus={e=>e.target.style.borderColor='#1B5E20'} onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                </div>

                {/* Description */}
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>{lang==='ar'?'الوصف':'Description'}</label>
                  <textarea style={{ ...inp, resize:'vertical', minHeight:70 }} value={form.description}
                    onChange={e=>setForm({...form,description:e.target.value})}
                    onFocus={e=>e.target.style.borderColor='#1B5E20'} onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                </div>

                {/* Images upload */}
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>📸 {lang==='ar'?'الصور':'Photos'}</label>
                  <label style={{ display:'block', border:'2px dashed #C8E6C9', borderRadius:12, padding:'16px', textAlign:'center', cursor:'pointer', background:'#F9FFF9' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#1B5E20'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='#C8E6C9'}>
                    <div style={{ fontSize:28, marginBottom:4 }}>📁</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1B5E20' }}>
                      {lang==='ar'?'اختر صوراً':lang==='fr'?'Choisir des photos':'Choose photos'}
                    </div>
                    <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>JPG, PNG, WEBP</div>
                    <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display:'none' }}/>
                  </label>

                  {/* Image previews */}
                  {previews.length > 0 && (
                    <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                      {previews.map((url,i) => (
                        <div key={i} style={{ position:'relative' }}>
                          <img src={url} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:10, border:'2px solid #C8E6C9' }}/>
                          <button type="button" onClick={() => {
                            setPreviews(prev => prev.filter((_,j)=>j!==i));
                            setImages(prev => prev.filter((_,j)=>j!==i));
                          }} style={{ position:'absolute', top:-6, right:-6, background:'#C62828', color:'white', border:'none', borderRadius:'50%', width:18, height:18, fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing images when editing */}
                  {editing && form.images?.length > 0 && previews.length === 0 && (
                    <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                      {form.images.map((img,i) => (
                        <img key={i} src={img.startsWith("data:") ? img : `${API_BASE}${img}`} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:10, border:'2px solid #C8E6C9' }}/>
                      ))}
                      <div style={{ fontSize:11, color:'#888', alignSelf:'center' }}>
                        {lang==='ar'?'أضف صوراً جديدة لاستبدالها':lang==='fr'?'Ajoutez de nouvelles photos pour les remplacer':'Add new photos to replace'}
                      </div>
                    </div>
                  )}
                </div>

                {/* For sale toggle */}
                <div style={{ background:'#FFF8E1', borderRadius:14, padding:'14px 16px', marginBottom:14, border:'1px solid #FFE0B2' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="checkbox" checked={!!form.for_sale} onChange={e=>setForm({...form,for_sale:e.target.checked})}
                      style={{ width:18, height:18, accentColor:'#1B5E20', cursor:'pointer' }}/>
                    <span style={{ fontWeight:700, color:'#E65100', fontSize:14 }}>
                      🏷️ {lang==='ar'?'تفعيل بيع الحيوان كاملاً':lang==='fr'?'Activer la vente de l\'animal':'Enable full animal sale'}
                    </span>
                  </label>
                </div>

                {/* Sale details */}
                {form.for_sale && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
                    <div>
                      <label style={lbl}>Prix (MAD)</label>
                      <input type="number" style={inp} value={form.sale_price} onChange={e=>setForm({...form,sale_price:e.target.value})}
                        onFocus={e=>e.target.style.borderColor='#1B5E20'} onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                    </div>
                    <div>
                      <label style={lbl}>{lang==='ar'?'العمر':'Âge'}</label>
                      <input style={inp} placeholder="2 ans" value={form.sale_age} onChange={e=>setForm({...form,sale_age:e.target.value})}
                        onFocus={e=>e.target.style.borderColor='#1B5E20'} onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                    </div>
                    <div>
                      <label style={lbl}>Poids (kg)</label>
                      <input type="number" style={inp} value={form.sale_weight} onChange={e=>setForm({...form,sale_weight:e.target.value})}
                        onFocus={e=>e.target.style.borderColor='#1B5E20'} onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display:'flex', gap:10, marginTop:8 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, background:'#f5f5f5', color:'#555', border:'none', borderRadius:12, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    {lang==='ar'?'إلغاء':'Annuler'}
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer', opacity:saving?0.7:1 }}>
                    {saving ? '...' : (lang==='ar'?'حفظ':lang==='fr'?'Enregistrer':'Save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Animals Grid ─────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ width:36, height:36, border:'4px solid #1B5E20', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      ) : animals.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🐾</div>
          <p>{lang==='ar'?'لا توجد حيوانات':lang==='fr'?'Aucun animal':'No animals yet'}</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
          {animals.map((a,i) => (
            <motion.div key={a._id} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
              style={{ background:'white', borderRadius:18, border:'1px solid #f0f0f0', overflow:'hidden', boxShadow:'0 2px 12px #0001' }}>

              {/* Image */}
              <div style={{ height:140, background:'linear-gradient(135deg,#E8F5E9,#FFF8E1)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
                {a.images?.[0] ? (
                  <img src={a.images[0].startsWith("data:") ? a.images[0] : `${API_BASE}${a.images[0]}`} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <span style={{ fontSize:60 }}>{EMOJI[a.type]||'🐾'}</span>
                )}
                <span style={{ position:'absolute', top:8, right:8, background:a.status==='available'?'#E8F5E9':'#FFEBEE', color:a.status==='available'?'#1B5E20':'#C62828', fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:20 }}>
                  {a.status}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div style={{ fontWeight:700, color:'#1a1a1a', fontSize:15 }}>{a.name}</div>
                  {a.for_sale && <span style={{ fontSize:10, background:'#FFF8E1', color:'#E65100', fontWeight:800, padding:'2px 8px', borderRadius:20 }}>🏷️ Sale</span>}
                </div>
                <div style={{ fontSize:12, color:'#888', marginBottom:12 }}>{EMOJI[a.type]} {a.type}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => openEdit(a)}
                    style={{ flex:1, background:'#E8F5E9', color:'#1B5E20', border:'none', borderRadius:10, padding:'8px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    ✏️ {lang==='ar'?'تعديل':lang==='fr'?'Modifier':'Edit'}
                  </button>
                  <button onClick={() => handleDelete(a._id)}
                    style={{ flex:1, background:'#FFEBEE', color:'#C62828', border:'none', borderRadius:10, padding:'8px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    🗑️ {lang==='ar'?'حذف':lang==='fr'?'Supprimer':'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
