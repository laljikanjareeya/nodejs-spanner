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
//  title: Insert data with timestamps column
//  usage: node insertWithTimestamp <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_insert_data_with_timestamp_column]
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

  async function insertWithTimestamp() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiate Spanner table objects
    const performancesTable = database.table('Performances');

    const data = [
      {
        SingerId: '1',
        VenueId: '4',
        EventDate: '2017-10-05',
        Revenue: '11000',
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
      {
        SingerId: '1',
        VenueId: '19',
        EventDate: '2017-11-02',
        Revenue: '15000',
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
      {
        SingerId: '2',
        VenueId: '42',
        EventDate: '2017-12-23',
        Revenue: '7000',
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
    ];

    // Inserts rows into the Singers table
    // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so
    // they must be converted to strings before being inserted as INT64s
    try {
      await performancesTable.insert(data);
      console.log('Inserted data.');
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished
      database.close();
    }
  }
  insertWithTimestamp().catch(console.error);
  // [END spanner_insert_data_with_timestamp_column]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
