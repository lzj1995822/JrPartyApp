import { store } from './redux/store';
import { Alert } from 'react-native';
import imageCondense from './views/utils/ImageCondense';

export const api = 'http://122.97.218.162:21018/';
const commonApiUrl = 'http://122.97.218.162:21018/api/';
// const commonApiUrl = 'http://172.16.1.92:8762/api/';
// export const api = 'http://172.16.1.92:8762/';

const HTTP_STATUS_CODE = {
    SUCCESS: 200,
    UNAUTHORIZATION: 401,
    FAILED: 500
}
const DEFAULT_FILE_SERVER = 'http://122.97.218.162:18087';
export const $http = (url, method, params) => {

    url = commonApiUrl + url;
    let token = store.getState().token.value;
    let config = {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'authorization': token
        }
    }
    if (method === 'POST' || method === 'PUT') {
        if (!params) {
            return;
        }
        config.body= JSON.stringify(params)
    }

    return fetch(url, config).then((res) => {
        return res.json();
    }).then((resp) => {
        if (resp.code !== HTTP_STATUS_CODE.SUCCESS) {
            Alert.alert('提示', '请求失败!', [{text: '确认', onPress: () => {}}])
            return false;
        }
        return resp.content;
    }).catch( error => {
        Alert.alert('提示', '请求失败!', [{text: '确认', onPress: () => {}}])
    })
}

export const $imgUpload = (file) => {
    return imageCondense(file).then(res => {
        return fileUpload(res)
    })
}

// 参数为ImageResizer压缩后返回的数据对象
let fileUpload = (res) => {
    let uploadIP = store.getState().user.value.uploadIP;
    let formData = new FormData();
    formData.append('file', {uri: res.uri, type: 'multipart/form-data', name: res.name});
    let imageApi = uploadIP ? uploadIP : DEFAULT_FILE_SERVER;
    let url = imageApi + '/upload';
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': store.getState().token.value
        },
        body: formData
    }).then(res => {
        console.log("上传城管");
        return res.text()
    }).catch(e => {
        Alert.alert(
            '提示',
            '图片上传失败，请重新拍取照片',
            [
                {
                    text: '确认', onPress: () => {}
                },
            ],
        )
    })
}

