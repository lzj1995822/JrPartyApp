import React from 'react';
import ActingActivity from './ActingActivity';
import PlanningActivity from './PlanningActivity';
import { createMaterialTopTabNavigator } from 'react-navigation';

let activityTopBar = createMaterialTopTabNavigator({
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
});
export default activityTopBar;