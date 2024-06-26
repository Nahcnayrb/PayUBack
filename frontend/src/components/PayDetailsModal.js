import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import { Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default class PayDetailsModal extends Component {
     
    state={
        copyClicked: false
    }





    render() {
        // payer user object
        // amount

        if (!this.props.payerUser) {
            return (
                <></>
            )
        }

        return (
            <Modal
                className='addModal'
                show={this.props.show}
                onHide={this.props.handleClose}
                keyboard={false}
                size='xl'
                backdrop='static'>

                    <Modal.Header className='modal-header'closeButton>
                    <Modal.Title >
                        
                        <h3>{this.props.payerUser.firstName + " " + this.props.payerUser.lastName} : {this.props.amount}</h3>
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.payerUser.email?
                            <label className='amount-label'>
                                E-tranfer Email: {this.props.payerUser.email}
                                <Button variant="secondary" onClick={() => {this.setState({copyClicked:true}); navigator.clipboard.writeText(this.props.payerUser.email)}}>
                                    <ContentCopyIcon></ContentCopyIcon> 
                                    {this.state.copyClicked? "Copied!": ""}
                                </Button>
                            </label>
                            :
                            <label className='amount-label'>
                                {this.props.payerUser.firstName + " " + this.props.payerUser.lastName + " "} 
                                did not specify an email address. Please reach out to them for payment directions :)
                            
                            </label>
                    
                    }
                        <div className='modal-padding'></div>
                    </Modal.Body>
                    <div className='modal-padding'></div>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => {this.props.handleClose()}}>
                        OK
                    </Button>
                    </Modal.Footer>
            </Modal>
        )
    }

}