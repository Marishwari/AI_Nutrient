import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setStatus('If that email exists, a reset link has been sent.');
    } catch (err) {
      setStatus('Failed to send reset link');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">Forgot password</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border"/>
        <button className="px-4 py-2 bg-black text-white rounded">Send reset link</button>
      </form>
      {status && <p className="mt-3">{status}</p>}
    </div>
  );
}
