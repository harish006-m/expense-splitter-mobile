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
} from 'react-native';

import {getGroup, getBalances} from '../services/api';

const API_BASE_URL = 'http://192.168.29.27:8000/api';

export default function GroupDetailsScreen({route, navigation}: any) {
  const groupId = route?.params?.groupId;

  const [group, setGroup] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [addingMember, setAddingMember] = useState(false);

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
        console.log('BALANCE ERROR:', balanceError);
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
      Alert.alert('Required', 'Please enter a member name.');
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
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setMemberName('');
      setShowAddMember(false);

      await loadGroup();

      Alert.alert('Success', `${name} added to the group.`);
    } catch (error: any) {
      console.log('ADD MEMBER ERROR:', error);

      Alert.alert(
        'Error',
        error.message || 'Unable to add member.',
      );
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loaderCircle}>
          <ActivityIndicator size="large" color="#2563EB" />
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
          <Text style={styles.errorIconText}>!</Text>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* GROUP HEADER */}
      <View style={styles.groupHeader}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>
            {group.name?.charAt(0)?.toUpperCase() || 'G'}
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
            <Text style={styles.memberIcon}>••</Text>

            <Text style={styles.subtitle}>
              {members.length} member
              {members.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </View>

      {/* QUICK SUMMARY */}
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
              {members.length === 1 ? '' : 's'} in this group
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() =>
              setShowAddMember(!showAddMember)
            }>
            <Text style={styles.addButtonText}>
              {showAddMember ? '×' : '+'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADD MEMBER FORM */}
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
              placeholderTextColor="#9CA3AF"
              value={memberName}
              onChangeText={setMemberName}
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[
                styles.addMemberButton,
                addingMember && styles.disabledButton,
              ]}
              onPress={addMember}
              disabled={addingMember}
              activeOpacity={0.85}>
              {addingMember ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.addMemberButtonText}>
                  Add Member
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

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
              Add members to start splitting expenses.
            </Text>
          </View>
        ) : (
          members.map((member: any, index: number) => (
            <View
              key={member.id}
              style={styles.memberCard}>

              <View
                style={[
                  styles.memberAvatar,
                  index % 3 === 1 && styles.memberAvatarBlue,
                  index % 3 === 2 && styles.memberAvatarGreen,
                ]}>
                <Text style={styles.memberAvatarText}>
                  {member.name
                    ?.charAt(0)
                    ?.toUpperCase() || '?'}
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

              <View style={styles.memberCheck}>
                <Text style={styles.memberCheckText}>
                  ✓
                </Text>
              </View>
            </View>
          ))
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
              {expenses.length === 1 ? '' : 's'} recorded
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
              Add your first expense to start tracking.
            </Text>
          </View>
        ) : (
          expenses.map((expense: any) => (
            <View
              key={expense.id}
              style={styles.expenseCard}>

              <View style={styles.expenseIcon}>
                <Text style={styles.expenseIconText}>
                  ₹
                </Text>
              </View>

              <View style={styles.expenseInfo}>
                <Text
                  style={styles.expenseName}
                  numberOfLines={1}>
                  {expense.description || expense.name}
                </Text>

                <Text style={styles.paidBy}>
                  Paid by {expense.paid_by || expense.paidBy}
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

              <Text style={styles.sectionSubtitle}>
                Current amount summary
              </Text>
            </View>
          </View>

          {balances.map((balance: any, index: number) => {
            const value = Number(balance.balance);

            return (
              <View
                key={balance.id || index}
                style={styles.balanceCard}>

                <View style={styles.balanceLeft}>
                  <View style={styles.balanceAvatar}>
                    <Text style={styles.balanceAvatarText}>
                      {(
                        balance.member?.name ||
                        balance.name ||
                        balance.member_name ||
                        '?'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.balanceName}>
                      {balance.member?.name ||
                        balance.name ||
                        balance.member_name}
                    </Text>

                    <Text style={styles.balanceStatus}>
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
                  {value >= 0 ? '+' : ''}₹
                  {balance.balance}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('AddExpense', {
              groupId: group.id,
              groupName: group.name,
            })
          }>
          <View style={styles.primaryIcon}>
            <Text style={styles.primaryIconText}>
              +
            </Text>
          </View>

          <Text style={styles.primaryButtonText}>
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
            navigation.navigate('Settlement', {
              groupId: group.id,
              groupName: group.name,
            })
          }>
          <View style={styles.secondaryIcon}>
            <Text style={styles.secondaryIconText}>
              ₹
            </Text>
          </View>

          <Text style={styles.secondaryButtonText}>
            View Settlement
          </Text>

          <Text style={styles.secondaryArrow}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  content: {
    padding: 20,
    paddingTop: 18,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FC',
  },

  loaderCircle: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginTop: 15,
  },

  loadingText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 5,
  },

  errorIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorIconText: {
    color: '#DC2626',
    fontSize: 28,
    fontWeight: '800',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 15,
  },

  /* GROUP HEADER */

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  groupAvatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  groupAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },

  groupHeaderInfo: {
    flex: 1,
    marginLeft: 15,
  },

  groupLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 3,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
  },

  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  memberIcon: {
    fontSize: 10,
    color: '#6B7280',
    marginRight: 6,
    letterSpacing: -1,
  },

  subtitle: {
    color: '#6B7280',
    fontSize: 13,
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },

  summaryLabel: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 2,
  },

  summaryText: {
    color: '#DBEAFE',
    fontSize: 13,
  },

  summaryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCircleText: {
    fontSize: 25,
  },

  /* SECTION */

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
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },

  /* ADD */

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: 25,
    fontWeight: '500',
    color: '#2563EB',
  },

  addMemberCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  formSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#DDE2EA',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },

  addMemberButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.7,
  },

  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* MEMBER */

  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECF2',
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberAvatarBlue: {
    backgroundColor: '#E0F2FE',
  },

  memberAvatarGreen: {
    backgroundColor: '#DCFCE7',
  },

  memberAvatarText: {
    color: '#2563EB',
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
    color: '#111827',
  },

  memberRole: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },

  memberCheck: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberCheckText: {
    color: '#16A34A',
    fontWeight: '800',
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECF2',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
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
    color: '#111827',
  },

  emptyText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },

  /* EXPENSE */

  expenseCard: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 17,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECF2',
  },

  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  expenseIconText: {
    color: '#2563EB',
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
    color: '#111827',
  },

  paidBy: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },

  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  /* BALANCE */

  balanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 17,
    marginBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECF2',
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceAvatarText: {
    fontWeight: '800',
    color: '#374151',
  },

  balanceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 11,
  },

  balanceStatus: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 11,
    marginTop: 2,
  },

  balanceAmount: {
    fontSize: 17,
    fontWeight: '800',
  },

  positive: {
    color: '#16A34A',
  },

  negative: {
    color: '#DC2626',
  },

  /* ACTIONS */

  actions: {
    marginTop: 2,
  },

  primaryButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#2563EB',
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500',
  },

  primaryButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 11,
  },

  primaryArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginRight: 4,
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE2EB',
  },

  secondaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryIconText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '800',
  },

  secondaryButtonText: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 11,
  },

  secondaryArrow: {
    color: '#6B7280',
    fontSize: 22,
    marginRight: 4,
  },

  bottomSpace: {
    height: 30,
  },
});