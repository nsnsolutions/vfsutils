#!/usr/bin/env node
'use strict';

const ArgumentParser = require('argparse').ArgumentParser;
const fs = require('fs');
const path = require('path');
const lib = require('../lib');
const packageJson = require('../package.json');

main(getOpts());

function loadSubs(ap) {
    var actions = {};
    var dirList = fs.readdirSync(__dirname);
    for(var i = 0; i < dirList.length; i++) {
        var modPath = path.join(__dirname, dirList[i]);
        var stats = fs.lstatSync(modPath);
        if(stats.isDirectory()) {
            var mod = require(modPath);

            var action = ap.addParser(mod.name, { 
                addHelp: true,
                description: mod.description
            });

            mod.register(action)

            actions[mod.name] = (function(o) { return mod.exec })();
        }
    }

    return actions;
}

function getOpts() {
    var ap = new ArgumentParser({
        version: `${packageJson.name} v${packageJson.version}`,
        description: packageJson.description,
        addHelp: true
    });

    ap.addArgument(
        [ '-V', '--verbose' ],
        {
            help: 'Increase verbosity level.',
            action: 'count'
        }
    );

    ap.addArgument(
        [ '--silent' ],
        {
            help: 'Override verbosity and disable all output except those explicity forced in the action code.',
            action: 'storeTrue'
        }
    );

    var subap = ap.addSubparsers({
        title: "Select an action",
        dest: "action"
    });

    var actions = loadSubs(subap);
    var opts = ap.parseArgs();

    if(opts.silent === true)
        opts.verbose = -1;

    return {
        opts: opts,
        actions: actions
    }
}

function main(opts) {

    var log = new lib.Log({ level: opts.opts.verbose });
    log.debug("Identified available actions:\n", opts.actions);
    log.debug("Executing with arguments:\n", opts.opts);

    if(opts.opts.action in opts.actions) {
        try {

            opts.actions[opts.opts.action](opts.opts, log, (e) => {
                if(e)
                    return die(e);

                process.exit(0);
            });

        } catch (e) { die(e); }

    } else {

        die({
            name: 'OptionNotFound',
            message: `Unknown action '${opts.opts.action}'`
        });

    }

    function die(e) {
        if(e.stack)
            log.error(e.stack);

        log.error("------------------------------------------------");
        log.error("Exception Message:");
        log.error(e.message);
        log.error("------------------------------------------------");

        log.error("Failed to execute action! See above for details.");

        process.exit(1);
    }

}

