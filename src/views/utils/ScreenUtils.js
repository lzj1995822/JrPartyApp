import { PixelRatio } from 'react-native';

const MDPI_RATIO = 1;
const HDPI_RATIO = 1.5;
const XHDPI_RATIO = 2;
const XXHDPI_RATIO = 3;
const XXXHDPI_RATIO = 3.5;

/*
    实际运行机器的DPI倍数
    mdpi 安卓 160dpi 倍数为1
    hdpi 安卓 240dpi 倍数1.5
    xhdpi 安卓 320dpi 苹果4 5 6 倍数2
    xxhdpi 安卓 480dpi 苹果 6p 倍数3
    xxxhdpi 安卓 倍数3.5
*/
const actualDpiRatio = PixelRatio.get();
console.log(actualDpiRatio, '实际dpi');

/*对应dpi倍数的code，用于适配不同的图片*/
let actualType;

switch (actualDpiRatio) {
    case MDPI_RATIO:
        actualType = 'mdpi';
        break;
    case HDPI_RATIO:
        actualType = 'hdpi';
        break;
    case XHDPI_RATIO:
        actualType = 'xhdpi';
        break;
    case XXHDPI_RATIO:
        actualType = 'xxhdpi';
        break;
    case XXXHDPI_RATIO:
        actualType = 'xxxhdpi';
        break;
    default:
        actualType = 'xhdpi';
}
function getNearestRatioType() {
    let distanceArray = [actualDpiRatio - MDPI_RATIO, actualDpiRatio - HDPI_RATIO, actualDpiRatio - XHDPI_RATIO,
        actualDpiRatio - XXHDPI_RATIO, actualDpiRatio - XXXHDPI_RATIO];
    let map = new Map([[0,'mdpi'],[1,'hdpi'],[2,'xhdpi'],[3,'xxhdpi'],[4, 'xxxhdpi']]);

    let min = Math.abs(actualDpiRatio - MDPI_RATIO);
    let minIndex = 0;
    for (let i = 1; i <= distanceArray.length; i++) {
        let temp = Math.abs(distanceArray[i]);
        if (temp < min) {
            min = temp;
            minIndex = i;
        }
    }
    return map.get(minIndex);
}
export default {
    actualDpiRatio,
    actualType,
    nearestType: getNearestRatioType()
}