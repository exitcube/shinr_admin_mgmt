import type { RawAxiosRequestHeaders } from "axios";

export interface GetRequestOptions {
  endpoint: string;
  query?: Record<string, any>;
  headers?: RawAxiosRequestHeaders;
}

export interface PostPutRequestOptions {
  endpoint: string;
  body?: Record<string, any>;
  headers?: RawAxiosRequestHeaders;
}

export interface DeleteRequestOptions {
  endpoint: string;
  headers?: RawAxiosRequestHeaders;
}


