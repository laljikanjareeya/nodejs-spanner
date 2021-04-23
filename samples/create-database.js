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
//  title: Create Database
//  usage: node createDatabase <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_create_database]
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

  async function createDatabase() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);

    // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
    // must be converted to strings before being inserted as INT64s
    const request = {
      schema: [
        `CREATE TABLE Singers (
        SingerId    INT64 NOT NULL,
        FirstName   STRING(1024),
        LastName    STRING(1024),
        SingerInfo  BYTES(MAX)
      ) PRIMARY KEY (SingerId)`,
        `CREATE TABLE Albums (
        SingerId    INT64 NOT NULL,
        AlbumId     INT64 NOT NULL,
        AlbumTitle  STRING(MAX)
      ) PRIMARY KEY (SingerId, AlbumId),
      INTERLEAVE IN PARENT Singers ON DELETE CASCADE`,
      ],
    };

    // Creates a database
    const [database, operation] = await instance.createDatabase(
      databaseId,
      request
    );

    console.log(`Waiting for operation on ${database.id} to complete...`);
    await operation.promise();

    console.log(`Created database ${databaseId} on instance ${instanceId}.`);
  }
  createDatabase().catch(console.error);
  // [END spanner_create_database]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
