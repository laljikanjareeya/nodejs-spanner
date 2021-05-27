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
//  title: Insert Datatypes Data
//  usage: node insertDatatypesData <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_insert_datatypes_data]
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

  async function insertDatatypesData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiate Spanner table objects.
    const venuesTable = database.table('Venues');
    const exampleBytes1 = new Buffer.from('Hello World 1');
    const exampleBytes2 = new Buffer.from('Hello World 2');
    const exampleBytes3 = new Buffer.from('Hello World 3');
    const availableDates1 = ['2020-12-01', '2020-12-02', '2020-12-03'];
    const availableDates2 = ['2020-11-01', '2020-11-05', '2020-11-15'];
    const availableDates3 = ['2020-10-01', '2020-10-07'];

    // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
    // must be converted to strings before being inserted as INT64s.
    const data = [
      {
        VenueId: '4',
        VenueName: 'Venue 4',
        VenueInfo: exampleBytes1,
        Capacity: '1800',
        AvailableDates: availableDates1,
        LastContactDate: '2018-09-02',
        OutdoorVenue: false,
        PopularityScore: 0.85543,
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
      {
        VenueId: '19',
        VenueName: 'Venue 19',
        VenueInfo: exampleBytes2,
        Capacity: '6300',
        AvailableDates: availableDates2,
        LastContactDate: '2019-01-15',
        OutdoorVenue: true,
        PopularityScore: 0.98716,
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
      {
        VenueId: '42',
        VenueName: 'Venue 42',
        VenueInfo: exampleBytes3,
        Capacity: '3000',
        AvailableDates: availableDates3,
        LastContactDate: '2018-10-01',
        OutdoorVenue: false,
        PopularityScore: 0.72598,
        LastUpdateTime: 'spanner.commit_timestamp()',
      },
    ];

    // Inserts rows into the Venues table.
    try {
      await venuesTable.insert(data);
      console.log('Inserted data.');
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  insertDatatypesData().catch(console.error);
  // [END spanner_insert_datatypes_data]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
