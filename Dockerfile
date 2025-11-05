
# --- Etapa 1: Construir el Frontend --- #
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto del código del frontend
COPY . .

# Construir la aplicación de React
RUN npm run build

# --- Etapa 2: Construir el Backend y Servir Todo --- #
FROM python:3.12-slim

WORKDIR /app

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copiar los requisitos del backend
COPY ./backend/requirements.txt .

# Instalar dependencias del backend
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY ./backend .

# Copiar los archivos construidos del frontend desde la etapa anterior
COPY --from=build-stage /app/dist ./dist

# Exponer el puerto que Render usará
EXPOSE 10000

# Comando para iniciar el servidor Gunicorn
# Render usa el puerto 10000 por defecto
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "app:app"]
