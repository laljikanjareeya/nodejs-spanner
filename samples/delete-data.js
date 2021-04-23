// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// sample-metadata:
//  title: Delete Data
//  usage: node deleteData <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_delete_data]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud Spanner client library
  const {Spanner} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function deleteData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiate Spanner table object
    const albumsTable = database.table('Albums');

    // Deletes individual rows from the Albums table.
    try {
      const keys = [
        [2, 1],
        [2, 3],
      ];
      await albumsTable.deleteRows(keys);
      console.log('Deleted individual rows in Albums.');
    } catch (err) {
      console.error('ERROR:', err);
    }

    // Delete a range of rows where the column key is >=3 and <5
    database.runTransaction(async (err, transaction) => {
      if (err) {
        console.error(err);
        return;
      }
      try {
        const [rowCount] = await transaction.runUpdate({
          sql: 'DELETE FROM Singers WHERE SingerId >= 3 AND SingerId < 5',
        });
        console.log(`${rowCount} records deleted from Singers.`);
      } catch (err) {
        console.error('ERROR:', err);
      }

      // Deletes remaining rows from the Singers table and the Albums table,
      // because Albums table is defined with ON DELETE CASCADE.
      try {
        // The WHERE clause is required for DELETE statements to prevent
        // accidentally deleting all rows in a table.
        // https://cloud.google.com/spanner/docs/dml-syntax#where_clause
        const [rowCount] = await transaction.runUpdate({
          sql: 'DELETE FROM Singers WHERE true',
        });
        console.log(`${rowCount} records deleted from Singers.`);
        await transaction.commit();
      } catch (err) {
        console.error('ERROR:', err);
      } finally {
        // Close the database when finished.
        await database.close();
      }
    });
  }
  deleteData().catch(console.error);
  // [END spanner_delete_data]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
