import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/api/authApi';
import { userApi } from '../services/api/userApi';
import { walletApi } from '../services/api/walletApi';
import { streamApi } from '../services/api/streamApi';
import { donationApi } from '../services/api/donationApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // API slices
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [streamApi.reducerPath]: streamApi.reducer,
    [donationApi.reducerPath]: donationApi.reducer,
    
    // Regular slices
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      walletApi.middleware,
      streamApi.middleware,
      donationApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 