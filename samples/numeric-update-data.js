// Copyright 2020 Google LLC
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
//  title: Update Data with numeric Column
//  usage: node updateWithNumericData <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_update_data_with_numeric_column]
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

  async function updateWithNumericData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiate Spanner table objects.
    const venuesTable = database.table('Venues');

    const data = [
      {
        VenueId: '4',
        Revenue: Spanner.numeric('35000'),
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
      {
        VenueId: '19',
        Revenue: Spanner.numeric('104500'),
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
      {
        VenueId: '42',
        Revenue: Spanner.numeric('99999999999999999999999999999.99'),
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
    ];

    // Updates rows in the Venues table.
    try {
      await venuesTable.update(data);
      console.log('Updated data.');
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  updateWithNumericData().catch(console.error);
  // [END spanner_update_data_with_numeric_column]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
