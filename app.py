try:
    from flask import Flask, send_from_directory
    from waitress import serve

    app = Flask(__name__, static_folder='./')

    @app.route('/')
    def index():
        return send_from_directory('.', 'index.html')

    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory('.', path)

    if __name__ == '__main__':
        print("="*80)
        print("Aplicativo de Anotações Protegidas - Servidor iniciado")
        print("Acesse em: http://localhost:80")
        print("Para encerrar, pressione CTRL+C")
        print("="*80)
        serve(app, host='0.0.0.0', port=80)
        
except ImportError as e:
    print("="*80)
    print("ERRO DE IMPORTAÇÃO: ", str(e))
    print("\nProvavelmente há um problema de compatibilidade entre as versões do Flask e Werkzeug.")
    print("Execute os seguintes comandos para resolver:")
    print("\npip uninstall flask werkzeug")
    print("pip install flask==2.0.1 werkzeug==2.0.1 waitress==2.0.0")
    print("\nEm seguida, execute novamente: python app.py")
    print("="*80)
    import sys
    sys.exit(1)
except Exception as e:
    print("ERRO: ", str(e))
    import sys
    sys.exit(1)
