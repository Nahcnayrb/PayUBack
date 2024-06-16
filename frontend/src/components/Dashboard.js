import React,{Component} from 'react'
import AddModal from './AddModal';
import axios from 'axios';
import ExpenseTable from './ExpenseTable';
import DeleteModal from './DeleteModal';
import PayAllModal from './PayAllModal';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import { toHaveDisplayValue } from '@testing-library/jest-dom/matchers';

export default class Dashboard extends Component {

    state = {
        hasFetched:false,
        owedExpenseDataArray:[],
        owingExpenseDataArray:[],
        toPayUsersArray:[],
        toBePaidUsersArray:[],
        expensesToBePaidToggle: true,
        payExpensesToggle: true,
        users: this.props.users,
        modalOpenedInDetails: false
    };

            // in the group by users view for to pay:
        // user's name (first + last)
        // remaining balance

        // in the group by users view for to be paid:
        // user's name (first + last)
        // remaining balance

    owedHeaders = ["Date","Description","To Pay","Status"]
    owingHeaders = ["Date","Description", "Balance","Status"]
    userViewHeaders =["User", "Outstanding Balance"]

    setToPayUsersArray = (toPayUsers) => {
        this.setState({
            toPayUsersArray: toPayUsers
        })
    }

    setToBePaidUsersArray = (toBePaidUsers) => {
        this.setState({
            toBePaidUsersArray: toBePaidUsers
        })
    }

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

    getLabel = (username) => {

        let allUsers = this.props.users

        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i]
            if (user.username === username) {
                let name = ""
                if (username === this.props.user.username) {
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

        // initiate hashmap outside of for each expense loop
        // in the group by users view for to be paid:
        // isExpenses to pay = false
        // for each expense
        //      for each borrower in expense
        //              if borrower hasn't paid
        //                  check if hashmap has the borrower
        //                  case yes: we fetch the current outstanding amount, add to it 
        //                   case no: we store borrower into hashmap with the curr expense amount

        // at the end of the for each expense loop, we have a hashmap full of borrowers who hasn't paid yet

        // isExpensesToPay == true
        // initiate hashmap
        // in the group by users view for to pay:
        // for each expense
        //      for each borrower in expense
        //              if borrower == curr user
        //                  check if has paid
        //                      if hasn't paid, we store the payerUsername as key into map
        //                              value += the amount that user owes for curr expense


        let map = new Map()

        let usersViewArray = []

        let payButtonArray = []

        let currTotal = 0


        await axios.get(endpoint).then(
            res => {
                if (isExpensesToPay) {
                    this.setHasExpensesToPay(true)
                    this.setState({
                        toPayExpenseData: res.data
                    })
                } else {
                    this.setHasExpensesToBePaid(true)
                    this.setState({
                        toBePaidExpenseData: res.data
                    })
                }

                res.data.forEach((expenseJson) => {
                    // for each expense object that the current user is the payer user

                    let hasSettled = true // true by default for the isExpensesToPay case
                    let date = expenseJson.date
                    let description = (expenseJson.description) ? expenseJson.description : "No description" 
                    let amount = isExpensesToPay ? "$ " : parseFloat(expenseJson.amount)
                    let expenseId = expenseJson.id
                    let payerUsername = expenseJson.payerUsername

                    expenseJson.borrowerDataList.forEach((borrowerData) => {
                        // if any of the borrowers haven't paid, hasSettled will end up being false

                        if (!isExpensesToPay) {
                            // case ppl owe user money
                            hasSettled = hasSettled & borrowerData.hasPaid
                            if (borrowerData.hasPaid) {
                                amount -= parseFloat(borrowerData.amount)
                            } else {
                                currTotal += borrowerData.amount
                                // borrower has not paid user back for this expense
                                // we add this amount to map
                                if (map.has(borrowerData.username)) {

                                     let currAmount = map.get(borrowerData.username)
                                        currAmount += borrowerData.amount
                                        map.set(borrowerData.username, currAmount)

                                } else {
                                    // case map doesn't have borrower yet
                                    map.set(borrowerData.username, borrowerData.amount)

                                }
                            }
                        } else {
                            // case user owes money to others
                            if (borrowerData.username === currentUsername) {
                                hasSettled = borrowerData.hasPaid
                                amount +=  borrowerData.amount.toFixed(2)
                                if (!hasSettled) {
                                    // user owes money to current expense payer
                                    currTotal += borrowerData.amount
                                    if (map.has(payerUsername)) {
                                        let currAmount = map.get(payerUsername)
                                        currAmount += borrowerData.amount
                                        map.set(payerUsername, currAmount)

                                    } else {
                                        // map doesn't have payer yet
                                        map.set(payerUsername, borrowerData.amount)
                                    }

                                }
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
                        // case to pay
                        if (hasSettled) {
                            payButtonArray.push(true)
                            hasSettled = "Paid :)"
                        } else {
                            payButtonArray.push(false)
                            hasSettled = "Unpaid :("
                        }
                    }

                    let dataJson = {
                        hasSettled: hasSettled,
                        date: date,
                        description: description,
                        amount: amount,
                        expenseId: expenseId,
                        payerUsername
                    }

                    expenseDataArray.push(dataJson)

                })

                // need to store date, description, amount, if every user has paid
                // to see if every user paid, iterate through borrowerDataList to see if hasPaid = true for all

                

                map.forEach((amount, username) => {

                    let label = this.getLabel(username)

                    let dataJson = {
                        username: username,
                        label: label,
                        amount: "$ " + amount.toFixed(2)
                    }

                    usersViewArray.push(dataJson)
                })


                if (isExpensesToPay) {
                    this.setOwedExpenses(expenseDataArray)
                    this.setState({
                        payButtonArray: payButtonArray
                    })
                    this.setToPayUsersArray(usersViewArray)
                    this.setState({
                        toPayTotal: currTotal

                    })
                } else {
                    this.setOwingExpenses(expenseDataArray)
                    this.setToBePaidUsersArray(usersViewArray)
                    this.setState({
                        toBePaidTotal: currTotal
                    })
                }

            },
            err => {
                if (err.response.status === 404) {
                    if (isExpensesToPay) {
                        // case no expenses to pay
                        this.setHasExpensesToPay(false)
                        this.setOwedExpenses([])
                        this.setToPayUsersArray([])
                    } else {
                        // case no expenses to be paid
                        this.setHasExpensesToBePaid(false)
                        this.setOwingExpenses([])
                        this.setToBePaidUsersArray([])
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

    setShowEdit = show => {


        this.setState({
            showEdit: show
        })
    }

    updateExpenses = () => {
        this.fetchOwedExpenses()
        this.fetchOwingExpenses()
    }


    handleClickEdit = async (expenseId,isInDetails) => {

        // case edit button was clicked on an expense
        // set show expense = true
        console.log(isInDetails)

        // get expense data
        this.setState({
            modalOpenedInDetails: isInDetails
        })


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
        this.setState({
            showDelete: show
        })
    }

    setShowPayAll = (show) => {
        this.setState({
            showPayAll: show
        })
    }

    setConfirmDelete = (confirm) => {
        this.setState({
            confirmDelete: confirm
        })
    }

    setConfirmPayAll = (confirm) => {
        this.setState({
            confirmPayAll: confirm
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
                    // this.updateExpenses()
                    this.setShowDelete(false)
                    this.setConfirmDelete(false)

                    if (this.state.modalOpenedInDetails) {
                        this.setIsInDetails(false)
                        window.location.reload()
                    } else {
                        this.updateExpenses()
                    }

                    
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

    handlePayAll = async (payerUsername, borrowerUsername) => {


        let label = this.getLabel(payerUsername)
        this.setState({
            payAllLabel:label,
            payAllUser: payerUsername
        })

        if (this.state.confirmPayAll) {
            // case user clicked confirm on delete modal
            await axios.put("/expenses/payAll/" + payerUsername + "/" + borrowerUsername).then(
                res => {
                    this.updateExpenses()
                    this.setShowPayAll(false)
                    this.setConfirmPayAll(false)
                    
                },
                err => {
                    console.log(err)
                    
                }
            )
        } else {
            // confirm Pay All not yet clicked, this means modal is not open
            this.setShowPayAll(true)
        }

    }

    handlePayExpensesToggle = (isTurnedOn) => {
        this.setState({
            payExpensesToggle: isTurnedOn
        })
    }

    handleExpensesToBePaidToggle = (isTurnedOn) => {
        this.setState({
            expensesToBePaidToggle: isTurnedOn
        })
    }

    getTargetRows = (username, isToPay) => {
        // case toPay
        // need to find all the expense rows where the given username matches the expenses' payerUsername
        // need to use 


        let expensesDataList = isToPay? this.state.toPayExpenseData : this.state.toBePaidExpenseData

        let expenseIdList = []
        let targetRowsData = []

        expensesDataList.forEach((expenseData) => {

            if ((isToPay) && (username === expenseData.payerUsername)) {
                // case find all the toPay expenses where username == payerUsername
                let dataJson = {
                    expenseId: expenseData.id,
                }
                expenseIdList.push(expenseData.id)
            } else {

                function checkUsername(borrowerData) {
                    return username === borrowerData.username
                }

                // case find all the tobepaid expenses where username is in the borrower list and hasn't paid
                let borrowerDataList = expenseData.borrowerDataList
                let filteredBorrowerDataList = borrowerDataList.filter(checkUsername)
                
                filteredBorrowerDataList.forEach((borrower) => {
                    // filteredBorrowerDataList only contains the borrower that === username

                    let dataJson = {
                        expenseId: expenseData.id,
                        hasSettled: borrower.hasPaid,
                        amount: borrower.amount
                    }
                    expenseIdList.push(expenseData.id)
                    targetRowsData.push(dataJson)

                })

            }
        })


        // console.log(expenseIdList)
         console.log(targetRowsData)

        return [expenseIdList,targetRowsData]
    }

    getExpenseViewHeaders = (isToPay) => {
        return this.owedHeaders
    }

    setPayButton = (isDisabled,i) => {
        let payButtonArray = this.state.payButtonArray
        payButtonArray[i] = isDisabled
        this.setState({
            payButtonArray: payButtonArray
        })

    }

    setIsInDetails = (isInDetails) => {
        this.setState({
            modalOpenedInDetails: isInDetails
        })
    }



    render() {

        // window.scrollTo(0, 0)

        if (!this.props.user) {
            // case not logged in
            return (
                <>
                    <div className='dashboard-padding'/>
                    <div className='dashboard-container'></div>
                </>
            )
        }

        if (!this.state.hasFetched) {
            // one time execution
            window.scrollTo(0, 0)
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
                       
                        <h3>
                            Expenses to pay:
                        </h3>
                        <h3>
                            Total ${this.state.toPayTotal.toFixed(2)}
                        </h3>
                        <Divider sx={{ borderBottomWidth: 5 }}/>  
                        <FormControlLabel control={<Switch defaultChecked onChange={e => {this.handlePayExpensesToggle(e.target.checked)}}/>} className="form-control-label" label="Group By Users"/>
                        <ExpenseTable 
                            headers={this.owedHeaders}
                            getExpenseViewHeaders={this.getExpenseViewHeaders}
                            rows={this.state.owedExpenseDataArray} 
                            isToPay={true} 
                            handleEdit={this.handleEdit} 
                            handleDelete={this.handleDelete}
                            handleClickEdit={this.handleClickEdit}
                            toggleIsOn={this.state.payExpensesToggle}
                            usersViewArray={this.state.toPayUsersArray}
                            handleDetails={this.handleDetails}
                            usersEmptyMessage={"You're all paid up :)"}
                            userViewHeaders={this.userViewHeaders}
                            getTargetRows={this.getTargetRows}
                            payButtonArray={this.state.payButtonArray}
                            setPayButton={this.setPayButton}
                            updateExpenses={this.updateExpenses}
                            currentUsername={this.props.user.username}
                            isInDetails={false}
                            handlePayAll={this.handlePayAll}>

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
                        <h3>
                            Expenses to be paid back:
                        </h3>
                        <h3>Total ${this.state.toBePaidTotal.toFixed(2)}</h3>
                        <Divider sx={{ borderBottomWidth: 5 }}/>  
                        <FormControlLabel control={<Switch defaultChecked onChange={ e => {this.handleExpensesToBePaidToggle(e.target.checked)}}/>} className="form-control-label" label="Group By Users" />
                        <ExpenseTable 
                            headers={this.owingHeaders}
                            getExpenseViewHeaders={this.getExpenseViewHeaders}
                            rows={this.state.owingExpenseDataArray} 
                            isToPay={false} 
                            handleEdit={this.handleEdit} 
                            handleDelete={this.handleDelete}
                            handleClickEdit={this.handleClickEdit}
                            toggleIsOn={this.state.expensesToBePaidToggle}
                            usersViewArray={this.state.toBePaidUsersArray}
                            handleDetails={this.handleDetails}
                            usersEmptyMessage={"All users have paid you back :)"}
                            userViewHeaders={this.userViewHeaders}
                            getTargetRows={this.getTargetRows}
                            isInDetails={false}
                            handlePayAll={this.handlePayAll}>
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
                users={this.props.users} 
                show={this.state.showEdit} 
                setShow={this.setShowEdit} 
                currentUser={this.props.user}
                updateExpenses={this.updateExpenses}
                isInDetails={this.state.modalOpenedInDetails}
                setInDetails={this.setIsInDetails}/>
            <DeleteModal 
                show={this.state.showDelete} 
                setShow={this.setShowDelete} 
                setConfirmDelete={this.setConfirmDelete}
                handleDelete={this.handleDelete}
                description={this.state.deleteDescription} 
                expenseId={this.state.deleteExpenseId}
                updateExpenses={this.updateExpenses}/>
            <PayAllModal
                show={this.state.showPayAll}
                setShow={this.setShowPayAll}
                payerUser={this.state.payAllUser}
                label={this.state.payAllLabel}
                currentUser={this.props.user.username}
                handlePayAll={this.handlePayAll}
                updateExpenses={this.updateExpenses}
                setPayAllConfirmation={this.setConfirmPayAll}/>
            </div>
            <div className='dashboard-padding' />
            </>
        )
    }

}