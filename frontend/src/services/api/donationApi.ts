import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const donationApi = createApi({
  reducerPath: 'donationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  }),
  tagTypes: ['Donation'],
  endpoints: (builder) => ({}),
});

export const {} = donationApi; 