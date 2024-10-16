import flask
from os import environ
from openai import OpenAI

app = flask.Flask(__name__)

client = OpenAI(api_key=environ['API_KEY'])


@app.get("/")
def main_page():

    return "<p>Hello, World!</p>"


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
    return odp
