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
//  title: Creates a backup of a Cloud Spanner database using an encryption key
//  usage: node createBackupWithEncryptionKey <INSTANCE_ID> <DATABASE_ID> <BACKUP_ID> <PROJECT_ID> <KEY_NAME>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  backupId = 'my-backup',
  projectId = 'my-project-id',
  keyName = 'key-name'
) {
  // [START spanner_create_backup_with_encryption_key]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const backupId = 'my-backup';
  // const projectId = 'my-project-id';
  // const keyName =
  //   'projects/my-project-id/my-region/keyRings/my-key-ring/cryptoKeys/my-key';

  // Imports the Google Cloud client library and precise date library
  const {Spanner} = require('@google-cloud/spanner');
  const {PreciseDate} = require('@google-cloud/precise-date');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function createBackupWithEncryptionKey() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const backup = instance.backup(backupId);

    // Creates a new backup of the database
    try {
      console.log(`Creating backup of database ${database.formattedName_}.`);
      const databasePath = database.formattedName_;
      // Expire backup 14 days in the future
      const expireTime = Date.now() + 1000 * 60 * 60 * 24 * 14;
      // Create a backup of the state of the database at the current time.
      const [, operation] = await backup.create({
        databasePath: databasePath,
        expireTime: expireTime,
        encryptionConfig: {
          encryptionType: 'CUSTOMER_MANAGED_ENCRYPTION',
          kmsKeyName: keyName,
        },
      });

      console.log(`Waiting for backup ${backup.formattedName_} to complete...`);
      await operation.promise();

      // Verify backup is ready
      const [backupInfo] = await backup.getMetadata();
      if (backupInfo.state === 'READY') {
        console.log(
          `Backup ${backupInfo.name} of size ` +
            `${backupInfo.sizeBytes} bytes was created at ` +
            `${new PreciseDate(backupInfo.createTime).toISOString()} ` +
            `using encryption key ${backupInfo.encryptionInfo.kmsKeyVersion}`
        );
      } else {
        console.error('ERROR: Backup is not ready.');
      }
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      await database.close();
    }
  }
  createBackupWithEncryptionKey().catch(console.error);
  // [END spanner_create_backup_with_encryption_key]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
