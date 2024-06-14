import React,{Component} from 'react'
import AddModal from './AddModal';
import axios from 'axios';
import ExpenseTable from './ExpenseTable';
import DeleteModal from './DeleteModal';


export default class Dashboard extends Component {

    state = {
        hasFetched:false,
        owedExpenseDataArray:[],
        owingExpenseDataArray:[],
    };

    owedHeaders = ["Date","Description","To Pay","Status"]
    owingHeaders = ["Date","Description", "Outstanding","Status"]


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

    fetchExpenses = async (isExpensesToPay) => {
        // isExpensesToPay == true if fetching all the expenses that the user has to pay back

        let expenseDataArray = []

        let currentUsername = this.props.user.username

        let endpoint = ""

        if (isExpensesToPay) {
            endpoint = "/expenses/owed/" + currentUsername
        } else {
            endpoint = "/expenses/owing/" + currentUsername
        }

        await axios.get(endpoint).then(
            res => {

                isExpensesToPay ? this.setHasExpensesToPay(true) : this.setHasExpensesToBePaid(true) 

                res.data.forEach((expenseJson) => {
                    // for each expense object that the current user is the payer user

                    let hasSettled = true // true by default for the isExpensesToPay case
                    let date = expenseJson.date
                    let description = (expenseJson.description) ? expenseJson.description : "No description" 
                    let amount = isExpensesToPay ? "$ " : parseFloat(expenseJson.amount)
                    let expenseId = expenseJson.id

                    expenseJson.borrowerDataList.forEach((borrowerData) => {
                        // if any of the borrowers haven't paid, hasSettled will end up being false

                        if (!isExpensesToPay) {
                            // case ppl owe user money
                            hasSettled = hasSettled & borrowerData.hasPaid
                            if (borrowerData.hasPaid) {
                                amount -= parseFloat(borrowerData.amount)
                            }
                        } else {
                            // case user owes money to others
                            if (borrowerData.username === currentUsername) {
                                hasSettled = borrowerData.hasPaid
                                amount +=  borrowerData.amount.toFixed(2)
                            }
                        }
                    })

                    if (!isExpensesToPay) {
                        if (hasSettled) {
                            amount = "$ 0.00"
                            hasSettled = "Settled :)"
                        } else {
                            amount = "$ " + amount.toFixed(2)
                            hasSettled = "Outstanding :("
                        }
                    } else {
                        hasSettled = (hasSettled === true) ? "Paid :)" : "Unpaid :("
                    }

                    let dataJson = {
                        hasSettled: hasSettled,
                        date: date,
                        description: description,
                        amount: amount,
                        expenseId: expenseId
                    }

                    expenseDataArray.push(dataJson)

                })

                // need to store date, description, amount, if every user has paid
                // to see if every user paid, iterate through borrowerDataList to see if hasPaid = true for all

                isExpensesToPay? this.setOwedExpenses(expenseDataArray) : this.setOwingExpenses(expenseDataArray)
            },
            err => {
                if (err.response.status === 404) {
                    if (isExpensesToPay) {
                        // case no expenses to pay
                        this.setHasExpensesToPay(false)
                        this.setOwedExpenses([])
                    } else {
                        // case no expenses to be paid
                        this.setHasExpensesToBePaid(false)
                        this.setOwingExpenses([])
                    }
                }
                console.log(err)
            }
        )


    }

    fetchOwingExpenses = async () => {
        // people owe the user money
        //isExpensesToPay == false here 
        console.log("fetched owing expenses")
        this.fetchExpenses(false)

    }

    fetchOwedExpenses = async () => {

        // user owes ppl money
        console.log("fetched owed expenses")
        this.fetchExpenses(true)

    }

    setHasExpensesToPay = (hasExpenses) => {
        this.setState({
            hasExpensesToPay: hasExpenses
        })
    }

    setHasExpensesToBePaid = (hasExpenses) => {
        this.setState({
            hasExpensesToBePaid: hasExpenses
        })
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

    }


    // edit modal = add modal with edit flag == true

    // only difference: create button -> update button
    // handle update method


    render() {

        // window.scrollTo(0, 0)

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
                    {this.state.hasExpensesToPay?
                        <>
                        <h3> Expenses I need to pay back</h3>
                        <ExpenseTable 
                            headers={this.owedHeaders} 
                            rows={this.state.owedExpenseDataArray} 
                            isOwed={true} 
                            handleEdit={this.handleEdit} 
                            handleDelete={this.handleDelete}
                            handleClickEdit={this.handleClickEdit}>

                        </ExpenseTable>
                        </>
                        :
                        <h3>You don't need to pay back anyone :)</h3>}
                </div>
            </div>
            <div className='dashboard-padding' />

            <div className='dashboard-container'>
                <div className='owing-container'> 
                    {this.state.hasExpensesToBePaid?
                        <>
                        <h3> Expenses I need to be paid back </h3>
                        <ExpenseTable 
                            headers={this.owingHeaders} 
                            rows={this.state.owingExpenseDataArray} 
                            isOwed={false} 
                            handleEdit={this.handleEdit} 
                            handleDelete={this.handleDelete}
                            handleClickEdit={this.handleClickEdit}>
                        </ExpenseTable>
                        </>
                        :
                        <h3>No one needs to pay you back :)</h3>}

                </div>
            </div>
            <div className='modal-container'>
            <AddModal 
                editExpenseData={this.state.editExpenseData} 
                isAdd={false} 
                users={this.state.users} 
                show={this.state.showEdit} 
                setShow={this.setShowEdit} 
                currentUser={this.props.user}/>
            <DeleteModal 
                show={this.state.showDelete} 
                setShow={this.setShowDelete} 
                setConfirmDelete={this.setConfirmDelete}
                handleDelete={this.handleDelete}
                description={this.state.deleteDescription} 
                expenseId={this.state.deleteExpenseId}/>
            </div>
            <div className='dashboard-padding' />
            </>
        )
    }

}