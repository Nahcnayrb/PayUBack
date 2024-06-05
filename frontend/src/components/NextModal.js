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
import { toHaveStyle } from '@testing-library/jest-dom/matchers';
import { LocalConvenienceStoreOutlined } from '@material-ui/icons';


// const TAX_RATE = 0.07;

// function ccyFormat(num) {
//   return `${num.toFixed(2)}`;
// }







export default class NextModal extends Component {


    constructor(props) {
        super(props)

        // by default, split equally 

        let rows = []

        // let involvedUserAmount = 0

        //let amountPerUser = parseFloat((this.props.amount / this.props.involvedUsers.length).toFixed(2))
        this.props.involvedUsers.forEach((involvedUser) => {
            // value = username
            // label = first last + username
            let name = involvedUser.label
            let hasPaid = (involvedUser.value === this.props.payerUser.value)

            // involvedUserAmount += amountPerUser

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

    componentDidMount() {

        this.splitEqually()

    }

    splitEqually = () => {
        let totalAmount = this.props.amount
        let rows = this.state.rows

        let remaining = totalAmount
        let amountPerUser = parseFloat((totalAmount / rows.length).toFixed(2))

        let currIndex = 0

        rows.forEach((row) => {
            row.amount = amountPerUser
            remaining -= amountPerUser
            if ((remaining != 0) && (currIndex == rows.length - 1)) {
                // case we have remaining value and we're on the last row
                row.amount += parseFloat(remaining.toFixed(2))
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
        this.splitEqually()

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


    handleCreate = () => {


        // let borrowerUsernameArray = []

        // this.props.involvedUsers.forEach((option) => {
        //     borrowerUsernameArray.push(option.value)
        // })

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


        const data = {
            payerUsername: this.props.payerUser.value,
            borrowerDataList : borrowerDataArray,
            amount: this.props.amount,
            date: this.props.date,
            description: this.props.description
        }

        console.log(data)
        axios.post('/expenses/add', data).then(
            res => {
                console.log(res)
            }
        ).catch(
            err => {
                console.log(err.response.data.message)
            }
        )


        this.props.handleClose()
        
    }
    


    render() {

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
                <h3>Add a new Expense</h3>
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>

            <TableContainer component={Paper}>
      <Table sx={{ minWidth: 150 }} aria-label="spanning table" >
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
                <Checkbox defaultChecked onChange={e => this.handleSplit(e.target.checked)}/>
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
            <Button variant="primary" onClick={this.handleCreate}>Create</Button>
            </Modal.Footer>
        </Modal>
    )}
}