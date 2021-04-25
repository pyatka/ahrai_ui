import React from 'react';

import { Form, Button} from 'react-bootstrap';
import { loader } from 'graphql.macro';
import { client } from '../Client';
import { Redirect } from 'react-router-dom';

const AuthEmployer = loader('../model/Employer/authEmployer.graphql');

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: false,
        };
    }

    onSubmit = (e) => {
        e.preventDefault();
        client.mutate({
            mutation: AuthEmployer,
            variables: {
                email: e.target.email.value,
                password: e.target.password.value
            }
        }).then((res) => {
            if(res.data.authEmployer.success){
                localStorage.setItem("token", res.data.authEmployer.token);
                this.setState({
                    auth: true,
                });
            }
        });
    }

    render(){
        if(this.state.auth){
            return <Redirect to="/"/>;
        } else {
            return (
                <div className="Login">
            <Form onSubmit={this.onSubmit}>
                <Form.Group size="lg" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    autoFocus
                    type="email"
                    name="email"
                />
                </Form.Group>
                <Form.Group size="lg" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                />
                </Form.Group>
                <Button block size="lg" type="submit" >
                Login
                </Button>
            </Form>
            </div>
            );
        }
    }
}

export default Login;