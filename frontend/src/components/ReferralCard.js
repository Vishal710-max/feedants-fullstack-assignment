import React, { useState } from 'react';
import { Share, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function ReferralCard({ link, reward, onLoginPress }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!link) return onLoginPress();
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const share = () => (link ? Share.share({ message: link }) : onLoginPress());

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.mint, borderRadius: 16, padding: 14, marginBottom: 10 }}>
      <Ionicons name="megaphone" size={44} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontWeight: '800', color: colors.text }}>{t('referEarn')}</Text>
        <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
          <View style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 9 }}>
            <Text numberOfLines={1} style={{ color: link ? colors.primaryDark : colors.muted, fontSize: 12 }}>{link || t('loginForLink')}</Text>
          </View>
          <TouchableOpacity onPress={copy} style={{ marginLeft: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 }}>
            <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 12 }}>{copied ? t('copied') : t('copyLink')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginLeft: 10, alignItems: 'center', maxWidth: 110 }}>
        <TouchableOpacity onPress={share} style={{ backgroundColor: colors.primaryDark, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t('referNow')}</Text>
        </TouchableOpacity>
        {reward > 0 ? <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6, textAlign: 'center' }}>{t('youEarn', { n: reward })}</Text> : null}
      </View>
    </View>
  );
}
