import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    TouchableOpacity,
    Image,
    ScrollView,
    ImageBackground,
    Alert,
    Modal, Dimensions, Platform, BackHandler
} from "react-native";
import { WebView } from 'react-native-webview';
import {Flex, Carousel, List, NoticeBar, SearchBar} from '@ant-design/react-native';
import NavigationBar from '../navigation/NavigationBar';
import NavigationUtils from '../navigation/NavigationUtils';
import AntDesign from "react-native-vector-icons/AntDesign";

const Item = List.Item;
const Brief = Item.Brief;

import color from '../styles/color';
import {store} from "../../redux/store";
import {api} from "../../api";


const THEME_COLOR = color.THEME_COLOR;

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

const BaseScript =  `
    (function () {
    var obj=document.getElementsByTagName("span");
    for(i=0;i<obj.length;i++){
    obj[i].style.fontSize='40px'
    obj[i].style.textIndent='80px',
    obj[i].style.lineHeight='70px'
    if(obj[i].style.color){
     while(obj[i].hasChildNodes()) 
    {
        obj[i].removeChild(obj[i].firstChild);
    }
    }
    }
    var objp=document.getElementsByTagName("p");
    for(i=0;i<objp.length;i++){
    objp[i].style.textIndent='80px',
    objp[i].style.lineHeight='70px'
    }
        var height = null;
        function changeHeight() {
          if (document.body.scrollHeight != height) {
           var _sh=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight); 
           var _ch=Math.max(document.body.clientHeight,document.documentElement.clientHeight); 
            height = Math.max(_sh,_ch);
            if (window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'setHeight',
                height: height,
              }))
            }
          }
        }
        setTimeout(changeHeight, 300);
    } ())
    `
const carouselStyles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
    },
    containerHorizontal: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        borderRadius: 8,
        overflow: 'hidden'
    },
    containerVertical: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    text: {
        color: '#fff',
        fontSize: 36,
    },
});


export default class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            partyBuildNews: [],
            notice: {},
            modalVisible: false,
            partyNewsDetail: '',
            selectNews: {},
            partyNewsImg:[],
            webHeight:500
        };
        this.fetchPartyBuild = this.fetchPartyBuild.bind(this);
        this.fetchNotice = this.fetchNotice.bind(this);
        this.showModal = this.showModal.bind(this);
    }

    componentDidMount() {
        this.fetchPartyBuild().then((news) => {
            this.fetchNotice().then((notice) => {
                this.setState({
                    partyBuildNews: news,
                    notice: notice
                })
            })
        })
    }

    fetchPartyBuild() {
        let url = 'http://www.jrxf.gov.cn/wz/getWz';
        let params = {fflid: '6', flid: null, page: 1, pageSize: 5};
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }).then((response) => response.json()).then((resJson) => {
            let fms = []
            resJson.data.forEach(item=>{
                if(item.fm){
                    fms.push(item.fm)
                }
            })
            this.setState({partyNewsImg:fms})
            return resJson.data;
        }).catch((error) => {
            console.error(error)
        })
    }

    fetchNotice() {
        let url = api + '/api/identity/information/page?page=0&size=1&sort=createdAt,desc';
        let tokenNew = store.getState().token.value
        return fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': tokenNew
            },
            body: JSON.stringify({})
        }).then((response) => response.json()).then((resJson) => {
            return resJson.content.content.length === 1 && resJson.content.content[0];
        }).catch((error) => {
            console.error(error)
        })
    }

    renderPartyBuildNews() {
        let newsItems = this.state.partyBuildNews.map((item,index) => {
            if(index == 0){
                let src = 'http://www.jrxf.gov.cn/file/'+this.state.partyNewsImg[0]
                return <Item key={item.id} data-seed="logId" arrow="horizontal" onPress={() => {
                    this.showModal(true, item)
                }}>
                    <View style={{ flex: 1,
                        flexDirection: 'row'}}>
                        <View><Image source={{uri: src}} style={{width:80,height:80}}/>
                        </View>
                        <View style={{textAlignVertical: 'center',marginLeft:5}}>
                    <Text style={styleScope.newsItem}>{item.bt}</Text>
                    <Brief style={styleScope.brief}>组织部 {item.ydl}阅读 {item.createtime}</Brief>
                        </View>
                    </View>
                </Item>
            }else {
                return <Item key={item.id} data-seed="logId" arrow="horizontal" onPress={() => {
                    this.showModal(true, item)
                }}>
                    <Text style={styleScope.newsItem}>{item.bt}</Text>
                    <Brief style={styleScope.brief}>组织部 {item.ydl}阅读 {item.createtime}</Brief>
                </Item>
            }

        });
        return  <List renderHeader={'党建新闻'}>{newsItems}</List>
    }

    showModal(is, val) {
        this.setState({modalVisible: is, selectNews: val})
        this.state.modalVisible = is
        this.setState({modalVisible:is})
        if (this.state.modalVisible == true) {
            // let reg = /<\/?.+?\/?>/g;
            // this.state.partyNewsDetail = val.nr.replace(reg, '')
            let str = `<div style="font-size: 70px; font-weight: 500; color: #444;margin-bottom: 20px; margin-top: 10px;text-align:center">` +
                    val.bt+`</div>`+
                `<div style="font-size:42px;color: #898989;text-align:center">类型:`+val.fl+`  阅读量:`+val.ydl+`  时间:`+val.createtime+`</div>`
                +val.nr
            this.setState({partyNewsDetail:str})
        } else {
            this.setState({partyNewsDetail:null})
        }
    }

    /**
     * web端发送过来的交互消息
     */
    onMessage (event) {
        try {
            const action = JSON.parse(event.nativeEvent.data)
            if (action.type === 'setHeight' && action.height > 0) {
                console.log(action.height,123)
                this.setState({ webHeight: action.height})
                // this.state.webHeight = action.height *160/Dimensions.get('window').scale
            }
            console.log(this.state)
        } catch (error) {
            // pass
        }
    }

    render() {
        const winHeight = Dimensions.get('window').height;

        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        };
        let navigationBar = <NavigationBar linerGradient={true} title='首页' statusBar={statusBar}
                                           style={{backgroundColor: THEME_COLOR}}/>;
        return (

            <View style={{flex: 1, backgroundColor: 'rgb(245, 245, 249)'}}>
                {navigationBar}
                <SearchBar style={{backgroundColor: 'white'}} defaultValue="" placeholder="搜索"/>

                <ScrollView
                    style={{flex: 1, padding: 5}}
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{marginBottom: 10}}>
                        <NoticeBar mode="link" marqueenProps={{loop: true, style: {}}}>
                            {this.state.notice.title}
                        </NoticeBar>
                    </View>
                    <Carousel
                        style={carouselStyles.wrapper}
                        dotStyle={{width: 8, height: 4, backgroundColor: 'rgba(255, 255, 255, 0.4)'}}
                        dotActiveStyle={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
                        selectedIndex={2}
                        autoplay
                        infinite>
                        <View
                            style={carouselStyles.containerHorizontal}
                        >
                            <ImageBackground source={require('../../static/drawable-xxhdpi/dj_banner.png')}
                                             style={{width: '100%', height: '100%', resizeMode: 'contain'}}>

                            </ImageBackground>
                        </View>
                        <View
                            style={[carouselStyles.containerHorizontal]}
                        >
                            <ImageBackground source={require('../../static/carousel/example1.png')}
                                             style={{width: '100%', height: '100%', resizeMode: 'cover'}}>

                            </ImageBackground>
                        </View>
                        <View
                            style={[
                                carouselStyles.containerHorizontal,
                            ]}
                        >
                            <ImageBackground source={require('../../static/carousel/example3.png')}
                                             style={{width: '100%', height: '100%', resizeMode: 'cover'}}>

                            </ImageBackground>
                        </View>
                    </Carousel>
                    {/*按钮集合展示区*/}
                    <List style={{marginTop:10}}>
                        <Item key={'btnss'}>
                    <Flex justify="between" align="center" style={styleScope.btnList}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("Activity")}>
                            <View style={{textAlign: 'center', marginRight: 2}}>
                                <Image source={require('../../static/drawable-xxxhdpi/活动管理.png')}
                                       style={styleScope.listImage}/>
                                <Text style={styleScope.btnLabel}>活动管理</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            console.log(this.props.navigation);
                            this.props.navigation.navigate("PositionShow")
                        }}>
                            <View style={{textAlign: 'center', marginLeft:1, marginRight: 1}}>
                                <Image source={require('../../static/drawable-xxxhdpi/阵地展示.png')}
                                       style={styleScope.listImage}/>
                                <Text style={styleScope.btnLabel}>阵地展示</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("ProgressSummary")}>
                            <View style={{textAlign: 'center', marginLeft:2, marginRight: 2}}>
                                <Image source={require('../../static/drawable-xxxhdpi/进度汇总.png')}
                                       style={styleScope.listImage}/>
                                <Text style={styleScope.btnLabel}>进度汇总</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("Information")}>
                            <View style={{textAlign: 'center', marginLeft:2, marginRight: 2}}>
                                <Image source={require('../../static/drawable-xxxhdpi/通知公告.png')}
                                       style={styleScope.listImage}/>
                                <Text style={styleScope.btnLabel}>通知公告</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("ScoreRank")}>
                            <View style={{textAlign: 'center', marginLeft:2}}>
                                <Image source={require('../../static/drawable-xxxhdpi/积分排名.png')}
                                       style={styleScope.listImage}/>
                                <Text style={styleScope.btnLabel}>积分排名</Text>
                            </View>
                        </TouchableOpacity>
                    </Flex>
                        </Item>
                    </List>
                    <View style={{marginTop: 5}}>
                        <ScrollView
                            style={{flex: 1}}
                            automaticallyAdjustContentInsets={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        >
                        {this.renderPartyBuildNews()}
                        </ScrollView>
                    </View>

                </ScrollView>
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setState({modalVisible: false})
                    }}
                >
                    <NavigationBar leftButton={
                        <TouchableOpacity onPress={() => {
                            this.setState({modalVisible: false})
                            this.setState({partyNewsDetail:null})
                            this.state.partyNewsDetail = null

                        }}>
                            <AntDesign name='left' size={26} style={{color: 'white'}}/>
                        </TouchableOpacity>}
                                   linerGradient={true} title='新闻详情'
                                   statusBar={{backgroundColor: THEME_COLOR, barStyle: 'light-content'}}
                                   style={{backgroundColor: THEME_COLOR}}
                    />
                    <ScrollView
                        style={{flex: 1, padding: 10}}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <WebView
                            injectedJavaScript={BaseScript}
                            style={{ height: Dimensions.get('window').height-100}}
                            scrollEnabled = {true}
                            automaticallyAdjustContentInsets = {true}
                            bounces = {false}
                            startInLoadingState={true}
                            source={{html:this.state.partyNewsDetail}}
                            decelerationRate='normal'
                            scalesPageToFit = {true}
                            javaScriptEnabled = {true} // 仅限Android平台。iOS平台JavaScript是默认开启的。
                            onMessage={this.onMessage.bind(this)}
                        />

                    </ScrollView></Modal>
            </View>

        )
    }
}



