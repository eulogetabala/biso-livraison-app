import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = {
  isOpen: boolean;
  compact?: boolean;
};

export default function OpenClosedBadge({ isOpen, compact }: Props) {
  return (
    <View style={[styles.badge, isOpen ? styles.open : styles.closed, compact && styles.compact]}>
      <View style={[styles.dot, isOpen ? styles.dotOpen : styles.dotClosed]} />
      <Text style={[styles.label, isOpen ? styles.labelOpen : styles.labelClosed]}>
        {isOpen ? 'Ouvert' : 'Fermé'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  open: {
    backgroundColor: '#DCFCE7',
  },
  closed: {
    backgroundColor: '#FEE2E2',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: '#16A34A',
  },
  dotClosed: {
    backgroundColor: '#DC2626',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  labelOpen: {
    color: '#15803D',
  },
  labelClosed: {
    color: '#B91C1C',
  },
});
