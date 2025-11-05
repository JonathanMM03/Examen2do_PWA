
import os
from flask import Flask, request, jsonify, send_from_directory
from flask.blueprints import Blueprint
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
import datetime
import re
from functools import wraps

# 1. Configuración de la App con un directorio estático para React
app = Flask(__name__, static_folder='../dist', static_url_path='/')
CORS(app)

# --- Configuración JWT ---
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mi_clave_secreta_desarrollo')
JWT_EXP_DELTA_SECONDS = 3600

# --- Datos en memoria ---
USERS = {"admin": "admin"}
MODELOS = []
MODELO_ID_COUNTER = 1

# --- Validaciones ---
def validar_fabricante(fabricante):
    return bool(re.fullmatch(r"[A-Za-z\s]+", fabricante))

def validar_gama(gama):
    return gama.lower() in ['baja', 'media', 'alta']

# --- Decorador JWT ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if not token:
            return jsonify({'error': 'Token faltante'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['username']
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return jsonify({'error': 'Token inválido o expirado'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# 2. Blueprint para la API, todo bajo /api
api = Blueprint('api', __name__, url_prefix='/api')

@api.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if USERS.get(username) == password:
        payload = {
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({"token": token}), 200
    return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

@api.route("/modelos", methods=["GET"])
@token_required
def listar_modelos(current_user):
    return jsonify(MODELOS), 200

@api.route("/modelos", methods=["POST"])
@token_required
def crear_modelo(current_user):
    global MODELO_ID_COUNTER
    data = request.json
    # ... (resto de la lógica sin cambios)
    nombre = data.get("nombre")
    fabricante = data.get("fabricante")
    costo = data.get("costo")
    gama = data.get("gama")
    descripcion = data.get("descripcion", "")

    if not all([nombre, fabricante, costo is not None, gama]):
        return jsonify({"error": "Nombre, fabricante, costo y gama son requeridos"}), 400
    if not validar_fabricante(fabricante):
        return jsonify({"error": "Fabricante solo puede tener letras y espacios"}), 400
    if not validar_gama(gama):
        return jsonify({"error": "Gama debe ser 'baja', 'media' o 'alta'"}), 400

    modelo = {
        "id": MODELO_ID_COUNTER,
        "nombre": nombre,
        "fabricante": fabricante,
        "costo": float(costo),
        "gama": gama.lower(),
        "descripcion": descripcion
    }
    MODELOS.append(modelo)
    MODELO_ID_COUNTER += 1
    return jsonify(modelo), 201

# ... (resto de rutas PUT y DELETE de la API sin cambios, solo usando @api.route)
@api.route("/modelos/<int:modelo_id>", methods=["PUT"])
@token_required
def actualizar_modelo(current_user, modelo_id):
    data = request.json
    modelo = next((m for m in MODELOS if m["id"] == modelo_id), None)
    if not modelo:
        return jsonify({"error": "Modelo no encontrado"}), 404

    nombre = data.get("nombre")
    fabricante = data.get("fabricante")
    costo = data.get("costo")
    gama = data.get("gama")
    descripcion = data.get("descripcion")

    if nombre:
        modelo["nombre"] = nombre
    if fabricante:
        if not validar_fabricante(fabricante):
            return jsonify({"error": "Fabricante solo puede tener letras y espacios"}), 400
        modelo["fabricante"] = fabricante
    if costo is not None:
        modelo["costo"] = float(costo)
    if gama:
        if not validar_gama(gama):
            return jsonify({"error": "Gama debe ser 'baja', 'media' o 'alta'"}), 400
        modelo["gama"] = gama.lower()
    if descripcion is not None:
        modelo["descripcion"] = descripcion

    return jsonify(modelo), 200

@api.route("/modelos/<int:modelo_id>", methods=["DELETE"])
@token_required
def eliminar_modelo(current_user, modelo_id):
    global MODELOS
    MODELOS = [m for m in MODELOS if m["id"] != modelo_id]
    return jsonify({"message": "Modelo eliminado"}), 200

app.register_blueprint(api)

# 3. Ruta "catch-all" para servir React en cualquier otra ruta
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- Swagger UI (opcional, pero bueno tenerlo) ---
SWAGGER_URL = "/swagger"
API_URL = "/static/swagger.json" # No necesita cambiar
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={"app_name": "API Modelos Tecnológicos"}
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@app.route("/static/swagger.json")
def swagger_json():
    # ... (la definición de swagger.json no cambia)
    return jsonify({
        "swagger": "2.0",
        "info": {"title": "API Modelos Tecnológicos", "version": "1.0"},
        "basePath": "/api", # Importante: actualizar basePath
        "schemes": ["http", "https"],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Usa 'Bearer {token}' para autenticar"
            }
        },
        "paths": {
            "/login": {
                "post": {
                    "summary": "Login y obtener JWT",
                    "parameters": [{"in": "body", "name": "body", "required": True,
                                    "schema": {"type": "object",
                                               "properties": {"username": {"type": "string"},
                                                              "password": {"type": "string"}}}}],
                    "responses": {"200": {"description": "JWT generado"}, "401": {"description": "Error"}}
                }
            },
            "/modelos": {
                "get": {"summary": "Listar modelos",
                        "security": [{"Bearer": []}],
                        "responses": {"200": {"description": "Lista de modelos"}, "401": {"description": "Token inválido"}}},
                "post": {"summary": "Crear modelo",
                         "security": [{"Bearer": []}],
                         "parameters": [{"in": "body", "name": "body", "required": True,
                                         "schema": {"type": "object",
                                                    "properties": {
                                                        "nombre": {"type": "string"},
                                                        "fabricante": {"type": "string"},
                                                        "costo": {"type": "number"},
                                                        "gama": {"type": "string"},
                                                        "descripcion": {"type": "string"}
                                                    }}}],
                         "responses": {"201": {"description": "Modelo creado"},
                                       "400": {"description": "Error de validación"},
                                       "401": {"description": "Token inválido"}}}
            },
            "/modelos/{id}": {
                "put": {"summary": "Actualizar modelo",
                        "security": [{"Bearer": []}],
                        "parameters": [{"name": "id", "in": "path", "required": True, "type": "integer"},
                                       {"in": "body", "name": "body", "required": True,
                                        "schema": {"type": "object",
                                                   "properties": {
                                                       "nombre": {"type": "string"},
                                                       "fabricante": {"type": "string"},
                                                       "costo": {"type": "number"},
                                                       "gama": {"type": "string"},
                                                       "descripcion": {"type": "string"}
                                                   }}}],
                        "responses": {"200": {"description": "Modelo actualizado"},
                                      "400": {"description": "Error de validación"},
                                      "404": {"description": "No encontrado"},
                                      "401": {"description": "Token inválido"}}},
                "delete": {"summary": "Eliminar modelo",
                           "security": [{"Bearer": []}],
                           "parameters": [{"name": "id", "in": "path", "required": True, "type": "integer"}],
                           "responses": {"200": {"description": "Modelo eliminado"},
                                         "401": {"description": "Token inválido"}}}
            }
        }
    })

if __name__ == '__main__':
    # Esta parte solo se usa para desarrollo local
    app.run(port=os.environ.get("PORT", 3000), debug=True)
