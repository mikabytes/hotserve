# Hotserve

This tiny server will provide static files in current folder and provide a websocket endpoint for listening to changes. This is great when building websites locally

## Usage

```
hotserve [mainHtmlFile] [port]
```

mainHtmlFile is a file that will be sent if no other files are matched. Useful for Single Page Apps that uses dynamic URLs.

port defaults to 3000
