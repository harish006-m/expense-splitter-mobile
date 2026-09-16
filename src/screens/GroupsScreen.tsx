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

import {getGroups, getGroup} from '../services/api';

const API_BASE_URL = 'http://192.168.29.27:8000/api';

export default function GroupsScreen({navigation}: any) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);

      const data = await getGroups();

      const groupList = Array.isArray(data)
        ? data
        : data.data || [];

      // Get member count from each group's details
      const groupsWithMembers = await Promise.all(
        groupList.map(async (group: any) => {
          try {
            const details = await getGroup(group.id);

            return {
              ...group,
              members: details?.members || [],
              members_count: details?.members?.length || 0,
            };
          } catch (error) {
            console.log(
              `GET GROUP ${group.id} ERROR:`,
              error,
            );

            return {
              ...group,
              members_count: 0,
            };
          }
        }),
      );

      setGroups(groupsWithMembers);
    } catch (error) {
      console.log('GET GROUPS ERROR:', error);

      Alert.alert(
        'Connection Error',
        'Unable to load groups from the backend.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const createGroup = async () => {
    const name = groupName.trim();

    if (!name) {
      Alert.alert('Required', 'Please enter a group name.');
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP ${response.status}`,
        );
      }

      setGroupName('');
      setShowCreate(false);

      Alert.alert('Success', 'Group created successfully.');

      await loadGroups();
    } catch (error: any) {
      console.log('CREATE GROUP ERROR:', error);

      Alert.alert(
        'Error',
        error.message || 'Unable to create group.',
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back 👋
          </Text>

          <Text style={styles.title}>
            Expense Splitter
          </Text>

          <Text style={styles.subtitle}>
            Manage your shared expenses easily
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>₹</Text>
        </View>
      </View>

      {/* SUMMARY */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>
            YOUR GROUPS
          </Text>

          <Text style={styles.summaryNumber}>
            {groups.length}
          </Text>

          <Text style={styles.summaryText}>
            Active expense groups
          </Text>
        </View>

        <View style={styles.summaryCircle}>
          <Text style={styles.summaryCircleText}>
            ↗
          </Text>
        </View>
      </View>

      {/* CREATE BUTTON */}
      <TouchableOpacity
        style={styles.createButton}
        activeOpacity={0.85}
        onPress={() => setShowCreate(!showCreate)}>

        <View style={styles.plusCircle}>
          <Text style={styles.plusText}>
            {showCreate ? '×' : '+'}
          </Text>
        </View>

        <View style={styles.createButtonContent}>
          <Text style={styles.createButtonTitle}>
            {showCreate
              ? 'Close'
              : 'Create New Group'}
          </Text>

          <Text style={styles.createButtonSubtitle}>
            {showCreate
              ? 'Close group creation'
              : 'Start splitting expenses'}
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* CREATE FORM */}
      {showCreate && (
        <View style={styles.createCard}>
          <Text style={styles.formTitle}>
            Create a new group
          </Text>

          <Text style={styles.formSubtitle}>
            Give your group a name to get started.
          </Text>

          <Text style={styles.label}>
            GROUP NAME
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Goa Trip"
            placeholderTextColor="#9CA3AF"
            value={groupName}
            onChangeText={setGroupName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              creating && styles.disabledButton,
            ]}
            onPress={createGroup}
            disabled={creating}
            activeOpacity={0.85}>

            {creating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitText}>
                  Create Group
                </Text>

                <Text style={styles.submitArrow}>
                  →
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Your Groups
          </Text>

          <Text style={styles.sectionSubtitle}>
            {groups.length === 0
              ? 'No groups available'
              : `${groups.length} group${
                  groups.length > 1 ? 's' : ''
                }`}
          </Text>
        </View>
      </View>

      {/* LOADING */}
      {loading ? (
        <View style={styles.center}>
          <View style={styles.loaderCircle}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading your groups
          </Text>

          <Text style={styles.loadingText}>
            Please wait a moment...
          </Text>
        </View>
      ) : groups.length === 0 ? (
        /* EMPTY */
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              ₹
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            No groups yet
          </Text>

          <Text style={styles.emptyText}>
            Create your first group and start splitting
            expenses with friends.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowCreate(true)}
            activeOpacity={0.85}>
            <Text style={styles.emptyButtonText}>
              + Create Group
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* GROUP LIST */
        groups.map((group: any, index: number) => {
          const memberCount =
            group.members_count ??
            group.members?.length ??
            0;

          const firstLetter =
            group.name?.charAt(0)?.toUpperCase() || 'G';

          return (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('GroupDetails', {
                  groupId: group.id,
                  groupName: group.name,
                })
              }>

              {/* AVATAR */}
              <View
                style={[
                  styles.groupAvatar,
                  index % 3 === 1 &&
                    styles.avatarBlue,
                  index % 3 === 2 &&
                    styles.avatarGreen,
                ]}>
                <Text style={styles.avatarText}>
                  {firstLetter}
                </Text>
              </View>

              {/* GROUP INFO */}
              <View style={styles.groupInfo}>
                <Text
                  style={styles.groupName}
                  numberOfLines={1}>
                  {group.name}
                </Text>

                <View style={styles.memberRow}>
                  <View style={styles.peopleIcon}>
                    <Text
                      style={styles.peopleIconText}>
                      ••
                    </Text>
                  </View>

                  <Text style={styles.groupMembers}>
                    {memberCount} member
                    {memberCount !== 1
                      ? 's'
                      : ''}
                  </Text>
                </View>
              </View>

              {/* ARROW */}
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>
                  ›
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIconText: {
    fontSize: 23,
    fontWeight: '800',
    color: '#2563EB',
  },

  summaryCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 11,
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
    marginTop: 1,
  },

  summaryCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCircleText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },

  createButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  plusCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  plusText: {
    color: '#2563EB',
    fontSize: 27,
    fontWeight: '500',
  },

  createButtonContent: {
    flex: 1,
    marginLeft: 13,
  },

  createButtonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  createButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  chevron: {
    fontSize: 27,
    color: '#9CA3AF',
    marginRight: 5,
  },

  createCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  formTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  formSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#DDE2EA',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 14,
  },

  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  submitArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 8,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 3,
  },

  center: {
    alignItems: 'center',
    paddingVertical: 55,
  },

  loaderCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 14,
  },

  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },

  empty: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    color: '#2563EB',
    fontSize: 28,
    fontWeight: '800',
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  emptyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECF2',
  },

  groupAvatar: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarBlue: {
    backgroundColor: '#E0F2FE',
  },

  avatarGreen: {
    backgroundColor: '#DCFCE7',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },

  groupInfo: {
    flex: 1,
    marginLeft: 14,
  },

  groupName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  peopleIcon: {
    marginRight: 6,
  },

  peopleIconText: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: -1,
  },

  groupMembers: {
    fontSize: 12,
    color: '#6B7280',
  },

  cardArrow: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardArrowText: {
    fontSize: 23,
    color: '#6B7280',
    marginTop: -2,
  },

  bottomSpace: {
    height: 30,
  },
});