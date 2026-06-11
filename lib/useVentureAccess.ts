'use client';

import { useState, useEffect } from 'react';

interface VentureAccess {
  isUnlocked: boolean;
  checkoutUrl: string | null;
  pipelineRunning: boolean;
  loading: boolean;
}

export function useVentureAccess(ventureId: string): VentureAccess {
  const [state, setState] = useState<VentureAccess>({
    isUnlocked: false,
    checkoutUrl: null,
    pipelineRunning: false,
    loading: true,
  });

  useEffect(() => {
    if (!ventureId) {
      setState({ isUnlocked: true, checkoutUrl: null, pipelineRunning: false, loading: false });
      return;
    }

    fetch(`/api/venture-status/${ventureId}`)
      .then(r => r.json())
      .then(data => {
        setState({
          isUnlocked: data.features_unlocked === true,
          checkoutUrl: data.checkout_url || null,
          pipelineRunning: data.pipeline_running === true,
          loading: false,
        });
      })
      .catch(() => {
        setState({ isUnlocked: true, checkoutUrl: null, pipelineRunning: false, loading: false });
      });
  }, [ventureId]);

  return state;
}
