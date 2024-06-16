import { React, Component } from "react";
import { Button } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import { Link } from "react-router-dom"
import FavoriteIcon from '@mui/icons-material/Favorite';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Divider from '@mui/material/Divider';

export default class Home extends Component {

    state = {
        version: "Version 1.4"
    }

    setShow = (show) => {
        this.setState({
            show: show
        })
    }

    handleClose = () => {
        this.setShow(false)
    } 

    handleShow = () => {
        this.setShow(true)
    }


    render() {
   //     if (this.props.user) {
            // case logged in
            return (
                <>
                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                        <h3 className='welcome-headers'>
                            <RequestQuoteIcon fontSize="large" />
                            PayUBack {this.state.version}
                            </h3>
                        <Button variant="contained" id='patch-notes-button' style={{backgroundColor: "#003366"}} onClick={this.handleShow}>
                            View Patch Notes
                        </Button>
                        <Divider  sx={{ borderBottomWidth: 5 }}/>  
                        <div className="home-padding"/>
 
                        {this.props.user?
                        <>
                            <h3 className='welcome-headers'>Welcome back, {this.props.user.firstName} :)</h3>
                            <div className="padding"></div>
                            <h3 className='welcome-headers'>Click on Dashboard to manage your expenses.</h3>
                        </>
                        :
                        <>
                            <h2>You are not logged in :(</h2>
                            <div className="padding"></div>
                            <h3> Please log in or create a new account to continue.</h3>
                        </>

                        }

                        <Modal
                    className='addModal'
                    show={this.state.show}
                    onHide={this.handleClose}
                    keyboard={false}
                    size='xl'
                    onShow={this.loadData}
                    backdrop='static'>

                        <Modal.Header className='modal-header'closeButton>
                        <Modal.Title>
                            <h3>{this.state.version} Patch Notes</h3>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Modal.Title>
                                <h3>New Features</h3>
                            </Modal.Title>
                                <label className='amount-label'>- Added a new "Group by users" feature on dashboard that shows a list of all the users that have yet to pay / you have yet to pay</label>
                                <label className="amount-label">- Implemented the details popup, which shows expense details for the associated user</label>
                            <div className="dashboard-padding"></div>
                            <Modal.Title>
                                <h3>Bug Fixes</h3>
                            </Modal.Title>

                        </Modal.Body>
                        <div className='modal-padding'></div>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        </Modal.Footer>
                </Modal>

                        <div className="home-padding"/>
                        <Divider  sx={{ borderBottomWidth: 5 }}/>  

                        <label id='footnote-label'>Made with <FavoriteIcon fontSize="small"/> by <Link to={'https://www.linkedin.com/in/nahcnayrb/'} target="_blank" rel="noopener noreferrer">Bryan Chan</Link></label>
                    
                        </div>
                </div>
                </>

        )}
}