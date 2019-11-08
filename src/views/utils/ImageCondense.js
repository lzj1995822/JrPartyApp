import ImageResizer from "react-native-image-resizer";
import {Alert} from "react-native";

export default (file) => {
    let ratio = file.width/750;
    return ImageResizer.createResizedImage(file.uri, 750, file.height/ratio, 'JPEG', 70)
        .catch(e => {
        Alert.alert(
            '提示',
            '图片压缩失败，请重新拍取照片',
            [
                {
                    text: '确认', onPress: () => {}
                },
            ],
        )
    })
}
