
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HubService } from '../services/hubService';
import { LinkHub } from '../types';

const Dashboard: React.FC = () => {
  const [hubs, setHubs] = useState<LinkHub[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHubs(HubService.getAllHubs());
  }, []);

  const createNewHub = () => {
    const newHub = HubService.createDefaultHub();
    HubService.saveHub(newHub);
    navigate(`/edit/${newHub.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this hub?')) {
      HubService.deleteHub(id);
      setHubs(HubService.getAllHubs());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="bg-green-600 p-2 rounded-lg text-black">
              <i className="fa-solid fa-link"></i>
            </span>
            SmartLink <span className="text-green-500">Hub</span>
          </h1>
          <p className="text-gray-400 mt-2">Manage your intelligent link aggregators.</p>
        </div>
        <button 
          onClick={createNewHub}
          className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 transform active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          Create New Hub
        </button>
      </header>

      {hubs.length === 0 ? (
        <div className="bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl p-20 text-center">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-folder-open text-3xl text-zinc-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No hubs yet</h2>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            Get started by creating your first intelligent link page. Add rules, themes, and track your analytics.
          </p>
          <button 
            onClick={createNewHub}
            className="text-green-500 font-semibold hover:underline"
          >
            Create your first hub &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map(hub => (
            <div 
              key={hub.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-2xl p-6 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-950/30 text-green-500 px-3 py-1 rounded-full text-xs font-mono">
                  /{hub.slug}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(hub.id, e)}
                    className="text-zinc-500 hover:text-red-500 transition-colors p-2"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1 text-white truncate">{hub.title}</h3>
              <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{hub.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <i className="fa-solid fa-eye text-xs"></i>
                  <span>{hub.totalVisits} visits</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <i className="fa-solid fa-link text-xs"></i>
                  <span>{hub.links.length} links</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to={`/edit/${hub.id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 rounded-lg text-center text-sm transition-colors"
                >
                  Edit Hub
                </Link>
                <Link 
                  to={`/analytics/${hub.id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 rounded-lg text-center text-sm transition-colors"
                >
                  Analytics
                </Link>
                <a 
                  href={`#/hub/${hub.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="col-span-2 bg-green-600/10 border border-green-600/30 text-green-500 hover:bg-green-600/20 py-2 rounded-lg text-center text-sm transition-all"
                >
                  View Public Page
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
