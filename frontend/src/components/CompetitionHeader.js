import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors } from '../theme';
import { inr } from '../utils/format';
import { useLang } from '../context/LanguageContext';

const Stat = ({ label, value }) => (
  <View>
    <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 2 }}>{label}</Text>
    <Text style={{ color: colors.primary, fontSize: 30, fontWeight: '800' }}>₹ {value}</Text>
  </View>
);

function SpotsMeter({ c }) {
  const { t } = useLang();
  const pct = Math.min(100, (c.registeredCount / c.maxParticipants) * 100);
  const label = c.isFull ? t('full') : c.remainingSpots === 1 ? t('oneSpotLeft') : t('spotsLeft', { n: c.remainingSpots });
  return (
    <View style={{ flex: 1, minWidth: 130 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="people-outline" size={16} color={colors.primary} />
        <Text style={{ marginLeft: 6, color: c.isFull ? colors.danger : colors.primary, fontWeight: '600' }}>{label}</Text>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: '#D5E6E8', marginTop: 8 }}>
        <View style={{ width: `${pct}%`, height: 5, borderRadius: 3, backgroundColor: colors.primary }} />
      </View>
      <Text style={{ color: colors.muted, marginTop: 8, fontSize: 13 }}>{t('booked', { a: c.registeredCount, b: c.maxParticipants })}</Text>
    </View>
  );
}

export default function CompetitionHeader({ competition: c }) {
  const { t } = useLang();
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{c.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            {c.tags.map((tag) => (
              <View key={tag} style={{ backgroundColor: '#EEF1F4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, marginBottom: 4 }}>
                <Text style={{ color: colors.text, fontSize: 13 }}>{tag}</Text>
              </View>
            ))}
            {c.certificateText ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="trophy-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.primary, marginLeft: 6, fontSize: 13 }}>{c.certificateText}</Text>
              </View>
            ) : null}
          </View>
        </View>
        {c.userState.isRegistered ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tint, borderWidth: 1, borderColor: '#B9DDE0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={{ color: colors.primaryDark, fontWeight: '600', marginLeft: 6 }}>{t('registered')}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, gap: 14 }}>
        <Stat label={t('prizePool')} value={inr(c.prizePool)} />
        <Stat label={t('entryFee')} value={inr(c.entryFee)} />
        <SpotsMeter c={c} />
      </View>
    </Card>
  );
}
