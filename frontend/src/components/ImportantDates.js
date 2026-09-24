import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors } from '../theme';
import { formatDate, formatTime } from '../utils/format';
import { useLang } from '../context/LanguageContext';

const Cell = ({ icon, label, iso, style }) => (
  <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12 }, style]}>
    <Ionicons name={icon} size={26} color={colors.primary} style={{ marginRight: 14 }} />
    <View>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.primaryDark, fontSize: 15, fontWeight: '800' }}>{formatDate(iso)}</Text>
      <Text style={{ color: colors.primaryDark, fontSize: 13, fontWeight: '600' }}>{formatTime(iso)}</Text>
    </View>
  </View>
);

export default function ImportantDates({ dates }) {
  const { t } = useLang();
  const line = { borderBottomWidth: 1, borderColor: colors.border };
  const side = { borderRightWidth: 1, borderColor: colors.border };
  return (
    <Card>
      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 10 }}>{t('importantDates')}</Text>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}>
        <View style={[{ flexDirection: 'row' }, line]}>
          <Cell icon="calendar-outline" label={t('registerBefore')} iso={dates.registrationEnd} style={side} />
          <Cell icon="paper-plane-outline" label={t('submissionStarts')} iso={dates.submissionStart} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Cell icon="cloud-upload-outline" label={t('submissionEnds')} iso={dates.submissionEnd} style={side} />
          <Cell icon="trophy-outline" label={t('resultDate')} iso={dates.resultDate} />
        </View>
      </View>
    </Card>
  );
}
