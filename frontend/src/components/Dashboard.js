import React,{Component} from 'react'
import Modal from 'react-bootstrap/Modal';
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CurrencyInput from 'react-currency-input-field';
import Multiselect from 'multiselect-react-dropdown';
import Select from 'react-select'
import { Navigate } from 'react-router-dom';
import AddModal from './AddModal';
import axios from 'axios';



export default class Dashboard extends Component {

    state = {};

    setShow = show => {
        this.setState({
          show: show
        })
      }

    handleClose = () => this.setShow(false)
    handleShow = () => {

        axios.get('users').then(
            res => {
                // res.data is a json array
                console.log(res.data)
                this.setState({
                    users: res.data
                })
  
            },
            err => {
                console.log(err)
            }
        )

        this.setShow(true)

    }



    render() {

        window.scrollTo(0, 0)

        if (!this.props.user) {
            // case not logged in
            return <Navigate to={'/'}/>
        }
    
        return (
            <>
            <div className='dashboard-padding'></div>
            <div className='dashboard-container'>

                <Button variant="contained" id="addButton" style={{backgroundColor: "#21b6ae" }} onClick={this.handleShow}>
                    <AddIcon></AddIcon>
                    New Expense
                </Button>

                <AddModal users={this.state.users} show={this.state.show} setShow={this.setShow} currentUser={this.props.user}></AddModal>



            </div>
            <div className='dashboard-padding'></div>
            <div className='dashboard-container'>

            <div className='owed-container'> 
                </div>

            </div>
            <div className='dashboard-padding'></div>
            <div className='dashboard-container'>
                <div className='owing-container'> 
                </div>
            </div>
            </>
        )
    }

}