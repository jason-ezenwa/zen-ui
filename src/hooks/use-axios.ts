import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";

type Error = {
  message: string;
  code: number;
};

type Response<T> = {
  data: T;
  status: number;
};

type UseAxiosReturn<T> = {
  response: Response<T> | undefined;
  loading: boolean;
  error: Error | undefined;
  request: (config: AxiosRequestConfig) => Promise<Response<T>>;
};

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const useAxios = <T = any>(): UseAxiosReturn<T> => {
  const [response, setResponse] = useState<Response<T>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const request = async (config: AxiosRequestConfig): Promise<Response<T>> => {
    setLoading(true);

    try {
      const axiosResponse: AxiosResponse<T> = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      const response: Response<T> = {
        data: axiosResponse.data,
        status: axiosResponse.status,
      };

      setResponse(response);
      setError(undefined);

      return response;
    } catch (err) {
      const axiosError = err as AxiosError;

      const response: Response<T> = {
        data: axiosError.response?.data as T,
        status: axiosError.response?.status || 500,
      };

      const error: Error = {
        message: axiosError.message,
        code: axiosError.response?.status || 500,
      };

      setResponse(response);
      setError(error);

      return response;
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, request };
};
