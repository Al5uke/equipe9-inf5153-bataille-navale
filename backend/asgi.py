"""ASGI wrapper for Flask app to work with uvicorn"""
from server import app
from asgiref.wsgi import WsgiToAsgi

# Convertir l'app Flask WSGI en ASGI
asgi_app = WsgiToAsgi(app)