'use strict';

window.ocw = window.ocw || (() => {});
window.ocw.Log = () => {
    let _factory = (level) => {
        return (message) => {
            console[level](message && message.responseText ? $(/<body.*>([\s\S]+)<\/body>/.exec(message.responseText)[0]).text() : message);
        };
    };

    return {
        error: _factory('error'),
        warn: _factory('warn'),
        info: _factory('info'),
        debug: _factory('debug')
    };
};
