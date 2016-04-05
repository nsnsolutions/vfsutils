#!/usr/bin/python

from argparse import ArgumentParser, FileType
from sys import argv, stdout
import requests
import json


class SrvCtrl(object):
    def __init__(self):
        self._ap = ArgumentParser(
            description="Manage VFS Services."
        )
        self._ap.set_defaults(
            url="https://api.vfs.velma.com/v1/system/service/"
        )
        sap = self._ap.add_subparsers(help="Select an action.");

        ap_get = sap.add_parser(
            "get",
            help="Show the current state of registered services.",
        )
        ap_get.add_argument(
            "STACK",
            help="The name of the stack."
        )
        ap_get.set_defaults(fn=self._get)

        ap_set = sap.add_parser(
            "set",
            help="Set the current state of a specific service instance."
        )
        ap_set.add_argument(
            "STACK",
            help="The name of the stack."
        )
        ap_set.add_argument(
            "ID",
            help="The ID of a specific instance within the stack."
        )
        ap_set.add_argument(
            "STATE",
            help="The state to set on the identified service instance."
        )
        ap_set.set_defaults(fn=self._set)

    def _get(self):
        _uri = make_resource(self._opts.url, [self._opts.STACK]);
        resp = requests.get(_uri)

        if resp.status_code in [400, 404]:
            print resp.json().get('errorMessage', "Failed: Unknown Error.")
            return
        
        elif resp.status_code != 200:
            print "Unknown Error -- {}".format(resp.text)

        _dat = resp.json()
        if type(_dat) != list:
            _dat = [_dat]

        for item in _dat:
            header = "=== {} ({}) ".format(
                item["serviceName"],
                item["serviceVersion"]
            );
            print "{}{}".format(header, "="*(50-len(header)))
            print col2("| Instance Name:", item['instanceId'], 50)
            if item['requestedState'] != item['currentState']:
                print col2(
                    "| Current State:",
                    "{} ({} pending)".format(
                        item['currentState'],
                        item['requestedState'],
                    ), 50
                )
            else:
                print col2("| Current State:", item['currentState'], 50)
            print col2("| Last Heatbeat:", item['statusDate'], 50)
            print col2("| Unique Id:", item['uniqueId'], 50)
            print "+{}\n".format("-"*49);

    def _set(self):
        _uri = make_resource(self._opts.url, [self._opts.STACK, self._opts.ID]);
        resp = requests.post(_uri, json.dumps({"requestedState": self._opts.STATE}))

        if resp.status_code in [400, 404]:
            try:
                print resp.json().get('errorMessage', "Failed: Unknown Error.")
            except ValueError:
                print resp.text
            return
        
        elif resp.status_code != 200:
            print "Unknown Error -- {}".format(resp.text)

        if resp.json()["message"] == "OK":
            print "Success!"
        else:
            print "Not sure what happend there -- {}".format(resp.text)

    def __call__(self, args=None):
        self._opts = self._ap.parse_args(args or argv[1:])
        self._opts.fn()


def make_resource(base, idents):
    _base = base.rstrip('/')
    return "{}/{}".format(_base, "/".join(idents))


def col2(l, r, s):
    c = len(l) + len(r)
    d = s - c
    f = ' ' * d
    return "{}{}{}".format(l, f, r)


if __name__ == "__main__":
    cmd = SrvCtrl();
    cmd();
