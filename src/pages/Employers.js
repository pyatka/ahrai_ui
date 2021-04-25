import React from 'react';
import Sidebar from './SideBar.js'

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';

import { Container, Row, Button, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const GetEmployersList = loader('../model/Employer/getEmployersList.graphql');

function EmployerView(e){
    return (<Row key={e.entityId} style={{ padding: '20px' }}>
        <Col>
            <Row>{e.name}</Row>
        </Col>
        <Col>
            <Row className="float-sm-right">
                <Link to={`/employer/${e.entityId}/edit`} className="btn btn-primary">Edit</Link>
            </Row>
        </Col>
    </Row>);
}

function Employers(){
    const { loading, error, data } = useQuery(GetEmployersList);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return (
        <div>
            <Container>
                <Row>
                    <Col sm={3}>
                        <Sidebar />
                    </Col>
                    <Col sm={9}>
                        {data.employers.map((value, index) => {
                            return EmployerView(value)
                        })}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Employers;