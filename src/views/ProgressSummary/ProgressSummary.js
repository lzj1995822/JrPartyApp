import React from "react";
import {View, Text, Image, Platform, BackHandler} from 'react-native';
import NavigationUtils from "../navigation/NavigationUtils";

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');
export default class  ProgressSummary extends React.Component {
    constructor(props) {
        super(props);
        this.backForAndroid.bind(this)
    }
    componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                return this.backForAndroid(NavigationUtils.navigation)});
        }
    }
    backForAndroid(navigator) {
        navigator.navigate('Main');
        return true;
    }
    render() {
        return(
            <View>
                <Image source={require('../../static/img/developing.png')} style={{width:width,height:height-100}}/>
            </View>);
    }
}
