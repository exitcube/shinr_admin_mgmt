import axios, { type AxiosRequestConfig } from "axios";
import type { GetRequestOptions, PostPutRequestOptions, DeleteRequestOptions } from "../types/request";

// ---------------- GET ----------------
export async function getRequest({ endpoint, query = {}, headers = {} }: GetRequestOptions): Promise<{ data: any; status: number; headers: Record<string, unknown> }> {
  try {
    const config: AxiosRequestConfig = {
      method: "GET",
      url: endpoint,
      headers: { "Content-Type": "application/json", ...headers },
      params: query,
    };

    const response = await axios.request(config);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as unknown as Record<string, unknown>,
    };
  } catch (error: any) {
    console.error(`GET ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ---------------- POST ----------------
export async function postRequest({ endpoint, body = {}, headers = {} }: PostPutRequestOptions): Promise<{ data: any; status: number; headers: Record<string, unknown> }> {
  try {
    const config: AxiosRequestConfig = {
      method: "POST",
      url: endpoint,
      headers: { "Content-Type": "application/json", ...headers },
      data: body,
    };

    const response = await axios.request(config);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as unknown as Record<string, unknown>,
    };
  } catch (error: any) {
    console.error(`POST ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ---------------- PUT ----------------
export async function putRequest({ endpoint, body = {}, headers = {} }: PostPutRequestOptions): Promise<{ data: any; status: number; headers: Record<string, unknown> }> {
  try {
    const config: AxiosRequestConfig = {
      method: "PUT",
      url: endpoint,
      headers: { "Content-Type": "application/json", ...headers },
      data: body,
    };

    const response = await axios.request(config);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as unknown as Record<string, unknown>,
    };
  } catch (error: any) {
    console.error(`PUT ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ---------------- DELETE ----------------
export async function deleteRequest({ endpoint, headers = {} }: DeleteRequestOptions): Promise<{ data: any; status: number; headers: Record<string, unknown> }> {
  try {
    const config: AxiosRequestConfig = {
      method: "DELETE",
      url: endpoint,
      headers: { "Content-Type": "application/json", ...headers },
    };

    const response = await axios.request(config);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as unknown as Record<string, unknown>,
    };
  } catch (error: any) {
    console.error(`DELETE ${endpoint} failed:`, error.message);
    throw error;
  }
}


