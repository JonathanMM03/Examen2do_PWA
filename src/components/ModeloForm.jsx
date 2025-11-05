
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const ModeloForm = ({ modelo, onSave }) => {
  const [formState, setFormState] = useState({
    nombre: '',
    fabricante: '',
    costo: '',
    gama: 'baja',
    descripcion: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modelo) {
      setFormState(modelo);
    } else {
      setFormState({
        nombre: '',
        fabricante: '',
        costo: '',
        gama: 'baja',
        descripcion: '',
      });
    }
  }, [modelo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const validate = () => {
    if (formState.nombre.trim().length < 6) {
      setError('El nombre del dispositivo debe tener al menos 6 caracteres');
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(formState.fabricante)) {
      setError('Fabricante solo puede tener letras y espacios');
      return false;
    }
    if (formState.costo < 0) {
      setError('El costo no puede ser un número negativo');
      return false;
    }
    if (!['baja', 'media', 'alta'].includes(formState.gama)) {
      setError("Gama debe ser 'baja', 'media' o 'alta'");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formState);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={formState.nombre}
          onChange={handleChange}
          required
          minLength="6"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Fabricante</Form.Label>
        <Form.Control
          type="text"
          name="fabricante"
          value={formState.fabricante}
          onChange={handleChange}
          required
          pattern="[A-Za-z\s]+"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Costo</Form.Label>
        <Form.Control
          type="number"
          name="costo"
          value={formState.costo}
          onChange={handleChange}
          required
          min="0"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Gama</Form.Label>
        <Form.Control
          as="select"
          name="gama"
          value={formState.gama}
          onChange={handleChange}
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          as="textarea"
          name="descripcion"
          value={formState.descripcion}
          onChange={handleChange}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Guardar
      </Button>
    </Form>
  );
};

export default ModeloForm;
