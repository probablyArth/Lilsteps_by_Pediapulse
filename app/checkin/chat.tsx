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

  // Progress based on question count (assume ~4 questions typical)
  const progress = Math.min(checkin.questionCount / 4, 1);

  // Start check-in on mount with the complaint
  useEffect(() => {
    if (complaint && !started) {
      setStarted(true);
      checkin.startCheckin(complaint).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint]);

  // Auto-scroll on new message
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
      // error is set in hook
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

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header + consultation banner */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.back()} disabled={generatingSummary}>
            <Ionicons name="arrow-back" size={22} color={AppColors.onSurface} />
          </Pressable>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.consultBanner}>
          <View style={styles.sessionPill}>
            <Text style={styles.sessionPillText}>CONSULTATION SESSION</Text>
          </View>
          <Text style={styles.consultTitle}>LilSteps AI</Text>
          <Text style={styles.consultSub}>
            Reviewing health symptoms for{' '}
            <Text style={styles.consultChildName}>{childName}</Text>
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {checkin.messages.map((msg, index) => {
          const isLastAi = msg.role === 'ai' && index === checkin.messages.length - 1;
          return msg.role === 'ai' ? (
            <AiBubble
              key={msg.id}
              text={msg.content}
              quickOptions={isLastAi && !checkin.loading && !checkin.aiReady ? msg.quickOptions : undefined}
              onOptionTap={sendReply}
            />
          ) : (
            <UserBubble key={msg.id} text={msg.content} />
          );
        })}

        {/* AI typing indicator */}
        {checkin.loading && (
          <View style={styles.aiBubbleRow}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={14} color={AppColors.onPrimary} />
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}

        {/* Error display */}
        {checkin.error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{checkin.error}</Text>
          </View>
        )}

        {/* Generate Summary CTA — appears when AI signals readiness */}
        {checkin.aiReady && !generatingSummary && (
          <View style={styles.generateSection}>
            <Text style={styles.generateHint}>I have enough information to prepare {childName}&apos;s summary for the doctor.</Text>
            <Pressable
              style={({ pressed }) => [styles.generateBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={handleGenerateSummary}
            >
              <LinearGradient
                colors={[AppColors.primary, AppColors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.generateGrad}
              >
                <Ionicons name="sparkles" size={16} color={AppColors.onPrimary} />
                <Text style={styles.generateBtnText}>Yes, generate summary</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Generating loader */}
        {generatingSummary && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={AppColors.primary} />
            <Text style={styles.loadingText}>Generating pre-visit summary…</Text>
          </View>
        )}
      </ScrollView>

      {/* Input bar — hidden when generating or AI is ready */}
      {!checkin.aiReady && !generatingSummary && (
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Type your reply…"
            placeholderTextColor={`${AppColors.onSurfaceVariant}60`}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendReply}
            returnKeyType="send"
            blurOnSubmit={false}
            editable={!checkin.loading}
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={sendReply}
            disabled={!inputText.trim() || checkin.loading}
          >
            <LinearGradient
              colors={inputText.trim() && !checkin.loading ? [AppColors.primary, AppColors.gradientEnd] : [AppColors.surfaceContainerHigh, AppColors.surfaceContainerHigh]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendGrad}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={inputText.trim() && !checkin.loading ? AppColors.onPrimary : AppColors.onSurfaceVariant}
              />
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function AiBubble({
  text,
  quickOptions,
  onOptionTap,
}: {
  text: string;
  quickOptions?: string[];
  onOptionTap?: (option: string) => void;
}) {
  return (
    <View style={styles.aiBubbleContainer}>
      <View style={styles.aiBubbleRow}>
        <LinearGradient colors={[AppColors.primary, AppColors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color={AppColors.onPrimary} />
        </LinearGradient>
        <View style={styles.aiBubble}>
          <Text style={styles.aiBubbleText}>{text}</Text>
        </View>
      </View>
      {quickOptions && quickOptions.length > 0 && (
        <View style={styles.chipsRow}>
          {quickOptions.map((opt) => (
            <Pressable
              key={opt}
              style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.72 : 1 }]}
              onPress={() => onOptionTap?.(opt)}
            >
              <Text style={styles.chipText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userBubbleRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.surface },
  header: {
    backgroundColor: AppColors.surfaceContainerLow,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.outlineVariant}20`,
  },
  headerTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  consultBanner: { alignItems: 'center', gap: 6 },
  sessionPill: {
    backgroundColor: `${AppColors.outlineVariant}25`,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
  },
  sessionPillText: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10,
    color: AppColors.onSurfaceVariant, letterSpacing: 1.2,
  },
  consultTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22,
    color: AppColors.onSurface, letterSpacing: -0.5,
  },
  consultSub: {
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },
  consultChildName: {
    fontFamily: 'PlusJakartaSans_700Bold', color: AppColors.primary,
  },

  progressTrack: { height: 3, backgroundColor: `${AppColors.outlineVariant}30`, marginHorizontal: 0 },
  progressFill: { height: 3, backgroundColor: AppColors.primary, borderRadius: 999 },

  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  aiBubbleContainer: { gap: 8 },
  aiBubbleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', maxWidth: '88%' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 40 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: `${AppColors.primary}12`,
    borderWidth: 1, borderColor: `${AppColors.primary}30`,
  },
  chipText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.primary },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 14, flex: 1,
    shadowColor: AppColors.onSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  aiBubbleText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurface, lineHeight: 21 },

  userBubbleRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  userBubble: {
    backgroundColor: AppColors.primary, borderRadius: 18, borderBottomRightRadius: 4,
    padding: 14, maxWidth: '80%',
  },
  userBubbleText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: AppColors.onPrimary, lineHeight: 21 },

  typingBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: `${AppColors.onSurfaceVariant}50` },
  dot1: {}, dot2: {}, dot3: {},

  errorSection: { alignItems: 'center', paddingVertical: 8 },
  errorText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.errorRed, textAlign: 'center' },

  generateSection: { marginTop: 8, gap: 12, alignItems: 'center' },
  generateHint: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: AppColors.onSurfaceVariant, textAlign: 'center', lineHeight: 19 },
  generateBtn: { borderRadius: 999, overflow: 'hidden', alignSelf: 'stretch' },
  generateGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  generateBtnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: AppColors.onPrimary },

  loadingSection: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  loadingText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: AppColors.onSurfaceVariant },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1, borderTopColor: `${AppColors.outlineVariant}20`,
  },
  textInput: {
    flex: 1, backgroundColor: `${AppColors.surfaceContainerHigh}50`,
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: AppColors.onSurface,
    maxHeight: 100,
  },
  sendBtn: { borderRadius: 999, overflow: 'hidden' },
  sendGrad: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
