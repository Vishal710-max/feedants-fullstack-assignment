import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

// Home / Explore / Create are outside this assignment's scope, so they are visual only.
export default function BottomNav({ user, onProfilePress }) {
  const { t } = useLang();
  const Item = ({ icon, label, active, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', flex: 1 }}>
      <Ionicons name={icon} size={24} color={active ? colors.primary : colors.muted} />
      <Text style={{ fontSize: 11, marginTop: 2, color: active ? colors.primary : colors.muted, fontWeight: active ? '700' : '400' }}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border, paddingTop: 8, paddingBottom: 6 }}>
      <Item icon="home" label={t('home')} />
      <Item icon="search-outline" label={t('explore')} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ width: 52, height: 44, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add" size={28} color="#fff" />
        </View>
      </View>
      <Item icon="trophy" label={t('competitions')} active />
      <TouchableOpacity onPress={onProfilePress} style={{ alignItems: 'center', flex: 1 }}>
        {user ? <Avatar uri={user.profileImage} name={user.name} size={28} /> : <Ionicons name="person-circle-outline" size={28} color={colors.muted} />}
        <Text style={{ fontSize: 11, marginTop: 2, color: colors.muted }}>{t('profile')}</Text>
      </TouchableOpacity>
    </View>
  );
}
