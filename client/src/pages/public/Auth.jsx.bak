import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, useLang } from '../../context';

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  const inp = { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:12, padding:'11px 16px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'system-ui' };

  const handle = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = mode === 'login'
        ? await login({ email:form.email, password:form.password })
        : await register(form);
      if (mode === 'register') {
        setWelcomeName(data.user?.name || form.name);
        setShowWelcome(true);
        setTimeout(() => navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard'), 3200);
      } else {
        toast.success(lang==='ar'?'مرحباً بعودتك!':lang==='fr'?'Bon retour !':'Welcome back!');
        navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (lang==='ar'?'حدث خطأ':lang==='fr'?'Erreur':'Something went wrong'));
    } finally { setLoading(false); }
  };

  if (showWelcome) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1B5E20,#66BB6A)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui' }}>
      <style>{`@keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      <div style={{ background:'white', borderRadius:28, padding:'50px 52px', textAlign:'center', maxWidth:420, width:'90%', animation:'popIn 0.6s ease forwards' }}>
        <div style={{ fontSize:80, animation:'bounce 1.2s ease infinite', marginBottom:20 }}>🎉</div>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#1B5E20', marginBottom:10 }}>{t.welcome_user}</h1>
        <p style={{ color:'#6b7280', fontSize:15, lineHeight:1.7, marginBottom:24 }}>
          {lang==='ar' ? `أهلاً ${welcomeName}! ${t.welcome_sub}` : lang==='fr' ? `Bonjour ${welcomeName}! ${t.welcome_sub}` : `Hello ${welcomeName}! ${t.welcome_sub}`}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:42, height:42, background:'linear-gradient(135deg,#2E7D32,#66BB6A)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'white', fontWeight:900, fontSize:16 }}>FT</span>
          </div>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontWeight:800, color:'#1B5E20', fontSize:20, lineHeight:1 }}>FarmTrust</div>
            <div style={{ fontSize:10, color:'#A1887F', letterSpacing:3 }}>BY RSHD</div>
          </div>
        </div>
        <p style={{ fontSize:12, color:'#9ca3af' }}>{lang==='ar'?'جاري التحويل...':lang==='fr'?'Redirection...':'Redirecting...'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0fdf4,#fef3c7)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui' }}>
      <div style={{ background:'white', borderRadius:24, padding:'40px 44px', width:'100%', maxWidth:420, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, justifyContent:'center' }}>
          <div style={{ width:44, height:44, background:'linear-gradient(135deg,#2E7D32,#66BB6A)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'white', fontWeight:900, fontSize:16 }}>FT</span>
          </div>
          <div>
            <div style={{ fontWeight:800, color:'#1B5E20', fontSize:20, lineHeight:1 }}>FarmTrust</div>
            <div style={{ fontSize:10, color:'#A1887F', letterSpacing:3 }}>BY RSHD</div>
          </div>
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#1f2937', marginBottom:4, textAlign:'center' }}>
          {mode==='login' ? (lang==='ar'?'تسجيل الدخول':lang==='fr'?'Connexion':'Sign in') : (lang==='ar'?'إنشاء حساب':lang==='fr'?'Créer un compte':'Create account')}
        </h1>
        <p style={{ color:'#9ca3af', textAlign:'center', fontSize:13, marginBottom:28 }}>FarmTrust by RSHD</p>
        <form onSubmit={handle}>
          {mode === 'register' && (
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>{lang==='ar'?'الاسم الكامل':lang==='fr'?'Nom complet':'Full name'}</label>
              <input style={inp} placeholder={lang==='ar'?'اسمك':lang==='fr'?'Votre nom':'Your name'} value={form.name} onChange={e => setForm({...form,name:e.target.value})} required onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
          )}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Email</label>
            <input type="email" style={inp} placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>{lang==='ar'?'كلمة المرور':lang==='fr'?'Mot de passe':'Password'}</label>
            <input type="password" style={inp} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          </div>
          <button type="submit" disabled={loading} style={{ width:'100%', background:loading?'#86efac':'#16a34a', color:'white', border:'none', borderRadius:12, padding:13, fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'system-ui' }}>
            {loading ? '...' : mode==='login' ? (lang==='ar'?'دخول':lang==='fr'?'Se connecter':'Sign in') : (lang==='ar'?'إنشاء الحساب':lang==='fr'?'Créer':'Create account')}
          </button>
        </form>
        <p style={{ textAlign:'center', fontSize:13, color:'#6b7280', marginTop:20 }}>
          {mode==='login'
            ? <>{lang==='ar'?'ليس لديك حساب؟':lang==='fr'?'Pas de compte ?':'No account?'}{' '}<Link to="/register" style={{ color:'#16a34a', fontWeight:700, textDecoration:'none' }}>{t.register}</Link></>
            : <>{lang==='ar'?'لديك حساب؟':lang==='fr'?'Déjà un compte ?':'Have an account?'}{' '}<Link to="/login" style={{ color:'#16a34a', fontWeight:700, textDecoration:'none' }}>{t.login}</Link></>
          }
        </p>
      </div>
    </div>
  );
}

export const Login    = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
export default Login;
