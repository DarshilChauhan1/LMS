import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/forms/Login'
import { Provider } from 'react-redux'
import store from './store/store'

function App() {

  return (
    <Provider store={store}>
    <BrowserRouter>
      
    </BrowserRouter>
    </Provider>
  )
}

export default App
