import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const streamApi = createApi({
  reducerPath: 'streamApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  }),
  tagTypes: ['Stream'],
  endpoints: (builder) => ({}),
});

export const {} = streamApi; 