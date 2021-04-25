import React from 'react';
import Sidebar from './SideBar.js';

import { Container, Row, Button, Col, Form, Tabs, Tab, ButtonGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";

import { loader } from 'graphql.macro';

import { client } from '../Client';

const AddPositionGroup = loader('../model/Position/addPositionGroup.graphql');
const GetPositionGroups = loader('../model/Position/getPositionGroups.graphql');
const AddPosition = loader('../model/Position/addPosition.graphql');
const GetPositions = loader('../model/Position/getPositions.graphql');

class PositionGroupView extends React.Component {
    render() {
        return (
            <Row key={this.props.value.entityId} style={{ marginTop: '10px' }}>
                <Col>
                    {this.props.value.name}
                </Col>
            </Row>
        );
    }
}

class PositionView extends React.Component {
    render() {
        var capacity = <></>;
        if(this.props.value.positionCapacity == 1) {
            capacity = <span>First day part</span>;
        } else if (this.props.value.positionCapacity == 2) {
            capacity = <span>Second day part</span>;
        } else if (this.props.value.positionCapacity == 3) {
            capacity = <span>Full day</span>;
        }

        var defaultShow = <span>No default show</span>;
        if (this.props.value.defaultShow){
            var defaultShow = <span>Default show</span>;
        }

        var oneHold = <span>Not uniq</span>;
        if (this.props.value.onePosition){
            var defaultShow = <span>Uniq</span>;
        }

        return (
            <Row key={this.props.value.entityId} style={{ marginTop: '10px' }}>
                <Col>
                    {this.props.value.name}
                </Col>
                <Col>
                    {this.props.value.positionGroup.name}
                </Col>
                <Col>
                    {capacity}
                </Col>
                <Col>
                    {defaultShow}
                </Col>
                <Col>
                    {oneHold}
                </Col>
            </Row>
        );
    }
}

class Positions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            positionGroups: [],
            positions: []
        };
    }

    componentDidMount(){
        this.updatePositionGroupsList();
        this.updatePositionList();
    }

    updatePositionGroupsList = () => {
        client.query({
            query: GetPositionGroups,
            fetchPolicy: 'no-cache'
        }).then((res) => {
            this.setState({
                positionGroups: res.data.positionGroups,
            })
        })
    }

    updatePositionList = () => {
        client.query({
            query: GetPositions,
            fetchPolicy: 'no-cache'
        }).then((res) => {
            this.setState({
                positions: res.data.positions,
            })
        })
    }

    addPostionGroup = (e) => {
        e.preventDefault();
        client.mutate({
            mutation: AddPositionGroup,
            variables: {
                name: e.target.newGroupName.value
            }
        }).then((res) => {
            console.log(res);
            this.updatePositionGroupsList();
            e.target.reset();
        });
    }

    addPosition = (e) => {
        e.preventDefault();
        client.mutate({
            mutation: AddPosition,
            variables: {
                name: e.target.newPositionName.value,
                positionGroup: e.target.newPositionGroup.value,
                positionCapacity: e.target.newPositionCapacity.value,
                defaultShow: e.target.newPositionDefaultShow.checked,
                onePosition: e.target.newPositionUniq.checked
            }
        }).then((res) => {
            console.log(res);
            this.updatePositionList();
            e.target.reset();
        });
    }

    render() {
        return (
            <>
                <Container>
                    <Row>
                        <Col sm={3}>
                            <Sidebar />
                        </Col>
                        <Col sm={9}>
                            <Tabs>
                                <Tab eventKey="groups" title="Groups">
                                    {this.state.positionGroups.map((value, index) => {
                                        return <PositionGroupView key={index} value={value}/>
                                    })}
                                    <Row style={{ marginTop: '10px' }}>
                                        <Col>
                                            <Form onSubmit={ this.addPostionGroup }>
                                                <Row>
                                                    <Col>
                                                        <Form.Control placeholder="Name" name="newGroupName" />
                                                    </Col>
                                                    <Col sm={2}>
                                                        <Button variant="primary" type="submit">
                                                            Add
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </Col>
                                    </Row>
                                </Tab>
                                <Tab eventKey="positions" title="Positions">
                                    {this.state.positions.map((value, index) => {
                                        return <PositionView key={index} value={value}/>
                                    })}
                                    <Form onSubmit={ this.addPosition }>
                                        <Row style={{ marginTop: '10px' }}>
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <Row>
                                                            <Col>
                                                                <Form.Control placeholder="Name" name="newPositionName" />
                                                            </Col>
                                                            <Col>
                                                                <Form.Control as="select" name="newPositionGroup">
                                                                    {this.state.positionGroups.map((value, index) => {
                                                                        return <option value={value.entityId} key={value.entityId}>{value.name}</option>
                                                                    })}
                                                                </Form.Control>
                                                            </Col>
                                                            <Col>
                                                                <Form.Control as="select" name="newPositionCapacity">
                                                                    <option key="1" value="1">First part</option>
                                                                    <option key="2" value="2">Second part</option>
                                                                    <option key="3" value="3">Full</option>
                                                                </Form.Control>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Form.Check inline label="One-hold position" type="checkbox" name="newPositionUniq" />
                                                            </Col>
                                                            <Col>
                                                                <Form.Check inline label="Default show" type="checkbox" name="newPositionDefaultShow" />
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col sm={2}>
                                                <Row>
                                                    <Col>
                                                        <Button variant="primary" type="submit">
                                                            Add
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default Positions;