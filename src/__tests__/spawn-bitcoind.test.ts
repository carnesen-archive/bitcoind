import { SectionedConfig, writeConfigFile } from '@carnesen/bitcoin-config';
import * as tempy from 'tempy';
import { spawnBitcoind } from '../spawn';

const spawnMocked = (config: SectionedConfig) => {
  const configFilePath = tempy.file();
  writeConfigFile(configFilePath, config);
  return spawnBitcoind({ configFilePath, bitcoinHome: process.cwd() });
};

const catchMocked = async (config: SectionedConfig) => {
  try {
    await spawnMocked(config);
    throw new Error('This error should never occur');
  } catch (ex) {
    return ex;
  }
};

describe(spawnBitcoind.name, () => {
  it('launches bitcoind and returns a promise that is pending while bitcoind is running', async () => {
    const s = Symbol();
    const resolvedValue = await Promise.race([
      spawnMocked({}),
      new Promise(resolve => {
        setTimeout(() => {
          resolve(s);
        }, 1000);
      }),
    ]);
    expect(resolvedValue).toBe(s);
  });

  it('resolves if the child exits and daemon is set to true', async () => {
    const datadir = tempy.directory();
    await spawnMocked({ daemon: true, datadir });
  });

  it('rejects if the child exits and daemon is not set to true', async () => {
    const datadir = tempy.directory();
    const err = await catchMocked({ timeout: 1, datadir });
    expect(err.message).toMatch('bitcoind exited');
  });

  it('rejects "must be an absolute path" if the provided "bitcoinHome" is not absolute', async () => {
    try {
      await spawnBitcoind({ bitcoinHome: 'foo' });
      throw new Error('This line should never be reached');
    } catch (ex) {
      expect(ex.message).toMatch('must be an absolute path');
    }
  });

  it('rejects if spawn fails', async () => {
    try {
      await spawnBitcoind({ bitcoinHome: '/foo/bar/baz' });
    } catch (ex) {
      expect(ex.code).toBe('ENOENT');
    }
  });
});
