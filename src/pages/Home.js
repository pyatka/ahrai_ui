import React from 'react';
import Sidebar from './SideBar.js';

import { Container, Row, Col } from 'react-bootstrap';

function Home() {
    return (
        <Container>
            <Row>
                <Col sm={3}>
                    <Sidebar />
                </Col>
                <Col sm={9}>
                </Col>
            </Row>
        </Container>
    );
}

export default Home;