import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/forms/Login'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/about" element={<h2>About</h2>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
