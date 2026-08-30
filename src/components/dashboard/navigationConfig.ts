import { 
  LayoutDashboard, 
  ShieldAlert, 
  Flame, 
  Activity, 
  Brain, 
  TrendingUp, 
  FileText, 
  Users, 
  Key, 
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
    title: 'Monitoring',
    links: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Live Incidents', to: '/dashboard/incidents', icon: ShieldAlert, badge: { text: '14', type: 'danger' } },
      { label: 'Wildfires', to: '/dashboard/maps', icon: Flame },
      { label: 'Earthquakes', to: '/dashboard/maps/layers', icon: Activity }
    ]
  },
  {
    title: 'Intelligence',
    links: [
      { label: 'AI Insights', to: '/dashboard/analysis', icon: Brain },
      { label: 'Analytics', to: '/dashboard/analysis/results', icon: TrendingUp },
      { label: 'Reports', to: '/dashboard/help/history', icon: FileText }
    ]
  },
  {
    title: 'Administration',
    links: [
      { label: 'Team', to: '/dashboard/settings', icon: Users },
      { label: 'API Access', to: '/dashboard/settings', icon: Key },
      { label: 'Settings', to: '/dashboard/settings', icon: Settings }
    ]
  }
]
