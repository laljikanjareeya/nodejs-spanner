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
//  title: Execute a read-write transaction using DML.
//  usage: node writeWithTransactionUsingDml <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_dml_getting_started_update]\

  // This sample transfers 200,000 from the MarketingBudget field
  // of the second Album to the first Album, as long as the second
  // Album has enough money in its budget. Make sure to run the
  // addColumn and updateData samples first (in that order).

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

  async function writeWithTransactionUsingDml() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const transferAmount = 200000;

    database.runTransaction((err, transaction) => {
      if (err) {
        console.error(err);
        return;
      }
      let firstBudget, secondBudget;
      const queryOne = `SELECT MarketingBudget FROM Albums
      WHERE SingerId = 2 AND AlbumId = 2`;

      const queryTwo = `SELECT MarketingBudget FROM Albums
    WHERE SingerId = 1 AND AlbumId = 1`;

      Promise.all([
        // Reads the second album's budget
        transaction.run(queryOne).then(results => {
          // Gets second album's budget
          const rows = results[0].map(row => row.toJSON());
          secondBudget = rows[0].MarketingBudget;
          console.log(`The second album's marketing budget: ${secondBudget}`);

          // Makes sure the second album's budget is large enough
          if (secondBudget < transferAmount) {
            throw new Error(
              `The second album's budget (${secondBudget}) is less than the transfer amount (${transferAmount}).`
            );
          }
        }),

        // Reads the first album's budget
        transaction.run(queryTwo).then(results => {
          // Gets first album's budget
          const rows = results[0].map(row => row.toJSON());
          firstBudget = rows[0].MarketingBudget;
          console.log(`The first album's marketing budget: ${firstBudget}`);
        }),
      ])
        .then(() => {
          // Transfers the budgets between the albums
          console.log(firstBudget, secondBudget);
          firstBudget += transferAmount;
          secondBudget -= transferAmount;

          console.log(firstBudget, secondBudget);

          // Updates the database
          // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
          // must be converted (back) to strings before being inserted as INT64s.

          return transaction
            .runUpdate({
              sql: `UPDATE Albums SET MarketingBudget = @Budget
                WHERE SingerId = 1 and AlbumId = 1`,
              params: {
                Budget: firstBudget,
              },
            })
            .then(() =>
              transaction.runUpdate({
                sql: `UPDATE Albums SET MarketingBudget = @Budget
                    WHERE SingerId = 2 and AlbumId = 2`,
                params: {
                  Budget: secondBudget,
                },
              })
            );
        })
        .then(() => {
          // Commits the transaction and send the changes to the database
          return transaction.commit();
        })
        .then(() => {
          console.log(
            `Successfully executed read-write transaction using DML to transfer ${transferAmount} from Album 2 to Album 1.`
          );
        })
        .then(() => {
          // Closes the database when finished
          database.close();
        });
    });
  }
  writeWithTransactionUsingDml().catch(console.error);
  // [END spanner_dml_getting_started_update]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
