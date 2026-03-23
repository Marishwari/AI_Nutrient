import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword(){
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('id');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleReset(e){
    e.preventDefault();
    try {
      const r = await axios.post('http://localhost:5000/api/auth/reset-password', { token, userId, password });
      // store JWT and redirect
      localStorage.setItem('token', r.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`;
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Reset failed');
    }
  }

  if (!token || !userId) return <div>Invalid reset link</div>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">Set new password</h2>
      <form onSubmit={handleReset} className="space-y-3">
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="New password" className="w-full p-2 border"/>
        <button className="px-4 py-2 bg-black text-white rounded">Reset password</button>
      </form>
    </div>
  );
}
