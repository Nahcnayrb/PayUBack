import React,{Component} from 'react'
import AddModal from './AddModal';
import axios from 'axios';
import ExpenseTable from './ExpenseTable';
import DeleteModal from './DeleteModal';
import PayAllModal from './PayAllModal';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import PayDetailsModal from './PayDetailsModal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
        if (!this.props.users) {
            window.location.reload()
        }

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


        let map = new Map()

        let usersViewArray = []

        let payButtonArray = []

        let currTotal = 0


        await axios.get(endpoint).then(
            res => {
                let filteredExpenseList = this.filterExpensesByCurrentGroup(res.data)
                if (isExpensesToPay) {

                    if (filteredExpenseList.length > 0) {

                        this.setHasExpensesToPay(true)

                        this.setState({
                            toPayExpenseData: filteredExpenseList
                        })

                    }

                } else {
                    if (filteredExpenseList.length > 0) {
                        this.setHasExpensesToBePaid(true)
                        this.setState({
                            toBePaidExpenseData: filteredExpenseList
                        })
                    }
                }

                filteredExpenseList.forEach((expenseJson) => {
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
                                if (!map.has(borrowerData.username) && (borrowerData.username !== this.props.user.username)) {
                                    map.set(borrowerData.username, 0)
                                }
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

                                } else {
                                    // case 
                                    if (!map.has(payerUsername)) {
                                        map.set(payerUsername, 0)
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

    filterExpensesByCurrentGroup = (expenseData) => {
        if (this.props.isGeneralDashboard) {
            // case in main dashboard
            return expenseData

        } else {
            // case in groups dashboard

            let filteredExpenseList = []

            expenseData.forEach((expense) => {
                if (expense.groupId === this.state.groupId) {
                    filteredExpenseList.push(expense)
                }
            })

            return filteredExpenseList
    
        }

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
        // window.scrollTo(0,document.body.scrollHeight)

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

    handleDelete = async (expenseId, description, isInDetails) => {

        let deleteDescription = "Are you sure you want to delete the Expense: '" + (description.length > 20 ? description.substring(0,21) : description)
         + "' ? This will delete the expense FOR EVERYONE involved."

        
        this.setState({
            deleteDescription: deleteDescription,
            deleteExpenseId: expenseId
        })

        if (this.state.confirmDelete) {
            // case user clicked confirm on delete modal
            await axios.delete("/expenses/" + expenseId).then(
                res => {
                    // this.updateExpenses()
                    this.setShowDelete(false)
                    this.setConfirmDelete(false)
                    if (isInDetails) {

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

    handlePayAll = async (payerUsername, borrowerUsername, amount) => {


        let label = this.getLabel(payerUsername)
        this.setState({
            payAllLabel:label,
            payAllUser: payerUsername,
            payDetailsAmount: amount
        })

        if (this.state.confirmPayAll) {
            // case user clicked confirm on delete modal
            let endpoint = this.props.isGeneralDashboard ? "/expenses/payAll/" : "/expenses/payAllGroups/" + this.state.groupId + "/"
            endpoint += payerUsername + "/" + borrowerUsername

            let payerUser = this.getUserByUsername(payerUsername)


            await axios.put(endpoint).then(
                res => {
                    this.updateExpenses()
                    this.setShowPayAll(false)
                    this.setConfirmPayAll(false)

                    this.setState({
                        payDetailsUser: payerUser
                    })
                    this.setShowPayDetails(true)
                    
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
        this.fetchOwedExpenses()
        this.setState({
            payExpensesToggle: isTurnedOn
        })
    }

    handleExpensesToBePaidToggle = (isTurnedOn) => {
        this.fetchOwingExpenses()
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

            if (isToPay) {
                if (username === expenseData.payerUsername) {
                    // case find all the toPay expenses where username == payerUsername
                    expenseIdList.push(expenseData.id)
                }
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

    getCurrentGroupData = () => {
        if (this.props.isGeneralDashboard) {
            // don't fetch if is general dashboard
            return
        }

        
        let href = window.location.href
        let groupId = href.substring(href.lastIndexOf('/') + 1)

        this.setState({
            groupId: groupId
        })

        if (groupId === "individual") {
            let group = {
                id: groupId,
                groupName: "Individual Expenses",
                usernames: "",
                colourHexCode: "#d3d3d3"
            }
            this.setState({
                group: group
            })
        } else {

            setTimeout(()=> {

        
                for (let i = 0; i < this.props.groupsData.length; i++) {
                    let currGroup = this.props.groupsData[i]
                    if (currGroup.id === groupId) {
                        // found group
        
                        this.setState({
                            group: currGroup
                        })
        
                    }
                }


            },600)
        }

    }

    getUserByUsername = (username) => {
        for (let i = 0; i < this.props.users.length; i++) {
            let currUser = this.props.users[i]
            if (currUser.username === username) {
                return currUser
            }
        }
        return ""
    }

    getPayerUser = (expenseId) => {

        let payerUsername = ""
        for (let i = 0; i < this.state.toPayExpenseData.length; i++) {
            let currExpense = this.state.toPayExpenseData[i]
            if (currExpense.id === expenseId) {
                // found expense
                payerUsername = currExpense.payerUsername
                break
            }
        }

        for (let i = 0; i < this.props.users.length; i++) {
            let currUser = this.props.users[i]
            if (currUser.username === payerUsername) {
                return currUser
            }
        }

    }

    setShowPayDetails = (show) => {
        this.setState({
            showPayDetails: show
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
            this.getCurrentGroupData()

            this.setState({
                hasFetched: true,
            })
        }
        // case has fetched
        // state must have owing and owed expenses
        let groupColour = "#000000"

        if (this.state.group) {
            let colour = this.state.group.colourHexCode

            var c = colour.substring(1);      // strip #
            var rgb = parseInt(c, 16);   // convert rrggbb to decimal
            var r = (rgb >> 16) & 0xff;  // extract red
            var g = (rgb >>  8) & 0xff;  // extract green
            var b = (rgb >>  0) & 0xff;  // extract blue

            var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

            if (luma < 70) {
                // set group name to white instead of black
                groupColour = "#ffffff"
            }
        }
    
        return (
            <>

            <div className='dashboard-offset-padding'/>
            <div style={{backgroundColor: this.state.group? this.state.group.colourHexCode : "#ffffff"}}className='dashboard-container'>
                {this.props.isGeneralDashboard? 

                <h3  style={{textAlign: "center"}}>Main Dashboard</h3>
                :
                <>
                <h3 style={{textAlign: "center", color: groupColour}}>{this.state.group? this.state.group.groupName : ""}</h3>
                <label style={{display: "block", textAlign: "center", fontSize: "14px",  color: groupColour}}>
                    {this.state.group? (this.state.group.id != "individual" ? ("Group ID: " + this.state.group.id) : "") : ""}
                    {this.state.group? (this.state.group.id != "individual" ? 
                        <ContentCopyIcon 
                        fontSize='large' 
                        style={{textAlign: "center", paddingLeft: "10px", color: groupColour, cursor: "pointer"}} 
                        onClick={() => {navigator.clipboard.writeText(this.state.group.id).then(()=>{this.setState({clickedCopy: true})})}}/>
                        : "") : ""}
                    {this.state.clickedCopy ?<label style={{textAlign: "center", fontSize: "15px", paddingLeft: "10px", color: groupColour}}>Copied!</label>: ""}
                    
                </label>
                </>
                
                }
            </div>
            
            <div className='dashboard-padding'/>
            <div className='dashboard-container'>
                <div className='owed-container'> 
                    {this.state.hasExpensesToPay?
                        <>
                       
                        <h3>
                            Expenses to pay: {(this.state.toPayTotal.toFixed(2) === "0.00") ? "None :)" : ""}
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
                            handlePayAll={this.handlePayAll}
                            setIsInDetails={this.setIsInDetails}
                            getPayerUser={this.getPayerUser}
                            getUserByUsername={this.getUserByUsername}>

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
                            Expenses to be paid back: {(this.state.toBePaidTotal.toFixed(2) === "0.00") ? "None :)" : ""}
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
                            handlePayAll={this.handlePayAll}
                            setIsInDetails={this.setIsInDetails}>
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
                setInDetails={this.setIsInDetails}
                groupsData={this.props.groupsData}/>
            <DeleteModal 
                show={this.state.showDelete} 
                setShow={this.setShowDelete} 
                setConfirmDelete={this.setConfirmDelete}
                handleDelete={this.handleDelete}
                isInDetails={this.state.modalOpenedInDetails}
                description={this.state.deleteDescription} 
                id={this.state.deleteExpenseId}/>
            <PayAllModal
                show={this.state.showPayAll}
                setShow={this.setShowPayAll}
                payerUser={this.state.payAllUser}
                label={this.state.payAllLabel}
                currentUser={this.props.user.username}
                handlePayAll={this.handlePayAll}
                updateExpenses={this.updateExpenses}
                setPayAllConfirmation={this.setConfirmPayAll}
                amount={this.state.payDetailsAmount} />
            <PayDetailsModal 
                    show={this.state.showPayDetails} 
                    handleClose={this.setShowPayDetails} 
                    amount={this.state.payDetailsAmount} 
                    payerUser={this.state.payDetailsUser} 
                    isInDetails={false}>
            </PayDetailsModal>
            </div>
            <div className='dashboard-padding' />
            </>
        )
    }

}