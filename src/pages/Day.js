import React from 'react';

import { Redirect, Link } from "react-router-dom";

import { Container, Row, Button, Col, Form, Tabs, Tab, Badge, Alert, Modal, ButtonGroup, DropdownButton, Dropdown, Navbar, Nav, NavDropdown, FormControl } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faChevronLeft, faChevronRight, faHome, faCog } from '@fortawesome/fontawesome-free-solid';
import Autosuggest from 'react-autosuggest';

import { loader } from 'graphql.macro';

import { client } from '../Client';

import "react-datepicker/dist/react-datepicker.css";

const GetPositions = loader('../model/Position/getPositions.graphql');
const GetEmployersList = loader('../model/Employer/getEmployersList.graphql');
const GetDay = loader('../model/Day/getDay.graphql');
const UpdateDayPosition = loader('../model/Day/updateDayPosition.graphql');
const AddPositionEmployer = loader('../model/Day/addPositionEmployer.graphql');
const DeletePositionEmployer = loader('../model/Day/deletePositionEmployer.graphql');
const SwitchPositionEmployerOrder = loader('../model/Day/switchPositionEmployerOrder.graphql');

class EmployerView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employer: props.employer,
            context: props.context,
            clickSelect: (props.clickSelect === undefined) ? false : props.clickSelect
        };
    }

    renderBadge = (position) => {
        let btype = "primary";
        if(position.positionCapacity === 2){
            btype = "warning";
        } else if (position.positionCapacity === 3){
            btype = "danger";
        }
        return <Badge key={position.entityId} variant={btype} style={{marginLeft: '3px'}}>{position.name}</Badge>
    }

    onEmployerClick = () => {
        if (this.state.clickSelect) {
            this.state.context.onEmployerClick(this.state.employer.entityId);
        }
    }

    render() {
        var badges = [];

        if(this.state.employer.positions !== undefined) {
            this.state.employer.positions.map((pid) => {
                badges.push(this.renderBadge(this.state.context.positions[pid]));
            }); 
        }

        return (
            <Row style={{cursor: 'pointer'}} onClick={this.onEmployerClick}>
                <Col className="text-left">
                    {this.state.employer.surname}
                    {badges.map((b) => {
                        return b;
                    })}
                </Col>
            </Row>
        );
    }
}

class EmployerInPosition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employerId: props.employerId,
            position: props.position,
            context: props.context
        };
    }

    getLoopIndex = () => {
        let index = 0;
        if(this.state.position.employers !== undefined){
            index = this.state.position.employers.findIndex((a) =>{
                return a.entityId == this.state.employerId;
            });
        }

        return index;
    }

    isFirst = () => {
        return this.getLoopIndex() === 0;
    }

    isLast = () => {
        return this.state.position.employers.length - 1 === this.getLoopIndex();
    }

    onDeleteClick = () => {
        this.state.context.onPositionEmployerDelete(this.state.position.entityId, this.state.employerId);
        client.mutate({
            mutation: DeletePositionEmployer,
            variables: {
                dayId: this.state.context.dayData.entityId,
                positionId: this.state.position.entityId,
                employerId: this.state.employerId
            }
        }).then((res) => {
            this.getLoopIndex();
            this.state.context.onAddAlert(res.data.deletePositionEmployer.alerts);
        });
    }

    onLeftClick = () => {
        let currentIndex = this.state.position.employers.findIndex((e) => {
            return e.entityId == this.state.employerId;
        });
        let toChangeIndex = currentIndex - 1;

        this.state.context.onEmployerPositionSwitch(this.state.position.entityId, 
                                                    this.state.position.employers[currentIndex], 
                                                    this.state.position.employers[toChangeIndex]);
    }

    onRightClick = () => {
        let currentIndex = this.state.position.employers.findIndex((e) => {
            return e.entityId == this.state.employerId;
        });
        let toChangeIndex = currentIndex + 1;

        this.state.context.onEmployerPositionSwitch(this.state.position.entityId, 
                                                    this.state.position.employers[currentIndex], 
                                                    this.state.position.employers[toChangeIndex]);
    }

    render(){
        let leftButton = <Button onClick={this.onLeftClick} size="sm" variant="primary">
            <FontAwesomeIcon icon={faChevronLeft} />
        </Button>;
        if(this.isFirst()){
            leftButton = <></>;
        }

        let rightButton = <Button onClick={this.onRightClick} size="sm" variant="primary">
            <FontAwesomeIcon icon={faChevronRight} />
        </Button>;
        if(this.isLast()){
            rightButton = <></>;
        }

        return(
            <Row>
                <Col>
                    {this.state.context.employers[this.state.employerId].surname}
                </Col>
                <Col sm={1}>
                    <Button onClick={this.onDeleteClick} size="sm" variant="danger">
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                </Col>
                <Col sm={1}>
                    {leftButton}
                </Col>
                <Col sm={1}>
                    {rightButton}
                </Col>
            </Row>
        );
    }
}

class PositionView extends React.Component{
    constructor(props) {
        super(props);
        let maxViewOrder = Math.max(props.position.employers.map((p) => p.viewOrder));
        this.state = {
            maxViewOrder: (maxViewOrder === undefined) ? 0 : maxViewOrder,
            value: '',
            suggestions: [],
            defaultShow: props.position.defaultShow,
            comment: (props.position.comment === undefined) ? "" : props.position.comment,
            position: props.position,
            context: props.context
        };
      }

    getEmployerSuggestion = (value) => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : Object.values(this.props.context.employers).filter(a =>
            a.surname.toLowerCase().slice(0, inputLength) === inputValue && this.state.position.employers.findIndex((v) => {
                return v.entityId == a.entityId
            }) == -1
        );
    }

    renderEmployerSuggestion = (suggestion, isHighlighted) => {
        // console.log(suggestion, isHighlighted);
        return (
            <EmployerView key={suggestion.entityId}
                            employer={this.state.context.employers[suggestion.entityId]}
                            context={this.state.context}
                            highlight={isHighlighted}/>
        );
    }

    renderSuggestionsContainer = ({ containerProps, children, query }) => {
        if(children !== null) {
            // console.log(children);
            return (
                <div {...containerProps} style={{ position: 'absolute', zIndex: 999, backgroundColor: 'white', width: '100%' }}>
                    <Container style={{width:'100%'}}>
                      {children.props.items.map((item, i) => {
                          return this.renderEmployerSuggestion(item, children.props.highlightedItemIndex == i);
                      })}
                    </Container>
                </div>
              );
        } else {
            return <></>;
        }
      }

    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: this.getEmployerSuggestion(value)
        });
    };

    updatePropertyValues = () => {
        client.mutate({
            mutation: UpdateDayPosition,
            variables: {
                dayId: this.props.context.dayData.entityId,
                positionId: this.props.position.entityId,
                defaultShow: this.state.defaultShow,
                comment: this.state.comment
            }
        }).then((res) => {
            // console.log(res);
        });
    }

    onChange = (event, { newValue }) => {
        this.setState({
          value: newValue
        });
    };

    addEmployer = (p, e, suggestion) => {
        p.employers.push({
            entityId: suggestion.entityId,
            viewOrder: this.state.maxViewOrder + 1
        });
        this.props.context.onUpdatePosition(this.props.position.entityId, p);

        e.positions.push(this.props.position.entityId);
        this.props.context.onUpdateEmployer(suggestion.entityId, e);
        this.setState({
            value: '',
            maxViewOrder: this.state.maxViewOrder + 1
        });

        client.mutate({
            mutation: AddPositionEmployer,
            variables: {
                dayId: this.props.context.dayData.entityId,
                positionId: this.props.position.entityId,
                employerId: suggestion.entityId,
                orderView: p.employers.length - 1
            }
        }).then((res) => {
            this.state.context.onAddAlert(res.data.addPositionEmployer.alerts);
        });
    }

    onSuggestionSelect = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
        var p = this.props.context.positions[this.props.position.entityId];
        var e = this.props.context.employers[suggestion.entityId];
        if(p.positionCapacity == 2){
            var isInOther = null;
            e.positions.map((ep) => {
                if(this.state.context.positions[ep].positionCapacity == 2){
                    isInOther = ep;
                }
            });

            if(isInOther !== null){
                let ap = this.state.context.positions[isInOther];
                this.state.context.onModalAlertShow("Are you shure?", 
                                                    e.surname + " will be deleted from " 
                                                    + ap.positionGroup.name + ": " + ap.name,
                                                    () => {
                                                        this.state.context.onPositionEmployerDelete(ap.entityId, suggestion.entityId);
                                                        this.addEmployer(p, e, suggestion);
                                                    },
                                                    () => {
                                                        this.onBlur();
                                                    });
            } else {
                this.addEmployer(p, e, suggestion);
            }
        } else if (p.positionCapacity == 3 && e.positions.length > 0) {
            var pString = "";
            e.positions.map((ep, i) => {
                let a = this.state.context.positions[ep];
                pString += a.name;
                // pString += a.positionGroup.name + ":" + a.name;
                if (i < e.positions.length - 1){
                    pString += ", "
                }
            });

            this.state.context.onModalAlertShow("Are you shure?", 
                                                    e.surname + " will be deleted from " 
                                                    + pString,
                                                    () => {
                                                        e.positions.map((ep) => {
                                                            this.state.context.onPositionEmployerDelete(ep, suggestion.entityId);
                                                        });
                                                        this.addEmployer(p, e, suggestion);
                                                    },
                                                    () => {
                                                        this.onBlur();
                                                    });
        } else {
            this.addEmployer(p, e, suggestion)
        }
    }
    
    onBlur = (e) => {
        this.setState({
            value: ''
        });
    }

    showCheckClick = (e) => {
        this.setState({
            defaultShow: e.target.checked
        }, () => {this.updatePropertyValues()});
    }

    render(){
        const inputProps = {
            placeholder: 'Type name',
            value: this.state.value,
            onChange: this.onChange,
            onBlur: this.onBlur,
            className: "form-control",
        };

        return (
            <Row style={{ marginBottom: '20px', padding: '5px' }}>
                <Col style={{ marginBottom: '10px' }}>
                    <Row style={{ marginBottom: '5px' }}>
                        <Col sm={1}>
                            <Form.Check onChange={this.showCheckClick} type="checkbox" defaultChecked={this.state.defaultShow} />
                        </Col>
                        <Col>
                            <h5>{this.props.position.name}</h5>
                        </Col>
                        <Col>
                            <Form.Control onBlur={this.updatePropertyValues} onChange={(e) => this.setState({comment: e.target.value})} type="text" placeholder="Comment" value={(this.state.comment === undefined || this.state.comment === null) ? '' : this.state.comment} />
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: '5px' }}>
                        {this.state.position.employers.map((value, i) => {
                                return (
                                    <Col sm={6} style={{ marginTop: '5px' }}  key={value.entityId}>
                                        <EmployerInPosition employerId={value.entityId} 
                                                            position={this.state.position}
                                                            context={this.state.context}/>
                                    </Col>
                                );
                            })}
                        <Col  sm={6} style={{ marginTop: '5px' }}>
                            <Autosuggest
                                suggestions={this.state.suggestions}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={() => { this.setState({suggestions: []}) }}
                                getSuggestionValue={(suggestion) => suggestion.surname}
                                renderSuggestion={this.renderEmployerSuggestion}
                                inputProps={inputProps}
                                onSuggestionSelected={this.onSuggestionSelect}
                                containerProps={{}}
                                highlightFirstSuggestion={true}
                                // renderSuggestionsContainer={this.renderSuggestionsContainer}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

class PositionGroupTabView extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            context: props.context,
            positionGroup: props.positionGroup
        };
    }

    render(){
        return (
            <>
                {this.state.positionGroup.positionsList.map((value) => {
                    const p = this.state.context.positions[value];
                    return(
                        <Row key={p.entityId}>
                            <Col>
                                <PositionView position={p} context={this.state.context}/>
                            </Col>
                        </Row>
                    );
                })}
            </>
        );
    }
}

class Day extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(props.match.params.year, props.match.params.month - 1, props.match.params.day),
            year: props.match.params.year,
            month: props.match.params.month,
            dayData: undefined,
            day: props.match.params.day,
            positions: {},
            positionGroups: [],
            employers: {},
            editPosition: undefined,
            alerts: [],
            modalAlert: {
                title: "",
                message: "",
                show: false,
                okCallback: () => {},
                noCallback: () => {},
            },
            employerViewFiler: "no",
            onUpdateEmployer: this.onUpdateEmployer,
            onUpdatePosition: this.onUpdatePosition,
            onPositionEmployerDelete: this.onPositionEmployerDelete,
            onEmployerPositionSwitch: this.onEmployerPositionSwitch,
            onEmployerClick: this.onEmployerClick,
            onAddAlert: this.onAddAlert,
            onModalAlertShow: this.onModalAlertShow,
        };
    }

    onModalAlertShow = (title, message, okCallback, noCallback) => {
        this.setState({
            modalAlert: {
                title: title,
                message: message,
                show: true,
                okCallback: okCallback,
                noCallback: noCallback,
            }
        })
    }

    onModalAlertClose = () => {
        this.setState({
            modalAlert: {
                title: "",
                message: "",
                show: false,
                okCallback: () => {},
                noCallback: () => {},
            }
        })
    }

    onAddAlert = (alert) => {
        if(alert.length > 0){
            var alerts = this.state.alerts;
            alert.map((a) => {
                alerts.unshift(a);
                if(alerts.length > 30) {
                    alerts.pop();
                }
            });

            this.setState({
                alerts: alerts,
            }, () => {
                window.scrollTo(0, 0);
            });
        }
    }

    onEmployerClick = (employerId) => {
        // console.log(employerId);
        // this.setState({
        //     possibleEmployer: employerId
        // });
    }

    onEmployerPositionSwitch = (positionId, current, next) => {
        var plist = this.state.positions;
        var newEmployers = [];

        plist[positionId].employers.map((v) => {
            let d = {
                entityId: v.entityId,
                viewOrder: v.viewOrder
            }
            if(v.entityId == current.entityId){
                d.viewOrder = next.viewOrder;
            }

            if(v.entityId == next.entityId){
                d.viewOrder = current.viewOrder;
            }

            newEmployers.push(d);
        });

        newEmployers.sort((a, b) => {
            if(a.viewOrder > b.viewOrder){
                return 1;
            } else if (a.viewOrder < b.viewOrder) {
                return -1;
            } else {
                return 0;
            }
        });

        plist[positionId].employers = newEmployers;

        this.setState({
            positions: plist,
        });

        client.mutate({
            mutation: SwitchPositionEmployerOrder,
            variables: {
                dayId: this.state.dayData.entityId,
                positionId: positionId,
                firstId: current.entityId,
                secondId: next.entityId
            }
        }).then((res) => {
            // console.log(res);
        });
    }

    onPositionEmployerDelete = (positionId, employerId) => {
        let plist = this.state.positions;
        plist[positionId].employers = plist[positionId].employers.filter(function(obj) {
            return obj.entityId !== employerId;
        });

        let elist = this.state.employers;
        elist[employerId].positions = elist[employerId].positions.filter(function(obj) {
            return obj !== positionId;
        });

        this.setState({
            positions: plist,
            employers: elist
        });
    }

    onUpdatePosition = (id, position) => {
        var e = this.state.positions;
        e[id] = position;
        this.setState({
            positions: e
        });
    }

    onUpdateEmployer = (id, employer) => {
        var e = this.state.employers;
        e[id] = employer;
        this.setState({
            employers: e
        });
    }

    componentDidMount(){
        this.updatePositionList();
    }

    updateDayInfo = (employers, positions, positionGroups) => {
        client.query({
            query: GetDay,
            variables: {
                year: this.state.year,
                month: this.state.month,
                day: this.state.day 
            }
        }).then((res) => {
            res.data.day.positions.map((value) => {
                if (positions[value.entityId] !== undefined){
                    Object.defineProperty(positions[value.entityId], "comment", { value: value.comment, writable: true});
                    Object.defineProperty(positions[value.entityId], "viewOrder",  { value: value.viewOrder, writable: true});
                    Object.defineProperty(positions[value.entityId], "defaultShow",   { value: value.defaultShow, writable: true});
                }

                value.employers.map((employer) => {
                    if(positions[value.entityId].employers === undefined){
                        positions[value.entityId].employers = []
                    }
                    positions[value.entityId].employers.push({
                        entityId: employer.entityId,
                        viewOrder: employer.viewOrder
                    });

                    if(employers[employer.entityId].positions === undefined){
                        employers[employer.entityId].positions = []
                    }
                    employers[employer.entityId].positions.push(value.entityId)
                });

                positions[value.entityId].employers.sort((a, b) => {
                    if(a.viewOrder > b.viewOrder){
                        return 1;
                    } else if (a.viewOrder < b.viewOrder) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
            });

            this.setState({
                positions: positions,
                positionGroups: positionGroups,
                employers: employers,
                dayData: res.data.day
            }, () => {
                // console.log("fdgfg");
            });
        });
    }

    updateEmployersList = (positions, positionGroups) => {
        client.query({
            query: GetEmployersList
        }).then((res) => {
            var e = {};
            res.data.employers.map((value) => {
                e[value.entityId] = value;
                e[value.entityId].positions= [];
            });

            this.updateDayInfo(e, positions, positionGroups);
        });
    }

    sortEmployers = (e) => {
        e.sort((a, b) => {
            if(a.positions.length > b.positions.length){
                return 1;
            } else if (a.positions.length < b.positions.length) {
                return -1;
            } else {
                return 0;
            }
        })
        return e;
    }

    updatePositionList = () => {
        client.query({
            query: GetPositions
        }).then((res) => {
            var pgs = [];
            var p = {};

            res.data.positions.map((value) => {
                if (pgs.find(o => o.entityId === value.positionGroup.entityId) == undefined){
                    pgs.push(value.positionGroup);
                }

                var cpg = pgs.find(o => o.entityId === value.positionGroup.entityId)
                if(cpg !== undefined){
                    if(cpg.positionsList == undefined){
                        cpg.positionsList = [value.entityId]
                    } else {
                        cpg.positionsList.push(value.entityId)
                    }
                }

                p[value.entityId] = value;
                p[value.entityId].employers = [];
                p[value.entityId].comment = "";
            });

            pgs.sort((a, b) => {
                if(a.viewOrder > b.viewOrder){
                    return 1;
                } else if (a.viewOrder < b.viewOrder) {
                    return -1;
                } else {
                    return 0;
                }
            });

            this.updateEmployersList(p, pgs);
        })
    }

    onDateChange = (date) => {
        let link = "/app/day";
        link = link + "/" + date.getDate();
        link = link + "/" + (date.getMonth() + 1);
        link = link + "/" + date.getFullYear();
        window.location = link;
    }

    onPrintClick = () => {
        let link = "/api/render";
        link = link + "/" + this.state.day;
        link = link + "/" + this.state.month;
        link = link + "/" + this.state.year;
        window.open(link, '_blank').focus();
    }

    getTopAlert = () => {
        if(this.state.alerts.length > 0) {
            return (
                <Alert variant={this.state.alerts[0].type}>
                    {this.state.alerts[0].message}
                </Alert>
            );
        } else {
            return <></>;
        }
    }

    onEmployerFilerChange = (e) => {
        this.setState({
            employerViewFiler: e.target.value
        });
    }

    render() {
        return (
            <Container>
                <Modal show={this.state.modalAlert.show} onHide={this.onModalAlertClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modalAlert.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.modalAlert.message}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={() => {
                            this.state.modalAlert.noCallback();
                            this.onModalAlertClose();
                        }}>
                            No
                        </Button>
                        <Button variant="primary" onClick={() => {
                            this.state.modalAlert.okCallback();
                            this.onModalAlertClose();
                        }}>
                            Yes
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Navbar expand="lg" variant="light" bg="light">
                    <Navbar.Brand href="/app">
                        <FontAwesomeIcon icon={faHome} />
                    </Navbar.Brand>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <NavDropdown title="Day" id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={this.onPrintClick}>Print</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Nav className="mr-auto">
                            {this.getTopAlert()}
                        </Nav>
                        <Form inline>
                            <DatePicker customInput={<Form.Control type="text" />}
                                        selected={ this.state.date } 
                                        todayButton="Today"
                                        onChange={this.onDateChange} 
                                        dateFormat="dd/MM/yyyy" />
                        </Form>
                    </Navbar.Collapse>
                </Navbar>
                <Row>
                    <Col sm={3}>
                        <Row>
                            <Form.Control onChange={this.onEmployerFilerChange} size="sm" as="select">
                                <option value="no">No filter</option>
                                <option value="no_first">Empty day</option>
                                <option value="no_positions">No positions</option>
                            </Form.Control>
                        </Row>
                        <Row className="border-right">
                            <Col>
                                {this.sortEmployers(Object.values(this.state.employers)).map((value) => {
                                    var to_show = true;

                                    if(this.state.employerViewFiler == "no_first"){
                                        var full_day = false;
                                        value.positions.map((a) => {
                                            if(this.state.positions[a].positionCapacity == 1 || this.state.positions[a].positionCapacity == 3){
                                                to_show = false;
                                            }
                                        });
                                    }

                                    if(this.state.employerViewFiler == "no_positions"){
                                        if(value.positions.length > 0){
                                            to_show = false;
                                        }
                                    }

                                    if(to_show){
                                        return (
                                            <EmployerView key={value.entityId}
                                                        employer={value}
                                                        clickSelect={true}
                                                        context={this.state}/>
                                        );
                                    }
                                })}
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={9}>
                        <Tabs>
                            {this.state.positionGroups.map((value) => {
                                return <Tab key={value.entityId} eventKey={value.entityId} title={value.name}>
                                    <PositionGroupTabView positionGroup={value} context={this.state}/>
                                </Tab>;
                            })}
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Day;