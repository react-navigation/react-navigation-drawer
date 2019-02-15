import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { SceneView } from "@react-navigation/core";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { ScreenContainer } from "react-native-screens";

import DrawerActions from "../routers/DrawerActions";
import DrawerSidebar from "./DrawerSidebar";
import DrawerGestureContext from "../utils/DrawerGestureContext";
import ResourceSavingScene from "../views/ResourceSavingScene";

/**
 * Component that renders the drawer.
 */
export default class DrawerView extends React.PureComponent {
  static defaultProps = {
    lazy: true
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { index } = nextProps.navigation.state;

    return {
      // Set the current tab to be loaded if it was not loaded before
      loaded: prevState.loaded.includes(index) ? prevState.loaded : [...prevState.loaded, index]
    };
  }

  state = {
    loaded: [this.props.navigation.state.index],
    drawerWidth:
      typeof this.props.navigationConfig.drawerWidth === "function"
        ? this.props.navigationConfig.drawerWidth()
        : this.props.navigationConfig.drawerWidth
  };

  componentDidMount() {
    Dimensions.addEventListener("change", this._updateWidth);
  }

  componentDidUpdate(prevProps) {
    const { openId, closeId, toggleId, isDrawerOpen } = this.props.navigation.state;
    const { openId: prevOpenId, closeId: prevCloseId, toggleId: prevToggleId } = prevProps.navigation.state;

    let prevIds = [prevOpenId, prevCloseId, prevToggleId];
    let changedIds = [openId, closeId, toggleId].filter(id => !prevIds.includes(id)).sort((a, b) => a > b);

    changedIds.forEach(id => {
      if (id === openId) {
        this._drawer.openDrawer();
      } else if (id === closeId) {
        this._drawer.closeDrawer();
      } else if (id === toggleId) {
        if (isDrawerOpen) {
          this._drawer.closeDrawer();
        } else {
          this._drawer.openDrawer();
        }
      }
    });
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this._updateWidth);
  }

  drawerGestureRef = React.createRef();

  _handleDrawerStateChange = (newState, willShow) => {
    if (newState === "Idle") {
      if (!this.props.navigation.state.isDrawerIdle) {
        this.props.navigation.dispatch({
          type: DrawerActions.MARK_DRAWER_IDLE,
          key: this.props.navigation.state.key
        });
      }
    } else if (newState === "Settling") {
      this.props.navigation.dispatch({
        type: DrawerActions.MARK_DRAWER_SETTLING,
        key: this.props.navigation.state.key,
        willShow
      });
    } else {
      if (this.props.navigation.state.isDrawerIdle) {
        this.props.navigation.dispatch({
          type: DrawerActions.MARK_DRAWER_ACTIVE,
          key: this.props.navigation.state.key
        });
      }
    }
  };

  _handleDrawerOpen = () => {
    this.props.navigation.dispatch({
      type: DrawerActions.DRAWER_OPENED,
      key: this.props.navigation.state.key
    });
  };

  _handleDrawerClose = () => {
    this.props.navigation.dispatch({
      type: DrawerActions.DRAWER_CLOSED,
      key: this.props.navigation.state.key
    });
  };

  _updateWidth = () => {
    const drawerWidth =
      typeof this.props.navigationConfig.drawerWidth === "function"
        ? this.props.navigationConfig.drawerWidth()
        : this.props.navigationConfig.drawerWidth;

    if (this.state.drawerWidth !== drawerWidth) {
      this.setState({ drawerWidth });
    }
  };

  _renderNavigationView = () => (
    <DrawerGestureContext.Provider value={this.drawerGestureRef}>
      <DrawerSidebar
        screenProps={this.props.screenProps}
        navigation={this.props.navigation}
        descriptors={this.props.descriptors}
        contentComponent={this.props.navigationConfig.contentComponent}
        contentOptions={this.props.navigationConfig.contentOptions}
        drawerPosition={this.props.navigationConfig.drawerPosition}
        style={this.props.navigationConfig.style}
        {...this.props.navigationConfig}
      />
    </DrawerGestureContext.Provider>
  );

  _renderContent = descriptor =>
    this.props.navigationConfig.unmountInactiveRoutes ? (
      <SceneView
        navigation={descriptor.navigation}
        screenProps={this.props.screenProps}
        component={descriptor.getComponent()}
      />
    ) : (
      <ScreenContainer style={styles.pages}>
        {this.props.navigation.state.routes.map(
          (route, index) =>
            (!this.props.lazy || this.state.loaded.includes(index)) && (
              <ResourceSavingScene
                key={route.key}
                style={[StyleSheet.absoluteFill, { opacity: this.props.navigation.state.index === index ? 1 : 0 }]}
                isVisible={this.props.navigation.state.index === index}
              >
                <SceneView
                  navigation={this.props.descriptors[route.key].navigation}
                  screenProps={this.props.screenProps}
                  component={this.props.descriptors[route.key].getComponent()}
                />
              </ResourceSavingScene>
            )
        )}
      </ScreenContainer>
    );

  _setDrawerGestureRef = ref => {
    this.drawerGestureRef.current = ref;
  };

  render = () => (
    <DrawerLayout
      ref={c => {
        this._drawer = c;
      }}
      onGestureRef={this._setDrawerGestureRef}
      drawerLockMode={
        this.props.descriptors[this.props.navigation.state.routes[this.props.navigation.state.index].key].options ||
        (this.props.screenProps && this.props.screenProps.drawerLockMode) ||
        this.props.navigationConfig.drawerLockMode
      }
      drawerBackgroundColor={this.props.navigationConfig.drawerBackgroundColor}
      keyboardDismissMode={this.props.navigationConfig.keyboardDismissMode}
      drawerWidth={this.state.drawerWidth}
      onDrawerOpen={this._handleDrawerOpen}
      onDrawerClose={this._handleDrawerClose}
      onDrawerStateChanged={this._handleDrawerStateChange}
      useNativeAnimations={this.props.navigationConfig.useNativeAnimations}
      renderNavigationView={this._renderNavigationView}
      drawerPosition={
        this.props.navigationConfig.drawerPosition === "right"
          ? DrawerLayout.positions.Right
          : DrawerLayout.positions.Left
      }
      /* props specific to react-native-gesture-handler/DrawerLayout */
      drawerType={this.props.navigationConfig.drawerType}
      edgeWidth={this.props.navigationConfig.edgeWidth}
      hideStatusBar={this.props.navigationConfig.hideStatusBar}
      statusBarAnimation={this.props.navigationConfig.statusBarAnimation}
      minSwipeDistance={this.props.navigationConfig.minSwipeDistance}
      overlayColor={this.props.navigationConfig.overlayColor}
      contentContainerStyle={this.props.navigationConfig.contentContainerStyle}
    >
      <DrawerGestureContext.Provider value={this.drawerGestureRef}>
        {this._renderContent(
          this.props.descriptors[this.props.navigation.state.routes[this.props.navigation.state.index].key]
        )}
      </DrawerGestureContext.Provider>
    </DrawerLayout>
  );
}

const styles = StyleSheet.create({
  pages: {
    flex: 1
  }
});
