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
//  title: Executes a partition
//  usage: node executePartition <INSTANCE_ID> <DATABASE_ID> <IDENTIFIER> <PARTITION>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  identifier = 'identifier',
  partition = 'partition',
  projectId = 'my-project-id'
) {
  // [START spanner_batch_execute_partitions]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const identifier = {};
  // const partition = {};
  // const projectId = 'my-project-id';

  // Imports the Google Cloud Spanner client library
  const {Spanner} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function executePartition() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);
    const transaction = database.batchTransaction(identifier);

    const [rows] = await transaction.execute(partition);
    console.log(
      `Successfully received ${rows.length} from executed partition.`
    );
  }
  executePartition().catch(console.error);
  // [END spanner_batch_execute_partitions]
}
main(...process.argv.slice(2));
