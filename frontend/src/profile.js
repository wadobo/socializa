import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'

import { setUser, user, logout } from './auth';


export default class Profile extends React.Component {
    state = { user: user }

    componentDidMount() {
        this.props.setAppState({ title: 'Profile', active: 'profile' });
    }

    save = (e) => {
        // TODO update user info
        setUser(this.state.user);
        hashHistory.push('/map');
    }

    aboutChange = (e) => {
        user.about = e.target.value;
        this.setState({user: user});
    }

    addInterest = (e) => {
        if (user.interests == undefined) {
            user.interests = [];
        }

        var v = document.querySelector('#interest');

        user.interests.push(v.value);
        v.value = '';
        this.setState({user: user});
    }

    removeInterest = (i, e) => {
        user.interests.splice(i, 1);
        this.setState({user: user});
    }

    changePassword = (e) => {
        var current = document.querySelector('#current').value;
        var newp = document.querySelector('#new').value;
        var repeat = document.querySelector('#repeat').value;

        // TODO, change the password
        if (newp != repeat) {
            alert("Password doesn't match, try again");
            return;
        }

        alert("Done!");
    }

    render() {
        return (
            <div id="profile" className="container">
                <textarea className="form-control" placeholder="about you" onChange={ this.aboutChange } value={ this.state.user.about }/>

                {/* interest */}
                <h3>Interests</h3>

                <div className="input-group">
                    <input type="text" id="interest" className="form-control" placeholder="interests"/>
                    <span className="input-group-btn">
                        <button className="btn btn-success" type="button" onClick={ this.addInterest }>
                            <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                   </span>
                </div>

                {/* interest tags */}
                <div id="interests">
                { this.state.user.interests.map((obj, i) => (
                    <span key={ obj } className="label label-danger">
                        { obj }
                        <i className="fa fa-times" onClick={ this.removeInterest.bind(this, i) }></i>
                    </span>
                ))}
                </div>

                {/* password change */}
                <hr/>
                <a className="btn btn-primary btn-block" role="button" data-toggle="collapse" href="#passwordChange"
                   aria-expanded="false" aria-controls="passwordChange">
                    <i className="fa fa-lock"></i> Change password
                </a>
                <div className="collapse" id="passwordChange">
                    <div className="well">
                        <input type="password" id="current" className="form-control" placeholder="current"/>
                        <input type="password" id="new" className="form-control" placeholder="new"/>
                        <input type="password" id="repeat" className="form-control" placeholder="repeat"/>
                    </div>
                    <button className="btn btn-danger btn-block" onClick={ this.changePassword }>Change</button>
                </div>

                <hr/>

                <button className="btn btn-block btn-success" onClick={ this.save }>Save</button>
            </div>
        );
    }
}
