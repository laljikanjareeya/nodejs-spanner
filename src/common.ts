import {CallOptions} from 'grpc';

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
