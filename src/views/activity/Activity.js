import React from 'react';
import ActingActivity from './ActingActivity';
import PlanningActivity from './PlanningActivity';
import ActivityReview from './ActivityReview';
import { createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';
import {store} from "../../redux/store";
import {BackHandler, DeviceEventEmitter, Platform} from "react-native";
import NavigationUtils from "../navigation/NavigationUtils";

export default class Activity extends React.Component {

    constructor() {
        super();
        this.generateTopBar.bind(this);
        this.backForAndroid.bind(this)
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            return this.backForAndroid(NavigationUtils.navigation)
        });
    }
    backForAndroid(navigator) {
        navigator.navigate('Main');
        return true;
    }

    generateTopBar() {
        let user = store.getState().user.value;
        if (user.roleCode === 'TOWN_REVIEWER') {
            return createMaterialTopTabNavigator({
                ActivityReview: {
                    screen: ActivityReview,
                    navigationOptions: {
                        title: '待审核'
                    }
                },
                ActingActivity: {
                    screen: ActingActivity,
                    navigationOptions: {
                        title: '进行中'
                    }
                },
                PlanningActivity: {
                    screen: PlanningActivity,
                    navigationOptions: {
                        title: '计划中'
                    }
                }
            },{
                initialRouteName: 'ActivityReview'
            });
        } else {
            return createMaterialTopTabNavigator({
                ActingActivity: {
                    screen: ActingActivity,
                    navigationOptions: {
                        title: '进行中'
                    }
                },
                PlanningActivity: {
                    screen: PlanningActivity,
                    navigationOptions: {
                        title: '计划中'
                    }
                }
            },{
                initialRouteName: 'ActingActivity'
            });
        }
    }


    render() {
        console.log("render")
        return React.createElement(createAppContainer(this.generateTopBar()));
    }
}
