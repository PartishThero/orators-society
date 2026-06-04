// App.jsx — root component with React Router routes
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import ArchivePage from './pages/ArchivePage'
import LegacyPage from './pages/LegacyPage'
import StagePage from './pages/StagePage'
import AdminPage from './pages/AdminPage'
import ClickSpark from './components/ui/ClickSpark'
import Navbar from './components/layout/Navbar'
import useSmoothScroll from './hooks/useSmoothScroll'

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
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/legacy" element={<LegacyPage />} />
        <Route path="/stage" element={<StagePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  useSmoothScroll()

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <ClickSpark sparkColor="#C5A872" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <AnimatedRoutes />
      </ClickSpark>
    </BrowserRouter>
  )
}

