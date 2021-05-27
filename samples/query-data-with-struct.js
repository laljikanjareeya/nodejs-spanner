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
//  title: Queries Data using STRUCT parameters.
//  usage: node queryDataWithStruct <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_query_data_with_struct]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const projectId = 'my-project-id';

  // [START spanner_create_struct_with_data]
  // Imports the Google Cloud Spanner client library
  const {Spanner} = require('@google-cloud/spanner');

  const nameStruct = Spanner.struct({
    FirstName: 'Elena',
    LastName: 'Campbell',
  });
  // [END spanner_create_struct_with_data]
  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function queryDataWithStruct() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const query = {
      sql:
        'SELECT SingerId FROM Singers WHERE ' +
        'STRUCT<FirstName STRING, LastName STRING>(FirstName, LastName) = @name',
      params: {
        name: nameStruct,
      },
    };

    // Queries rows from the Singers table
    try {
      const [rows] = await database.run(query);

      rows.forEach(row => {
        const json = row.toJSON();
        console.log(`SingerId: ${json.SingerId}`);
      });
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  queryDataWithStruct().catch(console.error);
  // [END spanner_query_data_with_struct]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
