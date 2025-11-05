
import React, { useContext } from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { BoxArrowRight } from 'react-bootstrap-icons';

const AppNavbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#">Gestor de Modelos</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Button variant="outline-light" onClick={logout}>
            <BoxArrowRight className="me-2" />
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
