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


var {height,width} =  Dimensions.get('window');
const styleScope = StyleSheet.create({
    borderList:{
        flex: 1,
        flexDirection: 'row',
        marginBottom: 5,
        borderWidth: 1,
        borderColor:'#ebeef5',
        borderRadius: 4,
        borderStyle: "solid",
        width:'98%',
        marginLeft:'1%',
        shadowColor:'black'
    },
    avator: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderColor: '#fff',
        borderWidth: 3,
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
            myDataIndex:0,
            myDataExam:0,
            flatData: [],
            onEndReachedCalledDuringMomentum:false,
            showFoot:0,
            totalPage:0,
            uerImg:store.getState().user.value.image? {uri:store.getState().user.value.image }:require("../../static/drawable-xxxhdpi/头像-01.png"),
            orgName:''
        }
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.renderEndComp = this.renderEndComp.bind(this);
        this.renderHeadComp = this.renderHeadComp.bind(this);
        // if(store.getState().user.value.image){
        //     this.setState({uerImg:'uri:'+store.getState().user.value.image})
        // }else {
        //     this.setState({uerImg: 'require('+'"../../static/drawable-xxxhdpi/头像-01.png"'+')'})
        // }
        // this.setState({orgName:store.getState().user.value.organizationName})
        this.handleRefresh ();
    }
    componentDidMount(): void {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {return this.backForAndroid(this.props.navigation.navigate("Main"))});
        }
    }

    scoreData(){

    }
    handleRefresh () {


        this.state.pageNow = 0
        this.state.refreshing = true
        this.state.pageSize = Math.ceil(height/50)-2
        this.state.flatData = []

        let url01 = api + '/api/identity/exaScore/scoreCunPercentAll?page='+pa+'&size='+size+'&sort=desc&year='+2019+''
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
                    this.setState({myDataExam:item.exam})
                    this.setState({myDataIndex:index})
                }
            })
        })

        let pa = this.state.pageNow
        let size = this.state.pageSize
        let url = api + '/api/identity/exaScore/scoreCunPercentAll?page='+pa+'&size='+size+'&sort=desc&year='+2019+''
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'authorization': tokenNew
            },
            body: JSON.stringify({})
        }).then((response) => response.json()).then((resJson) => {
            console.log(resJson.content)
            if(resJson.content){
                this.state.totalPage = Math.ceil(resJson.content[0].total/size)
            }else {
                this.state.totalPage =  this.state.pageNow+1
            }
            this.setState({
                refreshing: false,
            });
            let scoreDate = resJson.content.map((item,index)=>{
                return {cun:item.cun,exam:item.exam,index:index}
            })
            this.setState({
                flatData: scoreDate,
            });
        }).catch((error) => {
            console.error(error)
        });
    }

    handleLoadMore(){
        console.log(this.state.flatData)
        if (!this.state.onEndReachedCalledDuringMomentum) {
            this.state.onEndReachedCalledDuringMomentum = true;
            let pp = this.state.pageNow
            pp = pp+1
            console.log(pp,555)
            this.state.pageNow = pp
            this.setState({
                pageNow: pp,
                refreshing: true,
                loading: false,
            })
            let pa = this.state.pageNow
            let size = this.state.pageSize
            console.log(pa,size)
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
                if(this.state.pageNow+1<this.state.totalPage){
                    console.log(6666666)
                    this.state.showFoot = 1
                }else {
                    this.state.showFoot = 2
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
                if( this.state.showFoot === 1){
                    this.state.showFoot === 0
                }
            }).catch((error) => {
                console.error(error)
            });
        }
    }

    showRankImg(val){
        if(val == 1){
            return (
            <Image source={require('../../static/drawable-xxxhdpi/第一.png')} style={{height:30,width:22,marginBottom:2}}/>
        )
        }else  if(val == 2){
            return (
                <Image source={require('../../static/drawable-xxxhdpi/第二.png')} style={{height:30,width:22,marginBottom:2}}/>
            )
        }else  if(val == 3){
            return (
                <Image source={require('../../static/drawable-xxxhdpi/第三.png')} style={{height:30,width:22,marginBottom:2}}/>
            )
        }else {
            return val
        }
    }

    renderItem(item){
        return (
            <View style={styleScope.borderList}>
                <View style={{width: "20%", height: 50}} >
                    <Text style={{ fontSize: 20,
                        textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        textAlignVertical:'center',
                        lineHeight:50
                    }}
                          key={item}>{this.showRankImg(item.index+1)}</Text>
                </View>
                <View style={{width: "52%", height: 50}} >
                    <Text style={{textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        textAlignVertical:'center',
                        lineHeight:50,
                        fontSize: 20}} key={item}>{item.cun}</Text>
                </View>
                <View style={{width:"25%", height: 50}} >
                    <Text style={{textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        textAlignVertical:'center',
                        lineHeight:50,
                        fontSize: 20,color:'#14BCF5'}} key={item}>{item.exam}</Text>
                </View>

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
                    source={require('../../static/drawable-xxxhdpi/组14.png')}
                    style={{height: height, width: width,textAlign:'center',alignItems: 'center',justifyContent: 'center'}}
                    resizeMode="cover"
                >
                    <Flex direction='row'  align='stretch' style={{textAlign:'center',alignItems: 'center',justifyContent: 'center',paddingBottom:50}}>
                        <View style={{marginTop:width/7,paddingRight:width/15,textAlign:'center',alignItems: 'center',justifyContent: 'center'}}>
                            <Text style={{fontSize:parseInt(width/14),color:'white',fontWeight:'300'}}>123</Text>
                            <Text style={{fontSize:parseInt(width/26),color:'white'}}>当前排名</Text>
                        </View>
                        <View style={{}}>
                        <Image source={this.state.uerImg} style={styleScope.avator}/>
                    </View>
                        <View style={{marginTop:width/7,paddingLeft:width/15,textAlign:'center',alignItems: 'center',justifyContent: 'center'}}>
                            <Text style={{fontSize:parseInt(width/14),color:'white',fontWeight:'300'}}>123</Text>
                            <Text style={{fontSize:parseInt(width/26),color:'white'}}>我的分数</Text>
                        </View>

                    </Flex>
                </ImageBackground>

            <View style={{ flex: 1,
            flexDirection: 'row',
            marginBottom: 5,
            width:'100%',
            backgroundColor: '#F5F5F4'}}>
            <View style={{width:width*0.05, height: 50,marginLeft:6}}>
                <Image source={require('../../static/drawable-xxxhdpi/排名.png')} style={{height:25,width:25,marginTop:14}}/>
            </View>
            <View style={{flex: 1, flexDirection: 'row',width: parseInt(width*0.1), height: 50}} >
                <Text style={{ fontSize: 25,
                    marginLeft:5, justifyContent:'center', textAlignVertical:'center', fontWeight:"500", lineHeight:50
                }}
                      key="titileO">排名</Text>
            </View>
            <View sryle={{width:width*0.1, height: 50}}>
                <Image source={require('../../static/drawable-xxxhdpi/组织.png')} style={{height:25,width:25,marginTop:14}}/>
            </View>
            <View style={{width: width*0.35, height: 50}} >
                <Text style={{
                    marginLeft:5, justifyContent:'center', textAlignVertical:'center', lineHeight:50, fontSize: 25, fontWeight:"500",
                }} key="titileT">组织名</Text>
            </View>
            <View sryle={{width:width*0.1, height: 50}}>
                <Image source={require('../../static/drawable-xxxhdpi/分数.png')} style={{height:25,width:25,marginTop:14}}/>
            </View>
            <View style={{width:  width*0.2, height: 50}} >
                <Text style={{
                    marginLeft:5,
                    justifyContent:'center',
                    textAlignVertical:'center',
                    lineHeight:50,
                    fontSize: 25,
                    fontWeight:"500",
                }}  key="titileTh">分数</Text>
            </View>

        </View>
            </View>)
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
    keyExtractor(item, index){

        return item.cun+item.exam
    }

    render() {

        return (
            <View>
                <FlatList
                    data={this.state.flatData}
                    horizontal={false}
                    // ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeadComp}
                    ListFooterComponent={this.renderEndComp}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    onEndReached={this.handleLoadMore}
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
