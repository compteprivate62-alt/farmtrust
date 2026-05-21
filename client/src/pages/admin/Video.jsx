import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AdminLayout } from './Dashboard';
import { useLang } from '../../context';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api','');
const token = () => localStorage.getItem('ft_token');

export default function AdminVideo() {
  const { t, lang } = useLang();
  const [current,  setCurrent]  = useState(null);   // { type:'upload'|'url', src:string }
  const [url,      setUrl]      = useState('');
  const [tab,      setTab]      = useState('upload'); // 'upload' | 'url'
  const [saving,   setSaving]   = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    fetch(`${API_BASE}/api/video`, { headers: { Authorization:`Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { if (d?.src) setCurrent(d); })
      .catch(() => {});
  }, []);

  /* ── Upload video file from PC ─────────────────────── */
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    if (file.size > 200 * 1024 * 1024) { toast.error('Max file size: 200MB'); return; }

    setSaving(true); setProgress(0);
    const fd = new FormData();
    fd.append('video', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)); };
      await new Promise((res, rej) => {
        xhr.onload  = () => res(JSON.parse(xhr.responseText));
        xhr.onerror = rej;
        xhr.open('POST', `${API_BASE}/api/video/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token()}`);
        xhr.send(fd);
      });
      const data = JSON.parse(xhr.responseText);
      setCurrent({ type:'upload', src: data.src });
      toast.success('✅ Video uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); setProgress(0); }
  };

  /* ── Save URL ──────────────────────────────────────── */
  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/video`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
        body: JSON.stringify({ type:'url', src:url.trim() }),
      });
      const d = await res.json();
      setCurrent(d);
      toast.success('✅ Video saved!');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  /* ── Remove ────────────────────────────────────────── */
  const handleRemove = async () => {
    if (!window.confirm('Remove video?')) return;
    await fetch(`${API_BASE}/api/video`, {
      method:'DELETE',
      headers:{ Authorization:`Bearer ${token()}` },
    });
    setCurrent(null); setUrl('');
    toast.success('Removed');
  };

  /* ── Embed URL helper ──────────────────────────────── */
  const toEmbed = (src) => src
    ?.replace('watch?v=','embed/')
    ?.replace('youtu.be/','www.youtube.com/embed/')
    ?.replace('shorts/','www.youtube.com/embed/');

  const isYT = (src) => src && (src.includes('youtube') || src.includes('youtu.be'));

  return (
    <AdminLayout title={`${t.admin.video} 🎬`}>
      <div style={{ maxWidth:700 }}>

        {/* Info box */}
        <div style={{ background:'#E8F5E9', borderRadius:14, padding:16, marginBottom:24, border:'1px solid #C8E6C9', fontSize:13, color:'#555', lineHeight:1.8 }}>
          <strong style={{ color:'#1B5E20' }}>📋 Instructions:</strong><br/>
          • Format: <strong>16:9</strong> (MP4, WebM, MOV — max 200MB)<br/>
          • OU lien YouTube / URL directe<br/>
          • La vidéo apparaît sur la page d'accueil pour tous les visiteurs
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'#f5f5f5', borderRadius:12, padding:4 }}>
          {[['upload','📁 Upload depuis PC'],['url','🔗 Lien URL']].map(([k,label]) => (
            <button key={k} onClick={()=>setTab(k)}
              style={{ flex:1, padding:'9px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer',
                background:tab===k?'white':'transparent', color:tab===k?'#1B5E20':'#888',
                boxShadow:tab===k?'0 1px 6px #0001':'none', transition:'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {tab === 'upload' && (
          <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e8e8e8', marginBottom:20 }}>
            <div onClick={() => !saving && fileRef.current?.click()}
              style={{ border:'2.5px dashed #C8E6C9', borderRadius:16, padding:'36px 20px', textAlign:'center', cursor:saving?'default':'pointer', transition:'border-color 0.2s', background:'#FAFAFA' }}
              onMouseEnter={e => !saving && (e.currentTarget.style.borderColor='#1B5E20')}
              onMouseLeave={e => (e.currentTarget.style.borderColor='#C8E6C9')}>
              <div style={{ fontSize:48, marginBottom:10 }}>🎬</div>
              <div style={{ fontWeight:700, color:'#1B5E20', fontSize:15, marginBottom:4 }}>
                {saving ? `Uploading... ${progress}%` : 'Cliquez pour choisir une vidéo'}
              </div>
              <div style={{ fontSize:12, color:'#aaa' }}>MP4, WebM, MOV — max 200MB — Format 16:9</div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" onChange={handleUpload} style={{ display:'none' }}/>

            {/* Progress bar */}
            {saving && progress > 0 && (
              <div style={{ marginTop:16, background:'#f0f0f0', borderRadius:8, height:8, overflow:'hidden' }}>
                <motion.div animate={{ width:`${progress}%` }} style={{ height:'100%', background:'#1B5E20', borderRadius:8 }}/>
              </div>
            )}
          </div>
        )}

        {/* URL tab */}
        {tab === 'url' && (
          <div style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e8e8e8', marginBottom:20 }}>
            <form onSubmit={handleSaveUrl}>
              <label style={{ fontSize:13, fontWeight:700, color:'#555', display:'block', marginBottom:8 }}>
                URL YouTube ou MP4 direct
              </label>
              <input value={url} onChange={e=>setUrl(e.target.value)} required
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ width:'100%', border:'1.5px solid #e0e0e0', borderRadius:12, padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:14 }}
                onFocus={e=>e.target.style.borderColor='#1B5E20'}
                onBlur={e=>e.target.style.borderColor='#e0e0e0'}/>
              <button type="submit" disabled={saving}
                style={{ background:'#1B5E20', color:'white', border:'none', borderRadius:12, padding:'11px 24px', fontWeight:700, fontSize:14, cursor:'pointer', opacity:saving?0.7:1 }}>
                💾 {saving?'Saving...':'Enregistrer'}
              </button>
            </form>
          </div>
        )}

        {/* Current video preview */}
        {current?.src && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            style={{ background:'#111', borderRadius:20, overflow:'hidden', boxShadow:'0 12px 40px #0003' }}>
            <div style={{ padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ color:'white', fontWeight:700, fontSize:13 }}>🎬 Aperçu — 16:9</span>
              <button onClick={handleRemove}
                style={{ background:'#C62828', color:'white', border:'none', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                🗑️ Supprimer
              </button>
            </div>
            {/* 16:9 container */}
            <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
              {current.type==='url' && isYT(current.src) ? (
                <iframe src={toEmbed(current.src)} allowFullScreen title="Video"
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}/>
              ) : (
                <video src={current.type==='upload' ? `${API_BASE}${current.src}` : current.src}
                  controls style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }}/>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
