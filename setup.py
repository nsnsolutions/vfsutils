from setuptools import setup


setup(
    name="vfs",
    description="A set of utilities for doing this with VFS",
    author="Ian Laird <ilaird@velma.com>",
    author_email="ilaird@velma.com",
    version="0.1.0",
    packages=["vfs", "vfs.utils"],
    entry_points={
        'console_scripts': [
            "vfsutil = vfs.__main__:main"
        ]
    }
)
