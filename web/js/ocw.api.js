'use strict';

window.ocw = window.ocw || (() => {});
window.ocw.Api = (host, port) => {
    let log = ocw.Log();

    let _request = (path, name, args) => {
        let base = host && port ? `http://${host}:${port}/api` : '/api';
        let command = name + (Array.isArray(args) ? '/' + args.join('/') : '');
        return $.ajax({
            url: `${base}/${path}/${command}`,
            type: 'GET',
            dataType: 'json'
        }).fail(log.error);
    };

    let _factory = (path, names) => {
        if (path == 'command') {
            return (name) => {
                return _request(path, name);
            };
        } else {
            let methods = {};
            names.forEach((name) => {
                methods[name] = (...args) => {
                    return _request(path, name, args);
                };
            });
            return methods;
        }
    };

    return {
        command: _factory('command'),
        communicate: _factory('communicate', ['u', 'b']),
        move: _factory('move', ['m', 'i', 'l']),
        stop: _factory('stop', ['d', 'p', 'r']),
        status: _factory('status', ['j'])
    };
};

window.ocw.Command = (command) => {
    let api = ocw.Api();

    let _command = command;

    let _setCommand = (command) => {
        _command = command ? command : _command;
        return _command;
    };

    let _getCommand = () => {
        return _command;
    };

    let _writeCommand = (command) => {
        return api.command(_setCommand(command));
    };

    return {
        setCommand: _setCommand,
        getCommand: _getCommand,
        writeCommand: _writeCommand
    };
};

window.ocw.communicate = window.ocw.communicate || (() => {});
window.ocw.communicate.U = () => { /* TODO */ };
window.ocw.communicate.B = () => { /* TODO */ };

window.ocw.move = window.ocw.move || (() => {});
window.ocw.move.M = (index, value) => {
    let api = ocw.Api();

    let _index = index;
    let _value = value;

    let _setIndex = (index) => {
        _index = Number.isInteger(index) ? parseInt(index) : _index;
        return _index;
    };

    let _getIndex = () => {
        return _index;
    };

    let _setValue = (value) => {
        _value = Number.isInteger(value) ? parseInt(value) : _value;
        return _value;
    };

    let _getValue = () => {
        return _value;
    };

    let _writeValue = (value) => {
        return api.move.m(index, _setValue(value));
    };

    let _readValue = () => {
        let deferred = $.Deferred();
        api.status.j().done((data) => {
            _setValue(data.status.j[index]);
            deferred.resolve(_getValue());
        });
        return deferred.promise();
    };

    return {
        setIndex: _setIndex,
        getIndex: _getIndex,
        setValue: _setValue,
        getValue: _getValue,
        writeValue: _writeValue,
        readValue: _readValue
    };
};
window.ocw.move.I = () => { /* TODO */ };
window.ocw.move.L = () => { /* TODO */ };

window.ocw.stop = window.ocw.stop || (() => {});
window.ocw.stop.D = () => { /* TODO */ };
window.ocw.stop.P = () => { /* TODO */ };
window.ocw.stop.R = () => { /* TODO */ };

window.ocw.status = window.ocw.status || (() => {});
window.ocw.status.J = () => {
    let api = ocw.Api();

    let _status = [];

    let _setStatus = (status) => {
        _status = Array.isArray(status) ? status.map(s => parseInt(s)) : _status;
        return _status;
    };

    let _getStatus = () => {
        return _status;
    };

    let _readStatus = () => {
        let deferred = $.Deferred();
        api.status.j().done((data) => {
            deferred.resolve(_setStatus(data.status.j));
        });
        return deferred.promise();
    };

    return {
        getStatus: _getStatus,
        readStatus: _readStatus
    };
};
