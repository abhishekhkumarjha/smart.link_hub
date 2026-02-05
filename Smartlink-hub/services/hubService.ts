
import { LinkHub, SmartLink, AnalyticsEntry } from '../types';
import { MOCK_HUBS_KEY, ANALYTICS_KEY, DEFAULT_THEME } from '../constants';

export const HubService = {
  getAllHubs: (): LinkHub[] => {
    const data = localStorage.getItem(MOCK_HUBS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getHubBySlug: (slug: string): LinkHub | undefined => {
    const hubs = HubService.getAllHubs();
    return hubs.find(h => h.slug === slug);
  },

  saveHub: (hub: LinkHub) => {
    const hubs = HubService.getAllHubs();
    const index = hubs.findIndex(h => h.id === hub.id);
    if (index >= 0) {
      hubs[index] = hub;
    } else {
      hubs.push(hub);
    }
    localStorage.setItem(MOCK_HUBS_KEY, JSON.stringify(hubs));
  },

  deleteHub: (id: string) => {
    const hubs = HubService.getAllHubs();
    const filtered = hubs.filter(h => h.id !== id);
    localStorage.setItem(MOCK_HUBS_KEY, JSON.stringify(filtered));
  },

  createDefaultHub: (): LinkHub => ({
    id: crypto.randomUUID(),
    slug: `user-${Math.floor(Math.random() * 10000)}`,
    title: 'My Smart Links',
    description: 'Welcome to my dynamic hub!',
    links: [],
    theme: { ...DEFAULT_THEME },
    totalVisits: 0,
    createdAt: Date.now(),
  }),

  logVisit: (hubId: string, linkId?: string) => {
    const analytics: AnalyticsEntry[] = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    analytics.push({
      hubId,
      linkId,
      timestamp: Date.now(),
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    });
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));

    // Update hub stats
    const hubs = HubService.getAllHubs();
    const hub = hubs.find(h => h.id === hubId);
    if (hub) {
      if (!linkId) {
        hub.totalVisits += 1;
      } else {
        const link = hub.links.find(l => l.id === linkId);
        if (link) {
          link.clickCount = (link.clickCount || 0) + 1;
          link.lastClicked = Date.now();
        }
      }
      HubService.saveHub(hub);
    }
  },

  getAnalytics: (hubId: string) => {
    const analytics: AnalyticsEntry[] = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    return analytics.filter(a => a.hubId === hubId);
  }
};
