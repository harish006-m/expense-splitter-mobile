import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {getSettlements} from '../services/api';

export default function SettlementScreen({route}: any) {
  const groupId = route?.params?.groupId;
  const groupName = route?.params?.groupName || 'Group';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getSettlements(groupId);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>

        <Text style={styles.loadingTitle}>
          Calculating settlement
        </Text>

        <Text style={styles.loadingText}>
          Finding the simplest way to settle balances...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>

        <Text style={styles.errorTitle}>
          Unable to load settlement
        </Text>

        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const settlements = data?.settlements || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Settlement</Text>

          <Text style={styles.group}>
            {groupName}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>₹</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryIconText}>
            {settlements.length > 0 ? '↗' : '✓'}
          </Text>
        </View>

        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>
            {settlements.length > 0
              ? 'PENDING TRANSACTIONS'
              : 'GROUP STATUS'}
          </Text>

          <Text style={styles.summaryTitle}>
            {settlements.length > 0
              ? `${settlements.length} payment${
                  settlements.length !== 1 ? 's' : ''
                }`
              : 'All Settled'}
          </Text>

          <Text style={styles.summarySubtitle}>
            {settlements.length > 0
              ? 'Required to settle all balances'
              : 'No pending payments'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.infoIcon}>
          <Text style={styles.infoIconText}>i</Text>
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Simplified Transactions
          </Text>

          <Text style={styles.infoText}>
            Minimum transactions required to settle all balances.
          </Text>
        </View>
      </View>

      {/* Section */}
      {settlements.length > 0 && (
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Payments
            </Text>

            <Text style={styles.sectionSubtitle}>
              Who needs to pay whom
            </Text>
          </View>
        </View>
      )}

      {/* Settlements */}
      {settlements.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>✓</Text>
          </View>

          <Text style={styles.emptyTitle}>
            All Settled 🎉
          </Text>

          <Text style={styles.emptyText}>
            Everyone is settled up. No pending payments are required.
          </Text>
        </View>
      ) : (
        settlements.map((item: any, index: number) => (
          <View key={index} style={styles.card}>

            {/* From */}
            <View style={styles.personBlock}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.from?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>

              <View style={styles.personInfo}>
                <Text style={styles.personLabel}>
                  PAYS
                </Text>

                <Text
                  style={styles.person}
                  numberOfLines={1}>
                  {item.from}
                </Text>
              </View>
            </View>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <View style={styles.line} />

              <View style={styles.arrowCircle}>
                <Text style={styles.arrow}>
                  →
                </Text>
              </View>

              <View style={styles.line} />
            </View>

            {/* To */}
            <View style={styles.personBlock}>
              <View style={[styles.avatar, styles.toAvatar]}>
                <Text style={[styles.avatarText, styles.toAvatarText]}>
                  {item.to?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>

              <View style={styles.personInfo}>
                <Text style={styles.personLabel}>
                  RECEIVES
                </Text>

                <Text
                  style={styles.person}
                  numberOfLines={1}>
                  {item.to}
                </Text>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>
                AMOUNT
              </Text>

              <Text style={styles.money}>
                ₹{Number(item.amount).toFixed(0)}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Success */}
      {settlements.length > 0 && (
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>
              ✓
            </Text>
          </View>

          <View style={styles.successContent}>
            <Text style={styles.successTitle}>
              Settlement calculated
            </Text>

            <Text style={styles.successText}>
              These transactions represent the simplest way to settle
              the group's current balances.
            </Text>
          </View>
        </View>
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

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  group: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIconText: {
    color: '#2563EB',
    fontSize: 24,
    fontWeight: '800',
  },

  /* Summary */

  summaryCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },

  summaryIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryIconText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  summaryInfo: {
    flex: 1,
    marginLeft: 15,
  },

  summaryLabel: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 2,
  },

  summarySubtitle: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 3,
  },

  /* Info */

  info: {
    backgroundColor: '#EEF5FF',
    padding: 15,
    borderRadius: 17,
    marginBottom: 22,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9E8FF',
  },

  infoIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: '#DCEAFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoIconText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '900',
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },

  infoText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  /* Section */

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

  /* Settlement Card */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },

  personBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '800',
  },

  toAvatar: {
    backgroundColor: '#DCFCE7',
  },

  toAvatarText: {
    color: '#16A34A',
  },

  personInfo: {
    marginLeft: 11,
  },

  personLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },

  person: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
    maxWidth: 150,
  },

  /* Arrow */

  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 3,
  },

  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#E5E7EB',
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 9,
  },

  arrow: {
    color: '#2563EB',
    fontSize: 19,
    fontWeight: '800',
  },

  /* Amount */

  amountBox: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amountLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  money: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16A34A',
  },

  /* Empty */

  empty: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EAF0',
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    color: '#16A34A',
    fontSize: 31,
    fontWeight: '900',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 7,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
  },

  /* Success */

  success: {
    backgroundColor: '#ECFDF5',
    padding: 15,
    borderRadius: 17,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  successIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successIconText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '900',
  },

  successContent: {
    flex: 1,
    marginLeft: 10,
  },

  successTitle: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '800',
  },

  successText: {
    color: '#4B7A5A',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  /* Loading */

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#F6F8FC',
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    marginTop: 16,
    color: '#374151',
    fontSize: 17,
    fontWeight: '800',
  },

  loadingText: {
    marginTop: 5,
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },

  /* Error */

  errorIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  errorIconText: {
    color: '#DC2626',
    fontSize: 29,
    fontWeight: '900',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 13,
  },

  bottomSpace: {
    height: 30,
  },
});