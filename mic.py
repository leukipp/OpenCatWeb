#!/usr/bin/python3

import time
import pyaudio
import threading


class Microphone(object):
    thread = None
    frame = None
    event = None

    def __init__(self):
        if Microphone.thread is None:
            Microphone.reset()
            Microphone.thread = threading.Thread(target=self.run, args=(pyaudio.paInt16, 1, 44100, 1024, 'dmic_sv'))
            Microphone.thread.start()

    @staticmethod
    def run(format, channels, rate, buffer, name):
        print('Starting microphone thread')

        microphone = pyaudio.PyAudio()
        chunk = microphone.open(input=True,
                                format=format,
                                channels=channels,
                                rate=rate,
                                frames_per_buffer=buffer,
                                input_device_index=Microphone.input(microphone, name))

        while True:
            Microphone.frame = chunk.read(buffer, exception_on_overflow=False)
            Microphone.event.set()

            if time.time() - Microphone.event.cleared > 10:
                break

        print('Stopping microphone thread due to inactivity')
        microphone.terminate()
        Microphone.reset()

    @staticmethod
    def input(microphone, name):
        count = range(microphone.get_host_api_info_by_index(0).get('deviceCount'))
        devices = (microphone.get_device_info_by_host_api_device_index(0, i) for i in count)
        return next(index for index, device in enumerate(devices) if device.get('name') == name)

    @staticmethod
    def header():
        bits = 16
        channels = 1
        rate = 44100
        size = 2048 * 10 ** 6
        head = bytes('RIFF', 'ascii')
        head += (size + 36).to_bytes(4, 'little')
        head += bytes('WAVE', 'ascii')
        head += bytes('fmt ', 'ascii')
        head += (16).to_bytes(4, 'little')
        head += (1).to_bytes(2, 'little')
        head += channels.to_bytes(2, 'little')
        head += rate.to_bytes(4, 'little')
        head += (rate * channels * bits // 8).to_bytes(4, 'little')
        head += (channels * bits // 8).to_bytes(2, 'little')
        head += bits.to_bytes(2, 'little')
        head += bytes('data', 'ascii')
        head += size.to_bytes(4, 'little')
        return head

    @staticmethod
    def reset():
        Microphone.thread = None
        Microphone.frame = None
        Microphone.event = MicrophoneEvent()

    @classmethod
    def stream(cls):
        Microphone.event.wait()
        Microphone.event.clear()
        yield Microphone.header() + Microphone.frame
        while True:
            Microphone.event.wait()
            Microphone.event.clear()
            yield Microphone.frame


class MicrophoneEvent(object):
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
