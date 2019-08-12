import React from "react";
import {View, Text, Image} from 'react-native';

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');
export default class  OnGoing extends React.Component {
    render() {
        return(
            <View>
                <Image source={require('../../static/img/developing.png')} style={{marginLeft:width/2-88,width:177,height:236,marginTop:height/2-128}}/>
            </View>);
    }
}