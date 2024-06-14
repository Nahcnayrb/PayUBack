import { React, Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Button } from '@mui/material';

export default class Register extends Component {

    state = {}

    handleSubmit = e => {
        e.preventDefault()

        // validation
        let usernameMessage = ""
        let passwordMessage = ""
        let confirmPasswordMessage = ""
        let registerFailMessage = ""
        if (this.username ==  null) {
            usernameMessage = "username cannot be empty"

        }

        if ((this.password == null) || (this.password.length < 8)) {
            passwordMessage = "password must not be less than 8 characters"
        }

        if (this.password !== this.confirmPassword) {
            confirmPasswordMessage = "Passwords do not match"

        }

        this.setState({
            usernameMessage: usernameMessage,
            passwordMessage: passwordMessage,
            confirmPasswordMessage: confirmPasswordMessage
        })

        if ((usernameMessage.length !== 0) || passwordMessage.length !== 0 || confirmPasswordMessage.length !== 0) {
            return
        }


        const data = {
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            password: this.password,
            confirmPassword: this.confirmPassword
        }

        axios.post('users/add', data).then(
            res => {
                console.log(res)
                this.setState({
                    registered: true
                })
                alert("Your account was successfully created!")
            }
        ).catch(
            err => {
                if (err.response.status === 409) {
                    console.log("username is already taken")
                    registerFailMessage = "username is already taken."
                    this.setState({
                        registerFailMessage: registerFailMessage
                    })

                }
            }
        )
    }

    render() {
        if (this.state.registered) {
            return <Navigate to={'/login'}/> 
        }

        let usernameError = ""
        let passwordError = ""
        let confirmPasswordError = ""
        let registerFailError = ""
        if (this.state.usernameMessage) {
            // case has error message

            usernameError = (
                <div className="alert alert-danger" role="alert">
                    {this.state.usernameMessage}
                </div>  
            )
        }
        if (this.state.passwordMessage) {
            passwordError = (
                <div className="alert alert-danger" role="alert">
                {this.state.passwordMessage}
            </div>  
            )
        }

        if (this.state.confirmPasswordMessage) {
            confirmPasswordError = (
                <div className="alert alert-danger" role="alert">
                {this.state.confirmPasswordMessage}
            </div>  
            )
        }

        if (this.state.registerFailMessage) {
            registerFailError = (
                <div className="alert alert-danger" role="alert">
                {this.state.registerFailMessage}
            </div>  
            )
        }

        return (
            <div className='auth-wrapper'>
                <div className='auth-inner'>
                    <form onSubmit={this.handleSubmit}>
                        <h3>Create new account</h3>
                        <div className='form-group'>
                            <label>First Name</label>
                            <input type='text' className="form-control" placeholder="First Name" onChange={e => this.firstName = e.target.value}/>
                        </div>
                        <div className="padding"></div>
                        <div className='form-group'>
                            <label>Last Name</label>
                            <input type='text' className="form-control" placeholder="Last Name" onChange={e => this.lastName = e.target.value}/>
                        </div>
                        <div className="padding"></div>
                        {usernameError}
                        <div className='form-group'>
                            <label>Username</label>
                            <input type='text' className="form-control" placeholder="user name" onChange={e => this.username = e.target.value}/>
                        </div>
                        <div className="padding"></div>
                        {passwordError}
                        <div className='form-group'>
                            <label>Password</label>
                            <input type='password' className="form-control" placeholder="password" onChange={e => this.password = e.target.value}/>
                        </div>
                        <div className="padding"></div>
                        {confirmPasswordError}
                        <div className='form-group'>
                            <label>Confirm Password</label>
                            <input type='password' className="form-control" placeholder="password" onChange={e => this.confirmPassword = e.target.value}/>
                        </div>
                        <div className="padding"></div>
                        {registerFailError}
                        <Button type="submit" variant="contained" style={{backgroundColor: "#003366"}}>
                                <label style={{cursor: "pointer"}}>Sign Up!</label>
                        </Button>
                    </form>
                </div>
            </div>
        )
    }
}