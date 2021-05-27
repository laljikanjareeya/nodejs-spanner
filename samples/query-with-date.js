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
//  title: Query With Date parameter
//  usage: node queryWithDate <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_query_with_date_parameter]
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

  async function queryWithDate() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const fieldType = {
      type: 'date',
    };

    const exampleDate = '2019-01-01';

    const query = {
      sql: `SELECT VenueId, VenueName, LastContactDate FROM Venues
                    WHERE LastContactDate < @lastContactDate`,
      params: {
        lastContactDate: exampleDate,
      },
      types: {
        lastContactDate: fieldType,
      },
    };

    // Queries rows from the Venues table.
    try {
      const [rows] = await database.run(query);

      rows.forEach(row => {
        const date = row[2]['value'];
        const json = row.toJSON();
        console.log(
          `VenueId: ${json.VenueId}, VenueName: ${json.VenueName},` +
            ` LastContactDate: ${JSON.stringify(date).substring(1, 11)}`
        );
      });
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  queryWithDate().catch(console.error);
  // [END spanner_query_with_date_parameter]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
