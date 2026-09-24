import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { COMPETITION_SLUG } from '../config';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import useCompetition from '../hooks/useCompetition';
import { getCtaState } from '../utils/ctaState';
import { ErrorState, LoadingState, errorMessage } from '../components/StateViews';
import LanguageToggle from '../components/LanguageToggle';
import CompetitionHeader from '../components/CompetitionHeader';
import JudgeCard from '../components/JudgeCard';
import CountdownBanner from '../components/CountdownBanner';
import ImportantDates from '../components/ImportantDates';
import PreviousWinners from '../components/PreviousWinners';
import CompetitionTabs from '../components/CompetitionTabs';
import Rewards from '../components/Rewards';
import { DisclaimerBar, PayoutInfoCard } from '../components/InfoStrip';
import ReferralCard from '../components/ReferralCard';
import ReviewsRow, { AdSlot } from '../components/ReviewsRow';
import ActionBar from '../components/ActionBar';
import BottomNav from '../components/BottomNav';
import PaymentSheet from '../components/PaymentSheet';

export default function CompetitionDetailsScreen({ navigation }) {
  const { t } = useLang();
  const { ready, token, user, logout } = useAuth();
  const { data: c, loading, error, clockOffset, refresh, setData } = useCompetition(COMPETITION_SLUG, { enabled: ready, token });
  // flow.step: idle | creatingOrder | paying | confirming
  const [flow, setFlow] = useState({ step: 'idle', order: null });
  const [refreshing, setRefreshing] = useState(false);

  if (!ready || (loading && !c)) return <LoadingState label={t('loading')} />;
  if (!c) return <ErrorState message={errorMessage(error, t)} onRetry={refresh} retryLabel={t('retry')} />;

  const busy = flow.step === 'creatingOrder' || flow.step === 'confirming';
  const cta = getCtaState(c, { isLoggedIn: Boolean(user), busy });

  const handleError = async (e) => {
    switch (e.code) {
      case 'ALREADY_REGISTERED':
        await refresh();
        return Alert.alert(t('alreadyRegistered'));
      case 'COMPETITION_FULL':
        await refresh();
        return Alert.alert(t('competitionFull'), t('fullMsg'));
      case 'REGISTRATION_CLOSED':
      case 'REGISTRATION_NOT_STARTED':
        await refresh();
        return Alert.alert(e.message);
      case 'AUTH_REQUIRED':
      case 'INVALID_TOKEN':
        await logout();
        Alert.alert(t('sessionExpired'));
        return navigation.navigate('Login');
      case 'PAYMENT_VERIFICATION_FAILED':
        return Alert.alert(t('paymentFailed'), t('paymentFailedMsg'));
      case 'NETWORK_ERROR':
        return Alert.alert(t('offline'));
      default:
        return Alert.alert(t('registrationFailed'));
    }
  };

  const startRegistration = async () => {
    if (flow.step !== 'idle') return; // guards against double taps
    setFlow({ step: 'creatingOrder', order: null });
    try {
      const { data: order } = await api.createPaymentOrder(c.slug);
      setFlow({ step: 'paying', order });
    } catch (e) {
      setFlow({ step: 'idle', order: null });
      await handleError(e);
    }
  };

  const confirmRegistration = async (order, payment) => {
    setFlow({ step: 'confirming', order });
    try {
      const res = await api.register(c.slug, { orderId: order.orderId, ...payment });
      setData(res.data); // server returns the fresh competition + user state
      setFlow({ step: 'idle', order: null });
      Alert.alert(t('registrationSuccess'), t('registrationSuccessMsg'));
    } catch (e) {
      setFlow({ step: 'idle', order: null });
      if (e.code === 'NETWORK_ERROR' || e.status >= 500) {
        // Money may have moved but we could not confirm: offer a safe retry (server-side idempotent).
        Alert.alert(t('paymentReceived'), t('confirmFailedMsg'), [
          { text: t('cancel'), style: 'cancel' },
          { text: t('retry'), onPress: () => confirmRegistration(order, payment) },
        ]);
      } else {
        await handleError(e);
      }
    }
  };

  const onCtaPress = () => {
    if (cta.action === 'login') navigation.navigate('Login');
    else if (cta.action === 'register') startRegistration();
    else if (cta.action === 'upload') navigation.navigate('Submission', { competition: c });
  };

  const onProfilePress = () => {
    if (!user) return navigation.navigate('Login');
    Alert.alert(user.name, t('logoutQ'), [{ text: t('cancel'), style: 'cancel' }, { text: t('logout'), style: 'destructive', onPress: logout }]);
  };

  const onPullRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 }}>
        <TouchableOpacity onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={{ marginLeft: 12, fontSize: 17, fontWeight: '600', color: colors.text }}>{t('goBack')}</Text>
        </TouchableOpacity>
        <LanguageToggle />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} tintColor={colors.primary} />}
      >
        <CompetitionHeader competition={c} />
        <JudgeCard judge={c.judge} />
        <CountdownBanner competition={c} clockOffset={clockOffset} onExpire={refresh} />
        <ImportantDates dates={c.dates} />
        <PreviousWinners winners={c.previousWinners} />
        <CompetitionTabs competition={c} />
        <Rewards rewards={c.rewards} />
        <DisclaimerBar text={c.disclaimer} />
        <PayoutInfoCard competition={c} />
        <ReferralCard link={user?.referralLink} reward={c.referralReward} onLoginPress={() => navigation.navigate('Login')} />
        <ReviewsRow onPress={() => navigation.navigate('Reviews', { slug: c.slug })} />
        <AdSlot />
      </ScrollView>

      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <ActionBar cta={cta} onPress={onCtaPress} />
      </View>
      <BottomNav user={user} onProfilePress={onProfilePress} />

      <PaymentSheet
        visible={flow.step === 'paying'}
        order={flow.order}
        title={c.title}
        onSuccess={(payment) => confirmRegistration(flow.order, payment)}
        onFailure={() => {
          setFlow({ step: 'idle', order: null });
          Alert.alert(t('paymentFailed'), t('paymentFailedMsg'));
        }}
        onCancel={() => setFlow({ step: 'idle', order: null })}
      />
    </SafeAreaView>
  );
}
