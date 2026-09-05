import { 
  MessagesSquare, 
  Radar, 
  ShieldAlert, 
  AreaChart, 
  SlidersHorizontal 
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: any
  badge?: {
    text: string
    type: 'danger' | 'success' | 'info' | 'warning'
  }
}

export interface NavGroup {
  title: string
  links: NavItem[]
}

export const navigationConfig: NavGroup[] = [
  {
    title: 'Intelligence',
    links: [
      { label: 'Chats', to: '/dashboard', icon: MessagesSquare },
      { label: 'Live Weather Map', to: '/dashboard/map', icon: Radar },
      { label: 'Alerts & Warnings', to: '/dashboard/alerts', icon: ShieldAlert, badge: { text: '6 Active', type: 'success' } },
      { label: 'Climate Analytics', to: '/dashboard/climate', icon: AreaChart },
    ],
  },
  {
    title: 'System',
    links: [
      { label: 'Settings & Units', to: '/dashboard/settings', icon: SlidersHorizontal },
    ],
  },
]
