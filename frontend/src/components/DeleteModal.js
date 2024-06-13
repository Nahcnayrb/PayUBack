import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import { Button } from '@mui/material';

export default class DeleteModal extends Component {
    state = {}

    resetButton = () => {
        this.setState({
            confirmClicked:false
        })
    }


    handleClick = () => {
        console.log("confirm clicked!")
        this.setState({
            confirmClicked: true
        })
        this.props.setConfirmDelete(true)
        setTimeout(() => {
            this.props.handleDelete(this.props.expenseId, this.props.description)
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
                            
                            <h3>Delete Expense</h3>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <label className='amount-label'>Are you sure you want to delete the Expense:"{this.props.description}"?
                                     This will delete the expense for everyone involved</label>
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