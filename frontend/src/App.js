import './App.css';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

import React, {Component} from 'react'
import Home from './components/Home';
import Nav from './components/Nav';
import Register from './components/Register';
import Login from './components/Login';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';

export default class App extends Component {

  state = {}

  componentDidMount() {
    const token = localStorage.getItem("token")
    if (token !== null) {
      axios.get('login/' + token).then(
          res => {
              this.setUser(res.data)

          },
          err => {
              console.log(err)
          }
      )
  }
}

setUser = user => {
  this.setState({
    user: user
  })
}


  render() {
    return (
          <BrowserRouter>
          
              <div className='App'>
                <Nav user={this.state.user} setUser={this.setUser}/>
      
                <div className='auth-wrapper'>
                  <div className='auth-inner'>
                    <Routes>
                      <Route exact path='/' element={<Home user={this.state.user}/>}/>
                      <Route exact path='/login' element={<Login setUser={this.setUser}/>}/>
                      <Route exact path='/register' element={<Register setUser={this.setUser}/>}/>
                      <Route exact path='/dashboard' element={<Dashboard />}></Route>
                    </Routes>
                  </div>
                </div>
      
              </div>
        </BrowserRouter>
        
      )}

}

// function App() {
//   return (
//     <BrowserRouter>
    
//         <div className='App'>
//           <Nav/>

//           <div className='auth-wrapper'>
//             <div className='auth-inner'>
//               <Routes>
//                 <Route exact path='/' element={<Home/>}/>
//                 <Route exact path='/login' element={<Login/>}/>
//                 <Route exact path='/register' element={<Register/>}/>

//               </Routes>
//             </div>
//           </div>

//         </div>
//   </BrowserRouter>
  
// )}
// export default App;
