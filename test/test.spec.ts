import { Migrator } from '../src/';

const dbURL = process.env.DBURL;

describe('Migration', () => {
  let migrator: Migrator;

  beforeAll(async () => {
    migrator = new Migrator({
      collectionName: '_migration',
      db: { connectionUrl: dbURL },
      log: true,
      logIfLatest: true,
    });
    await migrator.config();
  });

  beforeEach(() => {
    migrator.add({
      version: 1,
      name: 'Version 1',
      up: async (_db) => {
        return;
      },
      down: async (_db) => {
        return;
      },
    });

    migrator.add({
      version: 2,
      name: 'Version 2',
      up: async (_db) => {
        return;
      },
      down: async (_db) => {
        return;
      },
    });
  });

  afterEach(async () => {
    await migrator.reset();
  });

  describe('#migrateTo', () => {
    test('1 from 0, should migrate to v1', async () => {
      let currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(0);
      await migrator.migrateTo(1);
      currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(1);
    });

    test('2 from 0, should migrate to v2', async () => {
      let currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(0);
      await migrator.migrateTo(2);
      currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(2);
    });

    test(`'latest' from 0, should migrate to v2`, async () => {
      let currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(0);
      await migrator.migrateTo('latest');
      currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(2);
    });

    test('from 2 to 1, should migrate to v1', async () => {
      await migrator.migrateTo('2');
      let currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(2);

      await migrator.migrateTo(1);
      currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(1);
    });

    test('from 2 to 0, should migrate to v0', async () => {
      await migrator.migrateTo('2');
      let currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(2);

      await migrator.migrateTo(0);
      currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(0);
    });

    test('rerun 0 to 0, should migrate to v0', async () => {
      let currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(0);

      await migrator.migrateTo('0,rerun');
      currentVersion = await migrator.getVersion();
      expect(currentVersion).toBe(0);
    });

    describe('With async up() & down()', () => {
      beforeEach(() => {
        migrator.add({
          version: 3,
          name: 'Version 3.',
          up: async (_db) => {
            return;
          },
          down: async (_db) => {
            return;
          },
        });

        migrator.add({
          version: 4,
          name: 'Version 4',
          up: async (_db) => {
            return;
          },
          down: async (_db) => {
            return;
          },
        });
      });

      test('from 0 to 3, should migrate to v3', async () => {
        let currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(0);
        await migrator.migrateTo(3);
        currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(3);
      });

      test('from 0 to 4, should migrate to v4', async () => {
        let currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(0);
        await migrator.migrateTo(4);
        currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(4);
      });
    });

    describe('On Error', () => {
      beforeEach(() => {
        migrator.add({
          version: 3,
          name: 'Version 3.',
          // tslint:disable-next-line: no-empty
          up: async (_db) => {
            return;
          },
          // tslint:disable-next-line: no-empty
          down: async (_db) => {
            return;
          },
        });

        migrator.add({
          version: 4,
          name: 'Version 4.',
          // tslint:disable-next-line: no-empty
          up: async (_db) => {
            return;
          },
          down: async (_db) => {
            throw new Error('Something went wrong');
          },
        });

        migrator.add({
          version: 5,
          name: 'Version 5.',
          up: async (_db) => {
            throw new Error('Something went wrong');
          },
          // tslint:disable-next-line: no-empty
          down: async (_db) => {
            return;
          },
        });
      });

      test('from 0 to 5, should stop migration at v4 due to error from v4 to v5', async () => {
        let currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(0);
        try {
          await migrator.migrateTo(5);
        } catch (e) {
          expect(e).toBeTruthy();
          expect(e).toBeInstanceOf(Error);
        }
        currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(4);
      });

      test('from 4 to 3, should stop migration at 4 due to error from v4 to v3', async () => {
        await migrator.migrateTo(4);
        let currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(4);
        try {
          await migrator.migrateTo(3);
        } catch (e) {
          expect(e).toBeTruthy();
          expect(e).toBeInstanceOf(Error);
        }
        currentVersion = await migrator.getVersion();
        expect(currentVersion).toBe(4);
      });
    });
  });
});
