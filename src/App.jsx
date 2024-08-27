import React from 'react'
import ChatBox from './Component/chatBox/ChatBox'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MobileOTP from './Component/MobileOTP/MobileOTP'


function App() {
  return (
    <BrowserRouter>
      <Routes>
     
        <Route path='/chatbox' element={<ChatBox/>}/>
        <Route path='/' element={<MobileOTP/>}/>

       
     
      </Routes>
    </BrowserRouter>

  )
}

export default App