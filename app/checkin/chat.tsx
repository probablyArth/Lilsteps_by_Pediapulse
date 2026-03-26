import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
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

const HEADER_HEIGHT = 60;

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
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <LinearGradient
          colors={[
            AppColors.surface,
            AppColors.surface,
            `${AppColors.surface}E8`,
            `${AppColors.surface}B0`,
            `${AppColors.surface}60`,
            `${AppColors.surface}20`,
            `${AppColors.surface}00`,
          ]}
          locations={[0, 0.35, 0.5, 0.65, 0.78, 0.9, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.header} pointerEvents="box-none">
          <Pressable style={styles.backBtn} onPress={() => router.back()} disabled={generatingSummary}>
            <Ionicons name="chevron-back" size={24} color={AppColors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>LilSteps AI</Text>
          <View style={styles.statusDot} />
          <View style={styles.headerSpacer} />
        </View>
      </View>

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
              paddingTop: insets.top + HEADER_HEIGHT,
              paddingBottom: showInput ? 100 + insets.bottom : 20 + insets.bottom 
            }
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

function AiMessage({
  text,
  quickOptions,
  onOptionTap,
}: {
  text: string;
  quickOptions?: string[];
  onOptionTap?: (option: string) => void;
}) {
  return (
    <View style={styles.aiMessageContainer}>
      <View style={styles.aiRow}>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={16} color={AppColors.primary} />
        </View>
        <View style={styles.aiContent}>
          <Text style={styles.aiText}>{text}</Text>
        </View>
      </View>
      {quickOptions && quickOptions.length > 0 && (
        <View style={styles.optionsRow}>
          {quickOptions.map((opt) => (
            <Pressable
              key={opt}
              style={({ pressed }) => [styles.optionChip, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => onOptionTap?.(opt)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{text}</Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 300, easing: Easing.ease, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  const scale = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const opacity = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.aiMessageContainer}>
      <View style={styles.aiRow}>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={16} color={AppColors.primary} />
        </View>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, { transform: [{ scale: scale(dot1) }], opacity: opacity(dot1) }]} />
          <Animated.View style={[styles.dot, { transform: [{ scale: scale(dot2) }], opacity: opacity(dot2) }]} />
          <Animated.View style={[styles.dot, { transform: [{ scale: scale(dot3) }], opacity: opacity(dot3) }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.surface },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 6,
  },
  backBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 17,
    color: AppColors.onSurface,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: AppColors.successGreen,
  },
  headerSpacer: { flex: 1 },

  keyboardView: { flex: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  sessionHeader: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  sessionLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
  },

  aiMessageContainer: {
    marginBottom: 20,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  aiIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  aiContent: {
    flex: 1,
    paddingRight: 40,
  },
  aiText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onSurface,
    lineHeight: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingLeft: 40,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}40`,
    backgroundColor: AppColors.surfaceContainerLowest,
  },
  optionText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: AppColors.onSurface,
  },

  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: AppColors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onPrimary,
    lineHeight: 24,
  },

  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: AppColors.primary,
  },

  errorRow: {
    paddingVertical: 8,
    paddingHorizontal: 40,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.errorRed,
  },

  summarySection: {
    marginTop: 12,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    flex: 1,
  },
  summaryBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  summaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  summaryBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: AppColors.onPrimary,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
  },

  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
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
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: `${AppColors.outlineVariant}30`,
  },
});
