import {React, Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Home from "./Home";

export default class Login extends Component {
    state = {}

    
    handleSubmit = e => {
        e.preventDefault()
        const data = {
            username: this.username,
            password: this.password,

        }
        console.log(data)

        axios.post('login/authenticate', data).then(
            res => {
                localStorage.setItem("token", res.data.token)
                this.setState({
                    loggedIn: true
                })
                this.props.setUser(res.data)
            }
        ).catch(
            err => {
                this.setState({
                    message: err.response.data.message
                })
                if (err.response.status == 401) {
                    this.setState({
                        message: "username or password is incorrect."
                    })
                }
            }
        )
    }

    render() {
        if (this.state.loggedIn) {
            return <Navigate to={'/'}/>
        }

        let error = ''
        if (this.state.message) {
            // case has error message
            error = (
                <div className="alert alert-danger" role="alert">
                    {this.state.message}
                </div>            
            )
        }
        return (
            <form onSubmit={this.handleSubmit}>
                {error}
                <h3>Log In</h3>
                <div className='form-group'>
                    <label>Username</label>
                    <input type='text' className="form-control" placeholder="user name" onChange={e => this.username = e.target.value}/>
                </div>
                <div className='form-group'>
                    <label>Password</label>
                    <input type='password' className="form-control" placeholder="password" onChange={e => this.password = e.target.value}/>
                </div>
                <button className="btn btn-primary btn-block">Log In</button> 
            </form>
        )
    }
}