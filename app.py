import json
import os
from time import sleep

from PIL import Image
import flask
from openai import OpenAI

app = flask.Flask(__name__)

client = OpenAI(api_key=os.environ['API_KEY'])

kostyl = dict()


def generate_tft(prompt):
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    ans = ''
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            ans += chunk.choices[0].delta.content

    return ans


def generate_audio(ans):
    retrieved = ''
    sentences = ''
    for chunk in ans:
        retrieved += chunk
        if '\n\n' in retrieved:
            *completed, retrieved = retrieved.split('\n\n')
            for json_object in completed:
                json_object = json_object.replace('data: ', '').strip()
                if json_object == '[DONE]':
                    continue
                try:
                    if json_object:
                        json_data = json.loads(json_object)
                        text = json_data.get('choices', [{}])[0].get(
                            'delta', {}).get('content', '')
                        sentences += text
                        if sentences and sentences.endswith('.' or '!' or '?'):

                            audio_response = client.audio.speech.create(
                                model="tts-1",
                                voice="nova",
                                input=sentences,
                                response_format="opus"
                            )

                            sentences = ''

                            for audio_chunk in audio_response.iter_bytes(1024):
                                yield audio_chunk

                except json.JSONDecodeError as e:
                    print(e)
                    continue


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
@app.post("/prompt_ttt")
def ttt():
    data = flask.request.get_json()
    prompt = data["prompt"]
    kostyl[data['session_id']] = generate_tft(prompt)

    return kostyl[data['session_id']], {"Content-Type": "text/plain"}


# 2 request for speech
@app.post("/prompt_tts")
def tts():
    data = flask.request.get_json()
    while True:
        try:
            ans = kostyl.pop(data['session_id'])
            break
        except KeyError:
            sleep(0.2)
    return flask.Response(flask.stream_with_context(generate_audio(ans)), content_type='audio/opus')


# added
if __name__ == "__main__":
    app.run(debug=True)
