'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('Unauthorized');
    })
    .then(data => setUser(data))
    .catch(() => {
      localStorage.removeItem('token');
      router.push('/auth/login');
    });
  }, [router]);

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Mon Profil</h1>
      <div className="bg-white shadow rounded p-6 text-black">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rôle:</strong> {user.role}</p>
        <p><strong>Créé le:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          router.push('/auth/login');
        }}
        className="mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700"
      >
        Se déconnecter
      </button>
    </div>
  );
}
