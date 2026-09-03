import { 
  MessageSquare, 
  Map, 
  AlertTriangle, 
  BarChart3, 
  Settings 
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
      { label: 'Chat Assistant', to: '/dashboard', icon: MessageSquare },
      { label: 'Live Weather Map', to: '/dashboard/map', icon: Map },
      { label: 'Alerts & Warnings', to: '/dashboard/alerts', icon: AlertTriangle, badge: { text: '6', type: 'danger' } },
      { label: 'Climate Analytics', to: '/dashboard/climate', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    links: [
      { label: 'Settings', to: '/dashboard/settings', icon: Settings },
    ],
  },
]
