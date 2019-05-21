import {google as spanner_client} from '../proto/spanner';
import * as r from 'request';

export type BasicCallback = (
  err: Error | null,
  res?: spanner_client.protobuf.Empty
) => void;
export type BasicResponse = [r.Response];

export interface GaxOptions {
  [key: string]: spanner_client.protobuf.Value;
}

export type Schema = string | SchemaObject;
export interface SchemaObject {
  statements: string[];
  operationId?: string;
}

// tslint:disable-next-line no-any
export type Any = any;
