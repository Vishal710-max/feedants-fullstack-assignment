import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors } from '../theme';
import { useLang } from '../context/LanguageContext';

const Bullets = ({ items }) =>
  items.map((line, i) => (
    <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
      <Text style={{ color: colors.muted, marginRight: 6 }}>•</Text>
      <Text style={{ flex: 1, color: colors.muted, lineHeight: 20 }}>{line}</Text>
    </View>
  ));

export default function CompetitionTabs({ competition: c }) {
  const { t } = useLang();
  const [tab, setTab] = useState('about');
  const [expanded, setExpanded] = useState(false);
  const tabs = [['about', t('about')], ['judging', t('judging')], ['rules', t('rules')]];
  const aboutText = c.about.join('\n');
  const canExpand = c.about.length > 3 || aboutText.length > 200;

  return (
    <Card>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
        {tabs.map(([key, label]) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ flex: 1, paddingVertical: 10, borderBottomWidth: 2, borderColor: tab === key ? colors.primary : 'transparent', marginBottom: -1 }}>
            <Text style={{ textAlign: 'center', fontSize: 12.5, fontWeight: '700', color: tab === key ? colors.primary : colors.muted }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'about' && (
        <>
          <Text style={{ color: colors.muted, lineHeight: 22 }} numberOfLines={expanded ? undefined : 3}>{aboutText}</Text>
          {canExpand ? (
            <TouchableOpacity onPress={() => setExpanded((e) => !e)} style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{expanded ? t('viewLess') : t('viewMore')}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : null}
        </>
      )}

      {tab === 'judging' &&
        c.judgingParameters.map((p) => (
          <View key={p.title} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{p.title}</Text>
              {p.weightage ? <Text style={{ color: colors.primary, fontWeight: '700' }}>{p.weightage}%</Text> : null}
            </View>
            <Text style={{ color: colors.muted, marginTop: 2, lineHeight: 20 }}>{p.description}</Text>
          </View>
        ))}

      {tab === 'rules' && (
        <>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 6 }}>{t('rulesTitle')}</Text>
          <Bullets items={c.rules} />
          <Text style={{ fontWeight: '700', color: colors.text, marginTop: 8, marginBottom: 6 }}>{t('eligibilityTitle')}</Text>
          <Bullets items={c.eligibility} />
        </>
      )}
    </Card>
  );
}
