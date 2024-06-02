import {React, Component } from "react"
import { Link } from "react-router-dom"
import Dropdown from 'react-bootstrap/Dropdown';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
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
            <Dropdown>
              <Dropdown.Toggle variant="white" id="dropdown-basic" >
                {this.props.user.firstName} {this.props.user.lastName}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">My Profile</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Settings</Dropdown.Item>
                <Dropdown.Item onClick={this.handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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

          <Link className='navbar-brand' to={'/'}>
          <RequestQuoteIcon fontSize="large" />PayUBack
          </Link>
          <div className='collapse navbar-collapse' id='navbar-custom'>
            {buttons}
          </div>
        </div>
      </nav>
        )
    }

}