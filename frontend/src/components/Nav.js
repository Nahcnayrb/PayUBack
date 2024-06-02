import {React, Component } from "react"
import { Link } from "react-router-dom"
export default class Nav extends Component {

    handleLogout = () => {
      localStorage.removeItem("token")
      this.props.setUser(null)

    }

    render() {

      let buttons;

      if (this.props.user) {
        // case logged in
        buttons = (

          <ul className='navbar-nav ml-auto'>
            <li  className='nav-item'>
              <Link className='nav-link' to={'/dashboard'} >Dashboard</Link>
            </li>
            <li  className='nav-item'>
              <Link className='nav-link'  to={'/'} >{this.props.user.firstName} {this.props.user.lastName}</Link>
            </li>
            <li  className='nav-item'>
              <Link className='nav-link' onClick={this.handleLogout} to={'/'} >Logout</Link>
            </li>
          </ul>
        )

      } else {
        buttons = (
          <ul className='navbar-nav ml-auto'>
          <li  className='nav-item'>
            <Link className='nav-link' to={'/login'} >Login</Link>
          </li>
          <li className='nav-item'>
            <Link className='nav-link' to={'/register'} >Sign Up</Link>
          </li>
        </ul>
        )

      }
        return (
        <nav className='navbar navbar-expand navbar-light fixed-top'>
        <div className='container'>
          <Link className='navbar-brand' to={'/'}>PayUBack</Link>
          <div className='collapse navbar-collapse'>
            {buttons}
          </div>
        </div>
      </nav>
        )
    }

}