// example.ts
import { spawn } from '.';
import { runAndExit } from '@carnesen/run-and-exit';
import { homedir } from 'os';
import { join } from 'path';

runAndExit(spawn, {
  bitcoinHome: join(homedir(), 'bitcoin-core-0.17.1'),
  configFilePath: join(homedir(), 'bitcoin.conf'),
});
