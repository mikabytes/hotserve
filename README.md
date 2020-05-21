# Hotserve

This tiny server will provide static files in current folder and provide a websocket endpoint for listening to changes. This is great when building websites locally

## Usage

```
hotserve [mainHtmlFile] [port]
```

mainHtmlFile is a file that will be sent if no other files are matched. Useful for Single Page Apps that uses dynamic URLs.

port defaults to 3000

## Client-side reloading

The server provides a websocket endpoint `/changes` that is fired every time a file is modified or deleted.

```
const url = new URL(`/changes`, location.origin)
url.protocol = `ws:`

new WebSocket(url).onmessage = (message) => {
  const { path, exists } = JSON.parse(message.data)

  if (!exists) {
    console.log(`${path} was deleted!`)
  } else {
    console.log(`${path} was modified.`)
  }

  // Use that specific file for hot reloading, or do a full page refresh
  document.location.reload()
}
```
