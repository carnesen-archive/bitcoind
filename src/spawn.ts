import { isAbsolute, join } from 'path';
import { spawn as childProcessSpawn } from 'child_process';

import signalExit = require('signal-exit');

import { readConfigFiles } from '@carnesen/bitcoin-config';
import { platform } from 'os';

type Options = Partial<{
  bitcoinHome: string;
  configFilePath: string;
}>;

const BITCOIND_EXE = platform() === 'win32' ? 'bitcoind.exe' : 'bitcoind';

export function spawnBitcoind(options: Options = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const { configFilePath, bitcoinHome } = options;
    if (bitcoinHome && !isAbsolute(bitcoinHome)) {
      throw new Error('If provided, "bitcoinHome" must be an absolute path');
    }
    const config = readConfigFiles(configFilePath);
    const spawnArgs: string[] = [];
    if (configFilePath) {
      spawnArgs.push(`-conf=${configFilePath}`);
    }
    const command = bitcoinHome ? join(bitcoinHome, 'bin', BITCOIND_EXE) : BITCOIND_EXE;
    const spawned = childProcessSpawn(command, spawnArgs, {
      stdio: 'inherit',
    });

    if (!config.daemon) {
      // Kill child when parent exits
      signalExit(() => {
        spawned.kill();
      });
    }

    spawned.on('error', err => {
      reject(err);
    });

    spawned.on('exit', code => {
      if (config.daemon && code === 0) {
        // When bitcoind is launched as a "daemon" it just prints a message and exits
        resolve();
      } else {
        // bitcoind has hopefully printed an error message to console too
        reject(new Error(`bitcoind exited with code ${code}`));
      }
    });
  });
}
