#!/usr/bin/env sh

python3 -m venv venv
source venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install setuptools
python3 -m pip install raylib==5.5.0.4
