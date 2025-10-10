// src/components/Loading.jsx
export default function Loading({ text = 'Carregando...' }) {
  return (
    <div style={{
      display:'flex', justifyContent:'center', alignItems:'center',
      padding:'24px', color:'#7a5a50', fontStyle:'italic'
    }}>
      {text}
    </div>
  );
}
