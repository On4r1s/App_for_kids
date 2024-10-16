import os

from PIL import Image
import flask
from openai import OpenAI

app = flask.Flask(__name__)

client = OpenAI(api_key=os.environ['API_KEY'])


def get_file(path):
    path = 'static/' + path
    if path[-4:] == '.png':
        return Image.open(path)
    else:
        return open(path).read()


@app.get("/")
def main_page():
    return flask.Response(get_file('page/hello_world.html'), mimetype="text/html")


@app.get("/<name1>/<name2>/<name3>")
def public(name1, name2, name3):
    return flask.Response(get_file(f'{name1}/{name2}/{name3}'))


@app.post("/prompt")
def input_prompt():
    my_json = flask.request.get_json()
    prompt = my_json['prompt']
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    odp = ''
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            odp += chunk.choices[0].delta.content
    out = dict(prompt=odp)
    return flask.jsonify(out)
