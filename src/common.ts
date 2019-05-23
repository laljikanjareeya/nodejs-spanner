import * as r from 'request';
import {google as database_admin_client} from '../proto/spanner_database_admin';

export type BasicCallback = (err: Error | null, res?: r.Response) => void;
export type BasicResponse = [r.Response];
export type Schema =
  | string
  | database_admin_client.spanner.admin.database.v1.IUpdateDatabaseDdlRequest;

// tslint:disable-next-line no-any
export type Any = any;
