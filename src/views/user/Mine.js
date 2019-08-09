import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    Image,
    StyleSheet,
    Alert,
    Modal,
    TextInput,
    ScrollView
} from "react-native";
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
import AntDesign from "react-native-vector-icons/AntDesign";
import Badge from "@ant-design/react-native/es/badge/index";
import { List, Flex, InputItem, Button, WingBlank} from "@ant-design/react-native";
import {Tag} from "beeshell";
import { store } from '../../redux/store';
const THEME_COLOR = color.THEME_COLOR;
const Item = List.Item;

const styles = StyleSheet.create({
    avator: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderColor: '#fff',
        borderWidth: 3,
    },
    userName: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
        paddingTop: 20,

    },
    latestLoginTime: {
        fontSize: 12,
        paddingLeft: 5,
        color:'white'
    }
});

export default class Mine extends React.Component {
    constructor() {
        super();
        this.state = {
            password:'',
            rePassword:'',
            pswModalVisible: false,
            questionModal:false,
            aboutModal:false,
            user:store.getState().user.value,
        };
    }

    setPswModalVisible(visible) {
        this.setState({ pswModalVisible: visible });
    }

    setQuestionModal(visible){
        this.setState({questionModal:visible});
    }

    setAboutModalVisible(visible) {
        this.setState({ aboutModal: visible });
    }

    showAlert() {
        Alert.alert(
          '',
          '是否确认重置密码？',
          [
              {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: '确认', onPress: () => this.resetPsw()},
          ],
        )
    }
    resetPsw(){
        let userUrl='http://122.97.218.162:21018/api/identity/sysUser/'+this.state.user.id+'id';
        return fetch(userUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': store.getState().token.value
            },
        }).then((response) => response.json()).then((resJson) => {
            let user = resJson.content;
            user.password = null;
            let url = 'http://122.97.218.162:21018/api/identity/sysUser/'+this.state.user.id+'id';
            return fetch(url, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'authorization': store.getState().token.value
                },
                body: JSON.stringify(user)
            }).then( (response) => {
                console.log(response);
                Alert.alert("","密码重置成功，请重新登录！",  [{text: '我知道了', onPress: () => this.logout() }]);
              }).catch((error) => {
                console.error(error)
            });
        }).catch((error) => {
            console.error(error)
        })
    }
    editPsw(psw){
        let userUrl='http://122.97.218.162:21018/api/identity/sysUser/'+this.state.user.id+'id';
        return fetch(userUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': store.getState().token.value
            },
        }).then((response) => response.json()).then((resJson) => {
            let user = resJson.content;
            user.password = psw;
            let url = 'http://122.97.218.162:21018/api/identity/sysUser/'+this.state.user.id+'id';
            return fetch(url, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'authorization': store.getState().token.value
                },
                body: JSON.stringify(user)
            }).then( (response) => {
                console.log(response);
                Alert.alert("","密码修改成功，请重新登录！",  [{text: '我知道了', onPress: () => this.logout() }]);
            }).catch((error) => {
                console.error(error)
            });
        }).catch((error) => {
            console.error(error)
        })
    }
    confirmPsw(password,rePassword){
        if(password==''||rePassword==''){
           Alert.alert("","信息未填写完整",  [{text: '我知道了', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}]);
        }
        else if(password!==rePassword){
            Alert.alert("","密码不一致，请重新输入",  [{text: '我知道了', onPress: () =>this.setState({password:'',rePassword:''}), style: 'cancel'}]);
        }
        else{
            this.editPsw(password);
        }
    }
    logout(){
        this.props.navigation.navigate("Login");
    }

    render() {
        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        };
        let rightButton =
            <TouchableOpacity style = {{flexDirection: 'row'}}>
                <View style={{padding: 10}}>
                    <Badge dot={true}>
                        <AntDesign
                            size={26}
                            name={'bells'}
                            style={{color: '#fff'}}
                        />
                    </Badge>
                </View>
            </TouchableOpacity>;
        let leftButton =
          <TouchableOpacity style = {{flexDirection: 'row'}}>
              <View style={{padding: 10}}>
                  <AntDesign
                    size={26}
                    name={'left'}
                    style={{color: '#fff'}}
                    onPress={() => {
                        this.setPswModalVisible(false);
                    }}
                  />
              </View>
          </TouchableOpacity>;
        let leftQuestionBtn =
          <TouchableOpacity style = {{flexDirection: 'row'}}>
              <View style={{padding: 10}}>
                  <AntDesign
                    size={26}
                    name={'left'}
                    style={{color: '#fff'}}
                    onPress={() => {
                        this.setQuestionModal(false);
                    }}
                  />
              </View>
          </TouchableOpacity>;
        let leftAboutBtn =
          <TouchableOpacity style = {{flexDirection: 'row'}}>
              <View style={{padding: 10}}>
                  <AntDesign
                    size={26}
                    name={'left'}
                    style={{color: '#fff'}}
                    onPress={() => {
                        this.setAboutModalVisible(false);
                    }}
                  />
              </View>
          </TouchableOpacity>;
        let navigationBar = <NavigationBar rightButton={rightButton} linerGradient={true} title='个人中心' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let pswNavigationBar = <NavigationBar leftButton={leftButton} linerGradient={true} title='修改密码' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let questionNavigationBar = <NavigationBar leftButton={leftQuestionBtn} linerGradient={true} title='问题反馈' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let aboutNavigationBar = <NavigationBar leftButton={leftAboutBtn} linerGradient={true} title='关于句容党建' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <View>
                {navigationBar}

                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View>

                    <ImageBackground
                    source={require('../../static/drawable-xxxhdpi/banner.png')}
                    style={{height: 250, width: '100%',alignItems: 'center',justifyContent: 'center'}}
                    resizeMode="cover"
                >
                    <Flex direction='row'  align='stretch' style={{alignItems: 'center',paddingBottom:50}}>
                        <View style={{flex: 0.33,alignItems: 'flex-end'}}>
                            <Image source={require('../../static/img/blue.jpg')} style={styles.avator}/>
                        </View>
                        <View style={{marginLeft: 20,flex: 0.66}}>
                            <Flex>
                                 <Text style={styles.userName}>{this.state.user.name}</Text>
                                {/*<View style={{borderColor: 'blue',display: 'inline-block'}}>*/}
                                <Tag textStyle={{color: '#fff'}} style={{backgroundColor: '#67c23a', height: 22, marginTop: 28, marginLeft:10, borderColor: '#67c23a'}}>{this.state.user.roleName.replace(/角色/g, '')}</Tag>
                                {/*</View>*/}
                            </Flex>
                            <Flex style={{height: 35}} align='end'>
                                <AntDesign
                                    size={18}
                                    name={'mobile1'}
                                />
                                <Text style={{ paddingLeft: 5,color:'white' }}> {this.state.user.phone || '暂无'}</Text>
                            </Flex>
                            <Flex style={{height: 40}} align='end'>
                                <AntDesign
                                    size={18}
                                    name={'clockcircleo'}
                                />
                                <Text style={styles.latestLoginTime}> 最近登录{this.state.user.lastTime.toString().split('.')[0].replace('T',' ')}</Text>
                            </Flex>
                        </View>
                    </Flex>
                </ImageBackground>
                <List renderHeader=' '>
                    <Item  thumb={<Image source={require('../../static/drawable-xxxhdpi/密码重置.png')} style={{marginRight:4,marginLeft: 0,height:18,width:16}}/>}
                           arrow="horizontal" onPress={this.showAlert.bind(this)}>
                        <Text style={{fontSize:16}}>密码重置</Text>
                    </Item>
                    <Item thumb={<Image source={require('../../static/drawable-xxxhdpi/钥匙.png')} style={{marginRight:9,marginLeft: 0,height:18,width:11}}/>}
                          arrow="horizontal" onPress={() => {this.setPswModalVisible(true);}}>
                        <Text style={{fontSize:16}}>密码修改</Text>
                    </Item>
                    <Item thumb={<Image source={require('../../static/drawable-xxxhdpi/意见.png')} style={{marginRight:2,marginLeft: 0,height:18,width:18}}/>}
                          arrow="horizontal" onPress={() => {this.setQuestionModal(true);}}>
                        <Text style={{fontSize:16}}>问题反馈</Text>
                    </Item>
                    <Item thumb={<Image source={require('../../static/drawable-xxxhdpi/关于.png')} style={{marginRight:2,marginLeft: 0,height:18,width:18}}/>}
                          arrow="horizontal" onPress={() => {this.setAboutModalVisible(true);}} extra={<Text style={{fontSize: 12}}>版本号 1.1.0</Text>}>
                        <Text style={{fontSize:16}}>关于句容党建</Text>
                    </Item>
                </List>
                <Button style={{marginRight: 10,marginLeft:10 ,marginTop:30}} onPress={() => { this.logout();}}>退出</Button>
                    </View>
                </ScrollView>
                <Modal animationType="slide" transparent={false} visible={this.state.pswModalVisible} onRequestClose={() => {alert("Modal has been closed.");}}>
                    {pswNavigationBar}
                    <InputItem clear type="password" value={this.state.password} placeholder="请输入密码"
                               onChange={value => {
                                    this.setState({
                                        password: value,
                                    });
                               }}
                    >
                        密码
                    </InputItem>
                    <InputItem clear type="password" value={this.state.rePassword} placeholder="再次输入密码"
                               onChange={value => {
                                   this.setState({
                                       rePassword: value,
                                   });
                               }}
                    >
                        确认密码
                    </InputItem>
                    <Button type="primary" style={{marginRight: 10,marginLeft:10 }} onPress={() => {this.confirmPsw(this.state.password,this.state.rePassword)}}>确认</Button>
                </Modal>
                <Modal animationType="slide" transparent={false} visible={this.state.questionModal} onRequestClose={() => {alert("Modal has been closed.");}}>
                    {questionNavigationBar}
                    <WingBlank>
                        <TextInput
                          style={{height: 150, borderColor: '#eaedf1', borderWidth: 1,textAlignVertical: 'top',marginTop:20,borderRadius: 5 }}
                          placeholder={"请输入意见"}
                          multiline = {true}
                          numberOfLines = {8}
                          editable = {true}
                          maxLength = {400}
                        />
                        <Button type="primary" style={{marginTop:20}} onPress={() => {this.setQuestionModal(false)}}>确认</Button>
                    </WingBlank>
                </Modal>
                <Modal animationType="slide" transparent={false} visible={this.state.aboutModal} onRequestClose={() => {alert("Modal has been closed.");}}>
                    {aboutNavigationBar}
                    <Flex direction='row'  align='stretch' style={{alignItems: 'center',paddingBottom:50}}>
                        <View style={{flex: 0.33}}>
                            <Image source={require('../../static/img/blue.jpg')} style={{width:120,height:120,marginTop:50,marginLeft:30,borderRadius:5,borderColor:'#eaedf1',borderWidth:1}}/>
                        </View>
                        <View style={{marginLeft: 40,marginTop:50,flex:0.66}}>
                            <Flex>
                                <Text style={{fontSize:16,color:'#b36d28',height:40}}>句容党建</Text>
                            </Flex>
                            <Flex>
                                <Text style={{fontSize:16,color:'#b36d28',height:40}}>当前版本：1.1</Text>
                            </Flex>
                        </View>
                    </Flex>
                    <Text style={{fontSize:16,color:'#b36d28',marginLeft:30,marginRight:30,lineHeight:30}}>    句容党建App是一款为党的各级党组织和广大党员提供基层党建工作管理、监督、学习和交流的平台。</Text>
                    <Text style={{fontSize:16,color:'#b36d28',marginLeft:30,marginRight:30,lineHeight:30}}>    通过合理有效的大数据分析统计，做到信息及时送达，基层党员声音通过大数据分析 平台分析统计汇总，解决以前层级汇报，效率低下，
                        与基层党建工作者基层党员缺乏良好互动的弊端。
                    </Text>

                </Modal>
            </View>
        )
    }
}
