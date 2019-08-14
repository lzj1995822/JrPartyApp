import React from "react";
import {View, Text, Image} from 'react-native';

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');
export default class  ProgressSummary extends React.Component {
    render() {
        return(
            <View>
                <Image source={require('../../static/img/developing.png')} style={{marginLeft:width/2-126,width:252,height:335,marginTop:height/2-168-30}}/>
            </View>);
    }
}