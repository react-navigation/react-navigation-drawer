import * as React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from '@react-navigation/native';
import TouchableItem from './TouchableItem';
import { Scene, Route } from '../types';

export type Props = {
  items: Route[];
  touchableType?: 'opacity' | 'highlight';
  activeItemKey?: string | null;
  activeTintColor?: string;
  activeBackgroundColor?: string;
  inactiveTintColor?: string;
  inactiveBackgroundColor?: string;
  getLabel: (scene: Scene) => React.ReactNode;
  renderIcon: (scene: Scene) => React.ReactNode;
  onItemPress: (scene: { route: Route; focused: boolean }) => void;
  itemsContainerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeLabelStyle?: TextStyle;
  inactiveLabelStyle?: TextStyle;
  iconContainerStyle?: ViewStyle;
  drawerPosition: 'left' | 'right';
};

/**
 * Component that renders the navigation list in the drawer.
 */
const DrawerNavigatorItems = ({
  items,
  touchableType,
  activeItemKey,
  activeTintColor,
  activeBackgroundColor,
  inactiveTintColor,
  inactiveBackgroundColor,
  getLabel,
  renderIcon,
  onItemPress,
  itemsContainerStyle,
  itemStyle,
  labelStyle,
  activeLabelStyle,
  inactiveLabelStyle,
  iconContainerStyle,
  drawerPosition,
}: Props) => (
  <View style={[styles.container, itemsContainerStyle]}>
    {items.map((route, index: number) => {
      const focused = activeItemKey === route.key;
      const color = focused ? activeTintColor : inactiveTintColor;
      const backgroundColor = focused
        ? activeBackgroundColor
        : inactiveBackgroundColor;
      const scene = { route, index, focused, tintColor: color };
      const icon = renderIcon(scene);
      const label = getLabel(scene);
      const accessibilityLabel = typeof label === 'string' ? label : undefined;
      const extraLabelStyle = focused ? activeLabelStyle : inactiveLabelStyle;
      return (
        <TouchableItem
          key={route.key}
          type={touchableType}
          activeBackgroundColor={activeBackgroundColor}
          accessible
          accessibilityLabel={accessibilityLabel}
          onPress={() => {
            onItemPress({ route, focused });
          }}
          delayPressIn={0}
        >
          <SafeAreaView
            style={[{ backgroundColor }, styles.item, itemStyle]}
            forceInset={{
              [drawerPosition]: 'always',
              [drawerPosition === 'left' ? 'right' : 'left']: 'never',
              vertical: 'never',
            }}
          >
            {icon ? (
              <View
                style={[
                  styles.icon,
                  focused ? null : styles.inactiveIcon,
                  iconContainerStyle,
                ]}
              >
                {icon}
              </View>
            ) : null}
            {typeof label === 'string' ? (
              <Text
                style={[styles.label, { color }, labelStyle, extraLabelStyle]}
              >
                {label}
              </Text>
            ) : (
              label
            )}
          </SafeAreaView>
        </TouchableItem>
      );
    })}
  </View>
);

/* Material design specs - https://material.io/guidelines/patterns/navigation-drawer.html#navigation-drawer-specs */
DrawerNavigatorItems.defaultProps = {
  touchableType: 'opacity',
  activeTintColor: '#2196f3',
  activeBackgroundColor: 'rgba(0, 0, 0, .04)',
  inactiveTintColor: 'rgba(0, 0, 0, .87)',
  inactiveBackgroundColor: 'transparent',
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 16,
    width: 24,
    alignItems: 'center',
  },
  inactiveIcon: {
    /*
     * Icons have 0.54 opacity according to guidelines
     * 100/87 * 54 ~= 62
     */
    opacity: 0.62,
  },
  label: {
    margin: 16,
    fontWeight: 'bold',
  },
});

export default DrawerNavigatorItems;
