import * as migration_20261118_115011_initial from './20261118_115011_initial';

export const migrations = [
  {
    up: migration_20261118_115011_initial.up,
    down: migration_20261118_115011_initial.down,
    name: '20261118_115011_initial'
  },
];
