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
//  title: Insert and Update records using Batch DML.
//  usage: node updateUsingBatchDml <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_dml_batch_update]
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

  async function updateUsingBatchDml() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const insert = {
      sql: `INSERT INTO Albums (SingerId, AlbumId, AlbumTitle, MarketingBudget)
          VALUES (1, 3, "Test Album Title", 10000)`,
    };

    const update = {
      sql: `UPDATE Albums SET MarketingBudget = MarketingBudget * 2
          WHERE SingerId = 1 and AlbumId = 3`,
    };

    const dmlStatements = [insert, update];

    try {
      await database.runTransactionAsync(async transaction => {
        const [rowCounts] = await transaction.batchUpdate(dmlStatements);
        await transaction.commit();
        console.log(
          `Successfully executed ${rowCounts.length} SQL statements using Batch DML.`
        );
      });
    } catch (err) {
      console.error('ERROR:', err);
      throw err;
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  updateUsingBatchDml().catch(console.error);
  // [END spanner_dml_batch_update]
}
main(...process.argv.slice(2));
