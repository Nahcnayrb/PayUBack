import React,{Component} from 'react'

export default class Dashboard extends Component {


    render() {
    
        return (
            <form onSubmit={this.handleSubmit}>
                <h3>Dashboard</h3>
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