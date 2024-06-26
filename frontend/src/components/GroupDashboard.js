import React, {Component} from 'react'
import { Button } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal'
import { Link } from "react-router-dom"
import DeleteModal from './DeleteModal';
import AddGroupModal from './AddGroupModal';

export default class GroupDashboard extends Component {
    state={
        showAddModal:false,
        colour: "#47ba1e",
        selections: [],
        confirmDelete: false,
        showDeleteModal: false,
        showEditModal: false
    }

    setShowAddModal = (show) => {
        this.setState({
            showAddModal: show
        })

        if (!show) {
            this.handleCloseAddGroupModal()
        }
    }

    setShowEditModal = (show) => {
        this.setState({
            showEditModal: show
        })
    }
    setShowJoinModal = (show) => {
        this.setState({
            showJoinModal: show
        })

        if (!show) {
            // clear error messages
            this.setState({
                joinGroupId: "",
                joinGroupErrorMessage: ""
            })
        }
    }
    setShowDeleteModal = (show) => {
        this.setState({
            showDeleteModal: show
        })
    }

    setConfirmDelete = (confirmDelete) => {
        this.setState({
            confirmDelete: confirmDelete
        })
    }

    setColor = (colour) => {
        this.setState({
            colour: colour
        })
    }

    handleCreate = async () => {
        console.log(this.state.colour)
        console.log(this.state.groupName)
        console.log(this.state.involvedUsers)

        let usernames = []
        this.state.involvedUsers.forEach((userSelection) => {
            usernames.push(userSelection.value)
        })

        let data={
            groupName: this.state.groupName,
            colourHexCode: this.state.colour,
            usernames: usernames
        }

        await axios.post("/groups/add", data).then(
            res => {
                console.log("added new group")
                this.props.fetchGroupsData()
            }
        ).catch(
            err => {
                console.log(err.response.data.message)
                
            }
        )
        this.setShowAddModal(false)
    }

    loadSelections = () => {
        let selections = []
        this.props.users.forEach((user) => {
            let label = ""

            if (user.username === this.props.user.username) {
                // case user is logged in user
                label = "Me"
            } else {
                // found user
                label = user.firstName + " " + user.lastName 
            }

            label += (" (@" + user.username + ")")

            let option = {value: user.username, label:label}
            selections.push(option)

        })
        
        this.setState({
            selections: selections
        })

    }

    handleDelete = async(groupId, groupName) => {

        let deleteDescription = "Are you sure you want to delete the Group: '" + groupName + "' ? This will delete the group and its related expenses for EVERYONE involved."

       if (!this.state.confirmDelete) {
            this.setState({
                deleteDescription: deleteDescription,
                deleteGroupId: groupId
            })
        }

       if (this.state.confirmDelete) {
           // case user clicked confirm on delete modal
           await axios.delete("/groups/" + groupId).then(
               res => {
                   // this.updateExpenses()
                   this.props.fetchGroupsData()

                   this.setShowDeleteModal(false)
                   this.setConfirmDelete(false)
                   
               },
               err => {
                   console.log(err)
                   
               }
           )
       } else {
           // confirm delete not yet clicked, this means modal is not open
           this.setShowDeleteModal(true)
       }
    }

    handleEdit = (groupId) => {

        for (let i = 0; i < this.props.groupsData.length; i++) {
            let currGroup = this.props.groupsData[i]
            if (currGroup.id === groupId) {
                // case found group
                this.setState({
                    editGroup: currGroup
                })

            }
        }
        this.setShowEditModal(true)
    }

    handleCloseAddGroupModal = () => {
        this.setState({
            involvedUsers: [],
            groupName: ""
        })

    }

    handleJoin = () => {
       if (!this.state.joinGroupId || this.state.joinGroupId.length === 0) {

            this.setState({
                joinGroupErrorMessage: "Group ID cannot be empty."
            })
            return

       } 
        axios.put("/groups/" + this.state.joinGroupId.trim() + "/" + this.props.user.username).then(
            res => {
                // this.updateExpenses()
                this.props.fetchGroupsData()
                this.setShowJoinModal(false)
            },
            err => {
                if (err.response.status === 404 ) {
                    // case group not found
                    this.setState({
                        joinGroupErrorMessage: "Group not found with the given ID."
                    })
                } else if (err.response.status === 400) {
                    // case user is already in group
                    this.setState({
                        joinGroupErrorMessage: "You are already in this group."
                    })
                }
                console.log(err)
                
            }
        )
    }


    // SET 25 CHARS MAX FOR GROUP NAME



    render() {

        if (!this.props.user || this.props.groupsData === undefined) {
            // case not logged in
            return (
                <>
                    <div className='dashboard-padding'/>
                    <div className='dashboard-container'></div>
                </>
            )
        }

        return (
            <>
            <div className='dashboard-offset-padding'/>
            <div className='group-menu-container'>
            <Button variant='contained'  size="small" style={{backgroundColor: "#003366", display: "inline-block", marginRight: "20px"}} onClick={() => {this.setShowAddModal(true)}}>
                <label className='group-button-label'>Create</label>
            </Button>
            <h3 style={{display: "inline-block"}}>Your Groups</h3>
            <Button variant='contained' size="small" style={{backgroundColor: "#003366", display: "inline-block", marginLeft: "20px"}} onClick={() => {this.setShowJoinModal(true)}}>
                <label className='group-button-label'>Join</label>
            </Button>
            </div>
            <div className='dashboard-padding'/>
            <Link style={{color: "black"}} to={"/groups/individual"}>
            <div className='group-container' style={{backgroundColor: "#d3d3d3"}}>
                <label className="group-label" style={{marginLeft: "10px", fontSize: "20px", cursor: "pointer"}}>Individual / Non-group Expenses</label>
            </div>
            </Link>


            {this.props.groupsData.map((group) => {
                let colour = group.colourHexCode
                let groupNameColour = "#000000"

                var c = colour.substring(1);      // strip #
                var rgb = parseInt(c, 16);   // convert rrggbb to decimal
                var r = (rgb >> 16) & 0xff;  // extract red
                var g = (rgb >>  8) & 0xff;  // extract green
                var b = (rgb >>  0) & 0xff;  // extract blue

                var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

                if (luma < 70) {
                    // set group name to white instead of black
                    groupNameColour = "#ffffff"
                }

                return (
            
                <>
                <div className='groups-padding'/>
                
                <div style={{'backgroundColor': colour}} className='group-container' key={group.id}>

                <Link style={{color: "black"}} to={"/groups/" + group.id}>
                    <div style={{'backgroundColor': colour}} className='left-group-container'>
                        <label className="group-label" style={{cursor: "pointer", color: groupNameColour}}>{group.groupName}</label>

                    </div>
                </Link>

                <div className="right-group-container" style={{float:"right"}}>


                    <Button variant='contained'  size="medium" style={{float:"right",backgroundColor: "#003366", display: "inline-block", marginTop: "22px", paddingTop: "15px", paddingBottom: "15px"}} onClick={()=>{this.handleDelete(group.id, group.groupName)}}>
                    <DeleteIcon fontSize='medium'/>
                    </Button>

                    <Button variant='contained'  size="medium" style={{float:"right",backgroundColor: "#003366", display: "inline-block",marginRight: "15px", marginTop: "22px", paddingTop: "15px", paddingBottom: "15px"}} onClick={()=>{this.handleEdit(group.id)}}>
                    <ModeEditIcon fontSize='medium'/>
                    </Button>
                </div>

                </div>
                
                </>

            )})}
            <div className='dashboard-padding'/>
                <AddGroupModal 
                    isEdit={false} 
                    user={this.props.user} 
                    users ={this.props.users} 
                    show={this.state.showAddModal} 
                    setShow={this.setShowAddModal} 
                    fetchGroupsData={this.props.fetchGroupsData}
                />
                <AddGroupModal 
                    isEdit={true} 
                    user={this.props.user} 
                    users ={this.props.users} 
                    show={this.state.showEditModal} 
                    setShow={this.setShowEditModal} 
                    fetchGroupsData={this.props.fetchGroupsData}
                    group={this.state.editGroup}
                />
                <Modal
                    className='addModal'
                    show={this.state.showJoinModal}
                    onHide={this.setShowJoinModal}
                    keyboard={false}
                    size='xl'
                    backdrop='static'>

                        <Modal.Header className='modal-header'closeButton>
                        <Modal.Title >
                            
                            <h3>Join an Existing Group</h3>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.joinGroupErrorMessage ? 
                                <div className="alert alert-danger" role="alert">
                                    {this.state.joinGroupErrorMessage}
                                </div>
                                :
                                <></>
                            }
                                <label className='amount-label'>Enter Group ID here:</label>
                                <input onChange={e => this.setState({joinGroupId: e.target.value})} value={this.state.joinGroupId}></input>
                        </Modal.Body>
                        <div className='modal-padding'></div>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => {this.setShowJoinModal(false)}}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={this.state.confirmClicked} onClick={() => {this.handleJoin()}}>Join</Button>
                        </Modal.Footer>
                </Modal>
                <DeleteModal 
                show={this.state.showDeleteModal} 
                setShow={this.setShowDeleteModal} 
                setConfirmDelete={this.setConfirmDelete}
                handleDelete={this.handleDelete}
                isInDetails={false}
                description={this.state.deleteDescription} 
                id={this.state.deleteGroupId}/>
            </>



        )

    }

}