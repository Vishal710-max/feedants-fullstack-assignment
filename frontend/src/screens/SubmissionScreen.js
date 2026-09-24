import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { api } from '../services/api';
import { formatDateTime } from '../utils/format';

export default function SubmissionScreen({ route, navigation }) {
  const { competition: c } = route.params;
  const rules = c.submissionRules;
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = (asset) => {
    const ext = asset.name.split('.').pop().toLowerCase();
    if (!rules.allowedFileTypes.includes(ext)) return `Allowed file types: ${rules.allowedFileTypes.join(', ').toUpperCase()}.`;
    if (asset.size && asset.size > rules.maxFileSizeMB * 1024 * 1024) return `File must be smaller than ${rules.maxFileSizeMB} MB.`;
    return null;
  };

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: rules.allowedMimeTypes, copyToCacheDirectory: true });
    if (res.canceled) return;
    const asset = res.assets[0];
    const problem = validate(asset);
    setError(problem);
    setFile(problem ? null : asset);
  };

  const upload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadSubmission(c.slug, file);
      setDone(true);
    } catch (e) {
      if (e.code === 'DUPLICATE_SUBMISSION') setDone(true);
      else setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const mb = (bytes) => (bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Upload submission</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>{c.title}</Text>

      {done ? (
        <View style={{ alignItems: 'center', marginTop: 48 }}>
          <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 12 }}>Submission uploaded</Text>
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>Results will be announced on {formatDateTime(c.dates.resultDate)}.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: colors.primaryDark, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12, marginTop: 24 }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Back to competition</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Requirements</Text>
            <Text style={{ color: colors.muted, marginTop: 6 }}>File types: {rules.allowedFileTypes.join(', ').toUpperCase()}</Text>
            <Text style={{ color: colors.muted }}>Max size: {rules.maxFileSizeMB} MB</Text>
            <Text style={{ color: colors.muted }}>Deadline: {formatDateTime(c.dates.submissionEnd)}</Text>
            <Text style={{ color: colors.muted }}>One submission per participant.</Text>
          </View>

          <TouchableOpacity onPress={pick} disabled={uploading} style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: 14, padding: 24, alignItems: 'center', marginTop: 16, backgroundColor: colors.tint }}>
            <Ionicons name="cloud-upload-outline" size={34} color={colors.primary} />
            <Text style={{ color: colors.primaryDark, fontWeight: '700', marginTop: 8 }}>{file ? file.name : 'Choose a file'}</Text>
            {file ? <Text style={{ color: colors.muted, marginTop: 2 }}>{mb(file.size)}</Text> : null}
          </TouchableOpacity>

          {error ? <Text style={{ color: colors.danger, marginTop: 12 }}>{error}</Text> : null}

          <TouchableOpacity onPress={upload} disabled={!file || uploading} style={{ backgroundColor: file && !uploading ? colors.primaryDark : colors.disabled, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 }}>
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Upload</Text>}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
