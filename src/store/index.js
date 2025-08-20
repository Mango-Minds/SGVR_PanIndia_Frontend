import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import user from './user'

const reducer = combineReducers({
    user,
})
const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['user'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store;