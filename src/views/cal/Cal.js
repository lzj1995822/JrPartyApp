import React from 'react';
import { View, Text} from "react-native";
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
const THEME_COLOR = color.THEME_COLOR;

export default class Cal extends React.Component {

    render() {
        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        };
        let navigationBar = <NavigationBar linerGradient={true} title='数据统计' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <View>
                {navigationBar}
            </View>
        )
    }
}