#!/usr/bin/env python
from argparse import ArgumentParser, REMAINDER
from sys import argv
from utils import Ini2Json, SrvCtrl


ENTRY_POINTS = {
    "ini2json": Ini2Json,
    "SrvCtrl": SrvCtrl
}


def get_opts(args):
    ap = ArgumentParser("VFS Utilities")
    ap.add_argument(
        "COMMAND",
        choices=ENTRY_POINTS.keys(),
        type=str,
        help="Select an action"
    )
    ap.add_argument(
        "args",
        nargs=REMAINDER,
        help="Arguments passed to action. (--help for details on a specific action)"
    )
    return ap.parse_args(args)


def main(args=None):
    _opts = get_opts(args or argv[1:])
    CallableClass = ENTRY_POINTS[_opts.COMMAND]

    _entry_point = CallableClass()
    return _entry_point(_opts.args)


if __name__ == "__main__":
    main()
