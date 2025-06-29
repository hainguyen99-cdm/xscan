import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  }),
  tagTypes: ['Wallet'],
  endpoints: (builder) => ({}),
});

export const {} = walletApi; 