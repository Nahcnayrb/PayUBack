import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import { Button } from '@mui/material';
import ExpenseTable from './ExpenseTable';

export default class DetailsModal extends Component {



    handleClose = () => {
        this.props.setShow(false)
    }

    render() {
        return (
            <Modal
            className='addModal'
            show={this.props.show}
            onHide={this.handleClose}
            keyboard={false}
            size='xl'
            backdrop='static'>

                <Modal.Header className='modal-header'closeButton>
                <Modal.Title >
                    <h3>DETAILS</h3>
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label className='amount-label'>Details Modal</label>
                    <ExpenseTable 
                        headers={this.props.headers}
                        rows={this.props.rows} 
                        handleEdit={this.props.handleEdit} 
                        handleDelete={this.props.handleDelete}
                        handleClickEdit={this.props.handleClickEdit}
                        toggleIsOn={false}>
                    </ExpenseTable>
                </Modal.Body>
                <div className='modal-padding'></div>
                <Modal.Footer>
                </Modal.Footer>
                <div className='modal-padding'></div>
        </Modal>
        )

    }
}