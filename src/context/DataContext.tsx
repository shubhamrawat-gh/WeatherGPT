import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import type { WeatherAlert, RegionalClimateStat } from '../data/weatherMockData'
import { INITIAL_ALERTS, REGIONAL_CLIMATE_STATS } from '../data/weatherMockData'

export interface WeatherStats {
  totalAlerts: number
  extremeAlerts: number
  severeAlerts: number
  moderateAlerts: number
  activeMonsoonSubdivisions: number
  avgNationalHumidity: number
}

interface DataContextType {
  alerts: WeatherAlert[]
  climateStats: RegionalClimateStat[]
  stats: WeatherStats
  severityFilter: string
  setSeverityFilter: (severity: string) => void
  regionFilter: string
  setRegionFilter: (region: string) => void
  addAlert: (alert: Omit<WeatherAlert, 'id' | 'issuedAt'>) => WeatherAlert
  dismissAlert: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>(INITIAL_ALERTS)
  const [climateStats] = useState<RegionalClimateStat[]>(REGIONAL_CLIMATE_STATS)
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [regionFilter, setRegionFilter] = useState<string>('ALL')

  const addAlert = useCallback((newAlertData: Omit<WeatherAlert, 'id' | 'issuedAt'>) => {
    const newAlert: WeatherAlert = {
      ...newAlertData,
      id: `alt-${Date.now()}`,
      issuedAt: 'Just now',
    }
    setAlerts((prev) => [newAlert, ...prev])
    return newAlert
  }, [])

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const stats: WeatherStats = useMemo(() => {
    const extreme = alerts.filter((a) => a.severity === 'extreme').length
    const severe = alerts.filter((a) => a.severity === 'severe').length
    const moderate = alerts.filter((a) => a.severity === 'moderate').length
    const activeSub = climateStats.filter((c) => c.monsoonStatus === 'Active' || c.monsoonStatus === 'Vigorous').length
    const avgHumid = Math.round(
      climateStats.reduce((sum, c) => sum + c.humidity, 0) / (climateStats.length || 1)
    )

    return {
      totalAlerts: alerts.length,
      extremeAlerts: extreme,
      severeAlerts: severe,
      moderateAlerts: moderate,
      activeMonsoonSubdivisions: activeSub,
      avgNationalHumidity: avgHumid,
    }
  }, [alerts, climateStats])

  const contextValue = useMemo(
    () => ({
      alerts,
      climateStats,
      stats,
      severityFilter,
      setSeverityFilter,
      regionFilter,
      setRegionFilter,
      addAlert,
      dismissAlert,
    }),
    [alerts, climateStats, stats, severityFilter, regionFilter, addAlert, dismissAlert]
  )

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
}

export const useData = (): DataContextType => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
