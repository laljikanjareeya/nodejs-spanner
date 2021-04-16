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
//  title: Updates the expire time of a backup
//  usage: node updateBackup <INSTANCE_ID> <BACKUP_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  backupId = 'my-backup',
  projectId = 'my-project-id'
) {
  // [START spanner_update_backup]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const backupId = 'my-backup';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library and precise date library
  const {Spanner} = require('@google-cloud/spanner');
  const {PreciseDate} = require('@google-cloud/precise-date');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function updateBackup() {
    // Gets a reference to a Cloud Spanner instance and backup
    const instance = spanner.instance(instanceId);
    const backup = instance.backup(backupId);

    // Read backup metadata and update expiry time
    try {
      const currentExpireTime = await backup.getExpireTime();
      const newExpireTime = new PreciseDate(currentExpireTime);
      newExpireTime.setDate(newExpireTime.getDate() + 30);
      console.log(
        `Backup ${backupId} current expire time: ${currentExpireTime.toISOString()}`
      );
      console.log(`Updating expire time to ${newExpireTime.toISOString()}`);
      await backup.updateExpireTime(newExpireTime);
      console.log('Expire time updated.');
    } catch (err) {
      console.error('ERROR:', err);
    }
  }
  updateBackup().catch(console.error);
  // [END spanner_update_backup]
}
main(...process.argv.slice(2));
