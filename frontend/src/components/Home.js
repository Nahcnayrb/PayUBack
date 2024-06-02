import { React, Component } from "react";
import axios from "axios";
export default class Home extends Component {


    render() {
        if (this.props.user) {
            // case logged in
            return <h2>Welcome, {this.props.user.firstName} {this.props.user.lastName} </h2>
        }

        
        return <h2>You are not logged in</h2>
        
    }
}