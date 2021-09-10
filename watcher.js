import chokidar from "chokidar"
import { relative } from "path"

let watcher

export default function watchDir(client, dir, pattern) {
  if (!watcher) {
    watcher = chokidar.watch(`${dir}/**/${pattern}`, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
    })
  }

  watcher
    .on("change", (path) => {
      client.emit("file-change", { path: relative(`.`, path), exists: true })
    })
    .on("unlink", (path) => {
      client.emit("file-change", {
        path: relative(`.`, path),
        exists: false,
      })
    })
}
