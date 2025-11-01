"use client";
import { useState } from "react";
import Header from "../../components/Header";
import { supabase } from "../../integrations/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin } });
    alert("Письмо с входом отправлено. Проверьте почту.");
  };

  return (
    <>
      <Header />
      <div className="container section">
        <h1 className="h2">Войти</h1>
        <form className="login" onSubmit={submit}>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <button className="btn btn--primary">Получить ссылку для входа</button>
        </form>
      </div>
    </>
  );
}
