import {React, Component } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import DetailsModal from "./DetailsModal";


export default class ExpenseTable extends Component {

    state = {
        show: false
    }
    
    // handle details

    // sort through list of expenses to find expenses relating to curr user
    // need to know if from toPay or toBePaid

    // after sort,
    // pass in list of sorted expenses
    // pass in labels
    // pass in handleClickEdit, handleDelete

    handleDetails = (username) => {

        let [expenseIDList, targetRowsData] = this.props.getTargetRows(username, this.props.isToPay)

        /**
         *                   let dataJson = {
                        expenseId: expenseData.id,
                        hasSettled: borrower.hasPaid,
                        amount: borrower.amount
                    }} row 

         */

        function checkExpenseID(row) {
            return expenseIDList.includes(row.expenseId)
        }

        let filteredRows = this.props.rows.filter(checkExpenseID)

        if (!this.props.isToPay) {
            filteredRows.forEach((row) => {
                for (let i = 0; i < targetRowsData.length; i++) {
                    if (targetRowsData[i].expenseId === row.expenseId) {
                        // matched target row data with filtered row
                        row.amount = targetRowsData[i].amount
                        row.hasSettled = targetRowsData[i].hasSettled ? "Paid" : "Unpaid" 
                    }
                }
            })
        }

        this.setState({
            detailRows: filteredRows
        })

        console.log(filteredRows)

        this.setShow(true)

        let detailsHeaders = this.props.getExpenseViewHeaders(this.props.isToPay)

        this.setState({
            headers: detailsHeaders
        })

    }


    setShow = (show) => {
        this.setState({
            show: show
        })
    }




    


    render() {

        // when user clicks on "details", we can just use the list of expenses passed (rows) to search for all the expenses that is associated
        // ex. only show the ones that satisfy inside the modal

        if ((this.props.toggleIsOn) && (this.props.usersViewArray.length === 0)) {
            return (
                <h3>{this.props.usersEmptyMessage}</h3>
            )
        }

        let headersToUse = this.props.toggleIsOn ? this.props.userViewHeaders : this.props.headers

        return (
            <Table className='owing-table' key={this.props.toggleIsOn} >
              <Thead>
                <Tr >
                    {headersToUse.map((header) => (
                        <Th key={header}>
                            <h3 id="data-header" key={header}>{header}</h3>
                        </Th>
                    ))}
                </Tr>
              </Thead>
              {this.props.toggleIsOn?
              <Tbody>
                {this.props.usersViewArray.map((row) => (
                    <Tr key={row.username}>
                        <Td>{row.label}</Td>
                        <Td>{row.amount}</Td>

                        <Td>
                            <Button variant="contained" style={{backgroundColor: "#003366"}} onClick={ () => { this.handleDetails(row.username) }}>
                                <ModeEditIcon fontSize="small"/>
                                <label className="button-labels" >Details</label>
                            </Button>
                        </Td>

                    </Tr>

                ))}
                
                <DetailsModal 
                    rows={this.state.detailRows} 
                    isToPay={this.props.isToPay} 
                    show={this.state.show} 
                    setShow={this.setShow} 
                    headers={this.state.headers}
                    handleClickEdit={this.props.handleClickEdit}
                    handleDelete={this.props.handleDelete}>
                </DetailsModal>
                
              </Tbody>
              :
              <Tbody>
                {this.props.rows.map((row) => (
                    <Tr key={row.expenseId}>

                        <Td>{row.date}</Td>
                        <Td>{row.description}</Td>
                        <Td>{row.amount}</Td>
                        <Td>{row.hasSettled}</Td>

                        <Td>
                            <Button variant="contained" style={{backgroundColor: "#003366"}} onClick={ () => { this.props.handleClickEdit(row.expenseId) }}>
                                <ModeEditIcon fontSize="small"/>
                                <label className="button-labels">Edit</label>
                            </Button>
                        </Td>
                        <Td>
                            <Button variant="contained" style={{backgroundColor: "#003366"}} onClick={ () => {this.props.handleDelete(row.expenseId, row.description)}}>
                                <DeleteIcon fontSize="small"/>
                                <label className="button-labels">Delete</label>
                            </Button>
                        </Td>

                    </Tr>

                ))}
              </Tbody>
    }
            </Table>
        )}

}