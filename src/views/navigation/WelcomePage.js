import React from 'react';
import {View, Text, Image,Dimensions} from "react-native";
import ActualParam from '../utils/ScreenUtils';

console.log(ActualParam);
export default class WelcomePage extends React.Component {
    componentDidMount() {
        this.timer = setTimeout(() => {
            const { navigation } = this.props;
            navigation.navigate("Login");
            clearTimeout(this.timer);
        }, 5000)
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
        let realHeight = width/bl1;
        let images = {
            hdpi: require('../../static/drawable-hdpi/guide.png'),
            xhdpi: require('../../static/drawable-xhdpi/guide.png'),
            xxhdpi: require('../../static/drawable-xxhdpi/guide.png'),
            xxxhdpi: require('../../static/drawable-xxxhdpi/guide.png'),
        }
        let retaio = 750 / 1344;
        console.log(width,height,width/height, 564/1002)
        let path = `../../static/drawable-${ActualParam.actualType}/guide.png`;
        if (ActualParam.isIPhoneX) {
            return (
                <View>
                    <Image resizeMode='stretch' source={require('../../static/iPhoneX/guideX.png')} style={{width: width, height: height}} />
                </View>
            )
        } else {
            return (
                <View>
                    <Image resizeMode='stretch' source={images[ActualParam.actualType]} style={{width: width, height: height}} />
                </View>
            )
        }
    }
}
