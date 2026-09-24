import React from 'react';
import { View } from 'react-native';
import { colors, radius, shadow } from '../theme';

export default function Card({ style, children }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: radius.card, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EEF1F4' }, shadow, style]}>
      {children}
    </View>
  );
}
