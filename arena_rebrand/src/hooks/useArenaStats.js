import { useState, useEffect } from 'react';

export function useArenaStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/arena-stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        // Fallback to mock data if API unavailable
        setStats({
          activeUsers: Math.floor(Math.random() * 50) + 10,
          pageViews: Math.floor(Math.random() * 10000) + 5000,
          apiRequests: Math.floor(Math.random() * 100) + 50,
          uptime: 99.9,
          status: 'operational'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
