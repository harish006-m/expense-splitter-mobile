import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import {getGroup} from '../services/api';

const API_BASE_URL = 'http://192.168.29.27:8000/api';

export default function AddExpenseScreen({route, navigation}: any) {
  const groupId = route?.params?.groupId;
  const groupName = route?.params?.groupName || 'Group';

  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await getGroup(groupId);
      setMembers(data.members || []);

      if (data.members?.length > 0) {
        setPaidBy(data.members[0].id);
      }
    } catch (error) {
      console.log('MEMBERS ERROR:', error);

      Alert.alert(
        'Error',
        'Unable to load group members.',
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const addExpense = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter an expense description.');
      return;
    }

    if (!amount.trim() || Number(amount) <= 0) {
      Alert.alert('Required', 'Please enter a valid amount.');
      return;
    }

    if (!paidBy) {
      Alert.alert('Required', 'Please select who paid.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/expenses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            paid_by: paidBy,
            description: description.trim(),
            amount: Number(amount),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      Alert.alert(
        'Success',
        'Expense added successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.log('ADD EXPENSE ERROR:', error);

      Alert.alert(
        'Error',
        error.message || 'Unable to add expense.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>₹</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.groupName}>{groupName}</Text>
        </View>
      </View>

      {/* Amount Highlight */}
      <View style={styles.amountCard}>
        <View style={styles.amountIcon}>
          <Text style={styles.amountIconText}>₹</Text>
        </View>

        <View style={styles.amountInfo}>
          <Text style={styles.amountLabel}>EXPENSE AMOUNT</Text>

          <View style={styles.amountInputRow}>
            <Text style={styles.rupeeSymbol}>₹</Text>

            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#93A4C0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      {/* Main Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Expense Details</Text>

        <Text style={styles.sectionSubtitle}>
          Enter the details of your shared expense.
        </Text>

        {/* Description */}
        <Text style={styles.label}>EXPENSE NAME</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Text style={styles.inputIconText}>✎</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Example: Dinner"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Paid By */}
        <Text style={[styles.label, styles.paidByLabel]}>
          PAID BY
        </Text>

        {loadingMembers ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>
              Loading members...
            </Text>
          </View>
        ) : members.length === 0 ? (
          <View style={styles.noMembersBox}>
            <Text style={styles.noMembersIcon}>!</Text>
            <Text style={styles.noMembers}>
              No members available.
            </Text>
          </View>
        ) : (
          <View style={styles.membersContainer}>
            {members.map((member: any, index: number) => {
              const selected = paidBy === member.id;
              const firstLetter =
                member.name?.charAt(0)?.toUpperCase() || 'M';

              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberButton,
                    selected && styles.memberButtonSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setPaidBy(member.id)}>
                  
                  <View
                    style={[
                      styles.memberAvatar,
                      selected && styles.memberAvatarSelected,
                    ]}>
                    <Text
                      style={[
                        styles.memberAvatarText,
                        selected && styles.memberAvatarTextSelected,
                      ]}>
                      {firstLetter}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text
                      style={[
                        styles.memberText,
                        selected && styles.memberTextSelected,
                      ]}>
                      {member.name}
                    </Text>

                    <Text
                      style={[
                        styles.memberSubtext,
                        selected && styles.memberSubtextSelected,
                      ]}>
                      {selected ? 'Selected payer' : 'Tap to select'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      selected && styles.radioSelected,
                    ]}>
                    {selected && (
                      <Text style={styles.radioCheck}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (saving || loadingMembers) && styles.disabledButton,
          ]}
          onPress={addExpense}
          disabled={saving || loadingMembers}
          activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitIcon}>+</Text>
              <Text style={styles.submitText}>
                Add Expense
              </Text>
              <Text style={styles.submitArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Note */}
      <View style={styles.noteCard}>
        <View style={styles.noteIcon}>
          <Text style={styles.noteIconText}>i</Text>
        </View>

        <View style={styles.noteContent}>
          <Text style={styles.noteTitle}>How it works</Text>
          <Text style={styles.noteText}>
            The expense will be added to the group and the balances
            will be updated automatically.
          </Text>
        </View>
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

  /* Header */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIconText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#2563EB',
  },

  headerTextContainer: {
    marginLeft: 13,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  groupName: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 3,
  },

  /* Amount */

  amountCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 5,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },

  amountIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  amountIconText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  amountInfo: {
    flex: 1,
    marginLeft: 15,
  },

  amountLabel: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  rupeeSymbol: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
    paddingVertical: 0,
    paddingHorizontal: 7,
  },

  /* Main Card */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 22,
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.9,
    marginBottom: 8,
  },

  inputContainer: {
    height: 52,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#DDE2EA',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 20,
  },

  inputIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputIconText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
    paddingVertical: 0,
  },

  paidByLabel: {
    marginTop: 2,
  },

  /* Members */

  membersContainer: {
    marginBottom: 6,
  },

  memberButton: {
    minHeight: 67,
    borderWidth: 1,
    borderColor: '#E1E5EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 15,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberAvatarSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  memberAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },

  memberAvatarTextSelected: {
    color: '#FFFFFF',
  },

  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },

  memberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  memberTextSelected: {
    color: '#FFFFFF',
  },

  memberSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },

  memberSubtextSelected: {
    color: '#DBEAFE',
  },

  radio: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },

  radioCheck: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '900',
  },

  /* Loading */

  loadingContainer: {
    height: 67,
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },

  loadingText: {
    color: '#6B7280',
    fontSize: 13,
    marginLeft: 9,
  },

  /* No Members */

  noMembersBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  noMembersIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 27,
    fontWeight: '800',
  },

  noMembers: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 9,
    fontWeight: '600',
  },

  /* Submit */

  submitButton: {
    backgroundColor: '#16A34A',
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    flexDirection: 'row',
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitIcon: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '500',
    marginRight: 7,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  submitArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 9,
  },

  /* Note */

  noteCard: {
    backgroundColor: '#EEF5FF',
    borderRadius: 16,
    padding: 14,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D9E8FF',
  },

  noteIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#DCEAFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noteIconText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '900',
  },

  noteContent: {
    flex: 1,
    marginLeft: 10,
  },

  noteTitle: {
    color: '#1E40AF',
    fontSize: 13,
    fontWeight: '800',
  },

  noteText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },
});