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
//  title: Deletes a backup
//  usage: node deleteBackup <INSTANCE_ID> <BACKUP_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  backupId = 'my-backup',
  projectId = 'my-project-id'
) {
  // [START spanner_delete_backup]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const backupId = 'my-backup';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud Spanner client library
  const {Spanner} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function deleteBackup() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const backup = instance.backup(backupId);

    // Delete the backup
    console.log(`Deleting backup ${backupId}.`);
    await backup.delete();

    // Verify backup no longer exists
    const exists = await backup.exists();
    if (exists) {
      console.error('Error: backup still exists.');
    } else {
      console.log('Backup deleted.');
    }
  }
  deleteBackup().catch(console.error);
  // [END spanner_delete_backup]
}
main(...process.argv.slice(2));
