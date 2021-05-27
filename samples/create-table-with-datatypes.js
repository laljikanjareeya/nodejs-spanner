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
//  title: Create Table with datatypes
//  usage: node createTableWithDatatypes <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_create_table_with_datatypes]
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

  async function createTableWithDatatypes() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const request = [
      `CREATE TABLE Venues (
                VenueId                INT64 NOT NULL,
                VenueName              STRING(100),
                VenueInfo              BYTES(MAX),
                Capacity               INT64,
                AvailableDates         ARRAY<DATE>,
                LastContactDate        Date,
                OutdoorVenue           BOOL,
                PopularityScore        FLOAT64,
                LastUpdateTime TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
              ) PRIMARY KEY (VenueId)`,
    ];

    // Creates a table in an existing database.
    const [operation] = await database.updateSchema(request);

    console.log(`Waiting for operation on ${databaseId} to complete...`);

    await operation.promise();

    console.log(`Created table Venues in database ${databaseId}.`);
  }
  createTableWithDatatypes().catch(console.error);
  // [END spanner_create_table_with_datatypes]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
