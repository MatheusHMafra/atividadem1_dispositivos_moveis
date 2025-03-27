from flask import Flask, send_from_directory, render_template
from waitress import serve
import os

app = Flask(__name__, static_folder='./')

@app.route('/')
def index():
    return send_from_directory('./', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('./', path)

if __name__ == '__main__':
    print("Servidor iniciado em http://localhost:80")
    serve(app, host='0.0.0.0', port=80)
