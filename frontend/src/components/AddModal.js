import { Button } from '@mui/material';
import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select'
import NextModal from './NextModal';

export default class AddModal extends Component {
    
    state = {
        hasLoadedData:false,
        selectOptions:[],
        selectedGroup:{value:"individual", label:"No Group"},
        groupOptions:[],
        hasLoadedGroups: false
    }

    constructor(props) {
        super()
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



        if (invalidAmountMessage.length !== 0 ||invalidInvolvedUsersMessage.length !== 0 || invalidPayerUserMessage.length !== 0 ) {
            return
        }

        // check if current significant changes are equal to fetched changes
        // if no, we need to set editmadechanges=true to indicate not to use borrowerdata list later

        if (!this.props.isAdd) {
            // case edit

            let expenseJson = this.props.editExpenseData
            let borrowerDataList = expenseJson.borrowerDataList
            let currUserList = this.state.involvedUsers
            let involvedUserSet = new Set()
            let fetchedTotal = expenseJson.amount
            let currTotal = this.state.amount

            // both list's length must be equal
            // 

            // borrower data list should match 1:1 with current involved users
            // if not, we have significant change

            // curr total amount should match fetched total amount 
            // if not we have significant change

            if (fetchedTotal !== currTotal) {

                // case total has been changed
                // dont need to check involved users
                this.setEditMadeChanges(true)
            } else {
                // case total was not changed
                // need to check involved users


                if (currUserList.length === borrowerDataList.length) {

                    currUserList.forEach((involvedUser) => {
                        involvedUserSet.add(involvedUser.value)
                    })
                    // curr user list has the usernames of all the curr involved users

                    for (let i = 0; i < borrowerDataList.length; i++) {
                        let borrower = borrowerDataList[i]
                        if (!involvedUserSet.has(borrower.username)) {
                            this.setEditMadeChanges(true)
                        }
                    }

                } else {
                    // case not equals
                    // set significant change
                    this.setEditMadeChanges(true)
                }
            }
        }

        this.setShowNext(true)
        this.props.setShow(false)

    }

    setEditMadeChanges = (madeChange) => {
        this.setState({
            editMadeChanges: madeChange
        })
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
        this.setEditMadeChanges(false)

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

    createOption = (value, isUser) => {

        let option = {}

        if (isUser) {
            let label = this.getLabel(value)

            option = {
                value: value,
                label: label
            }
        } else {
            // case group option
            let label = this.getGroupLabel(value)
            option = {
                value: value,
                label: label
            }

        }

        return option

    }

    getGroupLabel = (groupId) => {
        let label = "No Group"
        if (this.props.groupsData != null) {
            for (let i = 0; i < this.props.groupsData.length; i++) {
                let currGroup = this.props.groupsData[i]
                if (currGroup.id === groupId) {
                    // found group
                    label = currGroup.groupName + " (ID: " + currGroup.id.substring(0,10) + "....)"
                    return label
                }
            }
        }
        return label

    }

    loadData = () => {
        console.log("load data lol")

        if (!this.props.editExpenseData || this.state.isLoaded) {
            // case editexpense data is empty or null
            // we would be in here if adding data

            if (!this.state.isLoaded) {
                this.updateSelectOptions({value:"individual", label:"No Group"})
            }
            return
        }

        // TODO: for the edit case, need to load groups selection & update selection options as well
        let expenseJson = this.props.editExpenseData

        let payerUsername = expenseJson.payerUsername
        let borrowerDataList = expenseJson.borrowerDataList
        let date = expenseJson.date
        let amount = expenseJson.amount
        let allUsers = this.props.users
        let groupId = expenseJson.groupId
    

        this.setState({
            fetchedTotal: amount
        })
     
        let involvedUsersOptions = []

        let groupLabel = this.getGroupLabel(groupId)

        let groupOption = {
            value: groupId,
            label: groupLabel
        }

        this.updateSelectOptions(groupOption)

        let payerLabel = this.getLabel(payerUsername)

        let payerUserOption = {

         value: payerUsername,
         label: payerLabel
        }

        borrowerDataList.forEach((borrowerData) => {

         allUsers.forEach((user) => {

             if (user.username === borrowerData.username) {
                 involvedUsersOptions.push(this.createOption(user.username, true))
             }
         })

        })

        // at this point, involvedusersoptions is filled with borrower options

         this.setState({
             description: expenseJson.description,
             involvedUsers: involvedUsersOptions,
             payerUser: payerUserOption,
             date: date,
             amount: amount,
             selectedGroup: groupOption
             
         })

    }


    getLabel = (username) => {

        let allUsers = this.props.users

        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i]
            if (user.username === username) {
                let name = ""
                if (username === this.props.currentUser.username) {
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

    updateSelectOptions = (groupSelection) => {
        console.log("updating select options")
        // sort through the list of ALL selections
        // find the ones that matches the username list of group selections
        // return those selections to each 
        let optionsArray = []
        let usersArray =this.props.users
        let groupUsernames = []

        if (groupSelection.value === "individual") {
            // case no group selected
            // selections array == all users
    
            if (usersArray != null) {
            usersArray.forEach((userJson) => {
                let option = this.createOption(userJson.username, true)
                optionsArray.push(option)
            })}

            this.setState({
                involvedUsers: []
            })

        } else {

            for (let i = 0; i < this.props.groupsData.length; i++) {
                let currGroup = this.props.groupsData[i]
                if (currGroup.id === groupSelection.value) {
                    groupUsernames = currGroup.usernames
                }
            }



            function checkUsername(user) {
                return groupUsernames.includes(user.username)
            }
    
            let filteredUsers = usersArray.filter(checkUsername)

            filteredUsers.forEach((userJson) => {
                let option = this.createOption(userJson.username, true)
                optionsArray.push(option)
            })
            this.setState({
                payerUser: "",
                involvedUsers: optionsArray
            })

        }

        this.setState({
            selectOptions: optionsArray,
            selectedGroup: groupSelection
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


        let groupOptions = [{value:"individual", label:"No Group"}]

        if (this.props.groupsData) {
            this.props.groupsData.forEach((group) => {
                let option = this.createOption(group.id, false)
                groupOptions.push(option)
                
            })
        }

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
            console.log(this.props.isInDetails)

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
                    editMadeChanges={this.state.editMadeChanges}
                    updateExpenses={this.props.updateExpenses}
                    isInDetails={this.props.isInDetails}
                    setInDetails={this.props.setInDetails}
                    selectedGroup={this.state.selectedGroup}
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
                                
                                <label className='amount-label'>Associated group</label>
                                <Select
                                name="payer-user-select"
                                // defaultValue={{value:"No group", label:"No Group"}}
                                options={groupOptions}
                                className="basic-multi-select"
                                closeMenuOnSelect={true}
                                value={this.state.selectedGroup}
                                placeholder='Select a group'
                                onChange={(choice) => {this.updateSelectOptions(choice)}}
                                />
                                <div className="padding"></div>

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
                                    options={this.state.selectOptions}
                                    className="basic-multi-select"
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
                                    options={this.state.selectOptions}
                                    className="basic-multi-select"
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
                        <div className='modal-padding'></div>
                        <div className='modal-padding'></div>
                        <div className='modal-padding'></div>
                </Modal>
    )}}
}