import { React, Component } from "react";
import axios from "axios";
export default class Home extends Component {


    render() {
        if (this.props.user) {
            // case logged in
            return (
                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                        <h2>Welcome back, {this.props.user.firstName} :)</h2>
                        <div className="padding"></div>
                        <h3>Click on Dashboard to manage your expenses.</h3>
                    </div>
                </div>

        )}

        
        return( 
            <div className='auth-wrapper'>
                <div className='auth-inner'>
                    <div>
                    <h2>You are not logged in :(</h2>
                    <div className="padding"></div>
                    <h3> Please log in or create a new account to continue.</h3>
                    </div>
                </div>
            </div>
        )
        
    }
}