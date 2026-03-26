import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, ListGroup, Separator } from 'heroui-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { TabScreenLayout } from '@/components/TabScreenLayout';
import { AppColors } from '@/constants/theme';
import { useChild } from '@/context/child';
import { useVaccinations, type VaccinationRow } from '@/hooks/useVaccinations';

// Human-readable bracket label
const BRACKET_LABEL: Record<string, string> = {
  NEWBORN: 'Newborn (0–3 months)',
  EARLY_INFANT: 'Early Infant (3–6 months)',
  INFANT: 'Infant (6–12 months)',
  TODDLER_EARLY: 'Toddler Early (12–18 months)',
  TODDLER: 'Toddler (18 months – 3 years)',
  PRESCHOOL: 'Preschool (3–5 years)',
  SCHOOL_EARLY: 'School Early (5–8 years)',
  SCHOOL_MID: 'School Mid (8–12 years)',
  ADOLESCENT: 'Adolescent (12+ years)',
};

export default function VaccineScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { bracket, child } = useChild();
  const { vaccinations, loading, markDone } = useVaccinations(child?.id ?? null);

  const bracketLabel = BRACKET_LABEL[bracket ?? ''] ?? bracket ?? '';

  const doneCount = vaccinations.filter((v) => v.status === 'done').length;
  const total = vaccinations.length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  
  const progressBarWidth = screenWidth - 40 - 40;
  const progressFillWidth = Math.max((progressPct / 100) * progressBarWidth, 8);
  const thumbPosition = Math.max((progressPct / 100) * progressBarWidth - 8, 0);

  const nextDue = vaccinations.find((v) => v.status === 'due_soon');
  const nextUpcoming = vaccinations.find((v) => v.status === 'upcoming');

  async function handleMarkGiven(id: string) {
    try {
      await markDone(id);
    } catch {
      // error handled in hook
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const headerContent = (
    <>
      <Text style={styles.headerTitle}>Vaccination</Text>
      <Pressable style={styles.headerIcon}>
        <Ionicons name="notifications-outline" size={22} color={AppColors.onSurface} />
      </Pressable>
    </>
  );

  return (
    <TabScreenLayout headerContent={headerContent}>
        {/* Hero progress section */}
        <Card style={styles.heroCard} className="border-0 shadow-none">
          <Card.Body style={styles.heroCardBody}>
            <View style={styles.heroBlob} />
            <View style={styles.heroHeader}>
              <Text style={styles.bracketLabel}>{bracketLabel}</Text>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle}>Vaccination{'\n'}Progress</Text>
                <LinearGradient
                  colors={[AppColors.primary, AppColors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.progressBadge}
                >
                  <Text style={styles.progressBadgeCount}>{doneCount}/{total}</Text>
                  <Text style={styles.progressBadgeLabel}>Given</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[AppColors.primary, AppColors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: progressFillWidth }]}
                />
              </View>
              <View style={[styles.progressThumb, { left: thumbPosition }]} />
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <View style={[styles.progressStatDot, { backgroundColor: AppColors.primary }]} />
                <Text style={styles.progressStatText}>{progressPct}% complete</Text>
              </View>
              <View style={styles.progressStat}>
                <View style={[styles.progressStatDot, { backgroundColor: AppColors.surfaceContainerHigh }]} />
                <Text style={styles.progressStatText}>{total - doneCount} remaining</Text>
              </View>
            </View>
          </Card.Body>
        </Card>

        {/* Upload certificate */}
        <Pressable style={({ pressed }) => [styles.uploadCard, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <LinearGradient
            colors={[`${AppColors.primary}08`, `${AppColors.primary}03`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.uploadGradient}
          />
          <View style={styles.uploadIcon}>
            <Ionicons name="cloud-upload-outline" size={24} color={AppColors.primary} />
          </View>
          <View style={styles.uploadText}>
            <Text style={styles.uploadTitle}>Upload Vaccination Certificate</Text>
            <Text style={styles.uploadSub}>Keep your records digital and safe</Text>
          </View>
          <View style={styles.uploadArrow}>
            <Ionicons name="chevron-forward" size={16} color={AppColors.primary} />
          </View>
        </Pressable>

        {/* Bento stats */}
        <View style={styles.bentoRow}>
          <Card style={styles.bentoCard}>
            <Card.Body style={styles.bentoCardBody}>
              <View style={styles.bentoIconWrap}>
                <Ionicons name="calendar-outline" size={22} color={AppColors.primary} />
              </View>
              <View style={styles.bentoText}>
                <Text style={styles.bentoLabel}>Next Dose</Text>
                <Text style={styles.bentoValue} numberOfLines={2}>
                  {nextDue?.vaccine_name ?? nextUpcoming?.vaccine_name ?? 'All done!'}
                </Text>
              </View>
            </Card.Body>
          </Card>
          <Card style={[styles.bentoCard, nextDue && styles.bentoCardWarning]}>
            <Card.Body style={styles.bentoCardBody}>
              <View style={[styles.bentoIconWrap, nextDue && styles.bentoIconWarning]}>
                <Ionicons name="alert-circle-outline" size={22} color={nextDue ? AppColors.tertiary : AppColors.onSurfaceVariant} />
              </View>
              <View style={styles.bentoText}>
                <Text style={styles.bentoLabel}>Status</Text>
                <Text style={[styles.bentoValue, nextDue && { color: AppColors.tertiary }]}>
                  {nextDue ? 'Due Soon' : nextUpcoming ? new Date(nextUpcoming.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'On Track'}
                </Text>
              </View>
            </Card.Body>
          </Card>
        </View>

        {/* Vaccination list */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Schedule</Text>
          <ListGroup style={styles.listGroup}>
            {vaccinations.map((vaccine, index) => (
              <VaccineListItem
                key={vaccine.id}
                vaccine={vaccine}
                onMarkGiven={() => handleMarkGiven(vaccine.id)}
                isLast={index === vaccinations.length - 1}
              />
            ))}
          </ListGroup>
        </View>

        {/* Doctor's note */}
        <Card style={styles.doctorNote}>
          <Card.Body style={styles.doctorNoteBody}>
            <Ionicons name="information-circle-outline" size={20} color={AppColors.tertiary} />
            <View style={styles.doctorNoteText}>
              <Text style={styles.doctorNoteTitle}>Doctor&apos;s Note</Text>
              <Text style={styles.doctorNoteBodyText}>
                Minor fever after DTP/Pentavalent is common. Apply a cold compress on the injection site if swelling occurs. Contact your pediatrician if fever exceeds 101°F.
              </Text>
            </View>
          </Card.Body>
        </Card>
    </TabScreenLayout>
  );
}

function VaccineListItem({
  vaccine,
  onMarkGiven,
  isLast,
}: {
  vaccine: VaccinationRow;
  onMarkGiven: () => void;
  isLast: boolean;
}) {
  const { status, vaccine_name: name, dose_label } = vaccine;
  const dateStr = new Date(vaccine.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const displayName = dose_label ? `${name} (${dose_label})` : name;

  const getIconConfig = () => {
    switch (status) {
      case 'done':
        return { name: 'checkmark-circle' as const, color: AppColors.successGreen, bgColor: AppColors.successGreenSurface };
      case 'due_soon':
        return { name: 'medical' as const, color: AppColors.primary, bgColor: `${AppColors.primaryContainer}35` };
      case 'overdue':
        return { name: 'alert-circle' as const, color: AppColors.errorRed, bgColor: AppColors.errorRedSurface };
      default:
        return { name: 'time-outline' as const, color: AppColors.onSurfaceVariant, bgColor: AppColors.surfaceContainerHigh };
    }
  };

  const getBadgeConfig = () => {
    switch (status) {
      case 'done':
        return { label: 'Given', bg: AppColors.successGreenSurface, color: AppColors.successGreenDark };
      case 'due_soon':
        return { label: 'Due Now', bg: AppColors.primary, color: AppColors.onPrimary };
      case 'overdue':
        return { label: 'Overdue', bg: AppColors.errorRedSurface, color: AppColors.errorRed };
      default:
        return { label: dateStr, bg: AppColors.surfaceContainerHigh, color: AppColors.onSurfaceVariant };
    }
  };

  const iconConfig = getIconConfig();
  const badgeConfig = getBadgeConfig();
  const givenStr = vaccine.administered_date
    ? new Date(vaccine.administered_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <>
      <ListGroup.Item
        style={[
          styles.listItem,
          status === 'due_soon' && styles.listItemDueSoon,
          status === 'upcoming' && styles.listItemUpcoming,
        ]}
        onPress={status === 'due_soon' ? onMarkGiven : undefined}
      >
        <ListGroup.ItemPrefix style={styles.listItemPrefix}>
          <View style={[styles.listItemIcon, { backgroundColor: iconConfig.bgColor }]}>
            <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
          </View>
        </ListGroup.ItemPrefix>
        <ListGroup.ItemContent style={styles.listItemContent}>
          <ListGroup.ItemTitle
            style={[
              styles.listItemTitle,
              status === 'due_soon' && styles.listItemTitleDue,
              status === 'upcoming' && styles.listItemTitleUpcoming,
            ]}
          >
            {displayName}
          </ListGroup.ItemTitle>
          <ListGroup.ItemDescription style={styles.listItemDesc}>
            {status === 'done' && givenStr ? `Given ${givenStr}` : dateStr}
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix>
          <View style={[styles.listBadge, { backgroundColor: badgeConfig.bg }]}>
            <Text style={[styles.listBadgeText, { color: badgeConfig.color }]}>{badgeConfig.label}</Text>
          </View>
        </ListGroup.ItemSuffix>
      </ListGroup.Item>
      {!isLast && <Separator style={styles.listSeparator} />}
    </>
  );
}

function VaccineCard({
  vaccine,
  onMarkGiven,
}: {
  vaccine: VaccinationRow;
  onMarkGiven: () => void;
}) {
  const { status, vaccine_name: name, dose_label } = vaccine;
  const dateStr = new Date(vaccine.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const displayName = dose_label ? `${name} (${dose_label})` : name;

  if (status === 'done') {
    const givenStr = vaccine.administered_date
      ? new Date(vaccine.administered_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '';
    return (
      <Card style={styles.cardDone}>
        <Card.Body style={styles.cardDoneBody}>
          <View style={styles.cardLeft}>
            <View style={styles.iconDone}>
              <Ionicons name="checkmark-circle" size={22} color={AppColors.successGreen} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{displayName}</Text>
              <Text style={styles.cardDate}>{dateStr}{givenStr ? ` · Given ${givenStr}` : ''}</Text>
            </View>
          </View>
          <View style={styles.badgeDone}>
            <Text style={styles.badgeDoneText}>Given</Text>
          </View>
        </Card.Body>
      </Card>
    );
  }

  if (status === 'due_soon') {
    return (
      <Card style={styles.cardDueSoon}>
        <Card.Body style={styles.cardDueSoonBody}>
          <View style={styles.cardDueSoonBlob} />
          <View style={styles.cardDueSoonTop}>
            <View style={styles.cardLeft}>
              <View style={styles.iconDueSoon}>
                <Ionicons name="medical" size={20} color={AppColors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { fontFamily: 'PlusJakartaSans_800ExtraBold' }]}>{displayName}</Text>
                <Text style={styles.cardDate}>{dateStr}</Text>
              </View>
            </View>
            <View style={styles.badgeDueSoon}>
              <Text style={styles.badgeDueSoonText}>Due Now</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              style={({ pressed }) => [styles.actionPrimary, { opacity: pressed ? 0.88 : 1 }]}
              onPress={onMarkGiven}
            >
              <LinearGradient
                colors={[AppColors.primary, AppColors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionPrimaryGrad}
              >
                <Text style={styles.actionPrimaryText}>Mark as Given</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionSecondary, { opacity: pressed ? 0.75 : 1 }]}>
              <Text style={styles.actionSecondaryText}>Not Sure</Text>
            </Pressable>
          </View>
        </Card.Body>
      </Card>
    );
  }

  if (status === 'overdue') {
    return (
      <Card style={styles.cardOverdue}>
        <Card.Body style={styles.cardOverdueBody}>
          <View style={styles.cardLeft}>
            <View style={styles.iconOverdue}>
              <Ionicons name="calendar-clear-outline" size={20} color={AppColors.errorRed} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{displayName}</Text>
              <Text style={styles.cardDate}>{dateStr}</Text>
            </View>
          </View>
          <View style={styles.badgeOverdue}>
            <Text style={styles.badgeOverdueText}>Overdue</Text>
          </View>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card style={styles.cardUpcoming}>
      <Card.Body style={styles.cardUpcomingBody}>
        <View style={styles.cardLeft}>
          <View style={styles.iconUpcoming}>
            <Ionicons name="time-outline" size={20} color={AppColors.onSurfaceVariant} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: `${AppColors.onSurface}90` }]}>{displayName}</Text>
            <Text style={styles.cardDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={styles.badgeUpcoming}>
          <Text style={styles.badgeUpcomingText}>Upcoming</Text>
        </View>
      </Card.Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { 
    flex: 1, 
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: { 
    fontFamily: 'PlusJakartaSans_700Bold', 
    fontSize: 22, 
    color: AppColors.onSurface, 
    letterSpacing: -0.3,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AppColors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },

  heroCard: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroCardBody: {
    padding: 20,
    gap: 20,
  },
  heroBlob: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${AppColors.primary}06`,
  },
  heroHeader: {
    gap: 6,
  },
  heroTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-between',
    gap: 12,
  },
  bracketLabel: { 
    fontFamily: 'PlusJakartaSans_700Bold', 
    fontSize: 11, 
    color: AppColors.onSurfaceVariant, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
  heroTitle: { 
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold', 
    fontSize: 28, 
    color: AppColors.onSurface, 
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  progressBadge: { 
    borderRadius: 999, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    alignItems: 'center', 
    flexDirection: 'row', 
    gap: 5,
    marginBottom: 6,
  },
  progressBadgeCount: { 
    fontFamily: 'PlusJakartaSans_800ExtraBold', 
    fontSize: 17, 
    color: AppColors.onPrimary,
  },
  progressBadgeLabel: { 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.9)',
  },
  progressBarContainer: {
    position: 'relative',
    paddingVertical: 6,
  },
  progressTrack: { 
    height: 8, 
    backgroundColor: `${AppColors.surfaceContainerHigh}`, 
    borderRadius: 999, 
    overflow: 'hidden',
  },
  progressFill: { 
    height: 8, 
    borderRadius: 999,
    minWidth: 8,
  },
  progressThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceContainerLowest,
    borderWidth: 3,
    borderColor: AppColors.primary,
    marginLeft: -8,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 20,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressStatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressStatText: { 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    fontSize: 13, 
    color: AppColors.onSurfaceVariant,
  },
  progressSubtext: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 12, 
    color: AppColors.onSurfaceVariant,
  },

  uploadCard: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
    backgroundColor: AppColors.surfaceContainerLowest, 
    borderRadius: 16,
    borderWidth: 1.5, 
    borderStyle: 'dashed', 
    borderColor: `${AppColors.primary}25`,
    padding: 16,
    overflow: 'hidden',
  },
  uploadGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  uploadIcon: {
    width: 44, 
    height: 44, 
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}10`,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  uploadText: { flex: 1, gap: 4 },
  uploadTitle: { 
    fontFamily: 'PlusJakartaSans_700Bold', 
    fontSize: 15, 
    color: AppColors.onSurface,
    letterSpacing: -0.2,
  },
  uploadSub: { 
    fontFamily: 'PlusJakartaSans_500Medium', 
    fontSize: 13, 
    color: AppColors.onSurfaceVariant,
  },
  uploadArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${AppColors.primary}08`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bentoRow: { flexDirection: 'row', gap: 12 },
  bentoCard: {
    flex: 1, 
    backgroundColor: AppColors.surfaceContainerLowest, 
    borderRadius: 16,
  },
  bentoCardWarning: {
    borderWidth: 1,
    borderColor: `${AppColors.tertiary}30`,
  },
  bentoCardBody: {
    padding: 16, 
    gap: 14,
  },
  bentoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoIconWarning: {
    backgroundColor: `${AppColors.tertiary}12`,
  },
  bentoText: { gap: 4 },
  bentoLabel: { 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    fontSize: 11, 
    color: AppColors.onSurfaceVariant, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
  bentoValue: { 
    fontFamily: 'PlusJakartaSans_700Bold', 
    fontSize: 16, 
    color: AppColors.onSurface,
    letterSpacing: -0.2,
  },

  listSection: { gap: 12 },
  listTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: AppColors.onSurface },
  list: { gap: 10 },

  listGroup: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listItemDueSoon: {
    backgroundColor: `${AppColors.primary}06`,
  },
  listItemUpcoming: {
    opacity: 0.65,
  },
  listItemPrefix: {
    marginRight: 14,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    gap: 2,
  },
  listItemTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: AppColors.onSurface,
  },
  listItemTitleDue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: AppColors.primary,
  },
  listItemTitleUpcoming: {
    color: AppColors.onSurfaceVariant,
  },
  listItemDesc: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
  },
  listBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  listBadgeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  listSeparator: {
    marginHorizontal: 16,
    backgroundColor: `${AppColors.outlineVariant}20`,
  },

  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: AppColors.onSurface },
  cardDate: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant },

  cardDone: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
  },
  cardDoneBody: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
  },
  iconDone: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.successGreenSurface, alignItems: 'center', justifyContent: 'center',
  },
  badgeDone: { backgroundColor: AppColors.successGreenSurface, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDoneText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.successGreenDark, textTransform: 'uppercase', letterSpacing: 0.5 },

  cardDueSoon: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1.5, 
    borderColor: `${AppColors.primary}18`,
    overflow: 'hidden',
  },
  cardDueSoonBody: {
    padding: 16,
    gap: 14,
  },
  cardDueSoonBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: `${AppColors.primary}07`,
  },
  cardDueSoonTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconDueSoon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${AppColors.primaryContainer}35`,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeDueSoon: { backgroundColor: AppColors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDueSoonText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.onPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionPrimary: { flex: 1, borderRadius: 999, overflow: 'hidden' },
  actionPrimaryGrad: { paddingVertical: 12, alignItems: 'center' },
  actionPrimaryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onPrimary },
  actionSecondary: {
    flex: 1, backgroundColor: AppColors.surfaceContainerHighest, borderRadius: 999,
    paddingVertical: 12, alignItems: 'center',
  },
  actionSecondaryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurfaceVariant },

  cardOverdue: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
    borderLeftWidth: 3, 
    borderLeftColor: AppColors.errorRed,
  },
  cardOverdueBody: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
  },
  iconOverdue: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.errorRedSurface, alignItems: 'center', justifyContent: 'center',
  },
  badgeOverdue: { backgroundColor: AppColors.errorRedSurface, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeOverdueText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.errorRed, textTransform: 'uppercase', letterSpacing: 0.5 },

  cardUpcoming: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.outlineVariant}15`,
    opacity: 0.72,
  },
  cardUpcomingBody: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
  },
  iconUpcoming: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: AppColors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center',
  },
  badgeUpcoming: { backgroundColor: AppColors.surfaceContainerHigh, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeUpcomingText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: AppColors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },

  doctorNote: {
    backgroundColor: AppColors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1, 
    borderColor: `${AppColors.tertiary}15`,
  },
  doctorNoteBody: {
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'flex-start',
    padding: 16,
  },
  doctorNoteText: { flex: 1, gap: 4 },
  doctorNoteTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: AppColors.onSurface },
  doctorNoteBodyText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: AppColors.onSurfaceVariant, lineHeight: 18 },
});
