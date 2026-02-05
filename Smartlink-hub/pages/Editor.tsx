
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HubService } from '../services/hubService';
import { GeminiService } from '../services/geminiService';
import { LinkHub, SmartLink, RuleType, DeviceType } from '../types';
import { COUNTRIES } from '../constants';

const Editor: React.FC = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const [hub, setHub] = useState<LinkHub | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'settings'>('links');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (hubId) {
      const allHubs = HubService.getAllHubs();
      const found = allHubs.find(h => h.id === hubId);
      if (found) setHub(found);
      else navigate('/');
    }
  }, [hubId, navigate]);

  if (!hub) return <div className="p-20 text-center">Loading...</div>;

  const save = (updatedHub: LinkHub) => {
    setHub(updatedHub);
    HubService.saveHub(updatedHub);
  };

  const addLink = () => {
    const newLink: SmartLink = {
      id: crypto.randomUUID(),
      title: 'New Link',
      url: 'https://',
      active: true,
      order: hub.links.length,
      rules: [],
      clickCount: 0
    };
    save({ ...hub, links: [...hub.links, newLink] });
  };

  const updateLink = (id: string, updates: Partial<SmartLink>) => {
    const updatedLinks = hub.links.map(l => l.id === id ? { ...l, ...updates } : l);
    save({ ...hub, links: updatedLinks });
  };

  const deleteLink = (id: string) => {
    save({ ...hub, links: hub.links.filter(l => l.id !== id) });
  };

  const addRule = (linkId: string) => {
    const updatedLinks = hub.links.map(l => {
      if (l.id === linkId) {
        return {
          ...l,
          rules: [...l.rules, { type: RuleType.TIME, config: { startTime: '09:00', endTime: '17:00' } }]
        };
      }
      return l;
    });
    save({ ...hub, links: updatedLinks });
  };

  const updateRule = (linkId: string, ruleIndex: number, config: any) => {
      const updatedLinks = hub.links.map(l => {
          if (l.id === linkId) {
              const rules = [...l.rules];
              rules[ruleIndex] = { ...rules[ruleIndex], config: { ...rules[ruleIndex].config, ...config } };
              return { ...l, rules };
          }
          return l;
      });
      save({ ...hub, links: updatedLinks });
  };

  const handleMagicFill = async (link: SmartLink) => {
    if (!link.url || link.url === 'https://') return;
    setIsGenerating(true);
    const suggestion = await GeminiService.suggestLinkMetadata(link.url);
    if (suggestion) {
      updateLink(link.id, { title: suggestion.title });
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar Controls */}
      <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 flex flex-col border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <Link to="/" className="text-zinc-500 hover:text-white transition-colors">
            <i className="fa-solid fa-chevron-left mr-2"></i> Dashboard
          </Link>
          <div className="flex gap-2">
            <button onClick={() => save(hub)} className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all">
              Save Changes
            </button>
            <a href={`#/hub/${hub.slug}`} target="_blank" rel="noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
              Preview <i className="fa-solid fa-up-right-from-square ml-1 text-xs"></i>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800">
          {(['links', 'design', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'text-green-500 border-green-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {activeTab === 'links' && (
            <>
              <div className="space-y-4">
                {hub.links.map((link, idx) => (
                  <div key={link.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 transition-all hover:border-zinc-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="cursor-grab text-zinc-600 hover:text-zinc-400">
                        <i className="fa-solid fa-grip-vertical"></i>
                      </div>
                      <input 
                        className="bg-transparent border-none text-white font-bold text-lg focus:ring-0 w-full p-0"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                        placeholder="Link Title"
                      />
                      <button 
                        onClick={() => deleteLink(link.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                        <input 
                          className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:border-green-500 outline-none transition-all"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          placeholder="https://your-link.com"
                        />
                      </div>
                      <button 
                        onClick={() => handleMagicFill(link)}
                        disabled={isGenerating}
                        className="bg-zinc-800 hover:bg-zinc-700 text-green-500 px-3 py-2 rounded-lg text-sm border border-zinc-700 disabled:opacity-50"
                        title="AI Magic Suggest"
                      >
                        <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                      </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rules</h4>
                            <button onClick={() => addRule(link.id)} className="text-xs text-green-500 hover:underline">+ Add Rule</button>
                        </div>
                        {link.rules.map((rule, ridx) => (
                            <div key={ridx} className="bg-black/40 border border-zinc-800 rounded-lg p-3 space-y-3">
                                <div className="flex items-center gap-2">
                                    <select 
                                        className="bg-zinc-800 border-none rounded px-2 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-green-500"
                                        value={rule.type}
                                        onChange={(e) => {
                                            const updatedLinks = [...hub.links];
                                            const l = updatedLinks.find(l => l.id === link.id);
                                            if (l) l.rules[ridx].type = e.target.value as RuleType;
                                            save({...hub, links: updatedLinks});
                                        }}
                                    >
                                        <option value={RuleType.TIME}>Time-Based</option>
                                        <option value={RuleType.DEVICE}>Device-Based</option>
                                        <option value={RuleType.LOCATION}>Location-Based</option>
                                    </select>
                                    <button 
                                        onClick={() => {
                                            const updatedLinks = [...hub.links];
                                            const l = updatedLinks.find(l => l.id === link.id);
                                            if (l) l.rules.splice(ridx, 1);
                                            save({...hub, links: updatedLinks});
                                        }}
                                        className="ml-auto text-zinc-600 hover:text-red-500"
                                    >
                                        <i className="fa-solid fa-xmark text-xs"></i>
                                    </button>
                                </div>
                                
                                {rule.type === RuleType.TIME && (
                                    <div className="flex items-center gap-2">
                                        <input type="time" className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white" value={rule.config.startTime} onChange={e => updateRule(link.id, ridx, {startTime: e.target.value})} />
                                        <span className="text-zinc-600 text-xs">to</span>
                                        <input type="time" className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white" value={rule.config.endTime} onChange={e => updateRule(link.id, ridx, {endTime: e.target.value})} />
                                    </div>
                                )}

                                {rule.type === RuleType.DEVICE && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => updateRule(link.id, ridx, {device: DeviceType.MOBILE})}
                                            className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${rule.config.device === DeviceType.MOBILE ? 'bg-green-600/20 border-green-600 text-green-500' : 'border-zinc-800 text-zinc-500'}`}
                                        >
                                            Mobile Only
                                        </button>
                                        <button 
                                            onClick={() => updateRule(link.id, ridx, {device: DeviceType.DESKTOP})}
                                            className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${rule.config.device === DeviceType.DESKTOP ? 'bg-green-600/20 border-green-600 text-green-500' : 'border-zinc-800 text-zinc-500'}`}
                                        >
                                            Desktop Only
                                        </button>
                                    </div>
                                )}

                                {rule.type === RuleType.LOCATION && (
                                    <select 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300"
                                        value={rule.config.country}
                                        onChange={e => updateRule(link.id, ridx, {country: e.target.value})}
                                    >
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={addLink}
                className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:text-green-500 hover:border-green-500/50 hover:bg-green-500/5 transition-all flex items-center justify-center gap-2 font-bold"
              >
                <i className="fa-solid fa-plus"></i>
                Add New Link
              </button>
            </>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8">
              <section>
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Color Scheme</h4>
                <div className="grid grid-cols-4 gap-4">
                  {['#22c55e', '#3b82f6', '#ef4444', '#eab308'].map(color => (
                    <button 
                      key={color}
                      onClick={() => save({...hub, theme: {...hub.theme, primaryColor: color}})}
                      className={`h-10 rounded-full border-4 transition-all ${hub.theme.primaryColor === color ? 'border-white scale-110' : 'border-zinc-900 hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Button Style</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(['rounded', 'pill', 'square', 'outline'] as const).map(style => (
                    <button 
                      key={style}
                      onClick={() => save({...hub, theme: {...hub.theme, buttonStyle: style}})}
                      className={`py-3 px-4 border text-sm font-semibold transition-all ${hub.theme.buttonStyle === style ? 'bg-green-600 border-green-600 text-black' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                      style={{ borderRadius: style === 'pill' ? '999px' : style === 'rounded' ? '12px' : '0' }}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Public URL Slug</label>
                <div className="flex">
                  <span className="bg-zinc-800 border border-zinc-800 border-r-0 rounded-l-lg px-3 py-2 text-zinc-500 text-sm">hub/</span>
                  <input 
                    className="flex-1 bg-black border border-zinc-800 rounded-r-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                    value={hub.slug}
                    onChange={(e) => save({...hub, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Page Title</label>
                <input 
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                  value={hub.title}
                  onChange={(e) => save({...hub, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none h-24 resize-none"
                  value={hub.description}
                  onChange={(e) => save({...hub, description: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-950 p-12 overflow-hidden">
        <div className="w-[380px] h-[780px] bg-black border-[12px] border-zinc-900 rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden">
            {/* Mock Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20"></div>
            
            <div className="flex-1 overflow-y-auto pt-16 px-8 pb-12 scrollbar-hide text-center" style={{ backgroundColor: hub.theme.backgroundColor }}>
                <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-zinc-900">
                    <i className="fa-solid fa-user text-3xl text-zinc-600"></i>
                </div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: hub.theme.textColor }}>{hub.title || 'Your Title'}</h1>
                <p className="text-sm opacity-60 mb-8" style={{ color: hub.theme.textColor }}>{hub.description || 'Add a description in settings'}</p>

                <div className="space-y-4">
                    {hub.links.map(link => (
                        <div 
                            key={link.id}
                            className={`w-full py-4 px-6 text-sm font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer ${hub.theme.buttonStyle === 'outline' ? 'border-2' : ''}`}
                            style={{ 
                                backgroundColor: hub.theme.buttonStyle === 'outline' ? 'transparent' : hub.theme.primaryColor,
                                color: hub.theme.buttonStyle === 'outline' ? hub.theme.primaryColor : '#000000',
                                borderColor: hub.theme.primaryColor,
                                borderRadius: hub.theme.buttonStyle === 'pill' ? '999px' : hub.theme.buttonStyle === 'rounded' ? '12px' : '0'
                            }}
                        >
                            {link.title}
                        </div>
                    ))}
                    {hub.links.length === 0 && (
                        <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 text-sm">
                            No links added yet
                        </div>
                    )}
                </div>

                <div className="mt-12 opacity-30 text-[10px] uppercase tracking-widest font-bold" style={{ color: hub.theme.textColor }}>
                    Powered by SmartLink Hub
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
