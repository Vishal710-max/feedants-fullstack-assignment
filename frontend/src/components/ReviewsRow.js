import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function ReviewsRow({ onPress }) {
  const { t } = useLang();
  return (
    <Card style={{ padding: 0 }}>
      <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color={colors.text} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{t('hearUsers')}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{t('hearUsersSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
    </Card>
  );
}

export function AdSlot() {
  const { t } = useLang();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#C9D1DA', borderRadius: 10, paddingVertical: 12, marginBottom: 10 }}>
      <Ionicons name="megaphone-outline" size={20} color={colors.muted} />
      <Text style={{ marginLeft: 10, color: colors.muted, fontWeight: '600' }}>{t('adHere')}</Text>
    </View>
  );
}
