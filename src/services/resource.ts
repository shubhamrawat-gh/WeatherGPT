export interface ResourceContact {
  phone?: string
  email?: string
  radioChannel?: string
}

export interface ResourceLocation {
  latitude: number
  longitude: number
  address?: string
}

export type ResourceAvailability = 'available' | 'limited' | 'critical' | 'inactive'
export type ResourceVerification = 'verified' | 'pending' | 'unverified'

export interface Resource {
  id: string
  name: string
  category: string
  location: ResourceLocation
  capacity?: {
    current: number
    max: number
    unit?: string
  }
  availability: ResourceAvailability
  verification: ResourceVerification
  contact?: ResourceContact
  updatedAt: string
}

export interface ResourceCategory {
  id: string
  name: string
  iconName: string
  description: string
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'hospitals',
    name: 'Hospitals',
    iconName: 'HeartPulse',
    description: 'Emergency rooms, field medical facilities, triage centers, and mobile clinics.'
  },
  {
    id: 'shelters',
    name: 'Shelters',
    iconName: 'Home',
    description: 'Short-term lodging, evacuation safe houses, and emergency tents.'
  },
  {
    id: 'food_supply',
    name: 'Food Supply',
    iconName: 'Utensils',
    description: 'Food banks, volunteer kitchens, ration distribution hubs, and supply depots.'
  },
  {
    id: 'water_supply',
    name: 'Water Supply',
    iconName: 'Droplet',
    description: 'Potable water stations, purification units, and bulk storage reservoirs.'
  },
  {
    id: 'medical_camps',
    name: 'Medical Camps',
    iconName: 'ShieldAlert',
    description: 'Responder first-aid bases, field pharmacies, and psychiatric care tents.'
  },
  {
    id: 'rescue_teams',
    name: 'Rescue Teams',
    iconName: 'Users',
    description: 'Urban search & rescue, water squads, canine units, and drone spotters.'
  },
  {
    id: 'emergency_centers',
    name: 'Emergency Centers',
    iconName: 'Activity',
    description: 'Local command bases, radio network control points, and coordination rooms.'
  },
  {
    id: 'volunteer_groups',
    name: 'Volunteer Groups',
    iconName: 'HandHelping',
    description: 'Spontaneous responder squads, community coordinators, and translators.'
  }
]
