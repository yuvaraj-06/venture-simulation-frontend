'use client';

import { useState, useEffect } from 'react';

interface VentureAccess {
  isUnlocked: boolean;
  checkoutUrl: string | null;
  loading: boolean;
}

export function useVentureAccess(ventureId: string): VentureAccess {
  const [state, setState] = useState<VentureAccess>({
    isUnlocked: false,
    checkoutUrl: null,
    loading: true,
  });

  useEffect(() => {
    if (!ventureId) {
      setState({ isUnlocked: true, checkoutUrl: null, loading: false });
      return;
    }

    fetch(`/api/venture-status/${ventureId}`)
      .then(r => r.json())
      .then(data => {
        setState({
          isUnlocked: data.features_unlocked === true,
          checkoutUrl: data.checkout_url || null,
          loading: false,
        });
      })
      .catch(() => {
        // On error, default to unlocked (don't block users)
        setState({ isUnlocked: true, checkoutUrl: null, loading: false });
      });
  }, [ventureId]);

  return state;
}
