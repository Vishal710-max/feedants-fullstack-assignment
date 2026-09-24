import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { api } from '../services/api';
import { useLang } from '../context/LanguageContext';
import { ErrorState, LoadingState, errorMessage } from '../components/StateViews';

const Stars = ({ n }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= n ? 'star' : 'star-outline'} size={14} color={colors.gold} />)}
  </View>
);

export default function ReviewsScreen({ route, navigation }) {
  const { slug } = route.params;
  const { t } = useLang();
  const [state, setState] = useState({ items: [], page: 0, hasMore: true, average: 0, total: 0, loading: true, error: null });

  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) return;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const { data } = await api.getReviews(slug, state.page + 1);
      setState((s) => ({ ...s, items: [...s.items, ...data.items], page: data.page, hasMore: data.hasMore, average: data.average, total: data.total, loading: false, loadingMore: false, error: null }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, loadingMore: false, error }));
    }
  }, [slug, state.page, state.hasMore, state.loadingMore]);

  useEffect(() => { loadMore(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.loading) return <LoadingState />;
  if (state.error && !state.items.length) return <ErrorState message={errorMessage(state.error, t)} retryLabel={t('retry')} onRetry={() => { setState((s) => ({ ...s, loading: true, error: null })); loadMore(); }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: '800', color: colors.text }}>{t('reviews')}</Text>
        <Text style={{ marginLeft: 'auto', color: colors.muted }}>★ {state.average} ({state.total})</Text>
      </View>
      <FlatList
        data={state.items}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 12 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>{t('noReviews')}</Text>}
        ListFooterComponent={state.loadingMore ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : null}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{item.userName}</Text>
              <Stars n={item.rating} />
            </View>
            <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{item.comment}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
