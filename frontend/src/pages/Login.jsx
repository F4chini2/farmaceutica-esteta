import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login(){
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const entrar = async (e) => {
    e.preventDefault();
    if(!email || !senha){ alert('Informe e-mail e senha.'); return; }
    try{
      setCarregando(true);
      const res = await fetch('http://localhost:3001/login', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if(res.ok && data?.token){
        localStorage.setItem('token', data.token);
        navigate('/usuarios');
      }else{
        alert(data?.erro || 'Falha no login');
      }
    }catch(err){
      alert('Erro de conexão no login');
    }finally{
      setCarregando(false);
    }
  };

  return (
    <div style={{maxWidth:420, margin:'60px auto'}} className="container-box">
      <h2>Acessar conta</h2>
      <form onSubmit={entrar} style={{display:'grid', gap:12}}>
        <label>E-mail
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label>Senha
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
        </label>
        <button className="btn-primary" type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
