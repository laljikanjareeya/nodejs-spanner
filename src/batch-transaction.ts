/*!
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {PreciseDate} from '@google-cloud/precise-date';
import {promisifyAll} from '@google-cloud/promisify';
import * as extend from 'extend';
import * as r from 'request';
import {CallOptions} from 'google-gax/build/src/gax';
import {Readable} from 'stream';

import {
  Snapshot,
  ReadRequest,
  ExecuteSqlRequest,
  RunCallback,
  ReadCallback as TransactionRequestReadCallback,
  Rows,
} from './transaction';
import {google as spanner_client} from '../proto/spanner';
import {BasicCallback} from './common';

export interface CreatePartitionsCallback {
  (
    err: Error | null,
    partitions?: spanner_client.spanner.v1.IPartition[] | null,
    resp?: PartitionResponse
  ): void;
}
export interface PartitionResponse {
  partitions: spanner_client.spanner.v1.IPartition[];
  transaction: spanner_client.spanner.v1.Transaction;
}
export interface PartitionRequestOptions
  extends spanner_client.spanner.v1.IPartitionReadRequest {
  limit?: number;
  resumeToken?: Uint8Array | string;
  partitionToken?: Uint8Array | string;
  gaxOptions?: CallOptions;
  types?: {[param: string]: string};
  keys?: spanner_client.protobuf.IListValue[] | null;
  ranges?: spanner_client.spanner.v1.IKeyRange[] | null;
}
export interface QueryPartition extends ExecuteSqlRequest {
  table?: string;
}
export interface ReadPartition extends ReadRequest {
  table: string;
}
export interface TransactionIdentifier {
  transaction: string;
  session: string;
  timestamp?: spanner_client.protobuf.ITimestamp;
}
export interface PartitionsConfig {
  client?: string;
  method?: string;
  reqOpts?: {
    partitionOptions?: spanner_client.spanner.v1.IPartitionOptions | null;
    [k: string]: unknown;
  };
  gaxOpts?: CallOptions | {[k: string]: string};
}

/**
 * Use a BatchTransaction object to create partitions and read/query against
 * your Cloud Spanner database.
 *
 * @class
 * @extends Snapshot
 *
 * @param {TimestampBounds} [options] [Timestamp Bounds](https://cloud.google.com/spanner/docs/timestamp-bounds).
 */
class BatchTransaction extends Snapshot {
  /**
   * Closes all open resources.
   *
   * When the transaction is no longer needed, you should call this method to
   * free up resources allocated by the Batch client.
   *
   * Calling this method would render the transaction unusable everywhere. In
   * particular if this transaction object was being used across multiple
   * machines, calling this method on any of the machine would make the
   * transaction unusable on all the machines. This should only be called when
   * the transaction is no longer needed anywhere
   *
   * @param {BasicCallback} [callback] Callback function.
   * @returns {Promise<BasicResponse>}
   *
   * @example
   * const {Spanner} = require('@google-cloud/spanner');
   * const spanner = new Spanner();
   *
   * const instance = spanner.instance('my-instance');
   * const database = instance.database('my-database');
   *
   * database.createBatchTransaction(function(err, transaction) {
   *   if (err) {
   *     // Error handling omitted.
   *   }
   *
   *   transaction.close(function(err, apiResponse) {});
   * });
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * database.createBatchTransaction().then(function(data) {
   *   const transaction = data[0];
   *   return transaction.close();
   * });
   */
  close(): Promise<[r.Response]>;
  close(callback: BasicCallback): void;
  close(callback?: BasicCallback): void | Promise<[r.Response]> {
    this.session.delete(callback!);
  }
  /**
   * @see [`ExecuteSqlRequest`](https://cloud.google.com/spanner/docs/reference/rpc/google.spanner.v1#google.spanner.v1.ExecuteSqlRequest)
   * @typedef {object} QueryPartition
   * @property {string} partitionToken The partition token.
   */
  /**
   * @typedef {array} CreateQueryPartitionsResponse
   * @property {QueryPartition[]} 0 List of query partitions.
   * @property {object} 1 The full API response.
   */
  /**
   * @callback CreateQueryPartitionsCallback
   * @param {?Error} err Request error, if any.
   * @param {QueryPartition[]} partitions List of query partitions.
   * @param {object} apiResponse The full API response.
   */
  /**
   * Creates a set of query partitions that can be used to execute a query
   * operation in parallel. Partitions become invalid when the transaction used
   * to create them is closed.
   *
   * @param {string|object} query A SQL query or
   *     [`ExecuteSqlRequest`](https://cloud.google.com/spanner/docs/reference/rpc/google.spanner.v1#google.spanner.v1.ExecuteSqlRequest)
   *     object.
   * @param {object} [query.gaxOptions] Request configuration options, outlined
   *     here: https://googleapis.github.io/gax-nodejs/CallSettings.html.
   * @param {object} [query.params] A map of parameter name to values.
   * @param {object} [query.partitionOptions] A map of partition options.
   * @param {object} [query.types] A map of parameter types.
   * @param {CreateQueryPartitionsCallback} [callback] Callback callback function.
   * @returns {Promise<CreateQueryPartitionsResponse>}
   *
   * @example <caption>include:samples/batch.js</caption>
   * region_tag:spanner_batch_client
   */
  createQueryPartitions(
    query: string | ExecuteSqlRequest,
    callback: CreatePartitionsCallback
  ): void | Promise<[spanner_client.spanner.v1.IPartition[], r.Response]> {
    if (typeof query === 'string') {
      query = {
        sql: query,
      };
    }

    const reqOpts: PartitionRequestOptions = Object.assign(
      {},
      query,
      Snapshot.encodeParams(query)
    );

    delete reqOpts.gaxOptions;
    delete reqOpts.types;

    this.createPartitions_(
      {
        client: 'SpannerClient',
        method: 'partitionQuery',
        reqOpts,
        gaxOpts: query.gaxOptions,
      },
      callback
    );
  }
  /**
   * Generic create partition method. Handles common parameters used in both
   * {@link BatchTransaction#createQueryPartitions} and {@link
   * BatchTransaction#createReadPartitions}
   *
   * @private
   *
   * @param {object} config The request config.
   * @param {function} callback Callback function.
   */
  createPartitions_(
    config: PartitionsConfig,
    callback: CreatePartitionsCallback
  ) {
    const query = extend({}, config.reqOpts, {
      session: this.session.formattedName_,
      transaction: {id: this.id},
    });
    config.reqOpts = extend({}, query);
    delete query.partitionOptions;
    this.session.request(config, (err: Error, resp: PartitionResponse) => {
      if (err) {
        callback(err, null, resp);
        return;
      }

      const partitions: spanner_client.spanner.v1.IPartition[] = resp.partitions.map(
        partition => {
          return extend({}, query, partition);
        }
      );

      if (resp.transaction) {
        const {id, readTimestamp} = resp.transaction;

        this.id = id;

        if (readTimestamp) {
          this.readTimestampProto = readTimestamp;
          this.readTimestamp = new PreciseDate(readTimestamp as number);
        }
      }

      callback(null, partitions, resp);
    });
  }
  /**
   * @typedef {object} ReadPartition
   * @mixes ReadRequestOptions
   * @property {string} partitionToken The partition token.
   * @property {object} [gaxOptions] Request configuration options, outlined
   *     here: https://googleapis.github.io/gax-nodejs/CallSettings.html.
   */
  /**
   * @typedef {array} CreateReadPartitionsResponse
   * @property {ReadPartition[]} 0 List of read partitions.
   * @property {object} 1 The full API response.
   */
  /**
   * @callback CreateReadPartitionsCallback
   * @param {?Error} err Request error, if any.
   * @param {ReadPartition[]} partitions List of read partitions.
   * @param {object} apiResponse The full API response.
   */
  /**
   * Creates a set of read partitions that can be used to execute a read
   * operation in parallel. Partitions become invalid when the transaction used
   * to create them is closed.
   *
   * @param {ReadRequestOptions} options Configuration object, describing what to
   *     read from.
   * @param {CreateReadPartitionsCallback} [callback] Callback function.
   * @returns {Promise<CreateReadPartitionsResponse>}
   */
  createReadPartitions(
    options: ReadPartition,
    callback: CreatePartitionsCallback
  ): void | Promise<[spanner_client.spanner.v1.IPartition[], r.Response]> {
    const reqOpts: PartitionRequestOptions = Object.assign({}, options, {
      keySet: Snapshot.encodeKeySet(options),
    });

    delete reqOpts.gaxOptions;
    delete reqOpts.keys;
    delete reqOpts.ranges;

    this.createPartitions_(
      {
        client: 'SpannerClient',
        method: 'partitionRead',
        reqOpts,
        gaxOpts: options.gaxOptions,
      },
      callback
    );
  }
  /**
   * Executes partition.
   *
   * @see {@link Transaction#read} when using {@link ReadPartition}.
   * @see {@link Transaction#run} when using {@link QueryParition}.
   *
   * @param {ReadPartition|QueryPartition} partition The partition object.
   * @param {object} [partition.gaxOptions] Request configuration options,
   *     outlined here:
   * https://googleapis.github.io/gax-nodejs/CallSettings.html.
   * @param {TransactionRequestReadCallback|RunCallback} [callback] Callback
   *     function.
   * @returns {Promise<RunResponse>|Promise<TransactionRequestReadResponse>}
   *
   * @example <caption>include:samples/batch.js</caption>
   * region_tag:spanner_batch_execute_partitions
   */
  execute(
    partition: ReadPartition
  ): Promise<[Rows, spanner_client.spanner.v1.ResultSetStats]>;
  execute(
    partition: ReadPartition,
    callback: TransactionRequestReadCallback
  ): void;
  execute(partition: QueryPartition): Promise<[Rows]>;
  execute(partition: QueryPartition, callback: RunCallback): void;
  execute(
    partition: ReadPartition | QueryPartition,
    callback?: TransactionRequestReadCallback | RunCallback
  ):
    | void
    | Promise<[Rows, spanner_client.spanner.v1.ResultSetStats]>
    | Promise<[Rows]> {
    if (typeof partition.table === 'string') {
      this.read(
        partition.table,
        partition,
        callback as TransactionRequestReadCallback
      );
      return;
    }
    this.run(partition as ExecuteSqlRequest, callback as RunCallback);
  }
  /**
   * Executes partition in streaming mode.
   *
   * @see {@link Transaction#createReadStream} when using {@link ReadPartition}.
   * @see {@link Transaction#runStream} when using {@link QueryPartition}.
   *
   * @param {ReadPartition|QueryPartition} partition The partition object.
   * @returns {ReadableStream} A readable stream that emits rows.
   *
   * @example
   * const {Spanner} = require('@google-cloud/spanner');
   * const spanner = new Spanner();
   *
   * const instance = spanner.instance('my-instance');
   * const database = instance.database('my-database');
   *
   * database.createBatchTransaction(function(err, transaction) {
   *   if (err) {
   *     // Error handling omitted.
   *   }
   *
   *   transaction.createReadPartitions(options, function(err, partitions) {
   *     const partition = partitions[0];
   *
   *     transaction
   *       .executeStream(partition)
   *       .on('error', function(err) {})
   *       .on('data', function(row) {
   *         // row = [
   *         //   {
   *         //     name: 'SingerId',
   *         //     value: '1'
   *         //   },
   *         //   {
   *         //     name: 'Name',
   *         //     value: 'Eddie Wilson'
   *         //   }
   *         // ]
   *       })
   *       .on('end', function() {
   *         // All results retrieved
   *       });
   *   });
   * });
   */
  executeStream(partition: ReadPartition | QueryPartition): Readable {
    if (typeof partition.table === 'string') {
      return this.createReadStream(partition.table, partition);
    }
    return this.runStream(partition as ExecuteSqlRequest);
  }
  /**
   * @typedef {object} TransactionIdentifier
   * @property {string} session The full session name.
   * @property {string} transaction The transaction ID.
   * @property {string|Date} readTimestamp The transaction read timestamp.
   */
  /**
   * Creates a transaction identifier used to reference the transaction in
   * workers.
   *
   * @returns {TransactionIdentifier}
   *
   * @example
   * const {Spanner} = require('@google-cloud/spanner');
   * const spanner = new Spanner();
   *
   * const instance = spanner.instance('my-instance');
   * const database = instance.database('my-database');
   *
   * database.createBatchTransaction(function(err, transaction) {
   *   const identifier = transaction.identifier();
   * });
   */
  identifier(): TransactionIdentifier {
    return {
      transaction: (this.id! as Buffer).toString('base64'),
      session: this.session.id,
      timestamp: this.readTimestampProto,
    };
  }
}

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(BatchTransaction, {
  exclude: ['identifier'],
});

export {BatchTransaction};
