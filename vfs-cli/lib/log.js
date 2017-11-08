'use strict';

module.exports = function(opts) {

    var level = opts.level;

    var self = {
        get level() { return level; },
        debug: debug,
        info: info,
        log: info,
        error: error,
        write: console.log
    };

    return self;

    // ------------------------------------------------------------------------

    function debug() {
        if(level >= 2)
            console.error.apply(null, arguments);
    }

    function info() {
        if(level >= 1)
            console.info.apply(null, arguments);
    }

    function error() {
        if(level >= 0)
            console.info.apply(null, arguments);
    }
};
