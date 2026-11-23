'use client';
import { useState } from 'react';
export default function AccessForm({ returnTo }: { returnTo: string }) {
  const [email,setEmail]=useState(''),[code,setCode]=useState(''),[sent,setSent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setMessage('');
    try {
      const response=await fetch('/auth/'+(sent?'verify-code':'request-code'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code,returnTo})});
      const result=await response.json();if(!response.ok)throw Error(result.error);
      if(sent)window.location.assign(result.returnTo);else{setSent(true);setMessage('Revisa tu correo e ingresa el código para continuar.');}
    } catch(error: any) { setMessage(error.message || 'No fue posible continuar. Intenta nuevamente.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="rpm-access-form"><label htmlFor="rpm-email">Correo electrónico</label><input id="rpm-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} readOnly={sent} />{sent&&<><label htmlFor="rpm-code">Código de acceso</label><input id="rpm-code" name="code" type="text" inputMode="numeric" pattern="[0-9]{6,10}" autoComplete="one-time-code" required minLength={6} maxLength={10} value={code} onChange={e=>setCode(e.target.value)} autoFocus /></>}<p className="rpm-access-message" role="status" aria-live="polite">{message}</p><button type="submit" disabled={busy}>{busy?'Un momento…':sent?'Entrar a mi cuenta':'Recibir código de acceso'}</button>{sent?<button className="rpm-access-secondary" type="button" disabled={busy} onClick={()=>{setSent(false);setCode('');setMessage('');}}>Cambiar correo o solicitar otro código</button>:<small>Te enviaremos un código. No necesitas una contraseña.</small>}</form>;
}
