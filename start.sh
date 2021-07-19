#!/bin/bash
(cd server && ts-node server.ts) &
ovpn_run