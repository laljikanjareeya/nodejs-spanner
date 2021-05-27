// Copyright 2016 Google LLC
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
//  title: Quick start
//  usage: node quickstart <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  projectId = 'my-project-id',
  instanceId = 'my-instance',
  databaseId = 'my-database'
) {
  // [START spanner_quickstart]
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

  async function quickstart() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // The query to execute
    const query = {
      sql: 'SELECT 1',
    };

    // Execute a simple SQL statement
    const [rows] = await database.run(query);
    console.log(`Query: ${rows.length} found.`);
    rows.forEach(row => console.log(row));
  }
  quickstart().catch(console.error);
  // [END spanner_quickstart]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
