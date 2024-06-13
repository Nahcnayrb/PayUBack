import { Button } from '@mui/material';
import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';


import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import CurrencyInput from 'react-currency-input-field';

export default class NextModal extends Component {


    constructor(props) {
        super(props)


        // by default, split equally if is add modal

        if (this.props.isAdd) {

            let rows = []

            this.props.involvedUsers.forEach((involvedUser) => {
                // value = username
                // label = first last + username
                let name = involvedUser.label
                let hasPaid = (involvedUser.value === this.props.payerUser.value)


                let row = {
                    label: name,
                    hasPaid: hasPaid,
                    amount: 0,
                    username: involvedUser.value
                }
                rows.push(row)
            })

            
            this.state={
                splitEqually: true,
                rows: rows
            }
        } else {
            // case edit
            // load rows

            let rows = []
            let expenseJson = this.props.editExpenseData
            let borrowerDataList = expenseJson.borrowerDataList

            let total = this.props.amount
            let remaining = total
            let resetAmounts = false

            if (this.props.originalTotal != total) {
                // case the total was changed by user 
                resetAmounts = true
            }

            // if the curr total is different from the total loaded from database, set all amounts to 0
            borrowerDataList.forEach((borrower) => {
                let borrowerUsername = borrower.username
                let label = this.getLabel(borrowerUsername)
                let hasPaid = borrower.hasPaid

                let amount = borrower.amount
                if (resetAmounts) {
                    amount = 0;
                }
                remaining =  (remaining - amount).toFixed(2)

                let rowData = {
                    label: label,
                    username: borrowerUsername,
                    hasPaid: hasPaid,
                    amount: amount
                }
                rows.push(rowData)
    
            })
            this.props.setDataIsLoaded(true)

            this.state={
                rows: rows,
                splitEqually: false,
                remaining:remaining
            }

        }
    }

    componentDidMount() {
        if (this.props.isAdd) {
            this.splitEqually()
        }
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


    setRows = (rows) => {

        this.setState({
            rows: rows
        })
    }

    setRemaining = (remaining) => {
        this.setState({
            remaining: parseFloat(remaining.toFixed(2))
        })
    }

    splitEqually = () => {
        console.log("SPLITING EQUALLY WTF")
        let totalAmount = this.props.amount
        let rows = this.state.rows

        let remaining = totalAmount
        let amountPerUser = parseFloat((totalAmount / rows.length).toFixed(2))

        let currIndex = 0

        rows.forEach((row) => {
            row.amount = amountPerUser
            remaining = parseFloat((remaining - amountPerUser).toFixed(2))
            if ((remaining != 0) && (currIndex == rows.length - 1)) {
                // case we have remaining value and we're on the last row
                row.amount = parseFloat((row.amount + remaining).toFixed(2))

                remaining = 0
            }
            currIndex++
        })

        // when we're here, remaining amount must be 0 and we have tried our best to split equally
        // need to update the rows object stored in state
        // update remaining in state as well

        this.setRows(rows)
        this.setRemaining(remaining)

    }

    // called by onchange 
    updateUserAmount = (username, amount) => {

        let rows = this.state.rows

        rows.forEach((row) => {
            // row has fields label, hasPaid, amount, username
            // need to find the row with the given username, then update the amount
            // update state.rows as the updated rows object afterwards

            if (row.username === username) {
                row.amount = amount
                return
            }
        })

        this.setRows(rows)

    }

    updateUserHasPaid = (username, hasPaid) => {

        let rows = this.state.rows

        rows.forEach((row) => {
            // row has fields label, hasPaid, amount, username
            // need to find the row with the given username, then update the amount
            // update state.rows as the updated rows object afterwards

            if (row.username === username) {
                row.hasPaid = hasPaid
                return
            }
        })

        this.setRows(rows)

    }

    createRow = (name, amount) =>{
        return { name, hasPaid: false, amount};
    }

    handleSplit = (choice) => {
        // when 'split equally' is unchecked
        // clear all user fields to 0
        // unassigned amount depends on the fields 
        this.setSplit(choice)
        if (choice) {
            this.splitEqually()
        }

    }

    setSplit = (choice) => {
        this.setState({
            splitEqually: choice
        })
    }

    handleChange = (username, amount, oldAmount) => {

        // update amount of the associated row entry
        // update remaining

        // get old amount
        // add it to remaining

        // subtract new amount from remaining

        // store it back into state
        this.setErrorMessage("")

        let remaining = parseFloat(this.state.remaining)

        remaining += (oldAmount == undefined) ? 0: parseFloat(oldAmount)
        remaining -= (amount == undefined) ? 0 : parseFloat(amount)

        this.setRemaining(remaining)
        this.updateUserAmount(username, amount)



    }

    handleHasPaidChange = (username, checked) => {

        this.updateUserHasPaid(username, checked)

    }

    setErrorMessage = (message) => {

        this.setState({
            hasRemainingAmountErrorMessage: message
        })
    }

    handleCreate = async () => {

        let hasRemainingAmountErrorMessage = ""

        if (this.state.remaining != 0) {
            hasRemainingAmountErrorMessage = "Amount split between involved users must add up to the total amount"
        }


        this.setState({
            hasRemainingAmountErrorMessage: hasRemainingAmountErrorMessage
        })

        if (hasRemainingAmountErrorMessage.length != 0) {
            return
        }

        let borrowerDataArray = []

        this.state.rows.forEach((row) => {

            let borrowerData = {
                username: row.username,
                hasPaid: row.hasPaid,
                amount: row.amount
            }

            borrowerDataArray.push(borrowerData)

        })


        if (this.props.isAdd) {

            const data = {
                payerUsername: this.props.payerUser.value,
                borrowerDataList : borrowerDataArray,
                amount: this.props.amount,
                date: this.props.date,
                description: this.props.description
            }

            await axios.post('/expenses/add', data).then(
                res => {
                    console.log(res)
                }
            ).catch(
                err => {
                    console.log(err.response.data.message)
                }
            )
        } else {

            let expenseID = this.props.editExpenseData.id
            const data = {
                id: expenseID,
                payerUsername: this.props.payerUser.value,
                borrowerDataList : borrowerDataArray,
                amount: this.props.amount,
                date: this.props.date,
                description: this.props.description
            }
            // case edit save
            await axios.put('/expenses/' + expenseID, data).then(
                res => {
                    console.log(res)
                }
            ).catch(
                err => {
                    console.log(err.response.data.message)
                }
            )
        }

        this.props.handleClose()

        if (this.props.isAdd) {
            window.location.reload()
        }
        
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


         let hasRemainingAmountError = ""

        if (this.state.hasRemainingAmountErrorMessage) {
            hasRemainingAmountError = (
                <div id="next-modal-alert" className="alert alert-danger" role="alert">
                    {this.state.hasRemainingAmountErrorMessage}
                </div>
        )}

        return (<Modal
        className='NextModal'
        show={this.props.showNext}
        onHide={this.props.handleClose}
        keyboard={false}
        size='xl'
        backdrop='static'>

            <Modal.Header className='modal-header'closeButton>
            <Modal.Title >
                {this.isAdd? <h3>Add a new Expense</h3>: <h3>Edit Expense</h3>}
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>

            <TableContainer component={Paper}>
      <Table sx={{ minWidth: 150 }} aria-label="spanning table">
        <TableHead>
          <TableRow key={""}>
            <TableCell align="left" >
            <h4>Involved Users</h4>
            </TableCell>
            <TableCell align="right">
            <h4>Has Paid</h4>
            </TableCell>
            <TableCell align="right" >
                <h4>Amount Owed</h4>
                <label>Split Equally</label>
                <Checkbox checked={this.state.splitEqually} onChange={e => this.handleSplit(e.target.checked)}/>
                </TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell >{row.label}</TableCell>
              <TableCell align="right" >
                <Checkbox 
                 disabled={row.username === this.props.payerUser.value}
                 checked={row.hasPaid}
                 onChange={e => this.handleHasPaidChange(row.username, e.target.checked)}
                />
              </TableCell>
              <TableCell align="right">
                <CurrencyInput
                        allowNegativeValue={false}
                        id="next-modal-input"
                        name="input-name"
                        prefix='$ '
                        disabled={this.state.splitEqually}
                        value={row.amount}
                        decimalsLimit={2}
                        onValueChange={(value) => this.handleChange(row.username, value, row.amount)}
                    />
              </TableCell>

            </TableRow>
          ))}

            <TableRow>
            <TableCell align="right" colSpan={1}>Unassigned Amount</TableCell>
            <TableCell align="right"colSpan={2}>
                
                {hasRemainingAmountError}
                <CurrencyInput 
                    id="total-input"
                    name="input-name"
                    prefix='$ '
                    disabled={true}
                    value={this.state.remaining}
                    decimalsLimit={2}
                />


            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell align="right" colSpan={1}>Total</TableCell>
            <TableCell align="right"colSpan={2}>
                
                <CurrencyInput 
                    id="total-input"
                    name="input-name"
                    prefix='$ '
                    disabled={true}
                    value={this.props.amount}
                    decimalsLimit={2}
                />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

            </Modal.Body>
            <div className='modal-padding'></div>
            <Modal.Footer>
            <Button variant="secondary" onClick={this.props.handlePrevious}>
                Previous
            </Button>
            <Button variant="secondary" onClick={this.props.handleClose}>
                Cancel
            </Button>
            {this.isAdd? <Button variant="primary" onClick={this.handleCreate}>Create</Button> : <Button variant="primary" onClick={this.handleCreate}>Save</Button>}
            </Modal.Footer>
        </Modal>
    )}
}