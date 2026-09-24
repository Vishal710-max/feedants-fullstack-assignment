import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors } from '../theme';
import { inr } from '../utils/format';
import { useLang } from '../context/LanguageContext';

const icon = (position) => {
  if (position === 1) return <Ionicons name="trophy" size={20} color={colors.gold} />;
  if (position === 2) return <Ionicons name="medal" size={20} color={colors.silver} />;
  if (position === 3) return <Ionicons name="medal" size={20} color={colors.bronze} />;
  return <Ionicons name="star-outline" size={20} color={colors.primary} />;
};

export default function Rewards({ rewards }) {
  const { t } = useLang();
  return (
    <Card>
      <Text style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '800', color: colors.text }}>{t('rewards')} </Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{t('allPositions')}</Text>
      </Text>
      {rewards.map((r) => (
        <View key={r.position} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F8FA', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 7, marginBottom: 4 }}>
          <View style={{ width: 28 }}>{icon(r.position)}</View>
          <Text style={{ flex: 1, fontWeight: '600', color: colors.text }}>{r.label}</Text>
          <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 17 }}>₹ {inr(r.amount)}</Text>
        </View>
      ))}
    </Card>
  );
}
