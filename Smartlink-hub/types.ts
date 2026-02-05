
export enum DeviceType {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  ALL = 'all'
}

export enum RuleType {
  TIME = 'time',
  DEVICE = 'device',
  LOCATION = 'location',
  PERFORMANCE = 'performance'
}

export interface LinkRule {
  type: RuleType;
  config: {
    startTime?: string; // HH:mm
    endTime?: string;   // HH:mm
    device?: DeviceType;
    country?: string;
    minClicks?: number;
  };
}

export interface SmartLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  active: boolean;
  order: number;
  rules: LinkRule[];
  clickCount: number;
  lastClicked?: number;
}

export interface HubTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill' | 'outline';
}

export interface LinkHub {
  id: string;
  slug: string; // Unique URL part
  title: string;
  description: string;
  links: SmartLink[];
  theme: HubTheme;
  totalVisits: number;
  createdAt: number;
}

export interface AnalyticsEntry {
  hubId: string;
  linkId?: string;
  timestamp: number;
  device: string;
  location?: string;
}
