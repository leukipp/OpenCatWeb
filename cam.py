#!/usr/bin/python3

import io
import time
import picamera
import threading


class Camera(object):
    thread = None
    frame = None
    event = None

    def __init__(self):
        if Camera.thread is None:
            Camera.reset()
            Camera.thread = threading.Thread(target=self.run, args=((1280, 720), 30))
            Camera.thread.start()

    @staticmethod
    def run(resolution, framerate):
        print('Starting camera thread')

        camera = picamera.PiCamera(resolution=resolution, framerate=framerate)
        chunk = io.BytesIO()

        for _ in camera.capture_continuous(chunk, 'jpeg', use_video_port=True):
            chunk.seek(0)
            Camera.frame = chunk.read()
            Camera.event.set()
            chunk.seek(0)
            chunk.truncate()

            if time.time() - Camera.event.cleared > 10:
                break

        print('Stopping camera thread due to inactivity')
        camera.close()
        Camera.reset()

    @staticmethod
    def reset():
        Camera.thread = None
        Camera.frame = None
        Camera.event = CameraEvent()

    @classmethod
    def stream(cls):
        while True:
            Camera.event.wait()
            Camera.event.clear()
            yield b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + Camera.frame + b'\r\n'


class CameraEvent(object):
    def __init__(self):
        self.events = {}
        self.cleared = time.time()

    def wait(self):
        sender = threading.get_ident()
        if sender not in self.events:
            self.events[sender] = threading.Event()
        return self.events[sender].wait()

    def set(self):
        for sender, event in self.events.items():
            if not event.isSet():
                event.set()

    def clear(self):
        self.events[threading.get_ident()].clear()
        self.cleared = time.time()
