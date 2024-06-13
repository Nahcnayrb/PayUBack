import { Button } from '@mui/material';
import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select'
import NextModal from './NextModal';
import { CompareSharp } from '@material-ui/icons';
import { toHaveStyle } from '@testing-library/jest-dom/matchers';

export default class AddModal extends Component {

    
    state = {
        hasLoadedData:false

    
    }



    resetDate = () => {

        var curr = new Date();
        curr.setDate(curr.getDate());
        var date = curr.toISOString().substring(0,10);

        this.setState({date: date})

    }

    componentDidMount() {
        // first load
        this.clearMessages()
        this.clearAddData()
        this.resetDate()


    }

    handleNext = () => {

        // validate data shown on Add/Edit Modal

        let invalidPayerUserMessage=""
        let invalidInvolvedUsersMessage=""
        let invalidAmountMessage=""
        let payerUsername = ""


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
        this.setDataIsLoaded(false)

    }

    handlePrevious = () => {
        // if we're here, we definitely came back from nextModal
        this.props.setShow(true)
        this.setShowNext(false)
        this.setState({
            invalidPayerUserMessage: "",
            invalidInvolvedUsersMessage: "",
            invalidAmountMessage: ""
        })
    }

    createOption = (userJson) => {

        let option = {}

        let label = this.getLabel(userJson.username)

        option = {
            value: userJson.username,
            label: label
        }

        return option

    }

    loadData = () => {


        if (!this.props.editExpenseData || this.state.isLoaded) {
            // case editexpense data is empty or null
            // we would be in here if adding data
            return
        }

        let expenseJson = this.props.editExpenseData

        let payerUsername = expenseJson.payerUsername
        let borrowerDataList = expenseJson.borrowerDataList
        let date = expenseJson.date
        let amount = expenseJson.amount
        let allUsers = this.props.users

        this.setState({
            fetchedTotal: amount
        })
     
        let involvedUsersOptions = []

        let payerLabel = this.getLabel(payerUsername)

        let payerUserOption = {

         value: payerUsername,
         label: payerLabel
        }
        let payerUserIsAssigned = false

        borrowerDataList.forEach((borrowerData) => {

         allUsers.forEach((user) => {

             if (user.username == borrowerData.username) {
                 involvedUsersOptions.push(this.createOption(user))
             }
         })

        })

        // at this point, involvedusersoptions is filled with borrower options

         this.setState({
             description: expenseJson.description,
             involvedUsers: involvedUsersOptions,
             payerUser: payerUserOption,
             date: date,
             amount: amount
         })

    }


    getLabel = (username) => {

        let allUsers = this.props.users

        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i]
            if (user.username == username) {
                let name = ""
                if (username == this.props.currentUser.username) {
                    // case user is logged in user
                    name = "Me"
                } else {
                    // found user
                    name = user.firstName + " " + user.lastName 
                }

                name += (" (@" + username + ")")
                return name
            } 
        }
        // case cannot find user
        return ""

    }

    setDataIsLoaded = (isLoaded) => {
        this.setState({
            isLoaded: isLoaded
        })
        
    }

    


    render() {


        if (!this.props.currentUser) {
            // case not logged in
            return (
                <>
                <div className='dashboard-padding'></div>
                <div className='dashboard-container'></div>
                </>
            )
        }

        let usersArray =this.props.users

        let optionsArray = []

        if (usersArray != null) {
        usersArray.forEach((userJson) => {
            let option = this.createOption(userJson)
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
                    isAdd={this.props.isAdd}
                    editExpenseData={this.props.editExpenseData}
                    showNext={this.state.showNext}
                    handlePrevious={this.handlePrevious}
                    handleClose={this.handleClose}
                    involvedUsers={this.state.involvedUsers}
                    payerUser={this.state.payerUser}
                    setShowNext={this.setShowNext}
                    setDataIsLoaded={this.setDataIsLoaded}
                    amount={this.state.amount}
                    description={this.state.description}
                    date={this.state.date}
                    setShow={this.props.setShow}
                    currentUser={this.props.currentUser}
                    users={this.props.users}
                    originalTotal={this.state.fetchedTotal}
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
                    onShow={this.loadData}
                    backdrop='static'>

                        <Modal.Header className='modal-header'closeButton>
                        <Modal.Title >
                            
                            <h3>{this.props.isAdd? "Add a new Expense" : "Edit Expense"}</h3>
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