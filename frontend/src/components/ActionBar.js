import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { colors, radius } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function ActionBar({ cta, onPress }) {
  const { t } = useLang();
  const inactive = cta.disabled;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      activeOpacity={0.85}
      onPress={onPress}
      style={{ backgroundColor: inactive && !cta.busy ? colors.disabled : colors.primaryDark, borderRadius: radius.button, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', minHeight: 56 }}
    >
      {cta.busy ? <ActivityIndicator color="#fff" style={{ marginBottom: 2 }} /> : null}
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{t(cta.labelKey, cta.labelVars)}</Text>
      {cta.subKey ? <Text style={{ color: '#D7EEF0', fontSize: 12 }}>{t(cta.subKey)}</Text> : null}
    </TouchableOpacity>
  );
}
