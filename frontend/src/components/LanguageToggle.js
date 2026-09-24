import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  const Pill = ({ code, label }) => (
    <TouchableOpacity
      onPress={() => setLang(code)}
      style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: lang === code ? colors.primary : 'transparent' }}
    >
      <Text style={{ color: lang === code ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#EAEFF3', borderRadius: 18, padding: 2 }}>
      <Pill code="en" label="ENG" />
      <Pill code="hi" label="हिंदी" />
    </View>
  );
}
