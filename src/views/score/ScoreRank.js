import React from 'react';
import {
    Button,
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    Image,
    FlatList,
    Separator,
    BackHandler,
    Platform,
    ImageBackground
} from "react-native";
import {store} from '../../redux/store';
import {Dimensions} from 'react-native';
import {api} from "../../api";
import {Flex} from "@ant-design/react-native";
import NavigationUtils from  "../navigation/NavigationUtils"


var {height,width} =  Dimensions.get('window');
const styleScope = StyleSheet.create({
    borderList:{
        marginBottom: 5,
        borderWidth: 1,
        borderColor:'#ebeef5',
        borderRadius: 4,
        borderStyle: "solid",
        width:'100%',
        shadowColor:'black'
    },
    avator: {
        width: 0.1*height,
        height: 0.1*height,
        borderRadius: 0.5*height,
        borderColor: '#ffffff',
        borderWidth: 3,
        overflow:'hidden'
    }

})
export default class ScoreRank extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: '',
            refreshing:false,
            pageNow: 0,
            pageSize:10,
            loading: false,
            myDataIndex:'暂无',
            myDataExam:'暂无',
            flatData: [],
            onEndReachedCalledDuringMomentum:false,
            showFoot:0,
            totalPage:0,
            uerImg:store.getState().user.value.image? {uri:store.getState().user.value.image }:require("../../static/img/dq.png"),
            orgName:store.getState().user.value.organizationName
        }
        this.handleRefresh.bind(this);
        this.handleLoadMore.bind(this);
        this.renderEndComp.bind(this);
        this.renderHeadComp.bind(this);
        this.backForAndroid.bind(this)
    }
    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                return this.backForAndroid(NavigationUtils.navigation)});
        }
        // 初始化数据
        this.handleRefresh();
    }

    backForAndroid(navigator) {
        navigator.navigate('Main');
        return true;
    }

    // 处理刷新
    handleRefresh () {
        this.state.pageNow = 0
        this.setState({refreshing: true, flatData: []})
        this.state.pageSize = Math.ceil(height/50)-2
        let year = new Date().getFullYear();
        let url01 = `${api}/api/identity/exaScore/scoreCunPercentAll?page=0&size=1000&sort=desc&year=${year}`;
        let tokenNew =  store.getState().token.value
        fetch(url01, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': tokenNew
            },
            body: JSON.stringify({})
        }).then((response) => response.json()).then((resJson) => {
            resJson.content.forEach((item,index)=>{
                if(item.cun == this.state.orgName){
                    this.setState({myDataExam:item.exam,myDataIndex:index+1})
                }
            })
        })

        let pa = this.state.pageNow;
        let size = this.state.pageSize;
        let url = `${api}/api/identity/exaScore/scoreCunPercentAll?page=${pa}&size=${size}&sort=desc&year=${year}`;
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': tokenNew
            },
            body: JSON.stringify({})
        }).then((response) => response.json()).then((resJson) => {
            if(resJson.content){
                this.state.totalPage = Math.ceil(resJson.content[0].total/size)
            }else {
                this.state.totalPage =  this.state.pageNow+1
            }
            let scoreDate = resJson.content.map((item,index)=>{
                return {cun:item.cun,exam:item.exam,index:index}
            })
            this.setState({
                refreshing: false,
                flatData: scoreDate
            });
        }).catch((error) => {
            console.error(error)
        });
    }

    handleLoadMore(){
        if (!this.state.onEndReachedCalledDuringMomentum) {
            this.setState({onEndReachedCalledDuringMomentum: true});
            this.setState({
                pageNow: ++this.state.pageNow,
                refreshing: true,
                loading: false,
                showFoot: 2
            })
            let pa = this.state.pageNow
            let size = this.state.pageSize
            let url = api + '/api/identity/exaScore/scoreCunPercentAll?page=' + pa + '&size=' + size + '&sort=desc&year=' + 2019 + ''
            let tokenNew = store.getState().token.value
            fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'authorization': tokenNew
                },
                body: JSON.stringify({})
            }).then((response) => response.json()).then((resJson) => {
                if (++this.state.pageNow > this.state.totalPage) {
                    this.setState({showFoot: 1})
                } else {
                    this.setState({showFoot: 0})
                }
                let scoreDate = resJson.content.map((item, index) => {
                    return {cun: item.cun, exam: item.exam, index: index + (pa * this.state.pageSize)}
                })
                scoreDate.forEach(item=>{
                    this.state.flatData.push(item)
                })
                this.setState({
                    loading: false,
                    refreshing: false,
                });
            }).catch((error) => {
                console.error(error)
            });
        }
    }

    showRankImg(val){
        if(val == 1){
            return (
            <Image source={require('../../static/drawable-xxxhdpi/NO1.png')} style={{height:25,width:18,marginBottom:6}}/>
        )
        }else  if(val == 2){
            return (
                <Image source={require('../../static/drawable-xxxhdpi/NO2.png')} style={{height:25,width:18,marginBottom:6}}/>
            )
        }else  if(val == 3){
            return (
                <Image source={require('../../static/drawable-xxxhdpi/NO3.png')} style={{height:25,width:18,marginBottom:6}}/>
            )
        }else {
            return <Text style={{ fontSize: 16,
                textAlign:'center',
                alignItems:'center',
                justifyContent:'center',
                textAlignVertical:'center',
                lineHeight:40
            }}>{val}</Text>
        }
    }

    renderItem(item){
        return (
            <View style={styleScope.borderList}>
                <Flex style={{width: '100%'}} justify='around'>
                    <View style={{flex: 0.33, alignItems:'center'}}>
                        {this.showRankImg(item.index+1)}
                    </View>
                    <View style={{flex: 0.33}}>
                        <Text style={{textAlign:'center',
                            alignItems:'center',
                            justifyContent:'center',
                            textAlignVertical:'center',
                            lineHeight:40,
                            fontSize: 16}} key={item}>{item.cun}</Text>
                    </View>
                    <View style={{flex: 0.33}}>
                        <Text style={{textAlign:'center',
                            alignItems:'center',
                            justifyContent:'center',
                            textAlignVertical:'center',
                            lineHeight:40,
                            fontSize: 16,color:'#14BCF5'}} key={item}>{item.exam}</Text>
                    </View>
                </Flex>
            </View>
        )
    }
    renderSeparator(){
        return (<View
            style={{
                height: 1,
                backgroundColor: "#CED0CE",
            }}
        />);
    }

    renderHeadComp(){
        const width = Dimensions.get('window').width;
        let height = parseInt(width/2.53)
        return (
            <View>
                <ImageBackground
                    source={require('../../static/drawable-xxxhdpi/scoreBg.png')}
                    style={{height: height, width: width,textAlign:'center',alignItems: 'center',justifyContent: 'center'}}
                    resizeMode="cover"
                >
                    <Flex direction='row'  align='stretch' style={{textAlign:'center',alignItems: 'center',justifyContent: 'center',paddingBottom:40}}>
                        <View style={{marginTop:width/7,paddingRight:width/15,textAlign:'center',alignItems: 'center',justifyContent: 'center'}}>
                            <Text style={{fontSize:parseInt(width/20),color:'white',fontWeight:'300'}}>{this.state.myDataIndex}</Text>
                            <Text style={{fontSize:parseInt(width/26),color:'white'}}>当前排名</Text>
                        </View>
                        <View style={styleScope.avator}>
                        <Image source={this.state.uerImg} resizeMode='contain'style={{width:'100%',height:'100%'}}/>
                        </View>
                        <View style={{marginTop:width/7,paddingLeft:width/15,textAlign:'center',alignItems: 'center',justifyContent: 'center'}}>
                            <Text style={{fontSize:parseInt(width/20),color:'white',fontWeight:'300'}}>{this.state.myDataExam}</Text>
                            <Text style={{fontSize:parseInt(width/26),color:'white'}}>我的分数</Text>
                        </View>

                    </Flex>
                </ImageBackground>

            <View style={{
            marginBottom: 5,
            width:'100%',
            backgroundColor: '#F5F5F4'}}>
                <Flex justify='around'>
                    <Flex style={{flex: 0.33}} justify='center' align='center'>
                        <Image source={require('../../static/drawable-xxxhdpi/rank.png')} style={{height:25,width:25}}/>
                        <Text style={{ fontSize: 18,
                            marginLeft:5, justifyContent:'center', textAlignVertical:'center', fontWeight:"500", lineHeight:50
                        }}
                              key="titileO">排名</Text>
                    </Flex>
                    <Flex style={{flex: 0.33}} justify='center' align='center'>
                        <Image source={require('../../static/drawable-xxxhdpi/org.png')} style={{height:25,width:25}}/>
                        <Text style={{
                            marginLeft:5, justifyContent:'center', textAlignVertical:'center', lineHeight:50, fontSize: 18, fontWeight:"500",
                        }} key="titileT">组织名</Text>
                    </Flex>
                    <Flex style={{flex: 0.33}} justify='center' align='center'>
                        <Image source={require('../../static/drawable-xxxhdpi/score.png')} style={{height:25,width:25}}/>
                        <Text style={{
                            marginLeft:5,
                            justifyContent:'center',
                            textAlignVertical:'center',
                            lineHeight:50,
                            fontSize: 18,
                            fontWeight:"500",
                        }}  key="titileTh">分数</Text>
                    </Flex>
                </Flex>
            </View>
            </View>
                )
    }

    renderEndComp(){
        if (this.state.showFoot == 1) {
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                        没有更多数据了
                    </Text>
                </View>
            );
        } else if(this.state.showFoot == 2) {
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <ActivityIndicator />
                    <Text>正在加载更多数据...</Text>
                </View>
            );
        } else{
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <Text></Text>
                </View>
            );
        }
    }
    keyExtractor(item, index) {
        return item.cun+item.exam
    }

    render() {

        return (
            <View>
                <FlatList
                    data={this.state.flatData}
                    style={{minHeight: height}}
                    horizontal={false}
                    // ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={() => this.renderHeadComp() }
                    ListFooterComponent={() => this.renderEndComp()}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.handleRefresh()}
                    onEndReached={() => this.handleLoadMore()}
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={this.keyExtractor}
                    onEndReachedThreshold={0.1}
                    onMomentumScrollBegin={() => {
                    this.setState({onEndReachedCalledDuringMomentum:false});
                }}

                />

            </View>
        )
    }
}
