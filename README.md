# Hotserve

*Starting with 2.0.0 websocket support has been dropped in favor of Server Sent Events. See Changelog*

This tiny server provides static files in current folder and provides endpoints for listening to file changes, or listing available files. This makes development servers more versatile.

## Install

`npm i -g hotserve`

## Usage - CLI

Go to the folder containing your project, then run:

```
hotserve [mainHtmlFile] [port] [pattern]
```

`mainHtmlFile` is a file that will be sent if no other files are matched. Useful for Single Page Apps that uses dynamic URLs. Use `""` to disable.

`port` defaults to 3000.

`pattern` is a glob. Defaults to `*.js`. Used to filter what files are reported on `/changes` endpoint.

Open a browser and go to `http://localhost:3000`, or the `port` you specified.

## Usage - programmatically

You may choose to include hotserve as part of your own server. This way you can host additional endpoints on the same express instance:

```javascript
import express from "express"
import hotserve from "hotserve"

const app = express()
hotserve({ dir, mainHtml, pattern, app })
app.listen(port)
console.log(`Server started at http://localhost:${port}`)
```

## Client-side reloading

The server provides a websocket endpoint `/changes` that is fired every time a file is modified or deleted.

```javascript
const source = new EventSource(`/changes`)
source.onmessage = (message) => {
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

## Client-side get list of files

It is possible (since v1.2) to load a description of all files and folders using GET `/files`.

Imagine the following structure:

```
a/
  imInA.html
b/
  c/
    one.html
    two.html
```

Doing a `GET /files` results in:

```
[
  "a/imInA.html",
  "b/c/one.html",
  "b/c/two.html",
]
```

Note that empty folders will never be included. Only files are listed. This feature is good for devtools that need to find files dynamically.

There's also two options to limit files. `include` (defaults to `*`) can be set to only include files matching a glob. For example `GET /files?include=*.js` would only return javascript files.

Similarly, there's an exclude option to explicitly forbid certain files or folders. `GET /files?include=*.js&exclude={node_modules,.git}` would return all javascript files except those in `node_modules` and `.git` folders.

Both `include` and `exclude` are globs with extended interpretation.
