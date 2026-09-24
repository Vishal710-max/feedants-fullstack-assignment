import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

export function DisclaimerBar({ text }) {
  const { t } = useLang();
  if (!text) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tint, borderRadius: 10, padding: 10, marginBottom: 10 }}>
      <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
      <Text style={{ flex: 1, marginLeft: 8, fontSize: 12.5, color: colors.muted }}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('disclaimer')} </Text>
        {text}
      </Text>
    </View>
  );
}

export function PayoutInfoCard({ competition: c }) {
  const { t } = useLang();
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity disabled={!c.prizeInfoVideoUrl} onPress={() => Linking.openURL(c.prizeInfoVideoUrl)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="play-circle" size={34} color={colors.primaryDark} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{t('howReceive')}</Text>
          <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2 }}>{t('watchVideo')}</Text>
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1, paddingLeft: 12 }}>
        <TouchableOpacity onPress={() => Alert.alert(t('refundPolicy'), c.refundPolicy || '')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
          <Text style={{ marginLeft: 8, color: colors.muted, fontSize: 12.5 }}>{t('refundPolicy')}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
          <Text style={{ marginLeft: 8, color: colors.muted, fontSize: 12 }}>
            {t('securePayments')} <Text style={{ color: '#0B3B8C', fontWeight: '800', fontStyle: 'italic' }}>Razorpay</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}
