import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '../theme';

/** Image with an initials fallback when the URL is missing or fails to load. */
export default function Avatar({ uri, name = '', size = 56, radius, style }) {
  const [failed, setFailed] = useState(false);
  const r = radius ?? size / 2;
  if (!uri || failed) {
    const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    return (
      <View style={[{ width: size, height: size, borderRadius: r, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: size / 3 }}>{initials}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} onError={() => setFailed(true)} style={[{ width: size, height: size, borderRadius: r }, style]} />;
}
