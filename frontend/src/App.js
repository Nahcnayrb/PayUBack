import './App.css';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

import React, {Component} from 'react'
import Home from './components/Home';
import Nav from './components/Nav';
import Register from './components/Register';
import Login from './components/Login';
import { Routes,Route } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import GroupDashboard from './components/GroupDashboard';
import Profile from './components/Profile';

export default class App extends Component {

  state = {
    fetchedUsers:false,
    hasFetchedGroups: false,
    hasFetched: false
  }

  componentDidMount() {

    this.fetchAfterLogin()
  }

  fetchAfterLogin = () => {
    const token = localStorage.getItem("token")

    if (!this.state.fetchedUsers) {
      // fetch users if haven't fetched
      this.fetchAllUsers()
    }

    if (token !== null) {
      // this gets called if we have a token
      this.fetchLoggedInUser(token)
    }

  }

  fetchLoggedInUser = async (token) => {

    axios.get('login/' + token).then(
      res => {
          this.setUser(res.data)
          setTimeout(this.fetchGroupsData, 50)
      },
      err => {
          console.log(err)
      }
  )

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

fetchGroupsData = () => {
  let username = this.state.user.username
  console.log(username)

  axios.get("/groups/" + username).then(
      res => {
          console.log("fetching groups data for curr user")
          res.data.sort((a,b) => a.groupName.localeCompare(b.groupName))
          this.setState({
              groupsData: res.data,
          })
      }
  ).catch(
      err => {
          this.setState({
              hasFetchedGroups: true,
              groupsData: []
          })
          console.log(err.response)

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

        <HashRouter>
          
        <div className='App'>
          <Nav user={this.state.user} setUser={this.setUser} users={this.state.users} groupsData={this.state.groupsData} fetchGroupsData={this.fetchGroupsData}/>

              <Routes>
                <Route exact path='/' element={<Home user={this.state.user}/>}/>
                <Route exact path='/login' element={<Login setUser={this.setUser} fetchAllUsers={this.fetchAllUsers}/>}/>
                <Route exact path='/register' element={<Register setUser={this.setUser}/>}/>
                <Route exact path='/dashboard' element={<Dashboard user={this.state.user} users={this.state.users}  groupsData={this.state.groupsData} isGeneralDashboard={true}/>}></Route>
                <Route exact path='/groups' element={<GroupDashboard user={this.state.user} users={this.state.users} groupsData={this.state.groupsData} fetchGroupsData={this.fetchGroupsData}/>}></Route>
                <Route exact path='/groups/:id' element={<Dashboard user={this.state.user} users={this.state.users} groupsData={this.state.groupsData} isGeneralDashboard={false} />}></Route>
                <Route exact path='/profile'  element={<Profile user={this.state.user} users={this.state.users} groupsData={this.state.groupsData} isGeneralDashboard={false} fetchLoggedInUser={this.fetchLoggedInUser}/>}></Route>

              </Routes>

        </div>
      </HashRouter>
        
      )}

}
