import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileLayout } from './components/layout/MobileLayout'
import { Home } from './pages/Home'
import { RhymeDetail } from './pages/RhymeDetail'
import { SplashScreen } from './pages/onboarding/SplashScreen'
import { AgeGate } from './pages/onboarding/AgeGate'
import { IntroCarousel } from './pages/onboarding/IntroCarousel'
import { AvatarCreator } from './pages/onboarding/AvatarCreator'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/age-gate" element={<AgeGate />} />
          <Route path="/intro" element={<IntroCarousel />} />
          <Route path="/avatar-create" element={<AvatarCreator />} />
          <Route path="/rhyme/:id" element={<RhymeDetail />} />
        </Routes>
      </MobileLayout>
    </BrowserRouter>
  )
}

export default App
