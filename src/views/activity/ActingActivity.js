import React from 'react';
import {
    Dimensions, FlatList, ScrollView, Text, View, StyleSheet, Image, TouchableOpacity, Modal, DeviceEventEmitter, Alert,
     BackHandler, Platform, RefreshControl
} from "react-native";
import {Card, Button, WhiteSpace,ActivityIndicator} from "@ant-design/react-native";
import WingBlank from "@ant-design/react-native/es/wing-blank/index";
import AntDesign from "react-native-vector-icons/AntDesign";
import Flex from "@ant-design/react-native/es/flex/Flex";
import {Progress} from "@ant-design/react-native";
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
import { store } from '../../redux/store';
import * as ProgressUI from 'react-native-progress';
import {Card as Shadow} from 'react-native-shadow-cards';
import Accordion from "@ant-design/react-native/es/accordion/index";
import ImagePicker from "@ant-design/react-native/es/image-picker/index";
import { RNCamera } from 'react-native-camera';
import CameraScreen from "../../components/CameraScreen";
import ImageResizer from "react-native-image-resizer";
import {api} from "../../api";
import NavigationUtils from "../navigation/NavigationUtils";
const THEME_COLOR = color.THEME_COLOR;
const { width, height} = Dimensions.get('window');
const camStyle = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    preview: {
        flex: 1,
        width: width,
        height: height,
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    toolBar: {
        width: 200,
        margin: 40,
        backgroundColor: '#000000',
        justifyContent: 'space-between',

    },
    button: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        color: '#000',
        padding: 10,
        margin: 40,
    }
});
const styles = StyleSheet.create({
    activityItem: {
        flex: 1,
    },
    formItem: {
        borderBottomWidth: 0.3,
        borderColor: '#d0d0d0',
        width: '100%',
        padding: 15,
        overflow: 'hidden'
    },
    itemLabel: {
        fontWeight: '400',
        fontSize: 16,
        color: '#3a3a3a',
        width: 100,
        textAlignVertical: 'top'
    },
    itemValue: {
        color: '#265498',
        width: 50,
        textAlign: 'right'
    }
});
export default class ActingActivity extends React.Component {
    constructor() {
        super();
        this.page = 1;
        this.size = 6;
        this.TownCodeKey = {
            '01' : 'totalPercent',
            '0101': 'xiaShuPercent',
            '0102': 'houBaiPercent',
            '0103': 'guoZhuangPercent',
            '0104': 'baiTuPercent',
            '0105': 'maoShanPercent',
            '0106': 'bianChengPercent',
            '0107': 'baoHuaPercent',
            '0108': 'tianWangPercent',
            '0109': 'huaYangPercent',
            '0111': 'kaiFaPercent',
            '0112': 'maoShanFengJingPercent'
        };
        this.state = {
            activityList: [],
            totalPage: 0,
            modalVis: false,
            currentRow: {
                title: ''
            },
            user: store.getState().user.value,
            token: store.getState().token.value,
            detailProgress: [],
            phonePic: [],
            activeSections: [0],
            cameraType: RNCamera.Constants.Type.back,
            camVis: false,
            files: [],
            executeLoading: false,
            // 下拉刷新
            isRefresh: false,
        };
        this.fetchActivityData.bind(this);
        this.onLoadMore.bind(this);
        this.renderModal.bind(this);
        this.showModal.bind(this);
        this.fetchDetailProgress.bind(this);
        this.renderProgress.bind(this);
        this.renderItemFooter.bind(this);
        this.fetchPhonePic.bind(this);
        this.onChange = activeSections => {
            this.setState({ activeSections });
        };
        this.handlePhonePath.bind(this);
        this.uploadFiles.bind(this);
        this.backForAndroid.bind(this);
    }
    componentDidMount() {
        this.deEmitter = DeviceEventEmitter.addListener('taked', (a) => {
            let temp = this.state.files;
            temp.push({url: a.uri, value: a});
            this.setState({files: temp,camVis: false})
        });
        this.fetchActivityData();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                return this.backForAndroid(NavigationUtils.navigation)});
        }
    }
    backForAndroid(navigator) {
        navigator.navigate('Main');
        return true;
    }

    componentWillUnmount() {
        this.deEmitter.remove();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                return this.backForAndroid(NavigationUtils.navigation)});
        }
    }
    fetchActivityData() {
        console.log("拉取活动数据");
        let isCountrySide = this.state.user.roleCode === 'COUNTRY_SIDE_ACTOR';
        let url = `${api}/api/identity/${isCountrySide ? 'parActivityObject' : 'parActivity'}/page?page=${this.page - 1}&size=${this.size}`;
        let params = {
            currentStatus: "ACTIVE",
        };
        if (isCountrySide) {
            params.organizationId = this.state.user.sysDistrict.districtId
        }
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': this.state.token
            },
            body: JSON.stringify(params)
        }).then((res) => res.json()).then(res => {
            this.setState({
                activityList: this.state.activityList.concat(res.content.content),
                totalPage: res.content.totalPages,
            })
        })
    }
    showModal(item) {
        this.setState({
            modalVis: true,
            currentRow: item
        });
        if (this.state.user.roleCode === 'TOWN_REVIEWER') {
            this.fetchDetailProgress(item);
        } else if (this.state.user.roleCode === 'COUNTRY_SIDE_ACTOR') {
            this.setState({
                phonePic: []
            });
            this.fetchPhonePic(item);
        }
    }
    renderItem = (item, index) => {
        let logo = item.taskType === 'Party' ? require('../../static/img/party-logo.png') : require('../../static/img/learning-logo.png');
        return (
                <View style={styles.activityItem}>
                        <Shadow cornerRadius={7} opacity={0.3} elevation={2} style={{margin: 10, width: width-20, fontSize: 14}} >
                            <TouchableOpacity onPress={() => {this.showModal(item)}}>
                            <Card>
                                <Card.Header
                                  title={<Text style={{fontSize: 14}}>{item.title}</Text>}
                                    thumb={<Image source={logo} style={{marginLeft: -8,marginRight: 6}}/>}
                                    extra={<Flex justify="end">
                                        <AntDesign name='calendar' size={18}/>
                                        <Text> {item.month}</Text>
                                    </Flex>}
                                />
                                <Card.Body>
                                    <Text style={{paddingLeft: 14, paddingRight: 14, lineHeight: 22}}>{item.context || "暂无内容"}</Text>
                                </Card.Body>
                                <Card.Footer content={this.renderItemFooter(item)} extra=""/>
                            </Card>
                            </TouchableOpacity>
                        </Shadow>
                </View>
        )
    };
    onLoadMore() {
        this.page++;
        this.fetchActivityData()
    }
    renderFooter() {
        let msg = '';
        let currentPage =  Math.floor(this.state.activityList.length/this.size);
        let leftSize =  this.state.activityList.length%this.size;
        let isend;
        if (this.state.totalPage === 0) {
            isend = true;
        }else{
            if(leftSize>0&&currentPage===this.state.totalPage-1){
                isend = true;
            }else if(leftSize==0&&currentPage==this.state.totalPage){
                isend = true;
            }else{
                isend = false;
            }
        }
        if (isend) {
            msg = '没有更多数据了'
        } else {
            msg = '正在加载更多数据'
        }
        return (
            <View style={{flexDirection: 'row',
                width: width,
                height: 50,
                //backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center'}}>
                {!isend && <ActivityIndicator/>}
                <Text style={{color: '#444'}}>
                    {msg}
                </Text>
            </View>
        )
    }
    /**
     * 空布局
     */
    _createEmptyView() {
        return (
            <View style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 16}}>没有更多数据了</Text>
            </View>
        );
    }
    /**
     * 下拉刷新
     * @private
     */
    _onRefresh = () => {
        // 不处于 下拉刷新
        if (!this.state.isRefresh) {
            // this.state.currentPage=0;
            this.fetchActivityData();
        }
    };
    // 获取镇所属村的活动完成情况
    fetchDetailProgress(item) {
        let url = api + '/api/identity/parActivityObject/list';
        let params = {
            activityId: item.id,
            attachTo: this.state.user.sysDistrict.districtId
        };
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': this.state.token
            },
            body: JSON.stringify(params)
        }).then((res) => res.json()).then((resp) => {
            this.setState({
                detailProgress: resp.content
            });
            return true;
        })
    }
    renderProgress() {
        if (this.state.user.roleCode === 'TOWN_REVIEWER') {
            let percentKey = this.TownCodeKey[this.state.user.sysDistrict.districtId];
            let temp = this.state.detailProgress.map(item => {
                let color;
                let label;
                if (item.status == 2) {
                    color = '#67c23a';
                    label = '已完成'
                } else if (item.status == 1) {
                    color = '#fdca34';
                    label = '待审核'
                } else {
                    color = '#c22120';
                    label = '未完成'
                }
                return (
                    <Flex justify='between' style={styles.formItem}>
                        <Text style={styles.itemLabel}>{item.districtName}</Text>
                        <Text style={{backgroundColor: color, fontSize: 14, height: 25, padding: 4,borderRadius: 5, borderColor: color, color: '#fff'}}>{label}</Text>
                    </Flex>
                )
            });
            return [
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>本镇总进度</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} progress={Number(this.state.currentRow[percentKey])} />
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow[percentKey] * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                temp
            ]
        } else if (this.state.user.roleCode == 'CITY_LEADER') {
            return [
               <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>全市总进度</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} progress={Number(this.state.currentRow.totalPercent)} />
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.totalPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>宝华镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.baoHuaPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.baoHuaPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>下蜀镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.xiaShuPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.xiaShuPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>茅山镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.maoShanPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.maoShanPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>茅山风景区</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.maoShanFengJingPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.maoShanFengJingPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>华阳街道</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.huaYangPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.huaYangPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>郭庄镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.guoZhuangPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.guoZhuangPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>边城镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.bianChengPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.bianChengPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>开发区</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.kaiFaPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.kaiFaPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                     <Text style={styles.itemLabel}>白兔镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.baiTuPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.baiTuPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>后白镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.houBaiPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.houBaiPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>,
                <Flex justify='between' style={styles.formItem}>
                    <Text style={styles.itemLabel}>天王镇</Text>
                    <Flex>
                        <ProgressUI.Bar style={{width: 100}} showsText={true} progress={Number(this.state.currentRow.tianWangPercent)}/>
                        <Text style={styles.itemValue}>{Math.round(this.state.currentRow.tianWangPercent * 1000)/10 + '%'}</Text>
                    </Flex>
                </Flex>
               ]
        } else {
             let records = this.state.phonePic.map((item) => {
                 let images = item.imageUrl.map(subItem => {
                     return (<Image resizeMode='contain' style={{width: 150, height: 200, margin: 6}} source={{uri: this.handlePhonePath(subItem.imageUrl)}}/>)
                 });
                 return (
                     <Accordion.Panel key={'accordion' + item.id } header={<Text style={{fontSize: 14,flex: 1,paddingTop:8, paddingBottom: 8}}>{`执行记录 (${item.time.replace(/T/g, ' ')})`}</Text>}>
                        <ScrollView horizontal={true}>
                            <Flex style={{overflowX: 'scroll'}}>
                                {images}
                            </Flex>
                        </ScrollView>
                    </Accordion.Panel>
                )
            });
            let enable = new Date(this.state.currentRow.month).getTime() >= new Date().getTime() && this.state.currentRow.status != 2  ;
            let executeComponent = [
                    <View style={{width: '100%'}}>
                        <Accordion onChange={this.onChange} activeSections={this.state.activeSections} >
                            {records}
                        </Accordion>
                    </View>,
                     <Flex direction='column' justify='between' align='start' style={styles.formItem}>
                         <Text style={[styles.itemLabel, {marginBottom: 20, color: '#b3ad27'}]}>执行照片</Text>
                         <ImagePicker
                             onChange={(files, type, index) => {this.setState({files: files});}}
                             onAddImageClick={() => {this.setState({camVis: true})}}
                             files={this.state.files}
                         />
                         <Text style={{fontSize: 12,color: "#cdcdcd"}}>友情提示: 请确保已拍取照片再进行提交操作!</Text>
                     </Flex>,
                     <WhiteSpace size="lg"/>,
                     <Button
                         style={{flex: 1,width: '100%'}}
                         onPress={this.execute.bind(this)}
                         type="primary"
                     ><Text>提交</Text></Button>,
                     <WhiteSpace size="lg"/>,
                     <Modal animationType={"slide"}
                            transparent={false}
                            visible={this.state.camVis}
                            onRequestClose={() => {this.setState({camVis: false})}}>
                         <CameraScreen/>
                     </Modal>,
                     <Modal
                            animationType="fade"
                            transparent={true}
                            visible={this.state.executeLoading}>
                        <View style={{ flex: 1,
                            textAlign:'center',
                            alignItems:'center',
                            justifyContent:'center',
                            textAlignVertical:'center',
                            backgroundColor: 'white',
                            opacity: 0.8,
                        }}>
                            <ActivityIndicator size="large" color="#0000ff" animating={this.state.executeLoading}/>
                            <Text>提交中</Text>
                        </View>
                    </Modal>
                 ];
            if (enable) {
                return executeComponent;
            }
            return  (
                <View style={{width: '100%'}}>
                    <Accordion onChange={this.onChange} activeSections={this.state.activeSections} >
                        {records}
                    </Accordion>
                </View>
            )

        }
    }
    execute() {
        this.setState({executeLoading: true});
        let images = this.state.files;
        if (images.length <= 0) {
            Alert.alert(
                '提示',
                '请拍取执行照片后再进行提交操作!',
                [
                    {text: '确认', onPress: () => {}},
                ],
            )
            return;
        }
        let formData = new FormData();
        let successInt = 0;
        images.forEach(item => {
            let ratio = item.value.width/500;
            ImageResizer.createResizedImage(item.url, 1000, item.value.width/ratio, 'PNG', 100).then(res => {
                successInt++;
                formData.append('files', {uri: res.uri, type: 'multipart/form-data', name: res.name})
            }).catch(e => {
                console.log('压缩失败')
            })
        });
        let timer = setTimeout(() => {
            console.log('还在压缩')
            if (successInt === images.length) {
                let parActivityObj = this.state.currentRow;
                this.uploadFiles(formData).then(files => {
                    let url = api + '/api/identity/parActivityObject/execute';
                    let params = {
                        activityId: parActivityObj.activityId,
                        organizationId: this.state.user.sysDistrict.districtId,
                        phoneOrTv: 'phone',
                        userId: this.state.user.id,
                        phoneImgList: files.map(item => item.path)
                    };
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'authorization': this.state.token
                        },
                        body: JSON.stringify(params)
                    }).then(res => res.json()).then(resp => {
                        clearTimeout(timer);
                        this.setState({executeLoading: false, files: []});
                        console.log(this.state);
                        Alert.alert(
                            '提示',
                            '提交成功!',
                            [
                                {text: '确认', onPress: () => {
                                    this.setState({
                                        modalVis: false
                                    })
                                    this.page = 1;
                                    this.setState({activityList: []})
                                    this.fetchActivityData();
                                }},
                            ],
                        )
                    })
                })
            }
        }, 1000);
    }
    uploadFiles(formData) {
        console.log('上传文件')
        let url = api + '/api/identity/accessory/singleBatch';
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'authorization': this.state.token
            },
            body: formData
        }).then(res => res.json()).then(resp => resp.content)
            .catch(e => {
                Alert.alert(
                    '提示',
                    '上传失败，请重新上传!',
                    [
                        {text: '确认', onPress: () => {
                                this.setState({
                                    executeLoading: false
                                })
                            }},
                    ],
                )
                console.log(e,"上传失败")
            })
    }
    handlePhonePath(imgUrl) {
        if (imgUrl.indexOf("http" )== -1) {
            if (imgUrl[0] === '..') {
                return `http://jrweixin.zj96296.com:18006/JRPartyService/Upload/PhotoTakeUpload/${imgUrl}`
            } else {
                return `http://jrweixin.zj96296.com:18006/JRPartyService/Upload/PhotoTake/${imgUrl}`;
            }
        }else {
            return imgUrl
        }
    }
    fetchPhonePic(item) {
        let url = api + '/api/identity/parActivityFeedback/phonePage?page=0&size=500&sort=time,desc';
        let params = {
            snId: item.activityId,
            userId: this.state.user.sysDistrict.id
        };
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': this.state.token
            },
            body: JSON.stringify(params)
        }).then((res) => res.json()).then((resp) => {
            this.setState({
                phonePic: resp.content.content
            });
            return true;
        })
    }
    renderModal() {
        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        };
        let navigationBar = <NavigationBar leftButton={
            <TouchableOpacity onPress={() => {this.setState({modalVis: false,files: []})}}>
                <AntDesign name='left' size={26} style={{color: 'white'}} />
            </TouchableOpacity>}
           linerGradient={true} title='活动详情' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <Modal
                animationType={"slide"}
                transparent={false}
                visible={this.state.modalVis}
                onRequestClose={() => {this.setState({modalVis: false, files: []})}}
            >
                {navigationBar}
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                <WingBlank size="sm">
                 <Flex direction='column' justify='around'>
                    <Flex justify='between' style={styles.formItem}>
                        <Text style={styles.itemLabel}>活动名称</Text>
                        <Text>{this.state.currentRow.title}</Text>
                    </Flex>
                    <Flex justify='between' style={styles.formItem}>
                        <Text style={styles.itemLabel}>任务类型</Text>
                        <Text>{this.state.currentRow.type}</Text>
                    </Flex>
                    <Flex justify='between' style={styles.formItem}>
                        <Text style={styles.itemLabel}>截止日期</Text>
                        <Text>{this.state.currentRow.month}</Text>
                    </Flex>
                    <Flex justify='between' style={styles.formItem}>
                        <Text style={styles.itemLabel}>提醒时间</Text>
                        <Text>{this.state.currentRow.alarmTime || '暂无'}</Text>
                    </Flex>
                    <Flex justify='between' style={styles.formItem}>
                        <Text style={styles.itemLabel}>任务分值</Text>
                        <Text>{this.state.currentRow.score}分</Text>
                    </Flex>
                    <Flex justify='between' align='start' style={styles.formItem}>
                        <Text style={styles.itemLabel}>工作要求</Text>
                        <Text style={{lineHeight: 20, width: 150, textAlign: 'right'}} numberOfLines={3}>{this.state.currentRow.context}</Text>
                    </Flex>
                     {this.renderProgress()}
                </Flex>
                </WingBlank>
                </ScrollView>
            </Modal>
        )
    }
    renderItemFooter(item) {
        let percentKey = 'totalPercent';
        if (this.state.user.roleCode === 'TOWN_REVIEWER') {
            percentKey = this.TownCodeKey[this.state.user.sysDistrict.districtId];
        }
        if (this.state.user.roleCode === 'COUNTRY_SIDE_ACTOR') {
            let color;
            let label;
            if (item.status == 2) {
                color = '#67c23a';
                label = '已完成'
            } else if (item.status == 1) {
                color = '#fdca34';
                label = '待审核'
            } else {
                color = '#c22120';
                label = '未完成'
            }
            return (
                <Flex justify='between'>
                    <Text style={{backgroundColor: color, fontSize: 14, height: 28, padding: 4, borderRadius: 3, borderColor: color, color: '#fff'}}>{label}</Text>
                    { item.status != 2 && new Date(item.month).getTime() >= new Date().getTime() ?
                    <Flex>
                        <AntDesign name={'playcircleo'} size={18}  style={{color: '#268aff'}}/>
                        <Text style={{color: '#268aff'}}> 执行</Text>
                    </Flex> :
                        <Flex>
                            <AntDesign name={'filetext1'} size={18}  style={{color: '#268aff'}}/>
                            <Text style={{color: '#268aff'}}> 详情</Text>
                        </Flex>
                    }
                </Flex>
            )

        } else {
            return (
                <Flex>
                    <View style={{ marginRight: 10, height: 3, flex: 1 }}>
                        <Progress percent={Math.round(Number(item[percentKey]) * 1000)/10} />
                    </View>
                    <Text style={{width: 45}}>{Math.round(Number(item[percentKey]) * 1000)/10}%</Text>
                </Flex>
            )
        }
    }
    keyExtractor(item, index) {
        return "index" + index + item;
    }
    render() {
        return (
            <View>
                <ScrollView style={{backgroundColor: '#f4f4ea',height:height-120}}>
                    <FlatList
                        style={{flex: 1}}
                        data={this.state.activityList}
                        onEndReached={() => {this.onLoadMore()}}
                        // 空布局
                        ListEmptyComponent={this._createEmptyView}
                        ListFooterComponent={this.renderFooter.bind(this)}
                        renderItem={({item}) => this.renderItem(item)}
                        keyExtractor={this.keyExtractor}
                        onEndReachedThreshold={0.1}
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
                    />
                </ScrollView>
                {this.renderModal()}
            </View>
        )
    }
}
