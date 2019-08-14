import React from 'react';
import {
    Dimensions, FlatList, ScrollView, Text, View, StyleSheet, Image, TouchableOpacity, Modal, DeviceEventEmitter, Alert,
    ActivityIndicator, BackHandler, Platform, TextInput, RefreshControl
} from "react-native";
import {Card, Button, WhiteSpace} from "@ant-design/react-native";
import WingBlank from "@ant-design/react-native/es/wing-blank/index";
import AntDesign from "react-native-vector-icons/AntDesign";
import Flex from "@ant-design/react-native/es/flex/Flex";
import color from '../styles/color';
import NavigationBar from "../navigation/NavigationBar";
import { store } from '../../redux/store';
import * as ProgressUI from 'react-native-progress';
import {Card as Shadow} from 'react-native-shadow-cards';
import { RNCamera } from 'react-native-camera';
import ImageResizer from "react-native-image-resizer";
import {api} from "../../api";
import Octicons from "react-native-vector-icons/Octicons";
import Fontisto from "react-native-vector-icons/Fontisto";
import Accordion from "@ant-design/react-native/es/accordion";
import ImagePicker from "@ant-design/react-native/es/image-picker";
import CameraScreen from "../../components/CameraScreen";
import InputItem from "@ant-design/react-native/es/input-item";
import TextAreaItem from "@ant-design/react-native/lib/textarea-item";
import List from "@ant-design/react-native/es/list";
import {Input} from "beeshell";
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
export default class ActivityReview extends React.Component {

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
            totalPage: 1,
            modalVis: false,
            currentRow: {
                title: ''
            },
            user: store.getState().user.value,
            token: store.getState().token.value,
            detailProgress: [],
            phonePic: [],
            tvPic: [],
            activeSections: [0],
            cameraType: RNCamera.Constants.Type.back,
            camVis: false,
            files: [],
            executeLoading: false,
            opinion: '',
            //下拉刷新
            isRefresh:false,
        };
        this.fetchActivityData.bind(this);
        this.onLoadMore.bind(this);
        this.renderModal.bind(this);
        this.showModal.bind(this);
        this.fetchPhonePic.bind(this);
        this.onChange = activeSections => {
            this.setState({ activeSections });
        };
        this.handlePhonePath.bind(this);
        this.backForAndroid.bind(this);
        this.fetchTVPic.bind(this);
        this.review.bind(this)
    }
    componentDidMount() {
        this.deEmitter = DeviceEventEmitter.addListener('taked', (a) => {
            let temp = this.state.files;
            temp.push({url: a.uri, value: a});
            this.setState({files: temp,camVis: false})
        });
        this.fetchActivityData();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {return this.backForAndroid(this.props.navigation)});
        }
    }
    backForAndroid(navigator) {
        navigator.navigate('Main');
        return true;
    }
    componentWillUnmount() {
        this.deEmitter.remove();
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', () => {return this.backForAndroid(this.props.navigation)});
        }
    }
    fetchActivityData() {
        let url = `${api}/api/identity/parActivityObject/page?page=${this.page - 1}&size=${this.size}&sort=createdAt,desc`;
        let params = {
            attachTo: this.state.user.sysDistrict.districtId,
            status: '1'
        };
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
        this.setState({
            phonePic: [],
            tvPic: []
        });
        this.fetchPhonePic(item);
        this.fetchTVPic(item);
    }
    renderItem = (item) => {
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
                            <Card.Footer content={
                                <Flex>
                                    <Flex>
                                        <Octicons name={'organization'} size={18} color={color.THEME_COLOR}></Octicons>
                                        <Text style={{color: '#317CDE',marginRight: 5}}>&nbsp;{item.districtName}</Text>
                                    </Flex>
                                    <Flex>
                                        <Octicons name={'calendar'} size={18} color={color.THEME_COLOR}></Octicons>
                                        <Text style={{color: '#317CDE',marginRight: 5}}>&nbsp;{new Date(item.modifiedAt).toLocaleDateString()}</Text>
                                    </Flex>
                                </Flex>
                            } extra={
                                <Flex justify={'end'}>
                                    <Fontisto name={'preview'} size={16}  style={{color: '#268aff'}}/>
                                    <Text style={{color: '#268aff'}}> 审核</Text>
                                </Flex>
                            }/>
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
        let isend = Math.floor(this.state.activityList.length/this.size)  === this.state.totalPage - 1;
        if (this.state.activityList.length === 0) {
            isend = true;
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
                {!isend ?  <ActivityIndicator/> : null}
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
    review(ispass) {
        this.setState({executeLoading: true});
        let url = `${api}/api/identity/parActivityPerform/check`;
        let params = {
            activityID: this.state.currentRow.activityId,
            activityTime: this.state.currentRow.month,
            createTime: "2019-08-12T14:55:35",
            districtId: this.state.currentRow.organizationId,
            organizationId: this.state.currentRow.districtId,
            remark: this.state.opinion,
            score: this.state.currentRow.score,
            status: String(ispass),
            type: "基本活动"
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
            this.setState({executeLoading: false, opinion: ''});
            Alert.alert(
                '提示',
                '审核成功!',
                [
                    {text: '确认', onPress: () => {
                            this.setState({
                                modalVis: false,
                                activityList: []
                            })
                            this.page = 1;
                            this.fetchActivityData();
                        }},
                ],
            )
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
    fetchTVPic(item) {
        let url = api + '/api/identity/parPictureInfro/page?page=0&size=500&sort=CreateTime,desc';
        let params = {
            organizationId: item.districtId,
            studyContent: item.activityId
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
                tvPic: resp.content.content
            });
            return true;
        })
    }
    fetchPhonePic(item) {
        let url = api + '/api/identity/parActivityFeedback/phonePage?page=0&size=500&sort=time,desc';
        let params = {
            snId: item.activityId,
            userId: item.districtId
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
            console.log(resp, 'resp')
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
                            {this.renderRecords()}
                            <InputItem
                                placeholder="请输入审核意见"
                                clear
                                style={{width: width}}
                                value={this.state.opinion}
                                onChange={value => {this.setState({opinion: value})}}
                            >
                                <Text style={styles.itemLabel}>审核意见</Text>
                            </InputItem>
                            <WhiteSpace size="lg"/>
                            <Button
                                style={{flex: 1,width: '100%'}}
                                onPress={() => {this.review(2)}}
                                type="primary"
                            ><Text>通过</Text></Button>
                            <WhiteSpace size="lg"/>
                            <Button
                                style={{flex: 1,width: '100%'}}
                                onPress={() => {this.review(0)}}
                                type="warning"
                            ><Text>驳回</Text></Button>
                        </Flex>
                    </WingBlank>
                </ScrollView>
            </Modal>
        )
    }
    renderRecords() {
        let records = this.state.phonePic.map((item) => {
            let images = item.imageUrl.map(subItem => {
                return (<Image resizeMode='contain' style={{width: 150, height: 200, margin: 6}} source={{uri: this.handlePhonePath(subItem.imageUrl)}}/>)
            });
            return (
                <Accordion.Panel header={<Text style={{fontSize: 14,flex: 1,paddingTop:8, paddingBottom: 8}}>{`执行记录 (${item.time.replace(/T/g, ' ')})`}</Text>}>
                    <ScrollView horizontal={true}>
                        <Flex style={{overflowX: 'scroll'}}>
                            {images}
                        </Flex>
                    </ScrollView>
                </Accordion.Panel>
            )
        });
        let tvPics = this.state.tvPic.map((item) => {
            return (<Image resizeMode='contain' style={{width: 200, height: 355, margin: 6}} source={{uri: this.handlePhonePath(item.imageURL)}}/>)
        })
        let tvPlane =
            <Accordion.Panel header={<Text style={{fontSize: 14,flex: 1,paddingTop:8, paddingBottom: 8}}>{`电视端执行记录${this.state.tvPic.length>=1 ? `(${this.state.tvPic[0].replace(/T/g, ' ')})` : ''}`}</Text>}>
                    {
                        tvPics.length >= 1 ?
                            <ScrollView horizontal={true}>
                                <Flex style={{overflowX: 'scroll'}}>{tvPics}</Flex>
                            </ScrollView>
                            :
                        <Text style={{padding: 5,textAlign: 'center', color: '#6f6f6f', fontSize: 12}}>电视端暂未执行！</Text>
                    }
            </Accordion.Panel>
        records.unshift(tvPlane);
        return (
            <View style={{width: '100%'}}>
                <Accordion onChange={activeSections => {this.setState({ activeSections })}} activeSections={this.state.activeSections} >
                    {records}
                </Accordion>
            </View>
        )
    }
    keyExtractor(item, index) {
        return "index" + index + item;
    }
    render() {
        return (
            <View style={{backgroundColor: '#f4f4ea',height:height-120}}>
                <ScrollView>
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
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text>提交中</Text>
                    </View>
                </Modal>
            </View>
        )
    }
}
