import {React, Component } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';


export default class ExpenseTable extends Component {

    


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
                            <Button variant="contained" style={{backgroundColor: "#003366"}} onClick={ () => { this.props.handleDetails(row.username) }}>
                                <ModeEditIcon fontSize="small"/>
                                <label>Details</label>
                            </Button>
                        </Td>

                    </Tr>

                ))}
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
                                <label>Edit</label>
                            </Button>
                        </Td>
                        <Td>
                            <Button variant="contained" style={{backgroundColor: "#003366"}} onClick={ () => {this.props.handleDelete(row.expenseId, row.description)}}>
                                <DeleteIcon fontSize="small"/>
                                <label>Delete</label>
                            </Button>
                        </Td>

                    </Tr>

                ))}
              </Tbody>
    }
            </Table>
        )}

}