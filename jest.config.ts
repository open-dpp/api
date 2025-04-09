import type { Config } from 'jest';
import * as path from 'path';

const config: Config = {
  setupFiles: [path.join(__dirname, 'jest.setup.ts')],

  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*-migration.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
export default config;
