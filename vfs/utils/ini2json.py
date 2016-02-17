from ConfigParser import RawConfigParser
from argparse import ArgumentParser, FileType
from sys import argv, stdout
import json


class Ini2Json(object):
    def __init__(self):
        self._ap = ArgumentParser(
            description="Create VFS Service configuration file using a queue map."
        )
        self._ap.add_argument(
            "-o",
            "--output",
            type=FileType('w'),
            default=stdout,
            help="The file to write the resulting json configuration file. (Default: STDOUT)"
        )
        self._ap.add_argument(
            "INI",
            type=FileType('r'),
            help="The INI file containing aws resource details."
        )
        self._ap.add_argument(
            "MAP",
            type=FileType('r'),
            help="The JSON MAP file that describes the queue/service relationships."
        )

    def __call__(self, args=None):
        _keys = RawConfigParser()

        _opts = self._ap.parse_args(args or argv[1:])

        _keys.readfp(_opts.INI)
        _map = json.load(_opts.MAP)

        _config = generate(
            _map.get('map'),
            _keys,
            _map.get('ref')
        )

        json.dump(_config, _opts.output, indent=2)



def generate(nodes, keys, refs):
    _ret = {}
    for node in nodes:
        _name = node['name']
        _ret[_name] = get_value(node, keys, refs)
    return _ret


def get_value(node, keys, refs):
    _type = node['type']
    _ret = None

    if _type == "value":
        _ret = node['value']

    elif _type == "object":
        _key = node['key']
        _ret = generate(refs[_key], keys, refs)

    elif _type == "ini":
        _section = node.get('section', "default")
        _key = node['key']
        _ret = keys.get(_section, _key)

    return _ret
