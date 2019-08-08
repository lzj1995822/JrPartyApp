import React from 'react';
import {View, Text, Image,Dimensions} from "react-native";

export default class WelcomePage extends React.Component {
    componentDidMount() {
        this.timer = setTimeout(() => {
            const { navigation } = this.props;
            navigation.navigate("Login");
            clearTimeout(this.timer);
        }, 1000)
    }
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer)
    }
    render() {
        const designWidth = 1500
        const designHeight = 2668
        const width = Dimensions.get('window').width;
        const height = Dimensions.get('window').height;
        let bl1 = designWidth/designHeight
        let realHeight = width/bl1
        return (
            <View>
                <Image source={require('../../static/drawable-xxxhdpi/引导页.png')} style={{height:realHeight,width:width}}/>
            </View>
        )
    }
}
