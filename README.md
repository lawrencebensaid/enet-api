# eNet API & CLI

API and CLI for eNet smart home.

## Implementing the API

```
const { ENet } = require("enet-api");

(() => {

  // Authenticate with eNet server
  const enet = new ENet("192.168.0.7");
  const token = await enet.authenticate("admin", "admin");

  // Power on the first device in the array.
  const devices = await enet.getDevices();
  await enet.setDevicePrimaryState(devices[0].deviceUID, true);

})();

```


## Using the CLI
```
Usage: main [options] [command]

eNet Smart Home utility CLI.

Options:
  -V, --version                                output the version number
  -d, --debug                                  Debug
  -j, --json                                   JSON
  -p, --pretty                                 Pretty printed
  -s, --include-state                          Include device state in device list (when executing 'enet device ls')
  -h, --help                                   display help for command

Commands:
  auth <username> <password> <hostname>        authenticate with eNet
  deauth                                       Authenticate with eNet interface.
  location <command>                           manage locations
  project <command> [project]                  manage devices
  device <uid/ls> [action] [function] [value]  manage devices
  function <fuid> <action>                     manage devices
  get <command>                                manage variables
  set <command> <value>                        manage variables
  help [command]                               display help for command
```