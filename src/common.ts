import {google as database_admin_client} from '../proto/spanner_database_admin';
import * as r from 'request';

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
export type BasicResponse = [r.Response];
export type BasicCallback = (err: Error | null, res?: r.Response) => void;
export type Schema =
  | string
  | string[]
  | database_admin_client.spanner.admin.database.v1.IUpdateDatabaseDdlRequest
  | {statements: string[]; operationId?: string};
