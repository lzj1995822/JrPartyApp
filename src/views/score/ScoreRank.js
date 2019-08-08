import React from 'react';
import {Button, StyleSheet, Text, View,TextInput,Alert,Modal,ActivityIndicator,Image,FlatList,Separator} from "react-native";
import {store} from '../../redux/store';
import {Dimensions} from 'react-native'

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
            flatData: [],
            onEndReachedCalledDuringMomentum:false,
            showFoot:0,
            totalPage:0
        }
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.renderEndComp = this.renderEndComp.bind(this);
        this.handleRefresh ();
    }

    scoreData(){

    }
    handleRefresh () {
        this.state.pageNow = 0
        this.state.refreshing = true
        this.state.pageSize = Math.ceil(height/50)-2
        this.state.flatData = []
        let pa = this.state.pageNow
        let size = this.state.pageSize
        let url = 'http://122.97.218.162:21018/api/identity/exaScore/scoreCunPercentAll?page='+pa+'&size='+size+'&sort=desc&year='+2019+''
        let tokenNew =  store.getState().token.value
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
            let url = 'http://122.97.218.162:21018/api/identity/exaScore/scoreCunPercentAll?page=' + pa + '&size=' + size + '&sort=desc&year=' + 2019 + ''
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
                          key={item}>{item.index+1}</Text>
                </View>
                <View style={{width: "50%", height: 50}} >
                    <Text style={{textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        textAlignVertical:'center',
                        lineHeight:50,
                        fontSize: 20}} key={item}>{item.cun}</Text>
                </View>
                <View style={{width:"30%", height: 50}} >
                    <Text style={{textAlign:'center',
                        alignItems:'center',
                        justifyContent:'center',
                        textAlignVertical:'center',
                        lineHeight:50,
                        fontSize: 20}} key={item}>{item.exam}</Text>
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
        return (<View style={{ flex: 1,
            flexDirection: 'row',
            marginBottom: 5,
            width:'98%',
            marginLeft:'1%',}}>
            <View style={{width: width*0.2, height: 50}} >
                <Text style={{ fontSize: 25,
                    textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    textAlignVertical:'center',
                    fontWeight:"500",
                    lineHeight:50
                }}
                      key="titileO">排名</Text>
            </View>
            <View style={{width: width*0.5, height: 50}} >
                <Text style={{textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    textAlignVertical:'center',
                    lineHeight:50,
                    fontSize: 25,
                    fontWeight:"500",
                }} key="titileT">组织名</Text>
            </View>
            <View style={{width:  width*0.3, height: 50}} >
                <Text style={{textAlign:'center',
                    alignItems:'center',
                    justifyContent:'center',
                    textAlignVertical:'center',
                    lineHeight:50,
                    fontSize: 25,
                    fontWeight:"500",
                }}  key="titileTh">分数</Text>
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
                <Image source={require('../../static/img/blue.jpg')} style={{height:60,width:'100%'}}/>
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
