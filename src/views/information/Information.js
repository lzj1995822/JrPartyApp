import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { store } from '../../redux/store';
import {List, WingBlank} from "@ant-design/react-native";
import NavigationBar from "../navigation/NavigationBar";
import AntDesign from "react-native-vector-icons/AntDesign";
import color from "../styles/color";
import {api} from "../../api";

//屏幕信息
const dimensions = require('Dimensions');
//获取屏幕的宽度和高度
const {width, height} = dimensions.get('window');
const THEME_COLOR = color.THEME_COLOR;
const Item = List.Item;
const Brief = Item.Brief;

export default class  Information extends React.Component  {

  constructor(props) {
    super(props);
    //状态
    this.state = {
      currentPage:0,
      pageSize:10,
      // 列表数据结构
      informationList: [],
      // 下拉刷新
      isRefresh: false,
      // 加载更多
      isLoadMore: false,
      // 控制foot  1：正在加载   2 ：无更多数据
      showFoot: 1,
      modalVis:false,
      currentInformation:{},
      user:store.getState().user.value,
    }
    this.showInformationList();
  }

  setModalVis(visible,item){
    this.setState({modalVis:visible});
    this.state.currentInformation = item;
  }
  //获取列表
  showInformationList() {
    this.state.isLoadMore = true;
    if(this.state.user.districtId==='01'){
      let url=api + '/api/identity/information/page?page='+this.state.currentPage+'&size='+this.state.pageSize+'&sort=createdAt,desc';
      return fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'authorization': store.getState().token.value
        },
        body: JSON.stringify({})
      }).then((response) => response.json()).then((resJson) => {
        if (this.state.currentPage === 0) {
          console.log("重新加载",resJson.content);
          console.log(url);
          this.setState({
            isLoadMore: false,
            informationList: resJson.content.content
          })
        } else {
          this.setState({
            isLoadMore: false,
            // 数据源刷新 add
            informationList: this.state.informationList.concat(resJson.content.content)
          })
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
      }).catch((error) => {
        console.error(error)
      })
    }else{
      let url=api + '/api/identity/acceptInformation/page?page='+this.state.currentPage+'&size='+this.state.pageSize+'&sort=createdAt,desc';
      return fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'authorization': store.getState().token.value
        },
        body: JSON.stringify({objs:this.state.user.districtId})
      }).then((response) => response.json()).then((resJson) => {
        if (this.state.currentPage === 0) {
          console.log("重新加载")
          this.setState({
            isLoadMore: false,
            informationList: resJson.content.content
          })
        } else {
          console.log("加载更多")
          this.setState({
            isLoadMore: false,
            // 数据源刷新 add
            informationList: this.state.informationList.concat(resJson.content.content)
          })
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
      //  this.setInformationList(resJson.content);
      }).catch((error) => {
        console.error(error)
      })
    }
  }


  render() {
    let statusBar = {
      backgroundColor: THEME_COLOR,
      barStyle: 'light-content'
    };
    let leftAboutBtn =
        <TouchableOpacity style = {{flexDirection: 'row'}}>
          <View style={{padding: 10}}>
            <AntDesign
                size={26}
                name={'left'}
                style={{color: '#fff'}}
                onPress={() => {
                  this.setModalVis(false,{});
                }}
            />
          </View>
        </TouchableOpacity>;
    let informationNavigationBar = <NavigationBar leftButton={leftAboutBtn} linerGradient={true} title='公告详情' statusBar={statusBar} style={{backgroundColor: THEME_COLOR}}/>;
    return (
        <View style={styles.container}>

            <FlatList
                style={styles.container}
                data={this.state.informationList}
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

          <Modal animationType={"slide"} transparent={false} visible={this.state.modalVis} onRequestClose={() => {alert("Modal has been closed.")}}>
            {informationNavigationBar}
            <ScrollView
                style={{flex: 1, padding: 10}}
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
              <View style={{width:'96%',marginLeft:'2%'}}>
                <Text style={{
                  fontSize: 25, fontWeight: '500', color: '#444', marginBottom: 5, marginTop: 5,textAlign:"center"}}>
                  {this.state.currentInformation.title}</Text>
              </View>
              <View style={{width:'96%',marginLeft:'2%'}}><Text style={{color: '#898989',textAlign:"center"}}> 发布时间:{new Date(this.state.currentInformation.createdAt).toLocaleDateString()}</Text></View>
              <Text style={{width:'96%',marginLeft:'2%',fontSize: 18, marginTop: 5,lineHeight:25,letterSpacing:2,textAlign:"center"}} selectable={true}>
                {this.state.currentInformation.description==null?"":this.state.currentInformation.description.replace(/<[^>]+>/g,"")}</Text>
            </ScrollView>
          </Modal>
        </View>
    );
  }

  _extraUniqueKey(item, index) {
    return "index" + index + item;
  }

  /**
   * 分割线
   */
  _separator() {
    return <View/>;
  }

  /**
   * 创建头部布局
   */
  _createListHeader() {
    return (
        <View>

        </View>
    )
  }

  /**
   * 创建尾部布局
   */
  _createListFooter = () => {
    return (
        <View style={styles.footerView}>
          {this.state.showFoot === 1 && <ActivityIndicator/>}
          <Text style={{color: '#444'}}>
            {this.state.showFoot === 1 ? '正在加载更多数据...' : '没有更多数据了'}
          </Text>
        </View>
    )
  }


  /**
   * 创建布局
   */
  _createListItem(item) {
    return (
        <WingBlank>

          <TouchableOpacity activeOpacity={0.5} onPress={() => this._onItemClick(item)}>
            <View style={{
              marginTop: 5,
              backgroundColor: '#fff',
              padding: 10
            }}>
              <Text style={{fontSize: 14,marginBottom: 5, marginTop: 5,}}>{item.title}</Text>
              <Text style={{fontSize: 12,color:'#444',marginTop:4}}>{new Date(item.createdAt).toLocaleDateString() }</Text>
            </View>
          </TouchableOpacity>
        </WingBlank>
    );
  }

  /**
   * 空布局
   */
  _createEmptyView() {
    return (
        <View style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontSize: 16}}>
            暂无列表数据，下拉刷新
          </Text>
        </View>
    );
  }

  /**
   * 下啦刷新
   * @private
   */
  _onRefresh = () => {
    // 不处于 下拉刷新
    if (!this.state.isRefresh) {
     // this.state.currentPage=0;
      this.showInformationList();
    }
  };

  /**
   * 加载更多
   * @private
   */
  _onLoadMore() {
    // 不处于正在加载更多 && 有下拉刷新过，因为没数据的时候 会触发加载
    if (!this.state.isLoadMore && this.state.informationList.length > 0 && this.state.showFoot !== 2) {
      console.log(this.state.currentPage,"加载。。。1");
      this.state.currentPage ++;
      console.log(this.state.currentPage,"加载。。。2");
      this.showInformationList();
    }
  }

  /**
   * item点击事件
   */
  _onItemClick(item) {
    this.setModalVis(true,item);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headView: {
    width: width,
    height: 50,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerView: {
    flexDirection: 'row',
    width: width,
    height: 50,
    //backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemImages: {
    width: 60,
    height: 60,
    resizeMode: 'stretch'
  },
});