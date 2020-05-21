import watchman from "./watchman.js"
import express from "express"
import expressWs from "express-ws"

export default async function run({ mainHtml, dir, port }) {
  const app = express()
  let sockets = []
  expressWs(app)

  app.use(express.static(dir))
  app.ws(`/changes`, (ws, req) => {
    sockets.push(ws)
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

  const client = await watchman(dir)
  client.subscribe((file) => {
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

  app.listen(port)

  console.log(`Server started at http://localhost:${port}`)
}
