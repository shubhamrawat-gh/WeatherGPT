import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import FeaturesPage from '../pages/FeaturesPage'
import HowItWorksPage from '../pages/HowItWorksPage'
import ContactPage from '../pages/ContactPage'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute'

import { lazy } from 'react'

// Dashboard layout and pages (lazy-loaded)
import DashboardLayout from '../components/dashboard/DashboardLayout'

const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'))
const MapsPage = lazy(() => import('../pages/dashboard/MapsPage'))
const MapDefaultPage = lazy(() => import('../pages/dashboard/MapDefaultPage'))
const MapResourcesPage = lazy(() => import('../pages/dashboard/MapResourcesPage'))
const MapIncidentsPage = lazy(() => import('../pages/dashboard/MapIncidentsPage'))
const MapLayersPage = lazy(() => import('../pages/dashboard/MapLayersPage'))
const IncidentsPage = lazy(() => import('../pages/dashboard/IncidentsPage'))
const NewIncidentPage = lazy(() => import('../pages/dashboard/NewIncidentPage'))
const HelpPage = lazy(() => import('../pages/dashboard/HelpPage'))
const NewHelpRequestPage = lazy(() => import('../pages/dashboard/NewHelpRequestPage'))
const HelpHistoryPage = lazy(() => import('../pages/dashboard/HelpHistoryPage'))
const SettingsPage = lazy(() => import('../pages/dashboard/SettingsPage'))
const AnalysisPage = lazy(() => import('../pages/dashboard/AnalysisPage'))
const NewAnalysisPage = lazy(() => import('../pages/dashboard/NewAnalysisPage'))
const AnalysisResultsPage = lazy(() => import('../pages/dashboard/AnalysisResultsPage'))
const ResourceDashboardPage = lazy(() => import('../pages/dashboard/ResourceDashboardPage'))
const DiscoverResourcesPage = lazy(() => import('../pages/dashboard/DiscoverResourcesPage'))
const ResourceCategoriesPage = lazy(() => import('../pages/dashboard/ResourceCategoriesPage'))
const ManageResourcesPage = lazy(() => import('../pages/dashboard/ManageResourcesPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>,
      },
      {
        path: 'features',
        element: <FeaturesPage />,
      },
      {
        path: 'how-it-works',
        element: <HowItWorksPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'login',
        element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>,
      },
      {
        path: 'forgot-password',
        element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>,
      },
      {
        path: 'reset-password',
        element: <PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        path: '',
        element: <DashboardHome />,
      },
      {
        path: 'maps',
        element: <MapsPage />,
        children: [
          {
            path: '',
            element: <MapDefaultPage />,
          },
          {
            path: 'resources',
            element: <MapResourcesPage />,
          },
          {
            path: 'incidents',
            element: <MapIncidentsPage />,
          },
          {
            path: 'layers',
            element: <MapLayersPage />,
          },
        ],
      },
      {
        path: 'incidents',
        element: <IncidentsPage />,
      },
      {
        path: 'incidents/new',
        element: <NewIncidentPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
      {
        path: 'help/request',
        element: <NewHelpRequestPage />,
      },
      {
        path: 'help/history',
        element: <HelpHistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'analysis',
        element: <AnalysisPage />,
      },
      {
        path: 'analysis/new',
        element: <NewAnalysisPage />,
      },
      {
        path: 'analysis/results',
        element: <AnalysisResultsPage />,
      },
      {
        path: 'resources',
        element: <ResourceDashboardPage />,
      },
      {
        path: 'resources/discover',
        element: <DiscoverResourcesPage />,
      },
      {
        path: 'resources/categories',
        element: <ResourceCategoriesPage />,
      },
      {
        path: 'resources/manage',
        element: <ManageResourcesPage />,
      },
    ],
  },
])
export default router

