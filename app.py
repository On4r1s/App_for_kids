import os

from PIL import Image
import flask

app = flask.Flask(__name__)


def get_file(path):
    path = 'static/' + path
    if path.endswith('.png'):
        return Image.open(path)
    else:
        return open(path).read()

@app.get("/")
def main_page():
    return flask.Response(get_file('page/hello_world.html'), mimetype="text/html")


@app.get("/<name1>/<name2>/<name3>")
def public(name1, name2, name3):
    return flask.Response(get_file(f'{name1}/{name2}/{name3}'))


if __name__ == '__main__':
    app.run(debug=True)