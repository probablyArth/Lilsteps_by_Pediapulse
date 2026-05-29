import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AllergyBanner } from '@/components/home/AllergyBanner';
import { CareTeam, type CareProvider } from '@/components/home/CareTeam';
import { GrowthCards } from '@/components/home/GrowthCards';
import { DailyInsight } from '@/components/home/DailyInsight';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PrimaryCtaCard } from '@/components/home/PrimaryCtaCard';
import { QuickActions } from '@/components/home/QuickActions';
import { VaccinationCard } from '@/components/home/VaccinationCard';
import { BRACKET_CONFIG } from '@/constants/bracketConfig';
import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useDoctors } from '@/hooks/useDoctors';
import { useConversations } from '@/hooks/useConversations';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { child, parentName, bracket } = useChild();
  const { vaccinations } = useVaccinations(child?.id ?? null);
  const { doctors } = useDoctors();
  const { startConversation } = useConversations(child?.id ?? null);

  async function handleProviderPress(doctorId: string) {
    if (!child) return;
    try {
      const convo = await startConversation({ child_id: child.id, doctor_id: doctorId });
      router.push(`/chat/${convo.id}`);
    } catch {
      // ignore — UI will show stale state, retry by tapping again
    }
  }

  const childName = child?.name ?? 'Child';
  const bracketKey = bracket ?? 'TODDLER';
  const bracketCfg = BRACKET_CONFIG[bracketKey];

  const allergies = child?.allergies.map(a => a.name) ?? [];

  const nextVaccine = vaccinations.find(v => v.status === 'due_soon' || v.status === 'upcoming');

  const careProviders: CareProvider[] = doctors.slice(0, 3).map((doc) => ({
    id: doc.id,
    name: doc.name,
    role: doc.specialisation,
    initial: doc.name.charAt(0),
  }));

  const headerHeight = insets.top + 56;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll, 
          { 
            paddingTop: headerHeight,
            paddingBottom: 100 + insets.bottom 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.greeting}>
            {getGreeting()}, {parentName || 'there'}.{'\n'}
            {childName} is thriving today.
          </Text>
          <Text style={styles.greetingSub}>
            {bracketCfg.greetingSubtext(childName)}
          </Text>
        </View>

        <QuickActions
          onBook={() => router.push('/consult/booking')}
          onGrowth={() => router.navigate('/(tabs)/growth')}
          onVaccines={() => router.navigate('/(tabs)/vaccine')}
          onRecords={() => router.navigate('/(tabs)/records')}
        />

        {allergies.length > 0 && (
          <AllergyBanner allergies={allergies} />
        )}

        <PrimaryCtaCard
          title={bracketCfg.ctaTitle}
          subtitle="Log symptoms or daily wellness"
          onPress={() => router.push('/checkin')}
        />

        <GrowthCards data={{ weight: child?.weight ?? 0, height: child?.height ?? 0 }} />

        <VaccinationCard
          nextVaccine={nextVaccine?.vaccine_name ?? 'All caught up!'}
          nextDate={nextVaccine?.scheduled_date ? new Date(nextVaccine.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          onViewSchedule={() => router.navigate('/(tabs)/vaccine')}
        />

        <CareTeam
          providers={careProviders}
          onAddProvider={() => router.push('/consult/booking')}
          onProviderPress={handleProviderPress}
        />

        <DailyInsight bracket={bracketKey} />
      </ScrollView>

      <HomeHeader
        childName={childName}
        avatarInitial={childName.charAt(0)}
        hasUnread={false}
        paddingTop={insets.top}
        onNotifications={() => router.push('/profile')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 28,
    paddingTop: 12,
  },
  section: {
    gap: 4,
  },
  greeting: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: AppColors.onSurface,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  greetingSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: AppColors.onSurfaceVariant,
    lineHeight: 24,
  },
});
