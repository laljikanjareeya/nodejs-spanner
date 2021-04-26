/**
 * Copyright 2021 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// sample-metadata:
//  title: Execute a read-only transaction
//  usage: node readOnlyTransaction <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_read_only_transaction]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library and precise date library
  const {Spanner} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function readOnlyTransaction() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Gets a transaction object that captures the database state
    // at a specific point in time
    database.getSnapshot(async (err, transaction) => {
      if (err) {
        console.error(err);
        return;
      }
      const queryOne = 'SELECT SingerId, AlbumId, AlbumTitle FROM Albums';

      try {
        // Read #1, using SQL
        const [qOneRows] = await transaction.run(queryOne);

        qOneRows.forEach(row => {
          const json = row.toJSON();
          console.log(
            `SingerId: ${json.SingerId}, AlbumId: ${json.AlbumId}, AlbumTitle: ${json.AlbumTitle}`
          );
        });

        const queryTwo = {
          columns: ['SingerId', 'AlbumId', 'AlbumTitle'],
        };

        // Read #2, using the `read` method. Even if changes occur
        // in-between the reads, the transaction ensures that both
        // return the same data.
        const [qTwoRows] = await transaction.read('Albums', queryTwo);

        qTwoRows.forEach(row => {
          const json = row.toJSON();
          console.log(
            `SingerId: ${json.SingerId}, AlbumId: ${json.AlbumId}, AlbumTitle: ${json.AlbumTitle}`
          );
        });

        console.log('Successfully executed read-only transaction.');
      } catch (err) {
        console.error('ERROR:', err);
      } finally {
        transaction.end();
        // Close the database when finished.
        await database.close();
      }
    });
  }
  readOnlyTransaction().catch(console.error);
  // [END spanner_read_only_transaction]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
