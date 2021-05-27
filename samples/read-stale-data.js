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
//  title: Read Stale Data
//  usage: node readStaleData <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_read_stale_data]
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

  async function readStaleData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Reads rows from the Albums table
    const albumsTable = database.table('Albums');

    const query = {
      columns: ['SingerId', 'AlbumId', 'AlbumTitle', 'MarketingBudget'],
      keySet: {
        all: true,
      },
    };

    const options = {
      // Guarantees that all writes committed more than 15 seconds ago are visible
      exactStaleness: 15,
    };

    try {
      const [rows] = await albumsTable.read(query, options);

      rows.forEach(row => {
        const json = row.toJSON();
        const id = json.SingerId;
        const album = json.AlbumId;
        const title = json.AlbumTitle;
        const budget = json.MarketingBudget ? json.MarketingBudget : '';
        console.log(
          `SingerId: ${id}, AlbumId: ${album}, AlbumTitle: ${title}, MarketingBudget: ${budget}`
        );
      });
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      await database.close();
    }
  }
  readStaleData().catch(console.error);
  // [END spanner_read_stale_data]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
