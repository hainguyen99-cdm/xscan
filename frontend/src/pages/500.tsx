export default function ServerError(): JSX.Element {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontSize:'2rem',fontWeight:600,color:'#111827'}}>500 - Server Error</h1>
        <p style={{marginTop:'0.5rem',color:'#6b7280'}}>An unexpected error occurred.</p>
        <a href="/" style={{marginTop:'1rem',display:'inline-block',background:'#000',color:'#fff',padding:'0.5rem 1rem',borderRadius:6}}>Go home</a>
      </div>
    </div>
  );
}


