// This is a little Node.js script that pretends it is the bitcoind executable.
// It is only used for unit testing.

import { readConfigFiles } from '@carnesen/bitcoin-config';

// By default this process runs for a "very long time" then exits 0
const DEFAULT_TIMEOUT = 9999;
const DEFAULT_CODE = 0;

const confArg = process.argv[2];
const confFilePath = confArg.split('=')[1];
const config = readConfigFiles(confFilePath);

// Let's hijack the config "timeout" property to mean
// "how long in milliseconds this mock process should stay alive for"

// and the "banscore" property to mean
// "what status code this process should exit with"
setTimeout(
  () => {
    process.exit(config.banscore || DEFAULT_CODE);
  },
  config.daemon ? 0 : config.timeout || DEFAULT_TIMEOUT,
);
