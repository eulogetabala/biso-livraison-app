import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fonts } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

const DATA: OnboardingItem[] = [
  {
    id: '1',
    title: 'Découvrez les meilleurs restaurants',
    description: 'Une grande variété de cuisines locales livrées directement à votre porte.',
    imageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1',
  },
  {
    id: '2',
    title: 'Commande facile & rapide',
    description: 'Sélectionnez vos plats préférés en quelques secondes et validez votre commande.',
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2',
  },
  {
    id: '3',
    title: 'Livraison ultra-rapide',
    description: 'Suivez votre livreur en temps réel et dégustez votre repas encore chaud.',
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3',
  },
];

const CIRCLE_CONFIGS = [
  { size: 120, top: '12%', left: '-8%', delay: 0 },
  { size: 80, top: '35%', right: '-6%', delay: 300 },
  { size: 60, bottom: '25%', left: '5%', delay: 600 },
  { size: 100, bottom: '10%', right: '-4%', delay: 900 },
];

function FloatingCircle({ size, delay, ...pos }: any) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.15, 0.08] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          opacity,
          transform: [{ translateY }],
          ...pos,
        },
      ]}
    />
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const titleAnims = useRef(DATA.map(() => new Animated.Value(0))).current;
  const skipOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(titleAnims[currentIndex], {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    titleAnims.forEach((a, i) => {
      if (i !== currentIndex) a.setValue(0);
    });

    Animated.timing(skipOpacity, {
      toValue: currentIndex < DATA.length - 1 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('biso_has_seen_onboarding', 'true');
        navigation.replace('Login');
      } catch (err) {
        navigation.replace('Login');
      }
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await AsyncStorage.setItem('biso_has_seen_onboarding', 'true');
      navigation.replace('Login');
    } catch (err) {
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const imageTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [40, 0, -40],
      extrapolate: 'clamp',
    });

    const imageScale = scrollX.interpolate({
      inputRange,
      outputRange: [1.1, 1, 1.1],
      extrapolate: 'clamp',
    });

    const titleScale = titleAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 1],
    });

    const titleOpacity = titleAnims[index];

    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: item.imageUrl }}
            style={[
              styles.heroImage,
              {
                transform: [
                  { translateY: imageTranslateY },
                  { scale: imageScale },
                ],
              },
            ]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
            pointerEvents="none"
          />
        </View>

        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.slideTitle,
              { opacity: titleOpacity, transform: [{ scale: titleScale }] },
            ]}
          >
            {item.title}
          </Animated.Text>
          <Text style={styles.slideDesc}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const progressWidth = scrollX.interpolate({
    inputRange: [0, (DATA.length - 1) * width],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {CIRCLE_CONFIGS.map((cfg, i) => (
        <FloatingCircle key={i} {...cfg} />
      ))}

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>

      {/* Skip button */}
      <Animated.View style={[styles.skipContainer, { opacity: skipOpacity }]}>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </Animated.View>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        scrollEventThrottle={16}
      />

      {/* Bottom button */}
      <View style={styles.footer}>
        <Pressable onPress={handleNext} style={styles.btnWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === DATA.length - 1 ? 'Commencer' : 'Continuer'}
            </Text>
            <Ionicons
              name={currentIndex === DATA.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
              size={20}
              color="#ffffff"
              style={styles.nextBtnIcon}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 54,
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  skipContainer: {
    position: 'absolute',
    top: 68,
    right: spacing.xl,
    zIndex: 10,
  },
  skipText: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: fonts.titleSemiBold,
  },
  slide: {
    width,
    height: height,
  },
  imageContainer: {
    flex: 0.65,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFill,
    top: '50%',
  },
  textContainer: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideTitle: {
    fontSize: 26,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: fonts.titleBold,
  },
  slideDesc: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 23,
    fontFamily: fonts.bodyMedium,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: spacing.xl,
    right: spacing.xl,
  },
  btnWrapper: {
    borderRadius: radius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  nextBtn: {
    flexDirection: 'row',
    height: 58,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: fonts.titleBold,
  },
  nextBtnIcon: {
    marginLeft: 10,
  },
});
