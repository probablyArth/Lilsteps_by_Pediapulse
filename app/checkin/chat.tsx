import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiMessage } from '@/components/checkin/AiMessage';
import { CHECKIN_HEADER_HEIGHT, CheckinHeader } from '@/components/checkin/CheckinHeader';
import { TypingIndicator } from '@/components/checkin/TypingIndicator';
import { UserMessage } from '@/components/checkin/UserMessage';
import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useCheckin } from '@/hooks/useCheckin';

export default function CheckinChatScreen() {
  const insets = useSafeAreaInsets();
  const { complaint } = useLocalSearchParams<{ complaint: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const { child } = useChild();
  const checkin = useCheckin(child);
  const [inputText, setInputText] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (complaint && !started) {
      setStarted(true);
      checkin.startCheckin(complaint).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint]);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(timer);
  }, [checkin.messages, checkin.loading]);

  async function sendReply(overrideText?: string) {
    const text = (overrideText ?? inputText).trim();
    if (!text || checkin.loading) return;
    setInputText('');
    try {
      await checkin.sendMessage(text);
    } catch {
      // handled in hook
    }
  }

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    try {
      await checkin.generateCheckinSummary();
      router.replace({
        pathname: '/checkin/summary',
        params: { sessionId: checkin.sessionId ?? '' },
      });
    } catch {
      setGeneratingSummary(false);
    }
  }

  const childName = child?.name ?? 'Child';
  const showInput = !checkin.aiReady && !generatingSummary;

  return (
    <View style={styles.root}>
      <CheckinHeader onBack={() => router.back()} backDisabled={generatingSummary} showStatusDot />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + CHECKIN_HEADER_HEIGHT,
              paddingBottom: showInput ? 100 + insets.bottom : 20 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
          alwaysBounceVertical
          overScrollMode="always"
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionLabel}>Health check-in for {childName}</Text>
          </View>

          {checkin.messages.map((msg, index) => {
            const isLastAi = msg.role === 'ai' && index === checkin.messages.length - 1;
            return msg.role === 'ai' ? (
              <AiMessage
                key={msg.id}
                text={msg.content}
                quickOptions={isLastAi && !checkin.loading && !checkin.aiReady ? msg.quickOptions : undefined}
                onOptionTap={sendReply}
              />
            ) : (
              <UserMessage key={msg.id} text={msg.content} />
            );
          })}

          {checkin.loading && <TypingIndicator />}

          {checkin.error && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{checkin.error}</Text>
            </View>
          )}

          {checkin.aiReady && !generatingSummary && (
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <Ionicons name="checkmark-circle" size={20} color={AppColors.successGreen} />
                <Text style={styles.summaryText}>
                  Ready to generate {childName}&apos;s pre-visit summary
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.summaryBtn, { opacity: pressed ? 0.9 : 1 }]}
                onPress={handleGenerateSummary}
              >
                <LinearGradient
                  colors={[AppColors.primary, AppColors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.summaryBtnGrad}
                >
                  <Text style={styles.summaryBtnText}>Generate Summary</Text>
                  <Ionicons name="arrow-forward" size={18} color={AppColors.onPrimary} />
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {generatingSummary && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={AppColors.primary} />
              <Text style={styles.loadingText}>Generating summary…</Text>
            </View>
          )}
        </ScrollView>

        {showInput && (
          <View style={styles.inputWrapper} pointerEvents="box-none">
            <LinearGradient
              colors={[
                `${AppColors.surface}00`,
                `${AppColors.surface}40`,
                `${AppColors.surface}B0`,
                AppColors.surface,
              ]}
              locations={[0, 0.25, 0.5, 0.7]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              pointerEvents="none"
            />
            <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder="Message"
                  placeholderTextColor={AppColors.outlineVariant}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => sendReply()}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  editable={!checkin.loading}
                  multiline
                />
                <Pressable
                  style={[styles.sendBtn, (!inputText.trim() || checkin.loading) && styles.sendBtnDisabled]}
                  onPress={() => sendReply()}
                  disabled={!inputText.trim() || checkin.loading}
                >
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={inputText.trim() && !checkin.loading ? AppColors.onPrimary : AppColors.outlineVariant}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.surface },
  keyboardView: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  sessionHeader: { paddingVertical: 12, marginBottom: 8 },
  sessionLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
  },

  errorRow: { paddingVertical: 8, paddingHorizontal: 40 },
  errorText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.errorRed },

  summarySection: { marginTop: 12, gap: 16 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  summaryText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant, flex: 1 },
  summaryBtn: { borderRadius: 999, overflow: 'hidden' },
  summaryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  summaryBtnText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: AppColors.onPrimary },

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20 },
  loadingText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurfaceVariant },

  inputWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
  inputBar: { paddingHorizontal: 16, paddingTop: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: AppColors.surfaceContainerLow,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}20`,
    paddingLeft: 16,
    paddingRight: 5,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onSurface,
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: `${AppColors.outlineVariant}30` },
});
