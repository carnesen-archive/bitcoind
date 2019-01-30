# @carnesen/bitcoind [![Build Status](https://travis-ci.com/carnesen/bitcoind.svg?branch=master)](https://travis-ci.com/carnesen/bitcoind)

A Node.js utility library for starting and stopping the bitcoin server `bitcoind`

## Install
```
$ npm install @carnesen/bitcoind
```
The package includes runtime JavaScript files suitable for Node.js >=8 as well as the corresponding TypeScript type declarations.

## Usage

Here is a little TypeScript Node.js script that spawns `bitcoind`:
```ts
// example.ts
import { spawn } from '@carnesen/bitcoind';
import { runAndExit } from '@carnesen/run-and-exit';
import { homedir } from 'os';
import { join } from 'path';

runAndExit(spawn, {
  bitcoinHome: join(homedir(), 'bitcoin-core-0.17.1'),
  configFilePath: join(homedir(), 'bitcoin.conf'),  
});
```

Running this script looks like:
```
$ ts-node example.ts
2019-01-24T03:57:07Z Bitcoin Core version v0.17.1 (release build)
2019-01-24T03:57:07Z InitParameterInteraction: parameter interaction: -whitelistforcerelay=1 -> setting -whitelistrelay=1
2019-01-24T03:57:07Z Validating signatures for all blocks.
...
```
The `bitcoind` child process inherits the Node.js parent's stdout, stdin, and stderr. So in non-daemon mode when `bitcoind` logs to the terminal, so does the parent.

## API
### spawn({bitcoinHome, configFilePath}): Promise\<void>
Reads a bitcoin configuration file and spawns `bitcoind` as a child process

#### bitcoinHome
Optional `string`. Absolute path of a directory where the bitcoin server software is installed. This library expects to find `bitcoind` at 
```
`${bitcoinHome}/bin/bitcoind` 
```
If `bitcoinHome` is not provided, `bitcoind` must be on your `PATH`.

#### configFilePath
Optional `string`. Defaults to the platform-dependent location where the bitcoin server software looks for its configuration file, e.g. `'~/.bitcoin/bitcoin.conf'` on Linux. Before spawning `bitcoind`, `spawnBitcoin` reads the configuration file and modifies its behavior slightly based on what it finds. If the configuration does not specify `daemon` as `true`, the `spawnBitcoin` kills the child `bitcoind` process if the parent Node.js process exits. Also if `daemon` is not set to `true` (1), `bitcoind` exiting is always considered an error even if it exits with status code 0 (success).

#### Return value
A `Promise` that represents the running `bitcoind` child. If there is an error spawning the child or if the child exits for any reason, the promise rejects. The only exception to that rule is if `daemon` is set to `true` and the child's exit status is 0 (success). In that case the promise resolves.

## More information
This library has a number of unit tests with >95% coverage. Check out [the tests directory](src/__tests__) for more examples of how it works. If you encounter any bugs or have any questions or feature requests, please don't hesitate to file an issue or submit a pull request on this project's repository on GitHub.

## Related
- [@carnesen/bitcoin-config](https://github.com/carnesen/bitcoin-config): Node.js constants, utilities, and TypeScript types for bitcoin server software configuration

