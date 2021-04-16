/**
 * Copyright 2020 Google LLC
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
//  title: Lists all database operations in the instance
//  usage: node getDatabaseOperations <INSTANCE_ID> <PROJECT_ID>

'use strict';

function main(instanceId = 'my-instance', projectId = 'my-project-id') {
  // [START spanner_list_database_operations]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library
  const {Spanner, protos} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function getDatabaseOperations() {
    // Gets a reference to a Cloud Spanner instance
    const instance = spanner.instance(instanceId);

    // List database operations
    try {
      const [databaseOperations] = await instance.getDatabaseOperations({
        filter:
          '(metadata.@type:type.googleapis.com/google.spanner.admin.database.v1.OptimizeRestoredDatabaseMetadata)',
      });
      console.log('Optimize Database Operations:');
      databaseOperations.forEach(databaseOperation => {
        const metadata =
          protos.google.spanner.admin.database.v1.OptimizeRestoredDatabaseMetadata.decode(
            databaseOperation.metadata.value
          );
        console.log(
          `Database ${metadata.name} restored from backup is ` +
            `${metadata.progress.progressPercent}% optimized.`
        );
      });
    } catch (err) {
      console.error('ERROR:', err);
    }
  }
  getDatabaseOperations().catch(console.error);
  // [END spanner_list_database_operations]
}
main(...process.argv.slice(2));
