import React from 'react';
import { FlatList, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import Avatar from './Avatar';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

function WinnerItem({ w }) {
  return (
    <TouchableOpacity
      disabled={!w.videoUrl}
      onPress={() => Linking.openURL(w.videoUrl)}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F7', borderRadius: 12, padding: 6, marginRight: 10, minWidth: 190 }}
    >
      <View>
        <Avatar uri={w.thumbnailUrl} name={w.name} size={64} radius={10} />
        {w.videoUrl ? (
          <View style={{ position: 'absolute', right: 4, bottom: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="play" size={11} color="#fff" />
          </View>
        ) : null}
      </View>
      <View style={{ marginLeft: 10 }}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{w.name}</Text>
        <Text style={{ color: colors.primary, fontSize: 12, marginTop: 2 }}>{w.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PreviousWinners({ winners }) {
  const { t } = useLang();
  if (!winners.length) return null;
  return (
    <Card>
      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 10 }}>{t('previousWinners')}</Text>
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={winners} keyExtractor={(w, i) => `${w.name}-${i}`} renderItem={({ item }) => <WinnerItem w={item} />} />
    </Card>
  );
}
