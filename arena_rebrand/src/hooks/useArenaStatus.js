import { useState, useEffect } from 'react';

export function useArenaStatus() {
  const [status, setStatus] = useState('operational');
  const [patch, setPatch] = useState(null);
  const [loading, setLoading] = useState(false); // Start false - no backend needed

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status', { signal: AbortSignal.timeout(2000) });
        if (!response.ok) throw new Error('Status check failed');
        const data = await response.json();
        setStatus(data.status);
        
        if (data.status === 'patching' || data.status === 'offline') {
          const patchResponse = await fetch('/api/patch');
          if (patchResponse.ok) {
            const patchData = await patchResponse.json();
            setPatch(patchData);
          }
        }
      } catch {
        // Default to operational if API unavailable
        setStatus('operational');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { status, patch, loading };
}
