import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import FeaturesPage from '../pages/FeaturesPage'
import HowItWorksPage from '../pages/HowItWorksPage'
import ContactPage from '../pages/ContactPage'

// WeatherGPT Dashboard Layout & Pages (Lazy-Loaded)
import DashboardLayout from '../components/dashboard/DashboardLayout'

const ChatAssistant = lazy(() => import('../pages/dashboard/ChatAssistant'))
const LiveMapPage = lazy(() => import('../pages/dashboard/LiveMapPage'))
const AlertsPage = lazy(() => import('../pages/dashboard/AlertsPage'))
const ClimatePage = lazy(() => import('../pages/dashboard/ClimatePage'))
const SettingsPage = lazy(() => import('../pages/dashboard/SettingsPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <LandingPage />,
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
        element: <LoginPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <ChatAssistant />,
      },
      {
        path: 'map',
        element: <LiveMapPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'climate',
        element: <ClimatePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])

export default router
