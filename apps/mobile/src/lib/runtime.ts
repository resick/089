import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * True inside the Expo Go app. Expo Go only ships Expo's built-in native
 * modules, so features using others (MapLibre) must check this first.
 */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
