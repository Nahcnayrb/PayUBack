
import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import { Button } from '@mui/material';

export default class PayAllModal extends Component {

    state = {}

    resetButton = () => {
        this.setState({
            confirmClicked:false
        })
    }


    handleClick = () => {
        this.setState({
            confirmClicked: true
        })
        this.props.setPayAllConfirmation(true)
        setTimeout(() => {
            this.props.handlePayAll(this.props.payerUser, this.props.currentUser, this.props.amount)
        }, 200)
    }


    render() {

        return (
                <Modal
                    className='addModal'
                    show={this.props.show}
                    onHide={this.props.setShow}
                    keyboard={false}
                    size='xl'
                    onShow={this.resetButton}
                    backdrop='static'>

                        <Modal.Header className='modal-header'closeButton>
                        <Modal.Title >
                            
                            <h3>Pay All : {this.props.label}</h3>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <label className='amount-label'>Are you sure you want to mark ALL the expenses you owe {this.props.label} as "Paid"?</label>
                        </Modal.Body>
                        <div className='modal-padding'></div>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => {this.props.setShow(false)}}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={this.state.confirmClicked} onClick={() => {this.handleClick()}}>Confirm</Button>
                        </Modal.Footer>
                </Modal>
        )

    }

}