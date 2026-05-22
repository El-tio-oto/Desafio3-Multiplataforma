// --- PROTECCIÓN ANTICRASH ---
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  global.DOMRect = class DOMRect {};
  global.window = global;
  global.document = { 
    createElement: () => ({}),
    body: { style: {} } 
  };
}
// -----------------------------

import React from 'react';
import { View, Text } from 'react-native';
import { registerRootComponent } from 'expo';

function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>¡LOGRADO!</Text>
    </View>
  );
}

registerRootComponent(App);