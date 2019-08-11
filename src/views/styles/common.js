import {StyleSheet} from "react-native";
import { isIphoneX } from '../utils';

const style = StyleSheet.create({
    header: {
        fontSize: 22,
        textAlign: 'center',
        color: '#fff',
        paddingTop: isIphoneX() ? 45 : 10,
        paddingBottom: 10,
        fontWeight: '400',
        backgroundColor: 'transparent',
        height: isIphoneX() ? 80 : 40,

    }

});
export default style;