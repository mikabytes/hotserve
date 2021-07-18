import Watchman from "fb-watchman"

let watchman

export default function watchDir(dir, pattern) {
  if (!watchman) {
    watchman = new Watchman.Client()

    watchman.capabilityCheck(
      { optional: [], required: [`relative_root`, `wildmatch`] },
      function (error, resp) {
        if (error) {
          // error will be an Error object if the watchman service is not
          // installed, or if any of the names listed in the `required`
          // array are not supported by the server
          console.error(error)
        }
        // resp will be an extended version response:
        // {'version': '3.8.0', 'capabilities': {'relative_root': true}}
        // console.log(resp)
      }
    )
  }
  return new Promise((res, rej) => {
    watchman.command([`watch-project`, dir], (error, client) => {
      if (error) {
        rej(`Error initiating watch:`, error)
        return
      }

      // It is considered to be best practice to show any 'warning' or
      // 'error' information to the user, as it may suggest steps
      // for remediation
      if (`warning` in client) {
        console.log(`warning: ${client.warning}`)
      }

      getClock(client).then((clock) => {
        res({
          subscribe: (cb) => subscribe(client, clock, dir, cb, pattern),
        })
      })
    })
  })
}

function getClock(client) {
  return new Promise((res, rej) => {
    watchman.command([`clock`, client.watch], (error, resp) => {
      if (error) {
        rej("Failed to query clock:", error)
        return
      }

      res(resp.clock)
    })
  })
}

function subscribe(client, clock, dir, cb, pattern) {
  const sub = {
    expression: [`allof`, [`imatch`, pattern], [`type`, `f`]],
    fields: [`name`, `exists`],
    since: clock,
  }
  if (client.relative_path) {
    sub.relative_root = client.relative_path
  }

  watchman.command(
    [`subscribe`, client.watch, `mysubscription`, sub],
    function (error, resp) {
      if (error) {
        // Probably an error in the subscription criteria
        console.error(`failed to subscribe: `, error)
        return
      }
    }
  )

  // Subscription results are emitted via the subscription event.
  // Note that this emits for all subscriptions.  If you have
  // subscriptions with different `fields` you will need to check
  // the subscription name and handle the differing data accordingly.
  // `resp`  looks like this in practice:
  //
  // { root: '/private/tmp/foo',
  //   subscription: 'mysubscription',
  //   files: [ { name: 'node_modules/fb-watchman/index.js',
  //       size: 4768,
  //       exists: true,
  //       type: 'f' } ] }
  watchman.on(`subscription`, function (resp) {
    if (resp.subscription !== `mysubscription`) {
      return
    }

    resp.files.forEach(function (file) {
      cb({ path: file.name, exists: file.exists })
    })
  })
}
