
// En producción, API_URL será una ruta relativa.
// En desarrollo, Vite usará el proxy (ver vite.config.js).
const API_URL = "/api";

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Usuario o contraseña incorrectos");
  }
  return response.json();
};

const getToken = () => localStorage.getItem("token");

const apiFetch = async (url, options = {}) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error en la petición a ${url}`);
  }

  // Si la respuesta no tiene contenido (ej. DELETE), no intentes parsear JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const fetchModelos = () => apiFetch(`${API_URL}/modelos`);

export const createModelo = (modelo) => apiFetch(`${API_URL}/modelos`, {
  method: 'POST',
  body: JSON.stringify(modelo),
});

export const updateModelo = (id, modelo) => apiFetch(`${API_URL}/modelos/${id}`, {
  method: 'PUT',
  body: JSON.stringify(modelo),
});

export const deleteModelo = (id) => apiFetch(`${API_URL}/modelos/${id}`, {
  method: 'DELETE',
});
