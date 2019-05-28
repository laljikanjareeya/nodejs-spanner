import {CallOptions} from 'grpc';
import {google as database_admin_client} from '../proto/spanner_database_admin';

export interface TransactionOptions {
  readOnly?: boolean;
  timeout?: number;
  exactStaleness?: number;
  readTimestamp?: Date;
  returnTimestamp?: boolean;
  strong?: boolean;
}
export interface CreateSessionOptions {
  name: string;
  labels: {[key: string]: string};
  createTime: GetTimestamp;
  approximateLastUseTime: GetTimestamp;
}
export interface GetTimestamp {
  nanos: number;
  seconds: number;
}

export interface RequestConfig {
  client: string;
  method: string;
  // tslint:disable-next-line: no-any
  reqOpts: any;
  gaxOpts: CallOptions;
}

export type Schema =
  | string
  | string[]
  | database_admin_client.spanner.admin.database.v1.IUpdateDatabaseDdlRequest;
