import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import AppLayout from '../components/AppLayout'
import LandingPage from '../pages/LandingPage'

const FeaturesPage = lazy(() => import('../pages/FeaturesPage'))
const HowItWorksPage = lazy(() => import('../pages/HowItWorksPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'))

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
