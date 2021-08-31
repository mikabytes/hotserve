import chokidar from 'chokidar'

let watcher

export default function watchDir(client, dir, pattern) {
  if (!watcher) {
    watcher = chokidar.watch(`${dir}/**/${pattern}`, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    })
  }

  watcher
    .on('change', (path) => {
      client.emit('file-change', {file: path, exists: true})
    })
    .on('unlink', (path) => {
      client.emit('file-change', {file: path, exists: false})
    })
}
