import { React, Component } from "react";
import axios from "axios";
export default class Home extends Component {


    render() {
        if (this.props.user) {
            // case logged in
            return <h2>Welcome back, {this.props.user.firstName} :)</h2>
        }

        
        return <h2>You are not logged in :(</h2>
        
    }
}