import React,{Component} from 'react'
import { Button, Checkbox } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { Navigate } from 'react-router-dom';
import AddModal from './AddModal';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import ExpenseTable from './ExpenseTable';
import DeleteModal from './DeleteModal';
import { ThirtyFpsOutlined } from '@mui/icons-material';


export default class Dashboard extends Component {

    state = {
        hasFetched:false,
        owedExpenseDataArray:[],
        owingExpenseDataArray:[],
    };

    owedHeaders = ["Date","Description","Amount","Status"]
    owingHeaders = ["Date","Description", "Amount","Status"]


    setOwingExpenses = (owingExpenses) => {
        this.setState({
            owingExpenseDataArray: owingExpenses
        })
    }

    setOwedExpenses = (owedExpenses) => {
        this.setState({
            owedExpenseDataArray: owedExpenses
        })
    }

    fetchOwingExpenses = async () => {
        // people owe the user money
        console.log("fetched owing expenses")

        let owingExpenseDataArray = []

        let currentUsername = this.props.user.username

        await axios.get("/expenses/owing/" + currentUsername).then(
            res => {

                res.data.forEach((expenseJson) => {
                    // for each expense object that the current user is owing

                    let hasSettled = true
                    let date = expenseJson.date
                    let description = (expenseJson.description) ? expenseJson.description : "No description" 
                    let amount = "$ " +  expenseJson.amount.toFixed(2)
                    let expenseId = expenseJson.id

                    expenseJson.borrowerDataList.forEach((borrowerData) => {

                        // if any of the borrowers haven't paid, hasSettled will end up being false
                        hasSettled = hasSettled & borrowerData.hasPaid
                        

                    })

                    hasSettled = (hasSettled == 1) ? "settled" : "outstanding"

                    let dataJson = {
                        hasSettled: hasSettled,
                        date: date,
                        description: description,
                        amount: amount,
                        expenseId: expenseId
                    }

                    owingExpenseDataArray.push(dataJson)

                })

                // res.data is a json array
                //console.log(res.data)
                // owingHeaders = ["Date","Description", "Amount","Settled"]

                // need to store date, description, amount, if every user has paid
                // to see if every user paid, iterate through borrowerDataList to see if hasPaid = true for all

                this.setOwingExpenses(owingExpenseDataArray)
            },
            err => {
                if (err.response.status == 404) {
                    console.log("No expenses owing!")
                    this.setOwingExpenses([])
                }
                console.log(err)
            }
        )

    }

    fetchAllUsers = async () => {

        await axios.get('users').then(
            res => {
                // res.data is a json array
                this.setState({
                    users: res.data
                })
  
            },
            err => {
                console.log(err)
            }
        )
    }

    fetchOwedExpenses = async () => {

        // user owes ppl money

        let currentUsername = this.props.user.username
        let owedExpenseDataArray = []

        console.log("fetched owed expenses")
        await axios.get("/expenses/owed/" + currentUsername).then(
            res => {

                res.data.forEach((expenseJson) => {
                    // for each expense object that the current user is owing to 
                    //owedHeaders = ["Date","Description","Owed to","Amount","Paid"]

                    let hasSettled = false
                    let date = expenseJson.date
                    let description = (expenseJson.description) ? expenseJson.description : "No description" 
                    let amount = "$ " +  expenseJson.amount.toFixed(2)
                    let owedTo = expenseJson.payerUsername
                    let expenseId = expenseJson.id

                    expenseJson.borrowerDataList.forEach((borrowerData) => {

                        // if any of the borrowers haven't paid, hasSettled will end up being false
                        if (borrowerData.username == currentUsername) {
                            hasSettled = borrowerData.hasPaid
                            
                        }

                    })

                    hasSettled = (hasSettled == true) ? "paid" : "unpaid"

                    let dataJson = {
                        hasSettled: hasSettled,
                        date: date,
                        description: description,
                        amount: amount,
                        owedTo: owedTo,
                        expenseId: expenseId
                    }

                    owedExpenseDataArray.push(dataJson)

                })

                // res.data is a json array
                //console.log(res.data)
                // owingHeaders = ["Date","Description", "Amount","Settled"]

                // need to store date, description, amount, if every user has paid
                // to see if every user paid, iterate through borrowerDataList to see if hasPaid = true for all

                this.setOwedExpenses(owedExpenseDataArray)
            },
            err => {
                if (err.response.status == 404) {
                    console.log("no expenses owed!")
                    this.setOwedExpenses([])
                }
            }
        )

    }

    setShow = show => {


        this.updateExpenses()

        this.setState({
          show: show
        })
    }

    setShowEdit = show => {


        this.updateExpenses()

        this.setState({
            showEdit: show
        })
    }

    updateExpenses = () => {
        this.fetchOwedExpenses()
        this.fetchOwingExpenses()
    }


    handleClickEdit = async (expenseId) => {

        // case edit button was clicked on an expense
        // set show expense = true

        // get expense data


        await axios.get("/expenses/" + expenseId).then(
            res => {
                // res.data is a json array
                this.setState({
                    editExpenseData: res.data
                })
  
            },
            err => {
                console.log(err)
            }
        )

        this.setShowEdit(true)
        
    }

    setShowDelete = (show) => {
        this.updateExpenses()
        this.setState({
            showDelete: show
        })
    }

    setConfirmDelete = (confirm) => {
        this.setState({
            confirmDelete: confirm
        })
    }

    handleDelete = async (expenseId, description) => {

        
        this.setState({
            deleteDescription: description,
            deleteExpenseId: expenseId
        })



        if (this.state.confirmDelete) {
            // case user clicked confirm on delete modal
            await axios.delete("/expenses/" + expenseId).then(
                res => {
    
                    this.updateExpenses()
                    this.setShowDelete(false)
                    this.setConfirmDelete(false)

                    
                },
                err => {
                    console.log(err)
                    
                }
            )
        } else {
            // confirm delete not yet clicked, this means modal is not open
            this.setShowDelete(true)
        }

        // unshow the delete modal after a delay
        // are you sure you want to delete _____? this will delete it for everyone involved.

    }


    // edit modal = add modal with edit flag == true

    // only difference: create button -> update button
    // handle update method


    render() {

        // window.scrollTo(0, 0)

        // if (!this.props.user) {
        //     // case not logged in
        //     return <Navigate to={'/'}/>
        // }

        if (!this.props.user) {
            // case not logged in
            return (
                <>
                    <div className='dashboard-container'></div>
                </>
            )
        }

        if (!this.state.hasFetched) {
            // one time execution
            window.scrollTo(0, 0)
            this.fetchAllUsers()
            this.updateExpenses()
            this.setState({
                hasFetched: true
            })
        }
        // case has fetched
        // state must have owing and owed expenses
    
        return (
            <>
            
            <div className='dashboard-padding'/>

            <div className='dashboard-container'>

                <div className='owed-container'> 

                    <h3> Expenses I need to pay back</h3>

                    <ExpenseTable 
                        headers={this.owedHeaders} 
                        rows={this.state.owedExpenseDataArray} 
                        isOwed={true} 
                        handleEdit={this.handleEdit} 
                        handleDelete={this.handleDelete}
                        handleClickEdit={this.handleClickEdit}>

                    </ExpenseTable>

                </div>

            </div>

            <div className='dashboard-padding' />

            <div className='dashboard-container'>
                <div className='owing-container'> 

                    <h3> Expenses I need to be paid back </h3>
                    <ExpenseTable 
                        headers={this.owingHeaders} 
                        rows={this.state.owingExpenseDataArray} 
                        isOwed={false} 
                        handleEdit={this.handleEdit} 
                        handleDelete={this.handleDelete}
                        handleClickEdit={this.handleClickEdit}>
                    </ExpenseTable>

                </div>
            </div>
            
            <div className='modal-container'>

            <AddModal editExpenseData={this.state.editExpenseData} isAdd={false} users={this.state.users} show={this.state.showEdit} setShow={this.setShowEdit} currentUser={this.props.user}></AddModal>
            <DeleteModal 
                show={this.state.showDelete} 
                setShow={this.setShowDelete} 
                setConfirmDelete={this.setConfirmDelete}
                handleDelete={this.handleDelete}
                description={this.state.deleteDescription} 
                expenseId={this.state.deleteExpenseId}>
            </DeleteModal>
            </div>

            <div className='dashboard-padding' />
            </>
        )
    }

}