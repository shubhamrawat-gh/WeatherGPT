import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import router from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <LanguageProvider>
            <RouterProvider router={router} />
          </LanguageProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
