import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import Avatar from './Avatar';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

export default function JudgeCard({ judge }) {
  const { t } = useLang();
  if (!judge) return null;
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar uri={judge.imageUrl} name={judge.name} size={84} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{t('judge')}</Text>
        <Text style={{ color: colors.text, fontSize: 19, fontWeight: '800' }}>{judge.name}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{judge.designation}</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{judge.experience}</Text>
      </View>
      {judge.introVideoUrl ? (
        <TouchableOpacity onPress={() => Linking.openURL(judge.introVideoUrl)} style={{ alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="play" size={20} color={colors.primary} />
          </View>
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{t('introVideo')}</Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}
