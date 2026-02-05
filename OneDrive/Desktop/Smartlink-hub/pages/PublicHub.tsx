
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { HubService } from '../services/hubService';
import { LinkHub, SmartLink, RuleType, DeviceType } from '../types';

const PublicHub: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [hub, setHub] = useState<LinkHub | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = HubService.getHubBySlug(slug);
      if (found) {
        setHub(found);
        HubService.logVisit(found.id);
      } else {
        setError(true);
      }
    }
  }, [slug]);

  const filteredLinks = useMemo(() => {
    if (!hub) return [];
    
    return hub.links.filter(link => {
      if (!link.active) return false;
      if (link.rules.length === 0) return true;

      return link.rules.every(rule => {
        switch (rule.type) {
          case RuleType.TIME: {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            return currentTime >= (rule.config.startTime || '00:00') && currentTime <= (rule.config.endTime || '23:59');
          }
          case RuleType.DEVICE: {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            if (rule.config.device === DeviceType.MOBILE) return isMobile;
            if (rule.config.device === DeviceType.DESKTOP) return !isMobile;
            return true;
          }
          case RuleType.LOCATION: {
            // In a real app, we'd use geolocation or IP-to-Country API
            // For this demo, location rules are considered passed if set to "Global"
            return rule.config.country === 'Global' || !rule.config.country;
          }
          case RuleType.PERFORMANCE: {
              return link.clickCount >= (rule.config.minClicks || 0);
          }
          default:
            return true;
        }
      });
    }).sort((a, b) => a.order - b.order);
  }, [hub]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-6xl font-black text-green-500 mb-4">404</h1>
        <p className="text-xl text-zinc-500">Hub not found. It might have been deleted or the link is incorrect.</p>
        <a href="#/" className="mt-8 inline-block bg-zinc-800 px-6 py-3 rounded-xl font-bold hover:bg-zinc-700 transition-all">Back Home</a>
      </div>
    </div>
  );

  if (!hub) return <div className="min-h-screen flex items-center justify-center text-zinc-500 animate-pulse">Loading Hub...</div>;

  const handleLinkClick = (linkId: string) => {
    HubService.logVisit(hub.id, linkId);
  };

  return (
    <div 
      className="min-h-screen pt-20 pb-20 px-6 text-center transition-colors duration-500"
      style={{ backgroundColor: hub.theme.backgroundColor }}
    >
      <div className="max-w-xl mx-auto">
        <div className="w-24 h-24 bg-zinc-900 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-zinc-800 shadow-xl">
            <i className="fa-solid fa-user text-3xl text-zinc-700"></i>
        </div>
        <h1 className="text-3xl font-extrabold mb-3" style={{ color: hub.theme.textColor }}>{hub.title}</h1>
        <p className="text-base opacity-70 mb-10 max-w-sm mx-auto" style={{ color: hub.theme.textColor }}>{hub.description}</p>

        <div className="space-y-4">
            {filteredLinks.map(link => (
                <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleLinkClick(link.id)}
                    className={`block w-full py-5 px-8 text-lg font-bold transition-all transform active:scale-[0.98] hover:scale-[1.02] shadow-lg group ${hub.theme.buttonStyle === 'outline' ? 'border-2' : ''}`}
                    style={{ 
                        backgroundColor: hub.theme.buttonStyle === 'outline' ? 'transparent' : hub.theme.primaryColor,
                        color: hub.theme.buttonStyle === 'outline' ? hub.theme.primaryColor : '#000000',
                        borderColor: hub.theme.primaryColor,
                        borderRadius: hub.theme.buttonStyle === 'pill' ? '999px' : hub.theme.buttonStyle === 'rounded' ? '16px' : '0'
                    }}
                >
                    {link.title}
                </a>
            ))}
            {filteredLinks.length === 0 && (
                <div className="py-20 text-zinc-600 italic">
                    No active links currently match your context.
                </div>
            )}
        </div>

        <footer className="mt-20 opacity-40 text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: hub.theme.textColor }}>
            Built with SmartLink Hub
        </footer>
      </div>
    </div>
  );
};

export default PublicHub;
