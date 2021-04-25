import React, { useState } from 'react';

import { Container, Row, Button, Col, Form } from 'react-bootstrap';
import { Link } from "react-router-dom";

import { loader } from 'graphql.macro';

import { client } from '../Client';

const GetEmployer = loader('../model/Employer/getEmployer.graphql');
const UpdateEmployer = loader('../model/Employer/updateEmployer.graphql');

class Employer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            surname: null,
            entityId: props.match.params.id,
            loading: true,
            saving: 0
        };
    }

    componentDidMount(){
        client.query({
            query: GetEmployer,
            variables: { 
                entityId: this.state.entityId
            },
            fetchPolicy: 'no-cache'
        }).then((res) => {
            this.setState({
                name: res.data.employer.name,
                surname: res.data.employer.surname,
                loading: false
            })
        })
    }

    save = (e) => {
        this.setState({ saving: 1 });
        e.preventDefault();
        client.mutate({
            mutation: UpdateEmployer,
            variables: {
                name: this.state.name,
                surname: this.state.surname,
                entityId: this.state.entityId
            }
        }).then((res) => {
            console.log(res);
            this.setState({ saving: 2 });
            setTimeout(function() { 
                this.setState({ saving: 0 })
            }.bind(this), 1000);
        });
    }

    getSaveButtonView = () => {
        if(this.state.saving == 1){
            return <div>Saving</div>
        } else if (this.state.saving == 2) {
            return <div>Saved</div>
        } else {
            return (
                <Button variant="primary" type="submit">
                    Save
                </Button>
            );
        }
    }

    render() {
        if (this.state.loading){
            return <div>Loading...</div>
        } else {
            return (
                <>
                    <Container>
                        <Row>
                            <Col>
                                <Link to={`/employers`} className="btn btn-secondary">Back</Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form onSubmit={this.save}>
                                    <Form.Group>
                                        <Form.Label>First name</Form.Label>
                                        <Form.Control type="text" onChange={e => this.setState({ name: e.target.value })} defaultValue={ this.state.name !== null ? this.state.name : "" } style={{ direction: 'rtl' }} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Last name</Form.Label>
                                        <Form.Control type="text" onChange={e => this.setState({ surname: e.target.value })} defaultValue={ this.state.surname !== null ? this.state.surname : "" } style={{ direction: 'rtl' }} />
                                    </Form.Group>
                                    { this.getSaveButtonView() }
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                </>
            );
        }
    }
}

export default Employer;