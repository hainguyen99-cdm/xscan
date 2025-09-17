export default function NotFound(): JSX.Element {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontSize:'2rem',fontWeight:600,color:'#111827'}}>404 - Page Not Found</h1>
        <p style={{marginTop:'0.5rem',color:'#6b7280'}}>The page you are looking for does not exist.</p>
        <a href="/" style={{marginTop:'1rem',display:'inline-block',background:'#000',color:'#fff',padding:'0.5rem 1rem',borderRadius:6}}>Go home</a>
      </div>
    </div>
  );
}


