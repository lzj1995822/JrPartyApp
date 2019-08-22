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
    ScrollView, FlatList, RefreshControl, ActivityIndicator, DeviceEventEmitter, Platform, BackHandler, StatusBar, DeviceInfo,
} from 'react-native';
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
import AntDesign from "react-native-vector-icons/AntDesign";
import Badge from "@ant-design/react-native/es/badge/index";
import {List, Flex, InputItem, Button, WingBlank, WhiteSpace} from "@ant-design/react-native";
import {Tag} from "beeshell";
import { store } from '../../redux/store';
import {api} from "../../api";
import Entypo from "react-native-vector-icons/Entypo";
import { hex_md5} from "../utils/md5";
import DeviceVersion from 'react-native-device-info';
import { NativeModules,Linking } from 'react-native';
import NavigationUtils from "../navigation/NavigationUtils";

const STATUS_BAR_HEIGHT = DeviceInfo.isIPhoneX_deprecated ? 30 : 20;
const THEME_COLOR = color.THEME_COLOR;
const Item = List.Item;
//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

const styles = StyleSheet.create({
    avator: {
        width: 80,
        height: 80,
        borderRadius: 45,
        borderColor: '#52B8F5',
        borderWidth: 3,
    },
    userName: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: 8,

    },
    latestLoginTime: {
        fontSize: 12,
        paddingLeft: 5,
        color:'white'
    }
});

const styleScope = StyleSheet.create({
    listImage: {
        width: 60,
        height: 60,
        borderRadius: 25,
    },
    btnList: {
        paddingTop: 10,
        paddingLeft: 0,
        paddingRight: 0,
    },
    btnLabel: {
        paddingTop: 4,
        fontSize: 12,
        textAlign: 'center'
    },
    brief: {
        fontSize: 12,
    },
    newsItem: {
        fontSize: 14,
        color: '#444',
        marginBottom: 5,
        marginTop: 5,
    }
});

export default class Mine extends React.Component {
    constructor() {
        super();
        this.state = {
            oldPsw:'',
            password:'',
            rePassword:'',
            resetPswModal:false,
            pswModalVisible: false,
            questionModal:false,
            aboutModal:false,
            noticeModal:false,
            messageList:[],
            user:store.getState().user.value,
            currentPage:0,
            // 下拉刷新
            isRefresh: false,
            // 加载更多
            isLoadMore: false,
            // 控制foot  1：正在加载   2 ：无更多数据
            showFoot: 1,
            doteVisible:false,
            version:DeviceVersion.getVersion(),
            storeUrl:'',
        };
        this.showMessageList();
    }
    componentDidMount() {
        let url = api + '/api/identity/sysConfiguration/list';
        let params;
        if(Platform.OS === 'android'){
            params = {
                code: "ANDROID_APP_VERSION",
            };
        }else if(Platform.OS === 'ios'){
            params = {
                code: "IOS_APP_VERSION",
            };
        }
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': store.getState().token.value
            },
            body: JSON.stringify(params)
        }).then((response) => response.json()).then((resJson) => {
            let latestVersion = resJson.content[0].codeValue;
           if(this.state.version != latestVersion){
               Alert.alert("","当前版本不是最新版本请更新",  [{text: '立即更新', onPress: () => this.downLoadAPP() }]);
           }
        }).catch((error) => {
            console.error(error)
        })
    }
    downLoadAPP (){
        if(Platform.OS === 'android'){
            let url = api + '/api/identity/sysConfiguration/list';
            let param = {
                  code: "ANDROID_APP_ADDRESS",
             };
            return fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'authorization': store.getState().token.value
                },
                body: JSON.stringify(param)
            }).then((response) => response.json()).then((resJson) => {
                 let appUrl = resJson.content[0].codeValue;
                 NativeModules.DownloadApk.downloading( appUrl, "app-release.apk");
            }).catch((error) => {
                  console.error(error)
            })
        }else if(Platform.OS === 'ios'){
            fetch('https://itunes.apple.com/lookup?bundleId=1111').then((response) => response.json()).then((responseJson) =>{
                this.setState({
                    storeUrl:responseJson.results[0].trackViewUrl,//应用商城下载的地址
                });
                Linking.openURL(this.state.storeUrl).catch(err => console.error('An error occurred', err));
            }).catch((error) => {
                console.error(error);
            });
        }

    }
    setResetPswModal(visible) {
        this.setState({
            oldPsw:'',
            resetPswModal: visible
        });
    }
    setPswModalVisible(visible) {
        this.setState({
            oldPsw:'',
            password:'',
            rePassword:'',
            pswModalVisible: visible
        });
    }

    setQuestionModal(visible){
        this.setState({questionModal:visible});
    }

    setAboutModalVisible(visible) {
        this.setState({ aboutModal: visible });
    }

    setNoticeModalVisible(visible) {
        this.setState({ noticeModal: visible });
    }

    setDote(visible){
        this.setState({doteVisible: visible});
    }

    resetPsw(){
        let userUrl= api + '/api/identity/sysUser/'+this.state.user.id+'id';
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
            let url = api + '/api/identity/sysUser/'+this.state.user.id+'id';
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
        let userUrl=api + '/api/identity/sysUser/'+this.state.user.id+'id';
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
            let url = api + '/api/identity/sysUser/'+this.state.user.id+'id';
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
    confirmRePsw(oldPsw){
        if(oldPsw==''){
            Alert.alert("","信息未填写完整",  [{text: '我知道了', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}]);
        }
        else if(hex_md5(oldPsw)!==this.state.user.password){
            Alert.alert("","原密码输入错误",  [{text: '我知道了', onPress: () =>this.setState({oldPsw:''}), style: 'cancel'}]);
        }
        else{
           this.resetPsw();
        }
    }
    confirmPsw(password,rePassword,oldPsw){
        if(password==''||rePassword==''||oldPsw==''){
           Alert.alert("","信息未填写完整",  [{text: '我知道了', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}]);
        }
        else if(hex_md5(oldPsw)!==this.state.user.password){
            Alert.alert("","原密码输入错误",  [{text: '我知道了', onPress: () =>this.setState({oldPsw:''}), style: 'cancel'}]);
        }
        else if(password!==rePassword){
            Alert.alert("","密码不一致，请重新输入",  [{text: '我知道了', onPress: () =>this.setState({password:'',rePassword:'',oldPsw:''}), style: 'cancel'}]);
        }
        else{
            this.editPsw(password);
        }
    }
    logout(){
        this.props.navigation.navigate("Login");
        store.dispatch({
            type: 'SET_TOKEN',
            value: ''
        });
        store.dispatch({
            type: 'SET_USER',
            value:''
        })

    }

    setDoteVis(){
        let url=api + '/api/identity/messageCenter/list';
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': store.getState().token.value
            },
            body: JSON.stringify({districtId:this.state.user.districtId,isRead:0})
        }).then((response) => response.json()).then((resJson) => {

            if(resJson.content.length>0){
                this.setDote(true);
            }else{
                this.setDote(false);
            }
        }).catch((error) => {
            console.error(error)
        })
    }
    showMessageList(){
        this.state.isLoadMore = true;
        let url=api + '/api/identity/messageCenter/page?page='+this.state.currentPage+'&sort=createdAt,desc';
        this.setDoteVis(url);
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': store.getState().token.value
            },
            body: JSON.stringify({districtId:this.state.user.districtId})
        }).then((response) => response.json()).then((resJson) => {
            if(resJson.content.totalPages===0){
                this.setState({
                    isLoadMore:false,
                    showFoot:3,
                    informationList:resJson.content.content
                })
            }else{
                if (this.state.currentPage === 0) {
                    this.setState({
                        isLoadMore: false,
                        messageList: resJson.content.content
                    })
                } else {
                    this.setState({
                        isLoadMore: false,
                        // 数据源刷新 add
                        messageList: this.state.messageList.concat(resJson.content.content)
                    });
                    if (this.state.currentPage <= resJson.content.totalPages-1) {
                        this.setState({
                            showFoot: 1
                        })
                    } else if (this.state.currentPage > resJson.content.totalPages-1) {
                        this.setState({
                            showFoot: 2
                        })
                    }
                }
            }

        }).catch((error) => {
            console.error(error)
        })
    }

    editMessage(item){
        item.isRead = '1';
        let url = api + '/api/identity/messageCenter/'+item.id+'id';
        return fetch(url, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': store.getState().token.value
            },
            body: JSON.stringify(item)
        }).then((response) => response.json()).then((resJson) => {
           this.showMessageList();
           this.setDoteVis();
        }).catch((error) => {
            console.error(error)
        })
    }

    render() {
        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        };
        let rightButton =
            <TouchableOpacity style = {{flexDirection: 'row'}}>
                <View style={{padding: 10}}>
                    <Badge dot={this.state.doteVisible}>
                        <AntDesign
                            size={26}
                            name={'bells'}
                            style={{color: '#fff'}}
                            onPress={() => {
                                this.setNoticeModalVisible(true);
                            }}
                        />
                    </Badge>
                </View>
            </TouchableOpacity>;
        let noticeButton =
            <TouchableOpacity style = {{flexDirection: 'row'}}>
                <View style={{padding: 10}}>
                    <AntDesign
                        size={26}
                        name={'left'}
                        style={{color: '#fff'}}
                        onPress={() => {
                            this.setNoticeModalVisible(false);
                        }}
                    />
                </View>
            </TouchableOpacity>;
        let leftReButton =
            <TouchableOpacity style = {{flexDirection: 'row'}}>
                <View style={{padding: 10}}>
                    <AntDesign
                        size={26}
                        name={'left'}
                        style={{color: '#fff'}}
                        onPress={() => {
                            this.setResetPswModal(false);
                        }}
                    />
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
        let RePswNavigationBar = <NavigationBar leftButton={leftReButton} linerGradient={true} title='重置密码' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let pswNavigationBar = <NavigationBar leftButton={leftButton} linerGradient={true} title='修改密码' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let questionNavigationBar = <NavigationBar leftButton={leftQuestionBtn} linerGradient={true} title='问题反馈' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let aboutNavigationBar = <NavigationBar leftButton={leftAboutBtn} linerGradient={true} title='关于句容党建' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        let noticeNavigationBar = <NavigationBar leftButton={noticeButton} linerGradient={true} title='消息中心' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <View style={{backgroundColor:'#f4f4ea'}}>
                <View style={{height: Platform.OS === 'ios' ? STATUS_BAR_HEIGHT : 0, backgroundColor: THEME_COLOR}}>
                    <StatusBar barStyle={'light-content'}/>
                </View>
                <View style={{width:width,height:40,backgroundColor:THEME_COLOR,alignItems:'center'}}>
                    <ImageBackground source={require('../../static/img/title.png')} style={{width:width*0.9,height:35,top:5,backgroundColor:THEME_COLOR}}/>
                </View>
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View >
                        <ImageBackground
                        source={require('../../static/drawable-xxxhdpi/banner.png')}
                        style={{width: width,alignItems: 'center',justifyContent: 'center'}}
                        resizeMode="cover"
                        >
                            <Flex style={{paddingTop: 6}}>
                                <View style={{flex:0.5}}>
                                    <Badge dot={this.state.doteVisible} style={{marginLeft:'10%'}}>
                                        <AntDesign
                                            size={22}
                                            name={'bells'}
                                            style={{color: '#fff'}}
                                            onPress={() => {
                                                this.setNoticeModalVisible(true);
                                            }}
                                        />
                                    </Badge>
                                </View>
                                <View style={{flex:0.5,}}>
                                    <Entypo
                                        size={22}
                                        name={'log-out'}
                                        style={{color: '#fff',marginLeft:'85%'}}
                                        onPress={() => {
                                            this.logout();
                                        }}
                                    />
                                </View>
                            </Flex>
                            <Image source={require('../../static/img/dq.png')} style={styles.avator}/>
                            <Text style={styles.userName}>{this.state.user.name}</Text>
                            <Text style={{ marginTop: 8,color:'white' }}> {this.state.user.phone || '暂无'}</Text>
                            <Tag textStyle={{color: '#000'}} style={{backgroundColor: '#fff', height: 24,marginTop:8,marginBottom: 10,borderRadius:45,fontSize:14}}>
                                <Flex>
                                    <Image source={require('../../static/img/xing.png')} style={{width:16,height:14.45,}}/>
                                    <Text>&nbsp;&nbsp;{this.state.user.roleName.replace(/角色/g, '')}</Text>
                                </Flex>
                            </Tag>
                        </ImageBackground>
                        {/*按钮集合展示区*/}
                        <List style={{marginTop:20}}>
                            <Item key={'btnss'}>
                                <Flex justify="between" align="center" style={styleScope.btnList}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("Activity")}>
                                        <View style={{textAlign: 'center', marginRight: 2}}>
                                            <Image source={require('../../static/drawable-xxxhdpi/activity.png')}
                                                   style={styleScope.listImage}/>
                                            <Text style={styleScope.btnLabel}>活动管理</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        console.log(this.props.navigation);
                                        this.props.navigation.navigate("PositionShow")
                                    }}>
                                        <View style={{textAlign: 'center', marginLeft:1, marginRight: 1}}>
                                            <Image source={require('../../static/drawable-xxxhdpi/positionShow.png')}
                                                   style={styleScope.listImage}/>
                                            <Text style={styleScope.btnLabel}>阵地展示</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("ProgressSummary")}>
                                        <View style={{textAlign: 'center', marginLeft:2, marginRight: 2}}>
                                            <Image source={require('../../static/drawable-xxxhdpi/progressSummary.png')}
                                                   style={styleScope.listImage}/>
                                            <Text style={styleScope.btnLabel}>进度汇总</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("Information")}>
                                        <View style={{textAlign: 'center', marginLeft:2, marginRight: 2}}>
                                            <Image source={require('../../static/drawable-xxxhdpi/information.png')}
                                                   style={styleScope.listImage}/>
                                            <Text style={styleScope.btnLabel}>通知公告</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("ScoreRank")}>
                                        <View style={{textAlign: 'center', marginLeft:2}}>
                                            <Image source={require('../../static/drawable-xxxhdpi/scoreRank.png')}
                                                   style={styleScope.listImage}/>
                                            <Text style={styleScope.btnLabel}>积分排名</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Flex>
                            </Item>
                        </List>
                        <List renderHeader={null} style={{marginTop:20,}}>
                            <Item  thumb={<Image source={require('../../static/drawable-xxxhdpi/pswReset.png')} style={{marginRight:4,marginLeft: 0,height:18,width:16}}/>}
                                   arrow="horizontal" onPress={()=>{this.setResetPswModal(true)}}>
                                <Text style={{fontSize:14}}>密码重置</Text>
                            </Item>
                            <Item thumb={<Image source={require('../../static/drawable-xxxhdpi/pswEdit.png')} style={{marginRight:9,marginLeft: 0,height:18,width:11}}/>}
                                  arrow="horizontal" onPress={() => {this.setPswModalVisible(true);}}>
                                <Text style={{fontSize:14}}>密码修改</Text>
                            </Item>
                            <Item thumb={<Image source={require('../../static/drawable-xxxhdpi/question.png')} style={{marginRight:2,marginLeft: 0,height:18,width:18}}/>}
                                  arrow="horizontal" onPress={() => {this.setQuestionModal(true);}}>
                                <Text style={{fontSize:14}}>问题反馈</Text>
                            </Item>
                            <Item thumb={<Image source={require('../../static/drawable-xxxhdpi/about.png')} style={{marginRight:2,marginLeft: 0,height:18,width:18}}/>}
                                  arrow="horizontal" onPress={() => {this.setAboutModalVisible(true);}} extra={<Text style={{fontSize:10}}>{"版本号"+this.state.version}</Text>}>
                                <Text style={{fontSize:14}}>关于句容党建</Text>
                            </Item>
                        </List>
                    </View>
                </ScrollView>
                <Modal animationType="slide" transparent={false} visible={this.state.resetPswModal} onRequestClose={() => {this.setResetPswModal(false);}}>
                    {RePswNavigationBar}
                    <InputItem clear type="password" value={this.state.oldPsw} placeholder="请输入原密码" style={{fontSize:14}}
                               onChange={value => {
                                   this.setState({
                                       oldPsw: value,
                                   });
                               }}
                    >
                        <Text style={{fontSize:14}}> 原密码</Text>
                    </InputItem>
                    <WhiteSpace size="lg"/>
                    <Button type="primary" style={{marginRight: 10,marginLeft:10 }} onPress={() => {this.confirmRePsw(this.state.oldPsw)}}><Text style={{fontSize:14}}>确认</Text></Button>
                </Modal>


                <Modal animationType="slide" transparent={false} visible={this.state.pswModalVisible} onRequestClose={() => {this.setPswModalVisible(false);}}>
                    {pswNavigationBar}
                    <InputItem clear type="password" value={this.state.oldPsw} placeholder="请输入原密码" style={{fontSize:14}}
                               onChange={value => {
                                   this.setState({
                                       oldPsw: value,
                                   });
                               }}
                    >
                        <Text style={{fontSize:14}}> 原密码</Text>
                    </InputItem>
                    <InputItem clear type="password" value={this.state.password} placeholder="请输入密码" style={{fontSize:14}}
                               onChange={value => {
                                    this.setState({
                                        password: value,
                                    });
                               }}
                    >
                        <Text style={{fontSize:14}}> 密码</Text>
                    </InputItem>
                    <InputItem clear type="password" value={this.state.rePassword} placeholder="再次输入密码" style={{fontSize:14}}
                               onChange={value => {
                                   this.setState({
                                       rePassword: value,
                                   });
                               }}
                    >
                        <Text style={{fontSize:14}}>确认密码</Text>
                    </InputItem>
                    <WhiteSpace size="lg"/>
                    <Button type="primary" style={{marginRight: 10,marginLeft:10 }} onPress={() => {this.confirmPsw(this.state.password,this.state.rePassword,this.state.oldPsw)}}><Text style={{fontSize:14}}>确认</Text></Button>
                </Modal>
                <Modal animationType="slide" transparent={false} visible={this.state.questionModal} onRequestClose={() => {this.setQuestionModal(false);}}>
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
                        <Button type="primary" style={{marginTop:20}} onPress={() => {
                            Alert.alert("提交成功！","",[
                                {text: '我知道了', onPress: () =>  this.setQuestionModal(false)},
                            ],)}}>确认</Button>
                    </WingBlank>
                </Modal>
                <Modal animationType="slide" transparent={false} visible={this.state.aboutModal} onRequestClose={() => {this.setAboutModalVisible(false);}}>
                    {aboutNavigationBar}
                    <WingBlank>
                        <Flex direction='row' justify="center" align="start" style={{height: 120, marginTop: 40, marginBottom: 20}}>
                            <View style={{flex: 0.45, alignItems: 'center'}}>
                                <Image source={require('../../static/img/template.png')} style={{width:90,height:90,borderRadius:20,borderColor:'#eaedf1',borderWidth:1,}}/>
                            </View>
                            <View style={{flex: 0.1}}></View>
                            <Flex direction='column' align="center" style={{flex: 0.45,marginLeft: -30,marginTop: 10}}>
                                <Text style={{fontSize:18,color:'#000',height:40,width:'100%'}}>句容党建</Text>
                                <Text style={{fontSize:14,color:'#999999',height:40,width:'100%'}}>当前版本:{this.state.version}</Text>
                            </Flex>
                        </Flex>
                        <Text style={{fontSize:16,color:'#b36d28',textAlign:'justify',lineHeight:30}}>    句容党建App是一款为党的各级党组织和广大党员提供基层党建工作管理、监督、学习和交流的平台。</Text>
                        <Text style={{fontSize:16,color:'#b36d28',textAlign:'justify',lineHeight:30}}>    通过合理有效的大数据分析统计，做到信息及时送达，基层党员声音通过大数据分析 平台分析统计汇总，解决以前层级汇报，效率低下，
                            与基层党建工作者基层党员缺乏良好互动的弊端。
                        </Text>
                    </WingBlank>
                </Modal>
                <Modal  animationType="slide" transparent={false} visible={this.state.noticeModal} onRequestClose={() => {this.setNoticeModalVisible(false);}}>
                    {noticeNavigationBar}
                    <View style={{flex: 1, backgroundColor: 'rgb(245, 245, 249)'}}>
                        <FlatList
                            style={{flex: 1, backgroundColor: 'rgb(245, 245, 249)'}}
                            data={this.state.messageList}
                            //item显示的布局
                            renderItem={({item}) => this._createListItem(item)}
                            // 空布局
                            ListEmptyComponent={this._createEmptyView}
                            //添加头尾布局
                            ListHeaderComponent={this._createListHeader}
                            // ListFooterComponent={this._createListFooter}
                            ListFooterComponent={this._createListFooter.bind(this)}
                            //下拉刷新相关
                            //onRefresh={() => this._onRefresh()}
                            refreshControl={
                                <RefreshControl
                                    title={'Loading'}
                                    colors={['#444']}
                                    refreshing={this.state.isRefresh}
                                    onRefresh={() => {
                                        this._onRefresh();
                                    }}
                                />
                            }
                            refreshing={this.state.isRefresh}
                            //加载更多
                            onEndReached={() => this._onLoadMore()}
                            onEndReachedThreshold={0.1}
                            ItemSeparatorComponent={this._separator}
                            keyExtractor={this._extraUniqueKey}
                        />
                    </View>
                </Modal>
            </View>
        )
    }

    _extraUniqueKey(item, index) {
        return "index" + index + item;
    }

    /*分割线*/
    _separator() {
        return <View/>;
    }

    /*创建头部布局*/
    _createListHeader() {
        return(
            <View style={{marginTop:5}}></View>
        )
    }

    /*创建尾部布局*/
    _createListFooter = () => {
        return (
            <View style={styles.footerView}>
                {this.state.showFoot === 1 && <ActivityIndicator/>}
                <Text style={{color: '#444',textAlign: 'center'}}>
                    {this.state.showFoot === 1 ? '正在加载更多数据...' : (this.state.showFoot === 2 ?'没有更多数据了':null)}
                </Text>
            </View>
        )
    }


    /*创建布局*/
    _createListItem(item) {
        let infoUrl = '../../static/img/info-notice.png';
        let partyUrl = '../../static/img/party-notice.png';
        let learning = '../../static/img/learning-notice.png';
        return (
            <WingBlank>
                <TouchableOpacity activeOpacity={0.5}>
                    <View style={{marginTop: 5, backgroundColor: '#fff', padding: 5,marginBottom:5,borderRadius:5}}>
                        <Flex>
                            <Badge dot={item.isRead=='0'}>
                                <Image source={item.type=='information'?require(infoUrl):(item.type=='party'?require(partyUrl):require(learning))} style={{width:50,height:50}}/>
                           {/* <FontAwesome
                                size={30}
                                name={item.type=='information'?'bullhorn':(item.type=='party'?'file-text-o':'circle-o')}
                                style={{color: '#f66',width:40,padding:5}}
                            />*/}
                            </Badge>
                            <View>
                                <Flex>
                                    <Text style={{fontSize: 14,marginBottom: 5, marginTop: 5,marginLeft:15,flex:1 }}>{item.content.split("]")[0].split("[")[1]}</Text>
                                    <Text style={{fontSize: 10,color:'#B6B6B6',marginTop:4,marginRight:12,flex:1,textAlign: 'right'}}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                </Flex>
                                <Text style={{fontSize: 10, marginLeft:15,marginRight:8,lineHeight: 18,color:'#B6B6B6',width:width-100 }}>{item.content.split("]")[1]}</Text>
                            </View>
                        </Flex>
                        {item.isRead == '0' ?
                            <Text style={{fontSize: 10, color: '#B6B6B6', marginTop:2, marginRight: 8, textAlign: 'right'}} onPress={() => {this.editMessage(item)}}>标为已读</Text>:null
                        }
                    </View>
                </TouchableOpacity>
            </WingBlank>
        );
    }

    /*空布局*/
    _createEmptyView() {
        return (
            <View style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 16}}>
                    没有更多数据了
                </Text>
            </View>
        );
    }

    /*下拉刷新*/
    _onRefresh = () => {
        // 不处于下拉刷新
        if (!this.state.isRefresh) {
            // this.state.currentPage=0;
            this.showMessageList();
        }
    };

    /* 加载更多*/
    _onLoadMore() {
        // 不处于正在加载更多 && 有下拉刷新过，因为没数据的时候 会触发加载
        if (!this.state.isLoadMore && (this.state.messageList.length > 0) && this.state.showFoot !== 2) {
            this.state.currentPage ++;
            this.showMessageList();
        }
    }

    /*/!*item点击事件*!/
    _onItemClick(item) {
        this.setModalVis(true,item);
    }*/

}
