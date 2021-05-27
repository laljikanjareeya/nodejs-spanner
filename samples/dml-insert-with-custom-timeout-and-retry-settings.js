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
//  title: Insert records using custom timeout and retry settings.
//  usage: node insertWithCustomTimeoutAndRetrySettings <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_set_custom_timeout_and_retry]
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

  async function insertWithCustomTimeoutAndRetrySettings() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);
    const table = database.table('Singers');

    const DEADLINE_EXCEEDED_STATUS_CODE = 4;
    const UNAVAILABLE_STATUS_CODE = 14;
    const retryAndTimeoutSettings = {
      retry: {
        retryCodes: [DEADLINE_EXCEEDED_STATUS_CODE, UNAVAILABLE_STATUS_CODE],
        backoffSettings: {
          // Configure retry delay settings.
          initialRetryDelayMillis: 500,
          maxRetryDelayMillis: 64000,
          retryDelayMultiplier: 1.5,
          // Configure RPC and total timeout settings.
          initialRpcTimeoutMillis: 60000,
          rpcTimeoutMultiplier: 1.0,
          maxRpcTimeoutMillis: 60000,
          totalTimeoutMillis: 60000,
        },
      },
    };

    const row = {
      SingerId: 16,
      FirstName: 'Martha',
      LastName: 'Waller',
    };

    await table.insert(row, retryAndTimeoutSettings);

    console.log('record inserted.');
  }
  insertWithCustomTimeoutAndRetrySettings().catch(console.error);
  // [END spanner_set_custom_timeout_and_retry]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
