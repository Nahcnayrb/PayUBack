import {React, Component } from "react";

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

export default class ExpenseTable extends Component {

    


    render() {

        return (
            <Table className='owing-table' >
              <Thead>
                <Tr >
                    {this.props.headers.map((header) => (
                        <Th key={header}>
                            <h3 id="data-header" key={header}>{header}</h3>
                        </Th>
                    ))}
                </Tr>
              </Thead>
              <Tbody>
                {this.props.rows.map((row) => (
                    <Tr key={row.expenseId}>

                        <Td>{row.date}</Td>
                        <Td>{row.description}</Td>
                        <Td>{row.amount}</Td>
                        <Td>{row.hasSettled}</Td>

                        <Td>
                            <Button variant="contained" onClick={ () => { this.props.handleClickEdit(row.expenseId) }}>
                                <ModeEditIcon fontSize="small"/>
                                <label>Edit</label>
                            </Button>
                        </Td>
                        <Td>
                            <Button variant="contained" onClick={ () => {this.props.handleDelete(row.expenseId, row.description)}}>
                                <DeleteIcon fontSize="small"/>
                                <label>Delete</label>
                            </Button>
                        </Td>

                    </Tr>

                ))}
              </Tbody>
            </Table>
        )}

}