import React, {Component} from 'react'
import { Button } from '@mui/material';
import axios from 'axios';

export default class Profile extends Component {
    state = {
        hasInitialized: false
    }


    handleSave = () => {

        this.setState({
            errorMessage: "",
            successMessage: ""
        })

        if (!this.state.firstName || this.state.firstName.length === 0) {
            // case first name is empty
            this.setState({
                errorMessage: "First name cannot be empty."
            })
            return

        }
        this.setState({
            successMessage: "Saving..."
        })

        let data = {
            id: this.props.user.id,
            firstName: this.state.firstName.trim(),
            lastName: this.state.lastName,
            username: this.state.username,
            email: this.state.email
        }
        console.log(data)

        let token = this.props.user.token

        axios.put("/users/update", data).then(
            res => {
                console.log("update user api call")
                this.setState({
                    successMessage: "Profile Updated!"
                })
                setTimeout(()=>{this.props.fetchLoggedInUser(token)},50)
                
            }
        ).catch(
            err => {
                console.log(err.response)
            }
        )

    }

    render() {
        if (!this.props.user) {
            return (<></>)
        }

        // at this point, props.user is not null
        if (!this.state.hasInitialized) {
            
            this.setState({
                firstName: this.props.user.firstName,
                lastName: this.props.user.lastName,
                username: this.props.user.username,
                email: this.props.user.email,
                hasInitialized: true,
                errorMessage: "",
                successMessage: ""
            })

        }



        return (
            <div className='auth-wrapper'>
            <div className='auth-inner'>
                <form>
                    {this.state.errorMessage?
                    <div className="alert alert-danger" role="alert">
                        {this.state.errorMessage}
                    </div>
                    :
                    ""
                    }
                    {this.state.successMessage?
                    <div class="alert alert-success" role="alert">
                        {this.state.successMessage}
                    </div>
                    :
                    ""
                    }
                    <h3>My Profile</h3>
                    <div className='form-group'>
                        <label>First Name</label>
                        <input type='text' className="form-control" placeholder="First Name" value={this.state.firstName} onChange={e => this.setState({firstName: e.target.value, hasFirstNameChanges: (e.target.value !== this.props.user.firstName)})}/>
                    </div>
                    <div className="padding"></div>
                    <div className='form-group'>
                        <label>Last Name</label>
                        <input type='text' className="form-control" placeholder="Last Name"value={this.state.lastName} onChange={e => this.setState({lastName: e.target.value, hasLastNameChanges: (e.target.value !== this.props.user.lastName)})}/>
                    </div>
                    <div className="padding"></div>
                    <div className='form-group'>
                        <label>Username</label>
                        <input type='text' className="form-control" disabled={true} value={this.state.username} onChange={e => this.setState({username: e.target.value})}/>
                    </div>
                    <div className="padding"></div>

                    <div className='form-group'>
                        <label>E-Transfer Email</label>
                        <input type='text' className="form-control" placeholder="email@email.com" value={this.state.email} onChange={e => this.setState({email: e.target.value, hasEmailChanges: (e.target.value !== this.props.user.email)})}/>
                    </div>
                    <div className="padding"></div>

                    <Button disabled={!this.state.hasEmailChanges && !this.state.hasFirstNameChanges && !this.state.hasLastNameChanges} variant="contained" style={{backgroundColor: "#003366"}} onClick={this.handleSave}>
                            <label style={{cursor: "pointer"}}>Save</label>
                    </Button>
                </form>
            </div>
        </div>
        )
    }
}