import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ClickSpark from './components/ui/ClickSpark'
import { SmoothCursor } from './components/ui/SmoothCursor'
import Navbar from './components/layout/Navbar'
import useSmoothScroll from './hooks/useSmoothScroll'
import { DataProvider } from './context/DataContext'

const HomePage = lazy(() => import('./pages/HomePage'))
const ArchivePage = lazy(() => import('./pages/ArchivePage'))
const LegacyPage = lazy(() => import('./pages/LegacyPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/legacy" element={<LegacyPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  useSmoothScroll()

  return (
    <DataProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ClickSpark sparkColor="#bcb669ff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
          <SmoothCursor />
          <Navbar />
          <AnimatedRoutes />
        </ClickSpark>
      </BrowserRouter>
    </DataProvider>
  )
}


