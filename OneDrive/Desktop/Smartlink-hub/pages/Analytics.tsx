
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HubService } from '../services/hubService';
import { LinkHub } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Analytics: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const [hub, setHub] = useState<LinkHub | null>(null);

  useEffect(() => {
    if (hubId) {
      const hubs = HubService.getAllHubs();
      const found = hubs.find(h => h.id === hubId);
      if (found) setHub(found);
    }
  }, [hubId]);

  if (!hub) return <div className="p-20 text-center">Loading...</div>;

  const chartData = hub.links.map(l => ({
    name: l.title,
    clicks: l.clickCount || 0
  })).sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <Link to="/" className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-2 block">
            <i className="fa-solid fa-chevron-left mr-2"></i> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-white">Hub <span className="text-green-500">Analytics</span></h1>
          <p className="text-zinc-500 mt-1">Detailed performance for "{hub.title}"</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => alert('Analytics exported as CSV')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
            >
                <i className="fa-solid fa-download"></i> Export Report
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1">Total Page Visits</span>
            <span className="text-4xl font-black text-white">{hub.totalVisits}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1">Total Link Clicks</span>
            <span className="text-4xl font-black text-green-500">{hub.links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0)}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1">Top Link</span>
            <span className="text-xl font-bold text-white truncate block">{chartData[0]?.name || 'N/A'}</span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-12">
        <h3 className="text-lg font-bold text-white mb-8">Click Distribution</h3>
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                        itemStyle={{ color: '#22c55e' }}
                    />
                    <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#3f3f46'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-zinc-800/50 border-b border-zinc-800">
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Link Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Clicks</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Last Clicked</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
                {hub.links.sort((a,b) => (b.clickCount || 0) - (a.clickCount || 0)).map(link => (
                    <tr key={link.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{link.title}</td>
                        <td className="px-6 py-4 text-right text-green-500 font-bold">{link.clickCount || 0}</td>
                        <td className="px-6 py-4 text-right text-zinc-500 text-sm">
                            {link.lastClicked ? new Date(link.lastClicked).toLocaleDateString() : 'Never'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
