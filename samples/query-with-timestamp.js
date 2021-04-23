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
//  title: Execute a read-only SQL query with an additional column.
//  usage: node queryWithTimestamp <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_query_data_with_timestamp_column]
  // [START_EXCLUDE]
  // This sample uses the `MarketingBudget` column. You can add the column
  // by running the `schema.js addColumn` sample or by running this DDL statement against
  // your database:
  //    ALTER TABLE Albums ADD COLUMN MarketingBudget INT64
  //
  // In addition this query expects the `LastUpdateTime` column
  // added by running the `add-timestamp-column.js addTimestampColumn` sample
  // or applying the DDL statement:
  //    ALTER TABLE Albums ADD COLUMN
  //    LastUpdateTime TIMESTAMP OPTIONS (allow_commit_timestamp=true)
  // [END_EXCLUDE]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library and precise date library
  const {Spanner} = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  async function queryWithTimestamp() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const query = {
      sql: `SELECT SingerId, AlbumId, MarketingBudget, LastUpdateTime
                FROM Albums ORDER BY LastUpdateTime DESC`,
    };

    // Queries rows from the Albums table
    try {
      const [rows] = await database.run(query);

      rows.forEach(row => {
        const json = row.toJSON();

        console.log(
          `SingerId: ${json.SingerId}, AlbumId: ${
            json.AlbumId
          }, MarketingBudget: ${
            json.MarketingBudget ? json.MarketingBudget : null
          }, LastUpdateTime: ${json.LastUpdateTime}`
        );
      });
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished
      database.close();
    }
  }
  queryWithTimestamp().catch(console.error);
  // [END spanner_query_data_with_timestamp_column]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
