import React from 'react';
import { PropTypes } from 'prop-types';
import { ViewPropTypes, Text, View, StatusBar, StyleSheet, Platform, DeviceInfo, Dimensions} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import color from '../styles/color';
const NAV_BAR_ANDROID_HEIGHT = 50;
const NAV_BAR_IOS_HEIGHT = 44;
const STATUS_BAR_HEIGHT = DeviceInfo.isIPhoneX_deprecated ? 30 : 0;
const StatusBarShape = {
    barStyle: PropTypes.oneOf(['light-content', 'default']),
    hidden: PropTypes.bool,
    backgroundColor: PropTypes.string
};
const sacle = Dimensions.get('window').width < 750;
export default class NavigationBar extends  React.Component{

    static propTypes = {
        style: ViewPropTypes.style,
        title: PropTypes.string,
        titleView: PropTypes.element,
        titleLayoutStyle: ViewPropTypes.style,
        hide: PropTypes.bool,
        statusBar: PropTypes.shape(StatusBarShape),
        rightButton: PropTypes.element,
        leftButton: PropTypes.element,
        linerGradient: PropTypes.bool,
        colors: PropTypes.array
    };

    static defaultProps = {
        statusBar: {
            barStyle: 'light-content',
            hidden: false
        }
    };

    render() {
        let statusBar = !this.props.statusBar.hidden ?
          <View style={styles.statusBar}>
              <StatusBar {...this.props.statusBar} />
          </View> : null;
        let titleView = this.props.titleView || <Text ellipsizeMode="head" numberOfLines={1} style={styles.title}>{this.props.title}</Text>
        let content = this.props.hide ? null :
          <View style={styles.navBar}>
              {this.getButtonElement(this.props.leftButton)}
              <View sytle={[styles.navBarTitleContainer, this.props.titleLayoutStyle]}>
                  {titleView}
              </View>
              {this.getButtonElement(this.props.rightButton)}
          </View>
        if (this.props.linerGradient) {
            return (
              <LinearGradient colors={this.props.colors || color.headerColors} locations={[ 0.1, 0.7, 1 ]} start={{ x : 0.0, y : 1.0 }} end={{ x : 1.0, y : 1.0 }}>
                {statusBar}
                {content}
            </LinearGradient>
            )
        }
        return (
          <View style={[styles.container, this.props.style]}>
              {statusBar}
              {content}
          </View>
        );
    }

    getButtonElement(data) {
        return (
          <View style={styles.navBarButton}>
              {data || null}
          </View>
        )
    }

}
const styles = StyleSheet.create({
    container: {
        backgroundColor: color.THEME_COLOR
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: Platform.OS === 'ios' ? NAV_BAR_IOS_HEIGHT : NAV_BAR_ANDROID_HEIGHT
    },
    navBarTitleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 40,
        right: 40,
        top: 0,
        bottom: 0
    },
    navBarButton: {
        alignItems: 'center',
        width: 55,
        overflow: 'hidden'
    },
    title: {
        fontSize: 18,
        color: 'white'
    },
    statusBar: {
        // 安卓系统保留了状态栏的高度
        height: Platform.OS === 'ios' ? STATUS_BAR_HEIGHT : 0
    }
})