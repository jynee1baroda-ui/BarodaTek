import { useArenaStats } from '../hooks/useArenaStats';

const Stat = ({ label, value, color, icon }) => (
  <div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    className="p-4 border border-arena-red rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-arena-red-glow transition-all text-center bg-arena-black/50 backdrop-blur animate-fadeIn"
  >
    {icon && <div className="text-2xl mb-2">{icon}</div>}
    <p className={`font-bold text-lg ${color || 'text-white'}`}>{value}</p>
    <p className="text-gray-400 text-sm uppercase tracking-wide">{label}</p>
  </div>
);

export default function ArenaStats() {
  const { stats, loading, error } = useArenaStats();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-pulse text-arena-red text-xl">
          🔄 LOADING ARENA STATS...
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-8 text-arena-red">
        ⚠️ STATS TEMPORARILY OFFLINE
      </div>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto animate-slideUp">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 glow-text-red">
          🏟️ LIVE ARENA STATS
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Stat 
            label="Active Users" 
            value={stats?.activeUsers || 0} 
            icon="👥"
            color="text-white"
          />
          <Stat 
            label="Page Views" 
            value={stats?.pageViews?.toLocaleString() || '0'} 
            icon="📊"
            color="text-white"
          />
          <Stat 
            label="API Requests" 
            value={`${stats?.apiRequests || 0}/min`} 
            icon="⚡"
            color="text-arena-red"
          />
          <Stat 
            label="Uptime" 
            value={`${stats?.uptime || 0}%`} 
            icon="✅"
            color="text-green-400"
          />
          <Stat 
            label="Port" 
            value="443" 
            icon="🔐"
            color="text-white"
          />
          <Stat 
            label="Status" 
            value={stats?.status?.toUpperCase() || 'UNKNOWN'} 
            icon={stats?.status === 'operational' ? '🟢' : '🔴'}
            color={stats?.status === 'operational' ? 'text-green-400' : 'text-arena-red'}
          />
        </div>

        {error && (
          <p className="text-center mt-4 text-sm text-gray-400">
            ⚠️ Using cached data - Live connection interrupted
          </p>
        )}
      </div>
    </section>
  );
}
