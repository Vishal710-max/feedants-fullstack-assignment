import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import useCountdown from '../hooks/useCountdown';
import { pad2 } from '../utils/format';
import { useLang } from '../context/LanguageContext';

export default function CountdownBanner({ competition: c, clockOffset, onExpire }) {
  const { t } = useLang();
  const target = c.registrationPhase === 'UPCOMING' ? c.dates.registrationStart : c.registrationPhase === 'OPEN' ? c.dates.registrationEnd : null;
  const { days, hours, minutes, seconds } = useCountdown(target, clockOffset, onExpire);

  const box = { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tint, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10 };

  if (!target) {
    return (
      <View style={box}>
        <Ionicons name="hourglass-outline" size={22} color={colors.muted} />
        <Text style={{ marginLeft: 12, fontWeight: '700', color: colors.muted }}>{t('regClosed')}</Text>
      </View>
    );
  }
  return (
    <View style={box}>
      <Ionicons name="hourglass-outline" size={24} color={colors.primary} />
      <Text style={{ marginLeft: 12, fontWeight: '700', color: colors.text, flexShrink: 1, maxWidth: 110 }}>
        {c.registrationPhase === 'UPCOMING' ? t('regOpensIn') : t('regClosesIn')}
      </Text>
      <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.primary }}>
        {pad2(days)}d : {pad2(hours)}h : {pad2(minutes)}m : {pad2(seconds)}s
      </Text>
      <Ionicons name="stopwatch-outline" size={18} color={colors.primary} />
      <Text style={{ marginLeft: 4, color: colors.primary, fontWeight: '700', fontSize: 12 }}>{t('hurryUp')}</Text>
    </View>
  );
}
