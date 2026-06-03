'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SimulationPage() {
  const params = useParams();
  const ventureId = (params?.ventureId as string) || '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ventureId) return;
    
    fetch(`/api/simulation/${ventureId}`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch((e: any) => {
        setError(String(e));
        setLoading(false);
      });
  }, [ventureId]);

  if (loading) {
    return <div style={{background:'#000',color:'#fff',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading {ventureId}...</div>;
  }

  if (error) {
    return (
      <div style={{background:'#000',color:'#f55',minHeight:'100vh',padding:40}}>
        <h1>Error: {error}</h1>
        <a href="/" style={{color:'#3B82F6'}}>Back</a>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{background:'#000',color:'#fff',minHeight:'100vh',padding:40}}>
        <h1>No data</h1>
        <a href="/" style={{color:'#3B82F6'}}>Back</a>
      </div>
    );
  }

  // Dynamic import with no SSR
  const SimDash = require('@/components/SimulationDashboard').default;
  return <SimDash simulation={data} />;
}