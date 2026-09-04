import type { RootStackParamList } from '../navigation/types';

type BannerNav = {
  navigate: <RouteName extends keyof RootStackParamList>(
    ...args: undefined extends RootStackParamList[RouteName]
      ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
      : [screen: RouteName, params: RootStackParamList[RouteName]]
  ) => void;
};

export function navigateFromBanner(
  navigation: BannerNav,
  linkType: string,
  linkValue?: string | null,
) {
  switch (linkType) {
    case 'RESTAURANTS':
      navigation.navigate('Restaurants');
      break;
    case 'PRODUCTS':
      navigation.navigate('Products');
      break;
    case 'PARCEL':
      navigation.navigate('Parcel');
      break;
    case 'URL':
      if (linkValue) {
        // Deep links / URLs externes — navigation interne si route reconnue
        if (linkValue.startsWith('restaurant:')) {
          const id = linkValue.replace('restaurant:', '');
          navigation.navigate('Restaurant', { id, name: 'Restaurant' });
          break;
        }
      }
      break;
    default:
      navigation.navigate('Restaurants');
  }
}
