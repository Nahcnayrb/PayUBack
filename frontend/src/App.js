import './App.css';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

import React, {Component} from 'react'
import Home from './components/Home';
import Nav from './components/Nav';
import Register from './components/Register';
import Login from './components/Login';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';

export default class App extends Component {

  state = {
    fetchedUsers:false
  }

  componentDidMount() {
    const token = localStorage.getItem("token")
    if (token !== null) {
      axios.get('login/' + token).then(
          res => {
              this.setUser(res.data)
              if (!this.state.fetchedUsers) {
                this.fetchAllUsers()
              }
              setTimeout(()=>{}, 500)
              //this.fetchAllUsers()
          },
          err => {
              console.log(err)
          }
      )
  }
}

fetchAllUsers = async () => {
  await axios.get('users').then(
      res => {
          // res.data is a json array
          this.setState({
              fetchedUsers: true,
              users: res.data
          })

      },
      err => {
          console.log(err)
      }
  )
}

setUser = user => {
  this.setState({
    user: user
  })
}


  render() {
    return (
        //   <BrowserRouter>
          
        //       <div className='App'>
        //         <Nav user={this.state.user} setUser={this.setUser} users={this.state.users}/>

        //             <Routes>
        //               <Route exact path='/' element={<Home user={this.state.user}/>}/>
        //               <Route exact path='/login' element={<Login setUser={this.setUser}/>}/>
        //               <Route exact path='/register' element={<Register setUser={this.setUser}/>}/>
        //               <Route exact path='/dashboard' element={<Dashboard user={this.state.user} users={this.state.users}/>}></Route>
        //             </Routes>
      
        //       </div>
        // </BrowserRouter>

        <HashRouter>
          
        <div className='App'>
          <Nav user={this.state.user} setUser={this.setUser} users={this.state.users}/>

              <Routes>
                <Route exact path='/' element={<Home user={this.state.user}/>}/>
                <Route exact path='/login' element={<Login setUser={this.setUser}/>}/>
                <Route exact path='/register' element={<Register setUser={this.setUser}/>}/>
                <Route exact path='/dashboard' element={<Dashboard user={this.state.user} users={this.state.users}/>}></Route>
              </Routes>

        </div>
      </HashRouter>
        
      )}

}
