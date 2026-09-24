import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import { inr } from '../utils/format';

/**
 * Test-mode checkout. In production this is replaced by the Razorpay native checkout
 * (react-native-razorpay, needs a dev build), which returns the same
 * { paymentId, signature } pair that we send to POST /register for server-side verification.
 */
export default function PaymentSheet({ visible, order, title, onSuccess, onFailure, onCancel }) {
  if (!order) return null;
  const isMock = order.mode === 'mock';
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>{isMock ? 'TEST CHECKOUT (mock payments)' : 'Razorpay'}</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 }}>{title}</Text>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary, marginVertical: 12 }}>₹ {inr(order.amount)}</Text>

          {isMock ? (
            <>
              <TouchableOpacity
                onPress={() => onSuccess({ paymentId: `pay_mock_${Date.now()}`, signature: 'mock_signature' })}
                style={{ backgroundColor: colors.primaryDark, borderRadius: 12, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Pay ₹{inr(order.amount)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onFailure} style={{ padding: 14, alignItems: 'center' }}>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>Simulate failed payment</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: colors.muted, marginBottom: 12 }}>
              Backend is in Razorpay mode. Wire up react-native-razorpay in a development build to open the real checkout; Expo Go cannot load it.
            </Text>
          )}
          <TouchableOpacity onPress={onCancel} style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
