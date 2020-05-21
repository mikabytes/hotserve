#!/usr/bin/env node

import hotserve from "./hotserve.js"

let [_node, _script, mainHtml, port] = process.argv
const dir = process.cwd()

port = port || 3000

hotserve({ port, dir, mainHtml })
