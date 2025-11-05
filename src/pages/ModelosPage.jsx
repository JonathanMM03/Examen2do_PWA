
import React, { useEffect, useReducer, useState } from 'react';
import { modelosReducer } from '../reducers/modelosReducer';
import { fetchModelos, createModelo, updateModelo, deleteModelo } from '../api/api';
import { Button, Container, Table, Modal, Alert, Card } from 'react-bootstrap';
import { PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons';
import ModeloForm from '../components/ModeloForm';
import AppNavbar from '../components/Navbar';

const ModelosPage = () => {
  const [modelos, dispatch] = useReducer(modelosReducer, []);
  const [showModal, setShowModal] = useState(false);
  const [editingModelo, setEditingModelo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModelos = async () => {
      try {
        setError(null);
        const data = await fetchModelos();
        dispatch({ type: 'SET_MODELOS', payload: data });
      } catch (err) {
        setError('Error al cargar los modelos. Asegúrese de que el servidor backend esté funcionando.');
      }
    };
    loadModelos();
  }, []);

  const handleSave = async (modelo) => {
    try {
      setError(null);
      if (editingModelo) {
        const updated = await updateModelo(editingModelo.id, modelo);
        dispatch({ type: 'UPDATE_MODELO', payload: updated });
      } else {
        const created = await createModelo(modelo);
        dispatch({ type: 'ADD_MODELO', payload: created });
      }
      setShowModal(false);
      setEditingModelo(null);
    } catch (err) {
      setError('Error al guardar el modelo. Verifique los datos e intente de nuevo.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este modelo?")) {
      try {
        setError(null);
        await deleteModelo(id);
        dispatch({ type: 'DELETE_MODELO', payload: id });
      } catch (err) {
        setError('Error al eliminar el modelo.');
      }
    }
  };

  const handleOpenModal = (modelo = null) => {
    setEditingModelo(modelo);
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setEditingModelo(null);
    setShowModal(false);
  };

  return (
    <>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Modelos Tecnológicos</h2>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="me-2" />
            Crear Modelo
          </Button>
        </div>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        <Card className="shadow-sm">
          <Table responsive striped bordered hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Fabricante</th>
                <th>Costo</th>
                <th>Gama</th>
                <th>Descripción</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modelos.length > 0 ? (
                modelos.map((modelo) => (
                  <tr key={modelo.id}>
                    <td>{modelo.nombre}</td>
                    <td>{modelo.fabricante}</td>
                    <td>${parseFloat(modelo.costo).toFixed(2)}</td>
                    <td>{modelo.gama}</td>
                    <td>{modelo.descripcion}</td>
                    <td className="text-center">
                      <Button variant="warning" size="sm" onClick={() => handleOpenModal(modelo)} className="me-2">
                        <PencilSquare />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(modelo.id)}>
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No hay modelos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingModelo ? 'Editar' : 'Crear'} Modelo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModeloForm modelo={editingModelo} onSave={handleSave} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModelosPage;
