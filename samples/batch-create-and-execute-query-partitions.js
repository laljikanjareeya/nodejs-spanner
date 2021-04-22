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
//  title: Creates query partitions and executes them
//  usage: node createAndExecuteQueryPartitions <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_batch_client]
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

  async function createAndExecuteQueryPartitions() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);
    const [transaction] = await database.createBatchTransaction();

    const query = 'SELECT * FROM Singers';

    const [partitions] = await transaction.createQueryPartitions(query);
    console.log(`Successfully created ${partitions.length} query partitions.`);

    let row_count = 0;
    const promises = [];
    partitions.forEach(partition => {
      promises.push(
        transaction.execute(partition).then(results => {
          const rows = results[0].map(row => row.toJSON());
          row_count += rows.length;
        })
      );
    });
    Promise.all(promises)
      .then(() => {
        console.log(
          `Successfully received ${row_count} from executed partitions.`
        );
        transaction.close();
      })
      .then(() => {
        database.close();
      });
  }
  createAndExecuteQueryPartitions().catch(console.error);
  // [END spanner_batch_client]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
