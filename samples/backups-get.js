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
//  title: Lists backups in the instance with filters.
//  usage: node getBackups <INSTANCE_ID> <DATABASE_ID> <BACKUP_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  backupId = 'my-backup',
  projectId = 'my-project-id'
) {
  // [START spanner_list_backups]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
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

  async function getBackups() {
    // Gets a reference to a Cloud Spanner instance
    const instance = spanner.instance(instanceId);

    try {
      // List all backups
      const [allBackups] = await instance.getBackups();
      console.log('All backups:');
      allBackups.forEach(backup => {
        console.log(backup.id);
      });

      // List backups filtered by backup name
      const [backupsByName] = await instance.getBackups({
        filter: `Name:${backupId}`,
      });
      console.log('Backups matching backup name:');
      backupsByName.forEach(backup => {
        console.log(backup.id);
      });

      // List backups expiring within 30 days
      const expireTime = new Date();
      expireTime.setDate(expireTime.getDate() + 30);
      const [backupsByExpiry] = await instance.getBackups({
        filter: `expire_time < "${expireTime.toISOString()}"`,
      });
      console.log('Backups expiring within 30 days:');
      backupsByExpiry.forEach(backup => {
        console.log(backup.id);
      });

      // List backups filtered by database name
      const [backupsByDbName] = await instance.getBackups({
        filter: `Database:${databaseId}`,
      });
      console.log('Backups matching database name:');
      backupsByDbName.forEach(backup => {
        console.log(backup.id);
      });

      // List backups filtered by backup size
      const [backupsBySize] = await instance.getBackups({
        filter: 'size_bytes > 100',
      });
      console.log('Backups filtered by size:');
      backupsBySize.forEach(backup => {
        console.log(backup.id);
      });

      // List backups that are ready that were created after a certain time
      const createTime = new Date();
      createTime.setDate(createTime.getDate() - 1);
      const [backupsByCreateTime] = await instance.getBackups({
        filter: `(state:READY) AND (create_time >= "${createTime.toISOString()}")`,
      });
      console.log('Ready backups filtered by create time:');
      backupsByCreateTime.forEach(backup => {
        console.log(backup.id);
      });

      // List backups using pagination
      let getBackupsOptions = {
        pageSize: 3,
        gaxOptions: {autoPaginate: false},
      };
      console.log('Get backups paginated:');
      do {
        const [backups, nextQuery] = await instance.getBackups(
          getBackupsOptions
        );
        backups.forEach(backup => {
          console.log(backup.id);
        });
        getBackupsOptions = nextQuery;
      } while (getBackupsOptions);
    } catch (err) {
      console.error('ERROR:', err);
    }
  }
  getBackups().catch(console.error);
  // [END spanner_list_backups]
}
main(...process.argv.slice(2));
