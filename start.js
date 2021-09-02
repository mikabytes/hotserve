#!/usr/bin/env node

import express from "express"
import hotserve from "./hotserve.js"
import exists from "command-exists"

async function run() {
  let [_node, _script, mainHtml, port, pattern] = process.argv

  if (!pattern) {
    pattern = "*.js"
  }

  const dir = process.cwd()

  port = port || 3000

  const app = express()
  hotserve({ dir, mainHtml, pattern, app })
  app.listen(port)
  console.log(`Server started at http://localhost:${port}`)
}

run()
