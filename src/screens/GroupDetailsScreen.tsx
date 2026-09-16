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

  /* =========================
     ADD MEMBER
  ========================= */

  const [showAddMember, setShowAddMember] =
    useState(false);

  const [memberName, setMemberName] = useState('');
  const [addingMember, setAddingMember] =
    useState(false);

  /* =========================
     MEMBER MENU
  ========================= */

  const [selectedMember, setSelectedMember] =
    useState<any>(null);

  const [showMemberMenu, setShowMemberMenu] =
    useState(false);

  const [removingMemberId, setRemovingMemberId] =
    useState<number | null>(null);

  /* =========================
     EDIT MEMBER
  ========================= */

  const [showEditMember, setShowEditMember] =
    useState(false);

  const [editMemberName, setEditMemberName] =
    useState('');

  const [updatingMember, setUpdatingMember] =
    useState(false);

  /* =========================
     EXPENSE MENU
  ========================= */

  const [selectedExpense, setSelectedExpense] =
    useState<any>(null);

  const [showExpenseMenu, setShowExpenseMenu] =
    useState(false);

  const [removingExpenseId, setRemovingExpenseId] =
    useState<number | null>(null);

  /* =========================
     EDIT EXPENSE
  ========================= */

  const [showEditExpense, setShowEditExpense] =
    useState(false);

  const [editExpenseDescription, setEditExpenseDescription] =
    useState('');

  const [editExpenseAmount, setEditExpenseAmount] =
    useState('');

  const [editExpensePaidBy, setEditExpensePaidBy] =
    useState<number | null>(null);

  const [updatingExpense, setUpdatingExpense] =
    useState(false);

  /* =========================
     LOAD GROUP
  ========================= */

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
            : balanceData?.data || [],
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

  /* =========================
     ADD MEMBER
  ========================= */

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

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
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
        error?.message ||
          'Unable to add member.',
      );
    } finally {
      setAddingMember(false);
    }
  };

  /* =========================
     MEMBER MENU
  ========================= */

  const openMemberMenu = (member: any) => {
    setSelectedMember(member);
    setShowMemberMenu(true);
  };

  /* =========================
     OPEN EDIT MEMBER
  ========================= */

  const openEditMember = () => {
    if (!selectedMember) {
      return;
    }

    setEditMemberName(
      selectedMember?.name || '',
    );

    setShowMemberMenu(false);
    setShowEditMember(true);
  };

  /* =========================
     SAVE MEMBER UPDATE
  ========================= */

  const saveMemberUpdate = async () => {
    const name = editMemberName.trim();

    if (!name) {
      Alert.alert(
        'Required',
        'Please enter a member name.',
      );
      return;
    }

    if (!selectedMember?.id) {
      Alert.alert(
        'Error',
        'Member ID is missing.',
      );
      return;
    }

    try {
      setUpdatingMember(true);

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/members/${selectedMember.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      setShowEditMember(false);
      setSelectedMember(null);

      await loadGroup();

      Alert.alert(
        'Success',
        'Member updated successfully.',
      );
    } catch (error: any) {
      console.log(
        'UPDATE MEMBER ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error?.message ||
          'Unable to update member.',
      );
    } finally {
      setUpdatingMember(false);
    }
  };

  /* =========================
     CONFIRM REMOVE MEMBER
  ========================= */

  const confirmRemoveMember = () => {
    if (!selectedMember) {
      return;
    }

    const member = selectedMember;

    setShowMemberMenu(false);

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
          onPress: () => removeMember(member),
        },
      ],
    );
  };

  /* =========================
     REMOVE MEMBER
  ========================= */

  const removeMember = async (member: any) => {
    try {
      setRemovingMemberId(member.id);

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/members/${member.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      await loadGroup();

      Alert.alert(
        'Member Removed',
        `${member.name} has been removed from the group.`,
      );
    } catch (error: any) {
      console.log(
        'REMOVE MEMBER ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error?.message ||
          'Unable to remove member.',
      );
    } finally {
      setRemovingMemberId(null);
      setSelectedMember(null);
    }
  };

  /* =========================
     EXPENSE MENU
  ========================= */

  const openExpenseMenu = (expense: any) => {
    setSelectedExpense(expense);
    setShowExpenseMenu(true);
  };

  /* =========================
     OPEN EDIT EXPENSE
  ========================= */

  const openEditExpense = () => {
    if (!selectedExpense) {
      return;
    }

    setEditExpenseDescription(
      selectedExpense?.description ||
        selectedExpense?.name ||
        '',
    );

    setEditExpenseAmount(
      String(selectedExpense?.amount ?? ''),
    );

    let paidById: number | null = null;

    if (
      typeof selectedExpense?.paid_by ===
      'number'
    ) {
      paidById = selectedExpense.paid_by;
    } else if (
      typeof selectedExpense?.paid_by_id ===
      'number'
    ) {
      paidById =
        selectedExpense.paid_by_id;
    } else if (
      typeof selectedExpense?.paidById ===
      'number'
    ) {
      paidById =
        selectedExpense.paidById;
    } else if (
      typeof selectedExpense?.paid_by ===
      'string'
    ) {
      const parsed = Number(
        selectedExpense.paid_by,
      );

      if (!Number.isNaN(parsed)) {
        paidById = parsed;
      }
    }

    if (!paidById && members.length > 0) {
      paidById = members[0].id;
    }

    setEditExpensePaidBy(paidById);

    setShowExpenseMenu(false);
    setShowEditExpense(true);
  };

  /* =========================
     SAVE EXPENSE UPDATE
  ========================= */

  const saveExpenseUpdate = async () => {
    const description =
      editExpenseDescription.trim();

    const amount = Number(
      editExpenseAmount,
    );

    if (!description) {
      Alert.alert(
        'Required',
        'Please enter an expense description.',
      );
      return;
    }

    if (
      !editExpenseAmount.trim() ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      Alert.alert(
        'Required',
        'Please enter a valid amount.',
      );
      return;
    }

    if (!editExpensePaidBy) {
      Alert.alert(
        'Required',
        'Please select who paid.',
      );
      return;
    }

    if (!selectedExpense?.id) {
      Alert.alert(
        'Error',
        'Expense ID is missing.',
      );
      return;
    }

    try {
      setUpdatingExpense(true);

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/expenses/${selectedExpense.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            paid_by: editExpensePaidBy,
            description,
            amount,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      setShowEditExpense(false);
      setSelectedExpense(null);

      await loadGroup();

      Alert.alert(
        'Success',
        'Expense updated successfully.',
      );
    } catch (error: any) {
      console.log(
        'UPDATE EXPENSE ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error?.message ||
          'Unable to update expense.',
      );
    } finally {
      setUpdatingExpense(false);
    }
  };

  /* =========================
     CONFIRM DELETE EXPENSE
  ========================= */

  const confirmRemoveExpense = () => {
    if (!selectedExpense) {
      return;
    }

    const expense = selectedExpense;

    setShowExpenseMenu(false);

    Alert.alert(
      'Delete Expense?',
      `Are you sure you want to delete "${expense?.description || expense?.name || 'this expense'}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            removeExpense(expense),
        },
      ],
    );
  };

  /* =========================
     DELETE EXPENSE
  ========================= */

  const removeExpense = async (
    expense: any,
  ) => {
    try {
      setRemovingExpenseId(expense.id);

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/expenses/${expense.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      await loadGroup();

      Alert.alert(
        'Expense Deleted',
        'The expense has been removed successfully.',
      );
    } catch (error: any) {
      console.log(
        'DELETE EXPENSE ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error?.message ||
          'Unable to delete expense.',
      );
    } finally {
      setRemovingExpenseId(null);
      setSelectedExpense(null);
    }
  };

  /* =========================
     LOADING
  ========================= */

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

  /* =========================
     GROUP NOT FOUND
  ========================= */

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
                      expense.name ||
                      'Expense'}
                  </Text>

                  <Text style={styles.paidBy}>
                    Paid by{' '}
                    {expense.paid_by_name ||
                      expense.paidByName ||
                      getPaidByName(
                        expense,
                        members,
                      )}
                  </Text>
                </View>

                <View style={styles.expenseRight}>
                  <Text style={styles.amount}>
                    ₹{expense.amount}
                  </Text>

                  <TouchableOpacity
                    style={styles.expenseMenuButton}
                    activeOpacity={0.7}
                    disabled={
                      removingExpenseId ===
                      expense.id
                    }
                    onPress={() =>
                      openExpenseMenu(expense)
                    }>

                    {removingExpenseId ===
                    expense.id ? (
                      <ActivityIndicator
                        size="small"
                        color={
                          COLORS.textSecondary
                        }
                      />
                    ) : (
                      <Text
                        style={
                          styles.expenseMenuDots
                        }>
                        ⋮
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
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

      {/* =========================
          MEMBER MENU
      ========================= */}

      <Modal
        visible={showMemberMenu}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMemberMenu(false)
        }>

        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackgroundButton}
            activeOpacity={1}
            onPress={() =>
              setShowMemberMenu(false)
            }
          />

          <View style={styles.memberMenuCard}>
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
              style={styles.editMenuItem}
              activeOpacity={0.7}
              onPress={openEditMember}>

              <View
                style={
                  styles.editMenuIcon
                }>
                <Text
                  style={
                    styles.editMenuIconText
                  }>
                  ✎
                </Text>
              </View>

              <Text
                style={
                  styles.editMenuText
                }>
                Edit Member
              </Text>
            </TouchableOpacity>

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
          </View>
        </View>
      </Modal>

      {/* =========================
          EDIT MEMBER MODAL
      ========================= */}

      <Modal
        visible={showEditMember}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowEditMember(false)
        }>

        <View style={styles.modalOverlay}>
          <View style={styles.editModalCard}>
            <Text style={styles.editModalTitle}>
              Edit Member
            </Text>

            <Text style={styles.editModalSubtitle}>
              Update the member name.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter member name"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={editMemberName}
              onChangeText={setEditMemberName}
              autoCapitalize="words"
              autoFocus
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={
                  styles.modalCancelButton
                }
                onPress={() =>
                  setShowEditMember(false)
                }
                disabled={updatingMember}>

                <Text
                  style={
                    styles.modalCancelText
                  }>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  updatingMember &&
                    styles.disabledButton,
                ]}
                onPress={saveMemberUpdate}
                disabled={updatingMember}>

                {updatingMember ? (
                  <ActivityIndicator
                    color={COLORS.white}
                  />
                ) : (
                  <Text
                    style={
                      styles.modalSaveText
                    }>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================
          EXPENSE MENU
      ========================= */}

      <Modal
        visible={showExpenseMenu}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowExpenseMenu(false)
        }>

        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackgroundButton}
            activeOpacity={1}
            onPress={() =>
              setShowExpenseMenu(false)
            }
          />

          <View style={styles.memberMenuCard}>
            <View style={styles.menuHeader}>
              <View
                style={
                  styles.expenseMenuHeaderIcon
                }>
                <Text
                  style={
                    styles.expenseIconText
                  }>
                  ₹
                </Text>
              </View>

              <View style={styles.menuHeaderInfo}>
                <Text
                  style={styles.menuMemberName}
                  numberOfLines={1}>
                  {selectedExpense?.description ||
                    selectedExpense?.name ||
                    'Expense'}
                </Text>

                <Text
                  style={
                    styles.menuMemberSubtitle
                  }>
                  ₹{selectedExpense?.amount}
                </Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.editMenuItem}
              activeOpacity={0.7}
              onPress={openEditExpense}>

              <View
                style={
                  styles.editMenuIcon
                }>
                <Text
                  style={
                    styles.editMenuIconText
                  }>
                  ✎
                </Text>
              </View>

              <Text
                style={
                  styles.editMenuText
                }>
                Edit Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeMenuItem}
              activeOpacity={0.7}
              onPress={
                confirmRemoveExpense
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
                Delete Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.cancelMenuButton
              }
              activeOpacity={0.7}
              onPress={() =>
                setShowExpenseMenu(false)
              }>
              <Text
                style={
                  styles.cancelMenuText
                }>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =========================
          EDIT EXPENSE MODAL
      ========================= */}

      <Modal
        visible={showEditExpense}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowEditExpense(false)
        }>

        <View style={styles.modalOverlay}>
          <View style={styles.editModalCard}>
            <Text style={styles.editModalTitle}>
              Edit Expense
            </Text>

            <Text style={styles.editModalSubtitle}>
              Update expense details.
            </Text>

            <Text style={styles.formLabel}>
              Expense Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: Dinner"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={editExpenseDescription}
              onChangeText={
                setEditExpenseDescription
              }
            />

            <Text style={styles.formLabel}>
              Amount
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 900"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={editExpenseAmount}
              onChangeText={
                setEditExpenseAmount
              }
              keyboardType="decimal-pad"
            />

            <Text style={styles.formLabel}>
              Paid By
            </Text>

            <ScrollView
              style={styles.paidByList}
              showsVerticalScrollIndicator={false}>

              {members.map((member: any) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.paidByButton,
                    editExpensePaidBy ===
                      member.id &&
                      styles.paidByButtonSelected,
                  ]}
                  onPress={() =>
                    setEditExpensePaidBy(
                      member.id,
                    )
                  }>

                  <Text
                    style={[
                      styles.paidByButtonText,
                      editExpensePaidBy ===
                        member.id &&
                        styles.paidByButtonTextSelected,
                    ]}>
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={
                  styles.modalCancelButton
                }
                onPress={() =>
                  setShowEditExpense(false)
                }
                disabled={updatingExpense}>

                <Text
                  style={
                    styles.modalCancelText
                  }>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  updatingExpense &&
                    styles.disabledButton,
                ]}
                onPress={saveExpenseUpdate}
                disabled={updatingExpense}>

                {updatingExpense ? (
                  <ActivityIndicator
                    color={COLORS.white}
                  />
                ) : (
                  <Text
                    style={
                      styles.modalSaveText
                    }>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   HELPER
========================================================= */

function getPaidByName(
  expense: any,
  members: any[],
) {
  const paidBy =
    expense?.paid_by ??
    expense?.paidBy ??
    expense?.paid_by_id ??
    expense?.paidById;

  const member = members.find(
    item =>
      String(item.id) ===
      String(paidBy),
  );

  return (
    member?.name ||
    (paidBy ? String(paidBy) : 'Unknown')
  );
}

/* =========================================================
   STYLES
========================================================= */

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

  formLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 7,
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
    marginRight: 8,
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

  expenseRight: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  expenseMenuButton: {
    width: 30,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.graySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  expenseMenuDots: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORS.textSecondary,
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

  /* =========================
     MODALS
  ========================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'flex-end',
  },

  modalBackgroundButton: {
    ...StyleSheet.absoluteFillObject,
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

  expenseMenuHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuHeaderInfo: {
    flex: 1,
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

  editMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 13,
  },

  editMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editMenuIconText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },

  editMenuText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
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

  editModalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },

  editModalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
  },

  editModalSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 18,
  },

  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 5,
  },

  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: COLORS.graySoft,
    alignItems: 'center',
    marginRight: 5,
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginLeft: 5,
  },

  modalSaveText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },

  paidByList: {
    maxHeight: 150,
    marginBottom: 12,
  },

  paidByButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBackground,
    marginBottom: 7,
  },

  paidByButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  paidByButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  paidByButtonTextSelected: {
    color: COLORS.white,
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
});