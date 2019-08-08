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
    Image, ScrollView
} from "react-native";
import {InputItem, Icon, List, Toast,Button} from '@ant-design/react-native';
import {IconFill, IconOutline} from "@ant-design/icons-react-native";
import blueVersion from "../styles/color";
import {store} from '../redux/store';

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
        backgroundColor: blueVersion.grey,
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
            showMessage: '登陆成功',
            token: ''
        }

        this.submit = this.submit.bind(this);
        this.setModalVisible = this.setModalVisible.bind(this)
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    submit() {
        let url = "http://122.97.218.162:21018/api/identity/sysUser/login";
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
            if (resJson.code == 200) {
                this.redux.dispatch({
                    type: 'SET_TOKEN',
                    value: resJson.content.token
                })
                this.redux.dispatch({
                    type: 'SET_USER',
                    value: resJson.content.user
                })
                this.setState({showMessage: '登陆成功'})
                this.setModalVisible(true)
                this.timer = setTimeout(() => {
                    const {navigation} = this.props;
                    navigation.navigate("Main");
                    clearTimeout(this.timer);
                }, 1000)
            } else {
                this.setState({showMessage: '用户名或密码错误'})
                this.setModalVisible(true)
                setTimeout(() => {
                    this.setModalVisible(false)
                }, 1500)
            }
            return resJson.data;
        }).catch((error) => {
            this.setState({showMessage: '网络错误'})
            this.setModalVisible(true)
            setTimeout(() => {
                this.setModalVisible(false)
            }, 1500)
            console.error(error)
        })
    }

    render() {
        const designWidth = 128
        const designHeight = 98
        let bl = designWidth / designHeight
        const height = Dimensions.get('window').height;
        let tHeight = height / 4 + 20
        let mHeight = height / 4
        let topHeight = height / 8
        let topWidth = topHeight * bl
        let btnTop = height / 24
        let btnHeight = height / 16
        let btnWidth = btnHeight*7
        let inputTop = height / 24
        return (
            <View>
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                <View style={{
                    height: tHeight,
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlignVertical: 'center',
                }}>
                    <Image source={require('../static/drawable-xxxhdpi/组10.png')}
                           style={{height: topHeight, width: topWidth}}/>
                    <Text style={{fontWeight: "500", fontSize: 30, marginTop: 20}}>句容市智慧党建</Text>
                </View>
                <View style={{width:"80%",height:mHeight,marginLeft:"10%"}}>
                    <View style={{}}>
                    <InputItem
                    clear
                    value={this.state.name}
                    onChange={(value: any) => {
                        this.setState({
                            name: value,
                        });
                    }}
                    placeholder="输入用户名"
                >
                    <Text style={{fontSize:20,fontWeight:'300'}}>用户名</Text>
                </InputItem>
                    </View>
                    <View style={{marginTop:20}}>
                    <InputItem
                        clear
                        type="password"
                        value={this.state.password}
                        onChange={(value: any) => {
                            this.setState({
                                password: value,
                            });
                        }}
                        placeholder="输入密码"
                    >
                        <Text style={{fontSize:20,fontWeight:'300'}}>密码</Text>
                    </InputItem>
                    </View>
                </View>
                <View style={{ textAlign: 'center', alignItems: 'center', }}>
                <Button
                    style={{marginTop: btnTop,height:btnHeight,width:btnWidth,}}
                    onPress={this.submit}
                    type="primary"
                ><Text style={{fontSize:25}}>立即登录</Text></Button>
                </View>
                </ScrollView>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                >
                    <View style={styleScope.overMes}>
                        <Text style={{
                            textAlign: 'center',
                            fontSize: 20,
                            marginTop: 10,
                            color: 'white'
                        }}>{this.state.showMessage}</Text>
                    </View>
                </Modal>
            </View>
        )
    }
}


