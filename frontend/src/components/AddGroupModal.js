import React, {Component} from 'react'
import Modal from 'react-bootstrap/Modal'
import Select from 'react-select'
import { Button } from '@mui/material'
import { HexColorPicker} from "react-colorful";
import axios from 'axios';
import { getLabel } from '../utils/Selections';
export default class AddGroupModal extends Component {

    state = {
        colour: "#47ba1e"
    }

    setColor = (colour) => {
        this.setState({
            colour: colour
        })
    }

    setShowModal = (show) => {
        this.props.setShow(show)

        this.setState({
            groupNameErrorMessage: "",
            membersErrorMessage: "",
            involvedUsers: [],
            groupName: ""
        })
    }

    handleCreate = async () => {
        if (!this.state.groupName) {
            // case no groupName or is empty
            this.setState({
                groupNameErrorMessage: "Group Name cannot be empty."
            })
            return
        } else {
            this.setState({
                groupNameErrorMessage: ""
            })
        }

        let usernames = []

        if (!this.state.involvedUsers || this.state.involvedUsers.length === 0) {
            this.setState({
                membersErrorMessage: "The group must have at least 1 member."
            })
            return
        } else {
            this.setState({
                membersErrorMessage: ""
            })
        }

        this.state.involvedUsers.forEach((userSelection) => {
            usernames.push(userSelection.value)
        })

        let data={
            groupName: this.state.groupName,
            colourHexCode: this.state.colour,
            usernames: usernames
        }

        if (!this.props.isEdit) {

            // current user must be an involved user, otherwise show error
            let currentUserUsername = this.props.user.username
            if (!usernames.includes(currentUserUsername)) {
                this.setState({
                    membersErrorMessage: "You must be one of the members in the group"
                })
                return
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
        } else {
            data.id = this.props.group.id
            // case edit
            await axios.put("/groups/" + this.props.group.id, data).then(
                res => {

                    console.log("updated group")
                    this.props.fetchGroupsData()
                    
                }
            ).catch(
                err => {
                    console.log(err.response.data.message)
                    
                }
            )
        }
        this.props.setShow(false)
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

        if (this.props.isEdit) {

            let involvedUsers = []
            this.props.group.usernames.forEach((username) => {
                let label = getLabel(username, this.props.users, this.props.user.username)
                let option = {
                    value: username,
                    label: label
                }
                involvedUsers.push(option)

            })

            this.setState({
                groupName: this.props.group.groupName,
                colour: this.props.group.colourHexCode,
                involvedUsers: involvedUsers
            })

        } else {
            // case add
            // generate random colour
            let colour = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
            this.setState({
                colour: colour
            })
        }
        
        this.setState({
            selections: selections
        })

    }

    render() {
        
        return (
            <Modal
                    className='addModal'
                    show={this.props.show}
                    onHide={this.setShowModal}
                    onShow={this.loadSelections}
                    keyboard={false}
                    size='xl'
                    backdrop='static'>

                        <Modal.Header className='modal-header'closeButton>
                        <Modal.Title >
                            
                            <h3>{this.props.group ? ("Edit Group: " + this.props.group.groupName) : "Add a New Group" }</h3>
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.groupNameErrorMessage ? 
                                <div className="alert alert-danger" role="alert">
                                    {this.state.groupNameErrorMessage}
                                </div>
                                :
                                <></>
                            }
                            <label className='amount-label'>Group Name (25 chars max)</label>
                            <input maxLength={25} onChange={e => this.setState({groupName: e.target.value})} value={this.state.groupName}></input>
                            <div className="padding"></div>
                            <label className='amount-label'>Colour Theme</label>
                            <HexColorPicker color={this.state.colour} onChange={this.setColor}/>
                            <div className="padding"></div>
                            {this.state.membersErrorMessage ? 
                                <div className="alert alert-danger" role="alert">
                                    {this.state.membersErrorMessage}
                                </div>
                                :
                                <></>
                            }
                            <label className='amount-label'>Members</label>
                            <Select
                                isMulti='true'
                                name="involved-user-select"
                                options={this.state.selections}
                                className="basic-multi-select"
                                closeMenuOnSelect={false}
                                blurInputOnSelect={false}
                                placeholder='Select Users'
                                value={this.state.involvedUsers}
                                onChange={(choice) => this.setState({involvedUsers: choice})}
                            />
                        </Modal.Body>
                        <div className='modal-padding'></div>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => {this.setShowModal(false)}}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={this.state.confirmClicked} onClick={() => {this.handleCreate()}}>
                            {this.props.isEdit? "Save" : "Create"}
                        </Button>
                        </Modal.Footer>
                </Modal>
        )
    } 
}