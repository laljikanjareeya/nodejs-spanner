import {status, Metadata, ServiceError} from 'grpc';

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

export interface RowCountsServiceError {
  //tslint:disable-next-line no-any
  rowCounts?: number[] | ((rowCounts: any, arg1: never[]) => any);
  code?: status;
  metadata?: Metadata;
  details?: string;
}
