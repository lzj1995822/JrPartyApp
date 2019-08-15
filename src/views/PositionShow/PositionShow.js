import React from "react";
import {View, Text, Image, ImageBackground, Platform, BackHandler} from 'react-native';

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');
export default class  PositionShow extends React.Component {
    componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {return this.backForAndroid(this.props.navigation.navigate("Main"))});
        }
    }
    render() {
        return(
        <View>
            <Image source={require('../../static/img/developing.png')} style={{width:width,height:height-100}}/>
        </View>
        );
    }1
}
