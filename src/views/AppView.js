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
import ProgressSummary from './ProgressSummary/ProgressSummary';
import PositionShow from './PositionShow/PositionShow';
import Information from './information/Information';
import Login from './Login';
import {TouchableOpacity, View} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

import NavigationUtils from './navigation/NavigationUtils';
import colors from '../styles/color';
import NavigationBar from "./navigation/NavigationBar";
import CameraScreen from "../components/CameraScreen";
import OnGoing from './activity/OnGoing';
import Cal from './cal/Cal'

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
    Camera: {
        screen: CameraScreen,
        navigationOptions: {
            header: null
        }
    },
    PositionShow:{
        screen: PositionShow,
        navigationOptions: ({ navigation }) => ({
            headerTitle: '阵地展示',
        })
    },
    ProgressSummary:{
        screen: ProgressSummary,
        navigationOptions: ({ navigation }) => ({
            headerTitle: '进度汇总',
        })
    },
    Information: {
        screen: Information,
        navigationOptions: ({ navigation }) => ({
            headerTitle: '通知公告',
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
    },
    Main: {
        screen: Mine,
        navigationOptions: {
            header: null
        }
    }
},{
    //默认导航配置
    defaultNavigationOptions: ({ navigation }) => {
        NavigationUtils.navigation = navigation;
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
            case 'PositionShow':
                title = '阵地展示';
                break;
            case 'ProgressSummary':
                title = '进度汇总';
                break;
            case 'Information':
                title = '通知公告';
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

export default createAppContainer(createSwitchNavigator({
    Welcome: welcome,
    Init: stack,
}, {
    initialRouteName: 'Welcome',
    defaultNavigationOptions: {
        header: null
    }
}))
