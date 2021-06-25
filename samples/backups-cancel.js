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
//  title: Creates and cancels a backup of a Cloud Spanner database.
//  usage: node cancelBackup <INSTANCE_ID> <DATABASE_ID> <BACKUP_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  backupId = 'my-backup',
  projectId = 'my-project-id'
) {
  // [START spanner_cancel_backup_create]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const backupId = 'my-backup';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud Spanner client library
  const {Spanner} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function cancelBackup() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const backup = instance.backup(backupId);

    // Creates a new backup of the database
    try {
      console.log(`Creating backup of database ${database.formattedName_}.`);
      const databasePath = database.formattedName_;
      // Expire backup one day in the future
      const expireTime = Date.now() + 1000 * 60 * 60 * 24;
      const [, operation] = await backup.create({
        databasePath: databasePath,
        expireTime: expireTime,
      });

      // Cancel the backup
      await operation.cancel();

      console.log('Backup cancelled.');
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Delete backup in case it got created before the cancel operation
      await backup.delete();

      // Close the database when finished.
      await database.close();
    }
  }
  cancelBackup().catch(console.error);
  // [END spanner_cancel_backup_create]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
