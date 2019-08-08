import React from 'react';
import WelcomePage from './navigation/WelcomePage';
import HomePage from './navigation/HomePage';

import {
    createAppContainer,
    createSwitchNavigator,
    createStackNavigator,
    createBottomTabNavigator
} from 'react-navigation';
import Mine from "./user/Mine";
import Activity from './activity/Activity';
import ScoreRank from './score/ScoreRank';
import Login from './Login';
import Cal from './cal/Cal';
import {TouchableOpacity, View} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

import NavigationUtils from './navigation/NavigationUtils';
import colors from '../styles/color';
import NavigationBar from "./navigation/NavigationBar";

const THEME_COLOR = colors.THEME_COLOR;

const welcome = createStackNavigator({
    WelcomePage: {
        screen: WelcomePage,
        navigationOptions: {
            header: null
        }
    }
},{
    initialRouteName: 'WelcomePage',
    //默认导航配置
    defaultNavigationOptions: {

    }
});

const stack = createStackNavigator({
    Activity: {
        screen: Activity,
        navigationOptions: ({ navigation }) => ({
            headerTitle: '活动管理',
        })
    },
    ScoreRank: {
        screen: ScoreRank,
        navigationOptions: ({ navigation }) => ({
            headerTitle: '积分排名',
        })
    },
    Login: {
        screen: Login,
        navigationOptions: {
            header: null
        }
    }
},{
    //默认导航配置
    defaultNavigationOptions: ({ navigation }) => {
        let statusBar = {
            backgroundColor: colors.THEME_COLOR,
            barStyle: 'light-content'
        };
        let title = '活动管理';
        let routeName = navigation.state.routeName;
        switch (routeName) {
            case 'Activity':
                title = '活动管理';
                break;
            case 'ScoreRank':
                title = '积分排名';
                break;
            default:
                title = '未匹配到路由'
        }
        let leftButton = <TouchableOpacity onPress={() => {navigation.navigate('Main')}}>
                            <AntDesign name='left' size={26} style={{color: 'white'}} />
                        </TouchableOpacity>;
        let navigationBar = <NavigationBar leftButton={leftButton} linerGradient={true} title={title} statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        if (routeName === 'Login') {
            navigationBar = null;
        }
        return {
            header: (
                navigationBar
            )
        }
    }
});

const tab = createBottomTabNavigator({
    HomePage: {
        screen: HomePage,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: "首页",
        })
    },
    Calendar: {
        screen: HomePage,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: "台账"
        })
    },
    Cal: {
        screen: Cal,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: "统计"
        })
    },
    Mine: {
        screen: Mine,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: "我的"
        })
    }
},{
    defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused }) => {
            const { routeName } = navigation.state;
            let iconSource;
            switch (routeName) {
                case 'HomePage':
                    iconSource = 'home';
                    break;
                case 'Calendar':
                    iconSource = 'calendar';
                    break;
                case 'Cal':
                    iconSource = 'linechart';
                    break;
                case 'Mine':
                    iconSource = 'user';
                    break;
            }
            return (
                <View>
                    <AntDesign
                        size={26}
                        name={iconSource}
                        style={{color: focused ? '#409eff' : 'grey'}}
                    />
                </View>
            );
        },

    })
});

export default createAppContainer(createSwitchNavigator({
    Welcome: welcome,
    Init: stack,
    Main: tab,
}, {
    initialRouteName: 'Welcome',
    defaultNavigationOptions: {
        header: null
    }
}))
