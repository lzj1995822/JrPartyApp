import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    Dimensions,
    Image, StatusBar
} from "react-native";
import {InputItem, Button} from '@ant-design/react-native';
import {store} from '../redux/store';
import {api} from "../api";

const styleScope = StyleSheet.create({
    inputName: {
        height: 60,
        width: 140,
        marginBottom: 20,
        textAlignVertical: 'bottom'
    },
    inputPassword: {
        height: 60,
        width: 140,
        marginBottom: 20,
    },
    overMes: {
        height: 50,
        backgroundColor:'grey',
        opacity: 0.8,
        textAlign: 'center',
        display: 'flex'

    }
})


export default class Login extends React.Component {


    constructor(props: any) {
        super(props);
        this.redux = store;
        this.state = {
            name: '',
            password: '',
            modalVisible: false,
            showMessage: '登录成功',
            token: '',
            loginLoading: false
        }

        this.submit = this.submit.bind(this);
        this.setModalVisible = this.setModalVisible.bind(this)
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    submit() {
        this.setState({loginLoading:true});
        let url = api + "api/identity/sysUser/login";
        let status = 0; // 0 等待 1 完成 2 超时
        //设置连接超时时间
        let timer = setTimeout(() => {
            console.log("chuli")
            if (status === 0) {
                status = 2;
                Alert.alert("提示","连接超时！",  [{text: '确定', onPress: () => {
                        this.setState({loginLoading:false})
                    } }]);
            }
        }, 5000);

        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: this.state.name,
                password: this.state.password,
                isMobile: 1,
            })
        }).then((response) => response.json()).then((resJson) => {
            clearTimeout(timer);
            //链接没超时
            if (status !== 2) {
                status = 1;
                if (resJson.code == 200) {
                    this.redux.dispatch({
                        type: 'SET_TOKEN',
                        value: resJson.content.token
                    })
                    this.redux.dispatch({
                        type: 'SET_USER',
                        value: resJson.content.user
                    })
                    const {navigation} = this.props;
                    this.setState({loginLoading:false});
                    navigation.navigate("Main");
                } else {
                    Alert.alert("提示","用户名或密码错误！",  [{text: '确定', onPress: () => {
                        this.setState({loginLoading:false});
                    }}]);
                }
            }
            return resJson.data;
        }).catch((error) => {
            //链接没超时
            if (status !== 2) {
                clearTimeout(timer);
                status = 1;
                this.setState({loginLoading: false})
                Alert.alert("提示","网络连接失败！",  [{text: '确定', onPress: null }]);
                console.error(error)
            }
        })
    }

    render() {
        const designWidth = 128
        const designHeight = 98
        let bl = designWidth / designHeight
        const height = Dimensions.get('window').height;
        const width = Dimensions.get('window').width;

        let jrWidth = parseInt(width*0.7)
        let tHeight = height / 4 + 20
        let mHeight = height / 4
        let topHeight = height / 8
        let topWidth = topHeight * bl
        let btnTop = height / 24
        let btnHeight = height / 16
        let btnWidth = btnHeight*7
        let inputTop = height / 24
        let jrFontSize = parseInt(jrWidth/10)
        return [
            <StatusBar key={'login-status'}/>,
            <View key={'main-login'} style={{width: '100%', height: '100%', alignItems: 'center', justifyContent:'center'}}>
                <View style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlignVertical: 'center',
                }}>
                    <Image resizeMode='stretch' source={require('../static/drawable-xxxhdpi/head.png')}
                           style={{height: topHeight, width: topWidth}}/>
                    <View style={{width:jrWidth,
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlignVertical: 'center',}}>
                        <Text style={{color: '#434343', fontWeight: "500",fontSize:20, marginTop: 25}}>句容市智慧党建</Text>
                    </View>
                </View>
                <View style={{width:"100%",marginTop: 20,padding: 30}}>
                    <View style={{}}>
                        <InputItem
                            clear
                            value={this.state.name}
                            labelNumber={2}
                            onChange={(value: any) => {
                                this.setState({
                                    name: value,
                                });
                            }}
                            placeholder="输入用户名"
                        >
                            <Image resizeMode='stretch' source={require('../static/drawable-xhdpi/user.png')} style={{width: 20,height: 20}}/>
                        </InputItem>
                    </View>
                    <View style={{marginTop:30}}>
                        <InputItem
                            clear
                            type="password"
                            value={this.state.password}
                            labelNumber={2}
                            onChange={(value: any) => {
                                this.setState({
                                    password: value,
                                });
                            }}
                            placeholder="输入密码"
                        >
                            <Image source={require('../static/drawable-xhdpi/psw.png')} style={{width: 19,height: 24,marginRight: 0}}/>
                        </InputItem>
                    </View>
                    <Button
                        style={{width: '100%', marginTop: 100}}
                        onPress={this.submit}
                        type="primary"
                    ><Text style={{fontSize: 16}}>立即登录</Text></Button>
                </View>
            </View>,
            <Modal
            key={'loading-modal'}
            animationType="fade"
            transparent={true}
            visible={this.state.loginLoading}
                >
                <View style={{ flex: 1,
                    textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    textAlignVertical:'center',
                    backgroundColor: 'white',
                    opacity: 0.8,
                }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            </Modal>
        ]
    }
}


