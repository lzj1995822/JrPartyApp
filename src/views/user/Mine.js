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
    ScrollView, FlatList, RefreshControl, ActivityIndicator
} from "react-native";
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
import AntDesign from "react-native-vector-icons/AntDesign";
import Badge from "@ant-design/react-native/es/badge/index";
import {List, Flex, InputItem, Button, WingBlank, WhiteSpace} from "@ant-design/react-native";
import {Tag} from "beeshell";
import { store } from '../../redux/store';
import {api} from "../../api";
import FontAwesome from "react-native-vector-icons/FontAwesome";
const THEME_COLOR = color.THEME_COLOR;
const Item = List.Item;
//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');

const styles = StyleSheet.create({
    avator: {
        width: 0.1*height,
        height: 0.1*height,
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

export default class Mine extends React.Component {
    constructor() {
        super();
        this.state = {
            password:'',
            rePassword:'',
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
        };
        this.showMessageList();
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

    setNoticeModalVisible(visible) {
        this.setState({ noticeModal: visible });
    }

    setDote(visible){
        this.setState({doteVisible: visible});
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
        let noticeNavigationBar = <NavigationBar leftButton={noticeButton} linerGradient={true} title='消息中心' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <View>
               {/* <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >*/}
                    <View>
                    <ImageBackground
                    source={require('../../static/drawable-xxxhdpi/banner.png')}
                    style={{height: 0.32* height, width: '100%',alignItems: 'center',justifyContent: 'center'}}
                    resizeMode="cover"
                >
                        <View style={{marginLeft:0.85 * width,}}>
                            <Badge dot={this.state.doteVisible}>
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
                        <Image source={require('../../static/img/dq.png')} style={styles.avator}/>
                        <Text style={styles.userName}>{this.state.user.name}</Text>
                        <Text style={{ marginTop: 8,color:'white' }}> {this.state.user.phone || '暂无'}</Text>
                        <Tag textStyle={{color: '#000'}} style={{backgroundColor: '#fff', height: 24,marginTop:8,borderRadius:45,fontSize:14}}>
                            <Flex>
                                <Image source={require('../../static/img/xing.png')} style={{width:16,height:14.45,}}/>
                                <Text>&nbsp;&nbsp;{this.state.user.roleName.replace(/角色/g, '')}</Text>
                            </Flex>
                        </Tag>
                  {/*  <Flex direction='row'  align='stretch' style={{alignItems: 'center',paddingBottom:50}}>
                        <View style={{flex: 0.33,alignItems: 'flex-end'}}>
                            <Image source={require('../../static/img/blue.jpg')} style={styles.avator}/>
                        </View>
                        <View style={{marginLeft: 20,flex: 0.66}}>
                            <Flex>
                                 <Text style={styles.userName}>{this.state.user.name}</Text>
                                <View style={{borderColor: 'blue',display: 'inline-block'}}>
                                <Tag textStyle={{color: '#fff'}} style={{backgroundColor: '#67c23a', height: 22, marginTop: 28, marginLeft:10, borderColor: '#67c23a'}}>{this.state.user.roleName.replace(/角色/g, '')}</Tag>
                                </View>
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
                    </Flex>*/}
                </ImageBackground>
                <List renderHeader={null}>
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
                <Button   type="primary" style={{marginRight: 10,marginLeft:10 ,marginTop:30,marginBottom:50}} onPress={() => { this.logout();}}><Text style={{fontSize:16}}>退出</Text></Button>
                    </View>
          {/*      </ScrollView>*/}
                <Modal animationType="slide" transparent={false} visible={this.state.pswModalVisible} onRequestClose={() => {this.setPswModalVisible(false);}}>
                    {pswNavigationBar}
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
                    <Button type="primary" style={{marginRight: 10,marginLeft:10 }} onPress={() => {this.confirmPsw(this.state.password,this.state.rePassword)}}><Text style={{fontSize:14}}>确认</Text></Button>
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
                                <Text style={{fontSize:14,color:'#999999',height:40,width:'100%'}}>当前版本：1.1</Text>
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
