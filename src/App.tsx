import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/home'

function App() {

  return (
    <div className='relative min-h-screen'>
      <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/home' element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
