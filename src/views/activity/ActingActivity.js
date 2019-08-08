import React from 'react';
import {FlatList, ScrollView, Text, View, StyleSheet, Image, TouchableOpacity, Modal, Button} from "react-native";
import Card from "@ant-design/react-native/es/card/index";
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
const THEME_COLOR = color.THEME_COLOR;
const styles = StyleSheet.create({
    activityItem: {
    },
    formItem: {
        borderBottomWidth: 1,
        borderColor: '#d0d0d0',
        width: '100%',
        padding: 15,
        overflow: 'hidden'
    },
    itemLabel: {
        fontWeight: '400',
        fontSize: 16,
        color: '#444',
        width: 200,
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
        this.size = 13;
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
            files: []
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
        this.handleFileChange.bind(this);
    }
    componentDidMount() {
        this.fetchActivityData();
    }
    fetchActivityData() {
        console.log("拉取活动数据");
        let isCountrySide = this.state.user.roleCode === 'COUNTRY_SIDE_ACTOR';
        let url = `http://122.97.218.162:21018/api/identity/${isCountrySide ? 'parActivityObject' : 'parActivity'}/page?page=${this.page - 1}&size=${this.size}`;
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
    renderItem = (item) => {
        let logo = item.taskType === 'Party' ? require('../../static/img/party-logo.png') : require('../../static/img/learning-logo.png');
        return (
                <View style={styles.activityItem} key={item.id}>
                    <TouchableOpacity onPress={() => {this.showModal(item)}}>
                        <Shadow cornerRadius={7} opacity={0.3} elevation={5} style={{flex: 1,margin: 20, fontSize: 14}} >
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
                                    <Text style={{paddingLeft: 15, paddingRight: 15, lineHeight: 26}}>{item.context || "暂无内容"}</Text>
                                </Card.Body>
                                <Card.Footer content={this.renderItemFooter(item)} extra=""/>
                            </Card>
                        </Shadow>
                    </TouchableOpacity>
                </View>
        )
    };
    onLoadMore() {
        this.page++;
        this.fetchActivityData()
    }
    renderFooter() {
        if (this.state.activityList.length/this.size === this.state.totalPage - 1) {
            return <Text>暂无更多</Text>
        } else {
            return <Text>上划加载更多</Text>
        }
    }
    // 获取镇所属村的活动完成情况
    fetchDetailProgress(item) {
        let url = 'http://122.97.218.162:21018/api/identity/parActivityObject/list';
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
                </Flex>
               ]
        } else {
             let records = this.state.phonePic.map((item) => {
                 let images = item.imageUrl.map(subItem => {
                     console.log(this.handlePhonePath(subItem.imageUrl, item), 'de')
                     return (<Image resizeMode='contain' style={{width: 150, height: 200, margin: 6}} source={{uri: this.handlePhonePath(subItem.imageUrl)}}/>)
                 })
                 console.log(item, 'images');
                 return (
                    <Accordion.Panel header={`执行记录(${item.time.replace(/T/g, ' ')})`}>
                        <ScrollView horizontal={true}>
                            <Flex style={{overflowX: 'scroll'}}>
                                {images}
                            </Flex>
                        </ScrollView>
                    </Accordion.Panel>
                )
            });
            return  [
                <View style={{width: '100%'}}>
                    <Accordion onChange={this.onChange} activeSections={this.state.activeSections} >
                        {records}
                    </Accordion>
                </View>,
                <ImagePicker
                    onChange={this.handleFileChange}
                    files={this.state.files}
                />
                ]

        }
    }
    renderExcute() {

    }
    handleFileChange() {

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
        let url = 'http://122.97.218.162:21018/api/identity/parActivityFeedback/phonePage?page=0&size=500&sort=time,desc';
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
            <TouchableOpacity onPress={() => {this.setState({modalVis: false})}}>
                <AntDesign name='left' size={26} style={{color: 'white'}} />
            </TouchableOpacity>}
           linerGradient={true} title='活动详情' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
        return (
            <Modal
                animationType={"slide"}
                transparent={false}
                visible={this.state.modalVis}
                onRequestClose={() => {alert("Modal has been closed.")}}
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
                    <Flex justify='between' style={styles.formItem}>
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
                    <View style={{ marginRight: 10, height: 4, flex: 1 }}>
                        <Progress percent={Math.round(Number(item[percentKey]) * 1000)/10} />
                    </View>
                    <Text style={{width: 45}}>{Math.round(Number(item[percentKey]) * 1000)/10}%</Text>
                </Flex>
            )
        }
    }
    render() {
        return (
            <View>
                <ScrollView style={{backgroundColor: 'rgb(245, 245, 249)'}}>
                    <FlatList
                        style={{flex: 1, backgroundColor: 'rgb(245, 245, 249)'}}
                        data={this.state.activityList}
                        onEndReachedThreshold={100}
                        onEndReached={() => {this.onLoadMore()}}
                        ListFooterComponent={this.renderFooter.bind(this)}
                        renderItem={({item}) => this.renderItem(item)}
                    />
                </ScrollView>
                {this.renderModal()}
            </View>
        )
    }
}
