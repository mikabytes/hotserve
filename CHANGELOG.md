# Changelog

## 2.0.0-alpha.1

This is a breaking change. Hotserve no longer supports websockets. Instead, Server Sent Events (SSE) is used. The reason for this is the continued lack of active development on dependency `express-ws` and its inability to be used together with Express Router. So:

README has been updated with examples.

### Cons

- hotserve no longer supports websockets

### Pros

- You may now use `const app = express(), subApp = express() ; hotserve({app: app2, ...}) ; express.use('/some/sub/path', subApp) ; app.listen()` to have hotserve mounted on /some/sub/path

## 1.3.4

- Fixes issue with full path instead of relative #3

## 1.3.3

- Replaced Watchman with Chokidar. This way you no longer need to install a third party binary to use hotserve! #2 (thanks Seke1412!)

## 1.3.2

- Fix issue with worker starting even if hotserve wasn't used. Prevented process from exiting.

## 1.3.1

- Fix missed import

## 1.3.0

- Added option to use hotserve programatically.

## 1.2.1

- Clarified in README.md what pattern does.

## 1.2.0

- Added option to provide pattern to search for:

  ```
  hotserve [mainHtmlFile] [port] [pattern]
  ```

- Added a startup check to error if watchman hasn't been installed
- Added option to fetch a list of folders and files using /files endpoint

## 1.1.3

### 2020-06-12

Added CORS headers
