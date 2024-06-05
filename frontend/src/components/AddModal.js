import { Button } from '@mui/material';
import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select'
import NextModal from './NextModal';

export default class AddModal extends Component {

    
    state = {

    
    }


    resetDate = () => {

        var curr = new Date();
        curr.setDate(curr.getDate());
        var date = curr.toISOString().substring(0,10);

        this.setState({date: date})

    }

    componentDidMount() {
        this.clearAddData()
        this.clearMessages()
        this.resetDate()

    }

    handleNext = () => {

        let invalidPayerUserMessage=""
        let invalidInvolvedUsersMessage=""
        let invalidAmountMessage=""
        let payerUsername = ""

        console.log(this.state.payerUser)
        if (this.state.payerUser === "") {
            invalidPayerUserMessage = "A payer must be selected"
        } else {
            payerUsername = this.state.payerUser.value
        }

        if (this.state.involvedUsers.length === 0) {
            invalidInvolvedUsersMessage = "At least 1 person involved must be selected"
        } else {
            // case has an involved user
            // if there is exactly 1 involved user and that user is the paying user, show invalid message
            if ((this.state.involvedUsers.length === 1) && (this.state.involvedUsers[0].value === payerUsername)) {
                invalidInvolvedUsersMessage = "At least 1 involved person besides the payer must be selected"
            }
        }

        if (!parseFloat(this.state.amount) > 0) {
            invalidAmountMessage = "Amount cannot be empty or 0"
        }


        this.setState({
            invalidPayerUserMessage: invalidPayerUserMessage,
            invalidInvolvedUsersMessage: invalidInvolvedUsersMessage,
            invalidAmountMessage: invalidAmountMessage
        })



        if (invalidAmountMessage.length !== 0 ||invalidInvolvedUsersMessage.length !== 0 || invalidAmountMessage.length !== 0 ) {
            return
        }



        this.setShowNext(true)
        this.props.setShow(false)

    }

    setShowNext = show => {
        this.setState({
          showNext: show
        })
    }

    clearMessages = () => {

        this.setState({
            invalidPayerUserMessage: "",
            invalidInvolvedUsersMessage: "",
            invalidAmountMessage: "",
        })

    }


    clearAddData = () => {
        this.resetDate()
        this.setState({
            description: "",
            payerUser: "",
            involvedUsers: [],
            amount: 0
        })
    }


    handleClose = () => {
        this.setShowNext(false)
        this.props.setShow(false)
        this.clearMessages()
        this.clearAddData()

    }

    handlePrevious = () => {
        this.props.setShow(true)
        this.setShowNext(false)
        this.setState({
            invalidPayerUserMessage: "",
            invalidInvolvedUsersMessage: "",
            invalidAmountMessage: ""
        })
    }

    // handleCreate = () => {

    //     let borrowerUsernameArray = []

    //     this.state.involvedUsers.forEach((option) => {
    //         borrowerUsernameArray.push(option.value)
    //     })


    //     const data = {
    //         payerUsername: this.state.payerUser.value,
    //         borrowerUsernames : borrowerUsernameArray,
    //         amount: this.state.amount
    //     }

    //     console.log(data)
    //     axios.post('/expenses/add', data).then(
    //         res => {
    //             console.log(res)
    //         }
    //     ).catch(
    //         err => {
    //             console.log(err.response.data.message)
    //         }
    //     )

    //     this.setShowNext(false)
    //     this.props.setShow(false)
        
    // }

    


    render() {


        let usersArray = this.props.users

        let optionsArray = []

        if (usersArray != null) {
        usersArray.forEach((userJson) => {
            let option = {};
            if (userJson.username === this.props.currentUser.username) {
                // case curr user is the logged in user
                option = {
                    value: userJson.username,
                    label: "Me (@" + userJson.username + ")"
                }

            } else {
                option = {
                    value: userJson.username,
                    label: userJson.firstName + " " + userJson.lastName + " (@" + userJson.username + ")"
                }
            }

            optionsArray.push(option)
        })}

        let firstOptions = optionsArray

        let secondOptions = optionsArray

        let invalidInvolvedUsersError = ""

        if (this.state.invalidInvolvedUsersMessage) {
            invalidInvolvedUsersError = (
                <div className="alert alert-danger" role="alert">
                    {this.state.invalidInvolvedUsersMessage}
                </div>
        )}


        let invalidUserError = ""

        if (this.state.invalidPayerUserMessage) {
            invalidUserError = (
                <div className="alert alert-danger" role="alert">
                    {this.state.invalidPayerUserMessage}
                </div>
        )}
        


        let invalidAmountError = ""

        if (this.state.invalidAmountMessage) {
            invalidAmountError = (
                <div className="alert alert-danger" role="alert">
                    {this.state.invalidAmountMessage}
                </div>
        )}


        


        if (this.state.showNext) {

            return (
                <NextModal 
                    showNext={this.state.showNext}
                    handlePrevious={this.handlePrevious}
                    handleClose={this.handleClose}
                    involvedUsers={this.state.involvedUsers}
                    payerUser={this.state.payerUser}
                    setShowNext={this.setShowNext}
                    amount={this.state.amount}
                    description={this.state.description}
                    date={this.state.date}
                    setShow={this.props.setShow}
                 ></NextModal>
            )

        } else {

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
                            <h3>Add a new Expense</h3>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <label className='amount-label'>When did the expense occur?</label>
                                <input 
                                    aria-label="Date" 
                                    type="date"  
                                    onChange={e => this.setState({date: e.target.value})}
                                    value={this.state.date}
                                    />
                                <div className="padding"></div>

                                <label className='amount-label'>Expense Description</label>
                                <textarea 
                                    id="story" 
                                    name="story" 
                                    rows="5" 
                                    cols="35" 
                                    placeholder='Ex. What is the Expense?'
                                    onChange={e => this.setState({description: e.target.value})}
                                    value={this.state.description}
                                    >

                                
                                </textarea>

                                <div className="padding"></div>

                                <label className='amount-label'>Who paid / is paying?</label>
                                {invalidUserError}
                                <Select

                                    name="payer-user-select"
                                    options={secondOptions}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    closeMenuOnSelect={true}
                                    placeholder='Select the expense payer'
                                    value={this.state.payerUser}
                                    onChange={(choice) => this.setState({payerUser: choice})}
                                />
                                <div className="padding"></div>
                                <label className='amount-label' >Who is included in the expense?</label>
                                {invalidInvolvedUsersError}
                                <Select

                                    isMulti='true'
                                    name="involved-user-select"
                                    options={firstOptions}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    closeMenuOnSelect={false}
                                    blurInputOnSelect={false}
                                    placeholder='select the people included in the expense'
                                    value={this.state.involvedUsers}
                                    onChange={(choice) => this.setState({involvedUsers: choice})}
                                />
                                <div className="padding"></div>
                                <label className='amount-label'>Amount</label>
                                {invalidAmountError}
                                <CurrencyInput
                                    id="input-example"
                                    name="input-name"
                                    prefix='$ '
                                    allowNegativeValue={false}
                                    placeholder="$ 420.69"
                                    defaultValue={0}
                                    decimalsLimit={2}
                                    value={this.state.amount}
                                    onValueChange={(value) => this.setState({amount: value})}
                                />
                                <div className="padding"></div>
                        </Modal.Body>
                        <div className='modal-padding'></div>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.handleNext}>Next</Button>
                        </Modal.Footer>
                </Modal>
    )}}
}