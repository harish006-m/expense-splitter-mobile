import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';

import {
  getGroup,
  getBalances,
  deleteMember,
} from '../services/api';

import {COLORS} from '../theme/colors';
import {SPACING} from '../theme/spacing';
import {TYPOGRAPHY} from '../theme/typography';

const API_BASE_URL = 'http://192.168.29.27:8000/api';

export default function GroupDetailsScreen({
  route,
  navigation,
}: any) {
  const groupId = route?.params?.groupId;

  const [group, setGroup] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddMember, setShowAddMember] =
    useState(false);

  const [memberName, setMemberName] = useState('');
  const [addingMember, setAddingMember] =
    useState(false);

  const [selectedMember, setSelectedMember] =
    useState<any>(null);

  const [showMemberMenu, setShowMemberMenu] =
    useState(false);

  const [removingMemberId, setRemovingMemberId] =
    useState<number | null>(null);

  const loadGroup = async () => {
    try {
      setLoading(true);

      const groupData = await getGroup(groupId);
      setGroup(groupData);

      try {
        const balanceData = await getBalances(groupId);

        setBalances(
          Array.isArray(balanceData)
            ? balanceData
            : balanceData.data || [],
        );
      } catch (balanceError) {
        console.log(
          'BALANCE ERROR:',
          balanceError,
        );

        setBalances([]);
      }
    } catch (error) {
      console.log('GROUP ERROR:', error);

      Alert.alert(
        'Error',
        'Unable to load group details.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const addMember = async () => {
    const name = memberName.trim();

    if (!name) {
      Alert.alert(
        'Required',
        'Please enter a member name.',
      );
      return;
    }

    try {
      setAddingMember(true);

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}`,
        );
      }

      setMemberName('');
      setShowAddMember(false);

      await loadGroup();

      Alert.alert(
        'Success',
        `${name} added to the group.`,
      );
    } catch (error: any) {
      console.log(
        'ADD MEMBER ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error.message ||
          'Unable to add member.',
      );
    } finally {
      setAddingMember(false);
    }
  };

  const openMemberMenu = (member: any) => {
    setSelectedMember(member);
    setShowMemberMenu(true);
  };

  const confirmRemoveMember = () => {
    if (!selectedMember) {
      return;
    }

    const member = selectedMember;

    setShowMemberMenu(false);

    setTimeout(() => {
      Alert.alert(
        'Remove Member?',
        `Are you sure you want to remove ${member.name} from this group?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () =>
              removeMember(member),
          },
        ],
        {
          cancelable: true,
        },
      );
    }, 200);
  };

  const removeMember = async (member: any) => {
    try {
      setRemovingMemberId(member.id);

      await deleteMember(
        groupId,
        member.id,
      );

      Alert.alert(
        'Member Removed',
        `${member.name} has been removed from the group.`,
      );

      await loadGroup();
    } catch (error: any) {
      console.log(
        'REMOVE MEMBER ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error.message ||
          'Unable to remove member.',
      );
    } finally {
      setRemovingMemberId(null);
      setSelectedMember(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loaderCircle}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading group
        </Text>

        <Text style={styles.loadingText}>
          Getting your group details...
        </Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Group not found
        </Text>

        <Text style={styles.loadingText}>
          Unable to load this group.
        </Text>
      </View>
    );
  }

  const members = group.members || [];
  const expenses = group.expenses || [];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* GROUP HEADER */}
        <View style={styles.groupHeader}>
          <View style={styles.groupAvatar}>
            <Text style={styles.groupAvatarText}>
              {group.name
                ?.charAt(0)
                ?.toUpperCase() || 'G'}
            </Text>
          </View>

          <View style={styles.groupHeaderInfo}>
            <Text style={styles.groupLabel}>
              EXPENSE GROUP
            </Text>

            <Text
              style={styles.title}
              numberOfLines={1}>
              {group.name}
            </Text>

            <View style={styles.memberCountRow}>
              <Text style={styles.memberIcon}>
                ••
              </Text>

              <Text style={styles.subtitle}>
                {members.length} member
                {members.length === 1
                  ? ''
                  : 's'}
              </Text>
            </View>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              GROUP MEMBERS
            </Text>

            <Text style={styles.summaryNumber}>
              {members.length}
            </Text>

            <Text style={styles.summaryText}>
              People sharing expenses
            </Text>
          </View>

          <View style={styles.summaryCircle}>
            <Text style={styles.summaryCircleText}>
              👥
            </Text>
          </View>
        </View>

        {/* MEMBERS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Members
              </Text>

              <Text style={styles.sectionSubtitle}>
                {members.length} member
                {members.length === 1
                  ? ''
                  : 's'} in this group
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              onPress={() =>
                setShowAddMember(
                  !showAddMember,
                )
              }>
              <Text style={styles.addButtonText}>
                {showAddMember ? '×' : '+'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ADD MEMBER */}
          {showAddMember && (
            <View style={styles.addMemberCard}>
              <Text style={styles.formTitle}>
                Add a member
              </Text>

              <Text style={styles.formSubtitle}>
                Add someone to this expense group.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter member name"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={memberName}
                onChangeText={setMemberName}
                autoCapitalize="words"
              />

              <TouchableOpacity
                style={[
                  styles.addMemberButton,
                  addingMember &&
                    styles.disabledButton,
                ]}
                onPress={addMember}
                disabled={addingMember}
                activeOpacity={0.85}>

                {addingMember ? (
                  <ActivityIndicator
                    color={COLORS.white}
                  />
                ) : (
                  <Text
                    style={
                      styles.addMemberButtonText
                    }>
                    Add Member
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* MEMBER LIST */}
          {members.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  👤
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No members yet
              </Text>

              <Text style={styles.emptyText}>
                Add members to start splitting
                expenses.
              </Text>
            </View>
          ) : (
            members.map(
              (
                member: any,
                index: number,
              ) => (
                <View
                  key={member.id}
                  style={styles.memberCard}>

                  <View
                    style={[
                      styles.memberAvatar,
                      index % 3 === 1 &&
                        styles.memberAvatarBlue,
                      index % 3 === 2 &&
                        styles.memberAvatarGreen,
                    ]}>
                    <Text
                      style={
                        styles.memberAvatarText
                      }>
                      {member.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        '?'}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.name}
                    </Text>

                    <Text style={styles.memberRole}>
                      Group member
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.menuButton}
                    activeOpacity={0.7}
                    onPress={() =>
                      openMemberMenu(member)
                    }
                    disabled={
                      removingMemberId ===
                      member.id
                    }>

                    {removingMemberId ===
                    member.id ? (
                      <ActivityIndicator
                        size="small"
                        color={
                          COLORS.textSecondary
                        }
                      />
                    ) : (
                      <Text
                        style={styles.menuDots}>
                        ⋮
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ),
            )
          )}
        </View>

        {/* EXPENSES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Expenses
              </Text>

              <Text style={styles.sectionSubtitle}>
                {expenses.length} expense
                {expenses.length === 1
                  ? ''
                  : 's'} recorded
              </Text>
            </View>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ₹
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No expenses yet
              </Text>

              <Text style={styles.emptyText}>
                Add your first expense to start
                tracking.
              </Text>
            </View>
          ) : (
            expenses.map((expense: any) => (
              <View
                key={expense.id}
                style={styles.expenseCard}>

                <View style={styles.expenseIcon}>
                  <Text
                    style={styles.expenseIconText}>
                    ₹
                  </Text>
                </View>

                <View style={styles.expenseInfo}>
                  <Text
                    style={styles.expenseName}
                    numberOfLines={1}>
                    {expense.description ||
                      expense.name}
                  </Text>

                  <Text style={styles.paidBy}>
                    Paid by{' '}
                    {expense.paid_by ||
                      expense.paidBy}
                  </Text>
                </View>

                <Text style={styles.amount}>
                  ₹{expense.amount}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* BALANCES */}
        {balances.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Balances
                </Text>

                <Text
                  style={styles.sectionSubtitle}>
                  Current amount summary
                </Text>
              </View>
            </View>

            {balances.map(
              (
                balance: any,
                index: number,
              ) => {
                const value = Number(
                  balance.balance,
                );

                const balanceMemberName =
                  balance.member?.name ||
                  balance.name ||
                  balance.member_name ||
                  '?';

                return (
                  <View
                    key={
                      balance.id || index
                    }
                    style={styles.balanceCard}>

                    <View
                      style={
                        styles.balanceLeft
                      }>
                      <View
                        style={
                          styles.balanceAvatar
                        }>
                        <Text
                          style={
                            styles.balanceAvatarText
                          }>
                          {balanceMemberName
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={
                            styles.balanceName
                          }>
                          {balanceMemberName}
                        </Text>

                        <Text
                          style={
                            styles.balanceStatus
                          }>
                          {value >= 0
                            ? 'Gets back'
                            : 'Needs to pay'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.balanceAmount,
                        value >= 0
                          ? styles.positive
                          : styles.negative,
                      ]}>
                      {value >= 0
                        ? '+'
                        : ''}
                      ₹{balance.balance}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                'AddExpense',
                {
                  groupId: group.id,
                  groupName: group.name,
                },
              )
            }>

            <View style={styles.primaryIcon}>
              <Text
                style={
                  styles.primaryIconText
                }>
                +
              </Text>
            </View>

            <Text
              style={
                styles.primaryButtonText
              }>
              Add Expense
            </Text>

            <Text style={styles.primaryArrow}>
              →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                'Settlement',
                {
                  groupId: group.id,
                  groupName: group.name,
                },
              )
            }>

            <View style={styles.secondaryIcon}>
              <Text
                style={
                  styles.secondaryIconText
                }>
                ₹
              </Text>
            </View>

            <Text
              style={
                styles.secondaryButtonText
              }>
              View Settlement
            </Text>

            <Text style={styles.secondaryArrow}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* MEMBER MENU */}
      <Modal
        visible={showMemberMenu}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMemberMenu(false)
        }>

        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() =>
            setShowMemberMenu(false)
          }>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.memberMenuCard}>

            <View style={styles.menuHeader}>
              <View
                style={
                  styles.menuHeaderAvatar
                }>
                <Text
                  style={
                    styles.menuHeaderAvatarText
                  }>
                  {selectedMember?.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    '?'}
                </Text>
              </View>

              <View style={styles.menuHeaderInfo}>
                <Text
                  style={styles.menuMemberName}>
                  {selectedMember?.name}
                </Text>

                <Text
                  style={
                    styles.menuMemberSubtitle
                  }>
                  Group member
                </Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.removeMenuItem}
              activeOpacity={0.7}
              onPress={
                confirmRemoveMember
              }>

              <View
                style={
                  styles.removeMenuIcon
                }>
                <Text
                  style={
                    styles.removeMenuIconText
                  }>
                  −
                </Text>
              </View>

              <Text
                style={
                  styles.removeMenuText
                }>
                Remove Member
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.cancelMenuButton
              }
              activeOpacity={0.7}
              onPress={() =>
                setShowMemberMenu(false)
              }>
              <Text
                style={
                  styles.cancelMenuText
                }>
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.screen,
    paddingTop: SPACING.md,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  loaderCircle: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 15,
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginTop: 5,
  },

  errorIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorIconText: {
    color: COLORS.error,
    fontSize: 28,
    fontWeight: '800',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 15,
  },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  groupAvatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  groupAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },

  groupHeaderInfo: {
    flex: 1,
    marginLeft: 15,
  },

  groupLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.text,
  },

  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  memberIcon: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginRight: 6,
    letterSpacing: -1,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
  },

  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },

  summaryLabel: {
    color: COLORS.primaryLight,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },

  summaryNumber: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 2,
  },

  summaryText: {
    color: COLORS.primaryExtraLight,
    fontSize: TYPOGRAPHY.sm,
  },

  summaryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.overlayWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCircleText: {
    fontSize: 25,
  },

  section: {
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: 25,
    fontWeight: '500',
    color: COLORS.primary,
  },

  addMemberCard: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  formSubtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.xs,
    marginTop: 3,
    marginBottom: 15,
  },

  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.text,
    marginBottom: 12,
  },

  addMemberButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.7,
  },

  addMemberButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.avatarPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberAvatarBlue: {
    backgroundColor: COLORS.avatarBlue,
  },

  memberAvatarGreen: {
    backgroundColor: COLORS.successSoft,
  },

  memberAvatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },

  memberInfo: {
    flex: 1,
    marginLeft: 13,
  },

  memberName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  memberRole: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginTop: 3,
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.graySoft,
  },

  menuDots: {
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'flex-end',
  },

  memberMenuCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
  },

  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  menuHeaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuHeaderAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },

  menuHeaderInfo: {
    marginLeft: 12,
  },

  menuMemberName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  menuMemberSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  removeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 13,
  },

  removeMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeMenuIconText: {
    fontSize: 25,
    fontWeight: '500',
    color: COLORS.error,
  },

  removeMenuText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },

  cancelMenuButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: COLORS.graySoft,
    alignItems: 'center',
  },

  cancelMenuText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.avatarPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  emptyIconText: {
    fontSize: 22,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },

  expenseCard: {
    backgroundColor: COLORS.white,
    padding: 13,
    borderRadius: 17,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  expenseIconText: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '800',
  },

  expenseInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  expenseName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  paidBy: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    marginTop: 4,
  },

  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  balanceCard: {
    backgroundColor: COLORS.white,
    padding: 13,
    borderRadius: 17,
    marginBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  balanceAvatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.graySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceAvatarText: {
    fontWeight: '800',
    color: COLORS.textDark,
  },

  balanceName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 11,
  },

  balanceStatus: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 11,
    marginTop: 2,
  },

  balanceAmount: {
    fontSize: 17,
    fontWeight: '800',
  },

  positive: {
    color: COLORS.success,
  },

  negative: {
    color: COLORS.error,
  },

  actions: {
    marginTop: 2,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  primaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.overlayWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryIconText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '500',
  },

  primaryButtonText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 11,
  },

  primaryArrow: {
    color: COLORS.white,
    fontSize: 22,
    marginRight: 4,
  },

  secondaryButton: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondaryBorder,
  },

  secondaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryIconText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },

  secondaryButtonText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 11,
  },

  secondaryArrow: {
    color: COLORS.textSecondary,
    fontSize: 22,
    marginRight: 4,
  },

  bottomSpace: {
    height: 30,
  },
});