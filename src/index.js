import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

// E2E runs (scripts/test-e2e.sh) disable the dev warning toast: it overlays
// the bottom tab bar and intercepts taps. Local development keeps warnings.
if (__DEV__ && process.env.EXPO_PUBLIC_DISABLE_LOGBOX === '1') {
  LogBox.ignoreAllLogs();
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
