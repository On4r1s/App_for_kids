from time import sleep

from PIL import Image
import flask

app = flask.Flask(__name__)

kostyl = dict()


def get_file(path):
    path = 'static/' + path
    if path[-4:] == '.png':
        return Image.open(path)
    else:
        return open(path, "rb").read()


@app.get("/")
def main_page():
    return flask.Response(get_file('page/hello_world.html'), mimetype="text/html")


@app.get("/<name1>/<name2>/<name3>")
def public(name1, name2, name3):
    return flask.Response(get_file(f'{name1}/{name2}/{name3}'))


# 1 request for text
@app.get("/prompt_ttt")
def ttt():
    data = flask.request.get_json()
    prompt = data["prompt"]
    kostyl[data['session_id']] = 'macie jakiś tam zgenerowany prompt xd'
    return kostyl[data['session_id']], {"Content-Type": "text/plain"}


# 2 request for speech
@app.get("/prompt_tts")
def tts():
    data = flask.request.get_json()
    while True:
        try:
            ans = kostyl.pop(data['session_id'])
            break
        except KeyError:
            sleep(0.2)
    return flask.Response(get_file('public/test_sound.opus'), content_type='audio/opus')


# added
if __name__ == "__main__":
    app.run(debug=True)
