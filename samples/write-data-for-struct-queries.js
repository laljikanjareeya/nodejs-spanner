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
//  title: Write Data for Struct Queries
//  usage: node writeDataForStructQueries <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_write_data_for_struct_queries]
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

  async function writeDataForStructQueries() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiates Spanner table objects
    const singersTable = database.table('Singers');

    // Inserts rows into the Singers table
    // Note: Cloud Spanner interprets Javascript numbers as FLOAT64s.
    // Use strings as shown in this example if you need INT64s.
    try {
      const data = [
        {
          SingerId: '6',
          FirstName: 'Elena',
          LastName: 'Campbell',
        },
        {
          SingerId: '7',
          FirstName: 'Gabriel',
          LastName: 'Wright',
        },
        {
          SingerId: '8',
          FirstName: 'Benjamin',
          LastName: 'Martinez',
        },
        {
          SingerId: '9',
          FirstName: 'Hannah',
          LastName: 'Harris',
        },
      ];

      await singersTable.insert(data);
      console.log('Inserted data.');
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  writeDataForStructQueries().catch(console.error);
  // [END spanner_write_data_for_struct_queries]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
