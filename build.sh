#!/bin/bash

meteor npm install

meteor  --allow-superuser --verbose build ../build --debug --architecture os.linux.x86_64 --server jianli.eshudata.com:4000
