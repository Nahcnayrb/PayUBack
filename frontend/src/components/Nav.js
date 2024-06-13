import {React, Component } from "react"
import { Link } from "react-router-dom"
import Dropdown from 'react-bootstrap/Dropdown';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import AddModal from "./AddModal";
import axios from "axios";
export default class Nav extends Component {

  state = {
  }


  setShow = show => {

    this.setState({
      show: show
    })
}

  handleShow = () => {

      this.setShow(true)
  }

    handleLogout = () => {
      localStorage.removeItem("token")
      this.props.setUser(null)
      window.location.reload()

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
                <Dropdown.Item href="#/action-2">Groups</Dropdown.Item>
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
          <RequestQuoteIcon fontSize="large" />
          <label className='navbar-headers'>PayUBack</label>
          </Link>
          {this.props.user?
          <>
          <Button variant="contained" id="addButton" style={{backgroundColor: "#21b6ae"}} onClick={this.handleShow}>
            <AddIcon></AddIcon>
            <label className='navbar-headers'>New Expense</label>
          </Button>
          <AddModal isAdd={true} users={this.props.users} show={this.state.show} setShow={this.setShow} currentUser={this.props.user}></AddModal>
          </> : <></>}
          <div className="right-div">
            {buttons}
          </div>  
        </div>
      </nav>
        )
    }

}