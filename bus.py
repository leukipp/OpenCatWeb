#!/usr/bin/python3

import time
import struct
import serial
import threading


class Serial(object):
    def __init__(self):
        self.lock = threading.Lock()
        self.connection = serial.Serial(
            port='/dev/ttyAMA0',
            baudrate=57600,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=1)

    def write(self, command):
        with self.lock:
            print('Serial write', command)
            self.connection.write(command.encode())
            return self.read() if command.replies() else time.sleep(0.05)

    def read(self):
        retry = 0
        self.connection.reset_input_buffer()
        while retry < 100:
            if self.connection.in_waiting > 0:
                line = self.connection.readline().strip()
                if b'\t' in line:
                    print('Serial read', line)
                    return line.split(b'\t')
            time.sleep(0.05)
            retry += 1


class SerialCommand(object):
    def __init__(self, name, *args):
        self.token = name[0]
        self.name = name
        self.args = args

    def __str__(self):
        if self.token in ['l', 'i']:
            return self.name + struct.pack('b' * len(self.args), *self.args)
        else:
            return self.name + ' '.join(list(map(str, self.args)))

    def encode(self):
        return str.encode(str(self))

    def replies(self):
        return self.token in ['j']
