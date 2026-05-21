import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAnimals } from '../../services/api';
import { useCart, useLang } from '../../context';
import toast from 'react-hot-toast';

const TYPES = ['all','cow','sheep','chicken','rabbit','other'];
const EMOJI = { cow:'🐄', sheep:'🐑', chicken:'🐓', rabbit:'🐇', other:'🐾' };
const API_BASE = (process.env.REACT_APP_API_URL || '').replace('/api','');

export default function AnimalsPage() {
  const [animals,    setAnimals]    = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [loading,    setLoading]    = useState(true);
  const { addToCart } = useCart();
  const { t, lang }  = useLang();
  const isRTL = lang === 'ar';

  useEffect(() => {
    getAnimals()
      .then(d => {
        const data = Array.isArray(d) ? d : [];
        setAnimals(data);
        setFiltered(data);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(activeType === 'all' ? animals : animals.filter(a => a.type === activeType));
  }, [activeType, animals]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ width:40, height:40, border:'4px solid #1B5E20', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ maxWidth:1200, margin:'0 auto', padding:'28px 16px' }}>
      <h1 style={{ fontSize:26, fontWeight:800, color:'#1a1a1a', marginBottom:4 }}>
        {lang==='ar'?'حيواناتنا':lang==='fr'?'Nos Animaux':'Our Animals'}
      </h1>
      <p style={{ color:'#888', fontSize:14, marginBottom:24 }}>
        {lang==='ar'?'تصفح الحيوانات المتاحة':lang==='fr'?'Parcourir les animaux disponibles':'Browse available animals'}
      </p>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {TYPES.map(type => (
          <button key={type} onClick={() => setActiveType(type)}
            style={{ padding:'8px 16px', borderRadius:12, border:'1.5px solid', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              background: activeType===type ? '#1B5E20' : 'white',
              color:      activeType===type ? 'white'    : '#555',
              borderColor:activeType===type ? '#1B5E20'  : '#e0e0e0',
            }}>
            {type !== 'all' && EMOJI[type]} {type.charAt(0).toUpperCase()+type.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#aaa' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🌾</div>
          <p>{lang==='ar'?'لا توجد حيوانات':lang==='fr'?'Aucun animal trouvé':'No animals found'}</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
          {filtered.map((animal, i) => (
            <motion.div key={animal._id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
              whileHover={{ y:-4 }}
              style={{ background:'white', borderRadius:20, border:'1px solid #f0f0f0', overflow:'hidden', boxShadow:'0 2px 12px #0001', transition:'box-shadow 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 32px #0002'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 12px #0001'}>

              {/* Image */}
              <div style={{ height:200, background:'linear-gradient(135deg,#E8F5E9,#FFF8E1)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                {animal.images?.[0] ? (
                  <img src={animal.images[0].startsWith("data:") ? animal.images[0] : `${API_BASE}${animal.images[0]}`} alt={animal.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <span style={{ fontSize:80 }}>{EMOJI[animal.type]||'🐾'}</span>
                )}
                {/* Badges */}
                <span style={{ position:'absolute', top:12, right:12, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:animal.status==='available'?'#E8F5E9':'#FFEBEE', color:animal.status==='available'?'#1B5E20':'#C62828' }}>
                  {animal.status}
                </span>
                {animal.for_sale && (
                  <span style={{ position:'absolute', top:12, left:12, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#FFF8E1', color:'#E65100' }}>
                    🏷️ {lang==='ar'?'للبيع':lang==='fr'?'À vendre':'For sale'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding:'16px 18px' }}>
                <h3 style={{ fontSize:17, fontWeight:800, color:'#1a1a1a', marginBottom:2 }}>{animal.name}</h3>
                <p style={{ fontSize:13, color:'#888', marginBottom:8 }}>{EMOJI[animal.type]||'🐾'} {animal.type}</p>

                {animal.description && (
                  <p style={{ fontSize:13, color:'#555', lineHeight:1.55, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {animal.description}
                  </p>
                )}

                {/* Sale info */}
                {animal.for_sale && animal.status==='available' && (
                  <div style={{ background:'#FFF8E1', borderRadius:12, padding:'10px 12px', marginBottom:12, border:'1px solid #FFE0B2' }}>
                    <div style={{ fontWeight:800, color:'#E65100', fontSize:16 }}>{animal.sale_price} MAD</div>
                    <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
                      {lang==='ar'?'العمر':'Âge'}: {animal.sale_age} • {lang==='ar'?'الوزن':'Poids'}: {animal.sale_weight}kg
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', gap:8 }}>
                  <Link to={`/animals/${animal._id}`}
                    style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:12, border:'2px solid #1B5E20', color:'#1B5E20', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                    {lang==='ar'?'التفاصيل':lang==='fr'?'Détails':'Details'}
                  </Link>
                  {animal.for_sale && animal.status==='available' && (
                    <button onClick={() => {
                      addToCart({ _id:animal._id, name:animal.name, price:animal.sale_price, type:'animal', image:EMOJI[animal.type] });
                      toast.success(`${animal.name} ajouté! 🛒`);
                    }}
                      style={{ flex:1, padding:'10px', borderRadius:12, background:'#1B5E20', color:'white', border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      🛒 {lang==='ar'?'شراء':lang==='fr'?'Acheter':'Buy'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
