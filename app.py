#!/usr/bin/python

import cgi

from flask import Flask, jsonify
from bus import Serial, SerialCommand

HOST = '0.0.0.0'
PORT = 8080
DEBUG = False

app = Flask(__name__, static_folder = 'web')
serial = Serial()


@app.route('/')
def root():
    return links(['/web/', '/api/'], True)


@app.route('/web/')
def web():
    return app.send_static_file('main.html')


@app.route('/api/')
def api():
    return links(['/api/command/', '/api/communicate/', '/api/move/', '/api/stop/', '/api/status/'], True)


@app.route('/api/command/')
def api_command():
    return links(['/api/command/<string:name>'], False)


@app.route('/api/command/<string:name>')
def api_command_value(name):
    return jsonify({'command': {name: serial.write(SerialCommand(name))}})


@app.route('/api/communicate/')
def api_communicate():
    return links(['/api/communicate/u/', '/api/communicate/b/'], True)


@app.route('/api/communicate/u/')
def api_communicate_u():
    return links(['/api/communicate/u/<int:repeat>/<int:tempo>'], False)


@app.route('/api/communicate/u/<int:repeat>/')
def api_communicate_u_repeat(repeat):
    return links(['/api/communicate/u/%i/<int:tempo>' % repeat], False)


@app.route('/api/communicate/u/<int:repeat>/<int:tempo>')
def api_communicate_u_repeat_tempo(repeat, tempo):
    return jsonify({'communicate': {'u': serial.write(SerialCommand('u', repeat, tempo))}})


@app.route('/api/communicate/b/')
def api_communicate_b():
    return links(['/api/communicate/b/<int:note>/<int:duration>'], False)


@app.route('/api/communicate/b/<int:note>/')
def api_communicate_b_note(note):
    return links(['/api/communicate/u/%i/<int:duration>' % note], False)


@app.route('/api/communicate/b/<int:note>/<int:duration>')
def api_communicate_b_note_duration(note, duration):
    return jsonify({'communicate': {'b': serial.write(SerialCommand('b', note, duration))}})


@app.route('/api/move/')
def api_move():
    return links(['/api/move/m/', '/api/move/i/', '/api/move/l/'], True)


@app.route('/api/move/m/')
def api_move_m():
    return links(['/api/move/m/<int:index>/<int:value>'], False)


@app.route('/api/move/m/<int:index>/')
def api_move_m_index(index):
    return links(['/api/move/m/%i/<int:value>' % index], False)


@app.route('/api/move/m/<int:index>/<string:value>')
def api_move_m_index_value(index, value):
    return jsonify({'move': {'m': serial.write(SerialCommand('m', index, int(value)))}})


@app.route('/api/move/i/')
def api_move_i():
    return links(['/api/move/i/<int:index>/<int:value>/<int:index>/<int:value>/...'], False)


@app.route('/api/move/i/<path:indexvalue>/')
def api_move_i_indexvalue(indexvalue):
    args = map(int, indexvalue.split('/'))
    if len(args) % 2 == 0:
        return jsonify({'move': {'i': serial.write(SerialCommand('i', *args))}})
    else:
        return links(['/api/move/i/%s/<int:value>' % indexvalue], False)


@app.route('/api/move/l/')
def api_move_l():
    return links(['/api/move/l/<int:valueofindex0>/.../<int:valueofindex15>'], False)


@app.route('/api/move/l/<path:valueofindex>/')
def api_move_l_valueofindex(valueofindex):
    args = map(int, valueofindex.split('/'))
    if len(args) == 16:
        return jsonify({'move': {'l': serial.write(SerialCommand('l', *args))}})
    else:
        return links(['/api/move/l/%s%s<int:valueofindex15>' % (valueofindex, '/' if len(args) == 15 else '.../')],
                     False)


@app.route('/api/stop/')
def api_stop():
    return links(['/api/stop/d', '/api/stop/p', '/api/stop/r'], True)


@app.route('/api/stop/d/')
def api_stop_d():
    return jsonify({'stop': {'d': serial.write(SerialCommand('d'))}})


@app.route('/api/stop/p/')
def api_stop_p():
    return jsonify({'stop': {'p': serial.write(SerialCommand('p'))}})


@app.route('/api/stop/r/')
def api_stop_r():
    return jsonify({'stop': {'r': serial.write(SerialCommand('r'))}})


@app.route('/api/status/')
def api_status():
    return links(['/api/status/j'], True)


@app.route('/api/status/j/')
def api_status_j():
    return jsonify({'status': {'j': serial.write(SerialCommand('j'))}})


def links(items, linked):
    ul = ['<ul>']
    for item in items:
        ul.append('<li>')
        if linked:
            ul.append('<a href="%s">%s</a>' % (item, cgi.escape(item)))
        else:
            ul.append(cgi.escape(item))
        ul.append('</li>')
    ul.append('</ul>')
    return html(''.join(ul))


def html(body):
    return ''.join(['<!DOCTYPE html>',
                    '<html>',
                    '<head>',
                    '<meta charset="utf-8">',
                    '<meta name="viewport" content="width=device-width,initial-scale=1.0">',
                    '<title>OpenCatWeb</title>',
                    '<link rel="icon" type="image/png" href="/web/img/favicon.png" />',
                    '<link rel="stylesheet" href="/web/css/reset.css" />',
                    '<link rel="stylesheet" href="/web/css/ocw.main.css" />',
                    '</head>',
                    '<body>',
                    body,
                    '</body>',
                    '</html>'
                    ])


if __name__ == '__main__':
    app.run(
        host = HOST,
        port = PORT,
        debug = DEBUG
    )
