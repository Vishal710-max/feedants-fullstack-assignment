import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export const LoadingState = ({ label }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
    <ActivityIndicator size="large" color={colors.primary} />
    {label ? <Text style={{ marginTop: 12, color: colors.muted }}>{label}</Text> : null}
  </View>
);

export const ErrorState = ({ message, onRetry, retryLabel }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}>
    <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: 16 }}>{message}</Text>
    <TouchableOpacity onPress={onRetry} style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 }}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>{retryLabel}</Text>
    </TouchableOpacity>
  </View>
);

export const errorMessage = (err, t) => {
  if (!err) return t('loadFailed');
  if (err.code === 'NETWORK_ERROR') return t('offline');
  if (err.code === 'COMPETITION_NOT_FOUND' || err.code === 'INVALID_COMPETITION_ID') return t('notFound');
  return t('loadFailed');
};
