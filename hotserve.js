import watcher from './watcher.js'
import expressWs from "express-ws"
import fs from "fs/promises"
import path from "path"
import globToRegex from "glob-to-regexp"
import express from "express"
import EventEmitter from 'events'

export default async function run({ mainHtml, dir, pattern, app }) {
  dir = path.resolve(dir)

  if (!app) {
    throw new Error(`app wasn't provided to 'run' function`)
  }

  // add cors headers
  app.use((req, res, next) => {
    if (req.headers.origin) {
      res.setHeader(`Access-Control-Allow-Origin`, req.headers.origin)
    }
    next()
  })

  let sockets = []
  expressWs(app)

  app.use(express.static(dir))
  app.ws(`/changes`, (ws, req) => {
    sockets.push(ws)
  })

  app.get(`/files`, async (req, res) => {
    const files = []
    const exclude =
      req.query.exclude && globToRegex(req.query.exclude, { extended: true })
    const include =
      req.query.include && globToRegex(req.query.include, { extended: true })

    for await (const file of getFiles(`${dir}/`, { exclude, include })) {
      files.push(file.path)
    }
    res.json(
      files.sort((a, b) => {
        const dirA = a.split(`/`).length
        const dirB = b.split(`/`).length

        if (dirA < dirB) {
          return -1
        } else if (dirB < dirA) {
          return 1
        } else {
          return a.localeCompare(b)
        }
      })
    )
  })

  if (mainHtml) {
    app.get(`*`, (q, s) => {
      s.sendFile(mainHtml, { root: dir })
    })
  }

  app.use(function (err, req, res, next) {
    console.error(err.message)
    console.error(err.stack)
    res.status(500).send(err.message)
  })


  const client = new EventEmitter()
  watcher(client, dir, pattern)
  client.on('file-change', (file) => {
    sockets.forEach((socket) => {
      try {
        if (socket.readyState !== 3) {
          socket.send(JSON.stringify(file))
        }
      } catch (e) {
        console.error(e)
      }
    })
  })

}

async function* getFiles(path, { exclude, include }, base) {
  if (!base) {
    base = path
  }

  const entries = await fs.readdir(path, { withFileTypes: true })

  for (let file of entries) {
    const fullPath = `${path}${file.name}`
    const relativePath = fullPath.slice(base.length)

    if (exclude && exclude.test(relativePath)) {
      continue
    }

    if (file.isDirectory()) {
      yield* getFiles(`${fullPath}/`, { exclude, include }, base)
    } else {
      if (!include || include.test(relativePath)) {
        yield { ...file, path: relativePath }
      }
    }
  }
}
