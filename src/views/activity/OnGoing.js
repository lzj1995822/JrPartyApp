import React from 'react';
import {View, Text, Image, Platform, BackHandler} from "react-native";
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
const THEME_COLOR = color.THEME_COLOR;

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');
export default class  OnGoing extends React.Component {
    componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {return this.backForAndroid(this.props.navigation.navigate("Main"))});
        }
    }
    render() {
        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        };
        let navigationBar = <NavigationBar linerGradient={true} title='台账' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <View>
                {navigationBar}
                <Image source={require('../../static/img/developing.png')} style={{width:width,height:height-100}}/>
            </View>
        )
    }
}
