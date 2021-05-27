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
//  title: Create a table with a commit timestamp column
//  usage: node createTableWithTimestamp <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_create_table_with_timestamp_column]
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

  async function createTableWithTimestamp() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
    // must be converted to strings before being inserted as INT64s
    const request = [
      `CREATE TABLE Performances (
        SingerId    INT64 NOT NULL,
        VenueId     INT64 NOT NULL,
        EventDate   DATE,
        Revenue     INT64,
        LastUpdateTime TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
      ) PRIMARY KEY (SingerId, VenueId, EventDate),
      INTERLEAVE IN PARENT Singers ON DELETE CASCADE`,
    ];

    // Creates a table in an existing database
    const [operation] = await database.updateSchema(request);

    console.log(`Waiting for operation on ${databaseId} to complete...`);

    await operation.promise();

    console.log(`Created table Performances in database ${databaseId}.`);
  }
  createTableWithTimestamp().catch(console.error);
  // [END spanner_create_table_with_timestamp_column]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
