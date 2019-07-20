#!/usr/bin/python

import serial
import struct
import time


class Serial(Object):
    def __init__(self):
        self.connection = serial.Serial(
            port = '/dev/ttyAMA0',
            baudrate = 57600,
            parity = serial.PARITY_NONE,
            stopbits = serial.STOPBITS_ONE,
            bytesize = serial.EIGHTBITS,
            timeout = 1
        )

    def write(self, command):
        print('-> %s' % str(command))
        self.connection.write(str(command))
        return self.read() if command.replies() else None

    def read(self):
        retry = 0
        self.connection.reset_input_buffer()
        while retry < 1000:
            if self.connection.in_waiting > 0:
                line = self.connection.readline().strip()
                if '\t' in line:
                    print(line)
                    return line.split('\t')
            time.sleep(0.01)
            retry += 1


class SerialCommand(Object):
    def __init__(self, name, *args):
        self.token = name[0]
        self.name = name
        self.args = args

    def __str__(self):
        if self.token in ['l', 'i']:
            return self.name + struct.pack('b' * len(self.args), *self.args)
        else:
            return self.name + ' '.join(list(map(str, self.args)))

    def replies(self):
        return self.token in ['u', 'b', 'm', 'j']
