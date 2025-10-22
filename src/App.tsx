import './App.css'
import { Route, Routes } from 'react-router-dom'
import Download from '@/pages/download'
import Home from '@/pages/home'

function App() {

  return (
    <div className='relative min-h-screen'>
      <Routes>
        <Route path='/' element={<Download />} />
        <Route path='/home' element={<Home />} />
        <Route path='/download' element={<Download />} />
      </Routes>
    </div>
  )
}

export default App
