#!/usr/bin/env node

import hotserve from "./hotserve.js"
import exists from "command-exists"

async function run() {
  try {
    await exists(`watchman`)
  } catch (e) {
    console.error(
      `Please install watchman: https://facebook.github.io/watchman/docs/install/`
    )
    process.exit(1)
  }

  let [_node, _script, mainHtml, port, pattern] = process.argv

  if (!pattern) {
    pattern = "*.js"
  }

  const dir = process.cwd()

  port = port || 3000

  hotserve({ port, dir, mainHtml, pattern })
}

run()
