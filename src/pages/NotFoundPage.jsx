
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';

const NotFoundPage = () => (
  <Container>
    <Row className="vh-100 justify-content-center align-items-center">
      <Col md={6} className="text-center">
        <Card className="shadow-sm">
          <Card.Body>
            <ExclamationTriangle size={50} className="text-warning mb-3" />
            <h1 className="display-4">404</h1>
            <h2>Página no encontrada</h2>
            <p className="lead">La página que buscas no existe o ha sido movida.</p>
            <Button as={Link} to="/" variant="primary">Volver al inicio</Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default NotFoundPage;
