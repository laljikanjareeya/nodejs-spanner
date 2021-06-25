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
//  title: Lists all backup operations in the instance
//  usage: node getBackupOperations <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_list_backup_operations]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library
  const {Spanner, protos} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function getBackupOperations() {
    // Gets a reference to a Cloud Spanner instance
    const instance = spanner.instance(instanceId);

    // List backup operations
    try {
      const [backupOperations] = await instance.getBackupOperations({
        filter:
          `(metadata.database:${databaseId}) AND ` +
          '(metadata.@type:type.googleapis.com/google.spanner.admin.database.v1.CreateBackupMetadata)',
      });
      console.log('Create Backup Operations:');
      backupOperations.forEach(backupOperation => {
        const metadata =
          protos.google.spanner.admin.database.v1.CreateBackupMetadata.decode(
            backupOperation.metadata.value
          );
        console.log(
          `Backup ${metadata.name} on database ${metadata.database} is ` +
            `${metadata.progress.progressPercent}% complete.`
        );
      });
    } catch (err) {
      console.error('ERROR:', err);
    }
  }
  getBackupOperations().catch(console.error);
  // [END spanner_list_backup_operations]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
