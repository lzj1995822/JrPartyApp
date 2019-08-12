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
import Cal from './cal/Cal';
import {TouchableOpacity, View} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

import NavigationUtils from './navigation/NavigationUtils';
import colors from '../styles/color';
import NavigationBar from "./navigation/NavigationBar";
import CameraScreen from "../components/CameraScreen";
import OnGoing from './activity/OnGoing';

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

const tab = createBottomTabNavigator({
    HomePage: {
        screen: HomePage,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: "首页",
        })
    },
    Calendar: {
        screen: OnGoing,
        navigationOptions: ({ navigation }) => ({
            tabBarLabel: "台账"
        })
    },
    Cal: {
        screen: OnGoing,
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
