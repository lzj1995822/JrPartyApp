import React from 'react';
import { $http, $imgUpload } from "../../api";
import Flex from "@ant-design/react-native/es/flex";
import {Alert, DeviceEventEmitter, Image, Modal, Text, TextInput} from "react-native";
import ImagePicker from "@ant-design/react-native/es/image-picker/index";
import commonStyle from '../../styles/common';
import CameraScreen from "../../components/CameraScreen";
import {Button, WhiteSpace} from "@ant-design/react-native";

export default class OfficeFeedback extends React.Component{

    // 默认接受属性的值以及接受的属性
    static defaultProps = {
        // 任务对象指派表Id -- ParActivityObject - id
        objectId: '',
        readOnly: false
    }

    //构造函数
    constructor(props) {
        super(props);
        this.state = {
            // 反馈项存储数组
            feedbackItems: [],
            // 上传上去的图片包含新拍摄的
            images: [],
            // 拍照界面是否显示
            camVis: false,
            // 拍照时图片的Index
            camIndex: null,
            // 执行Loading标志
            executeLoading: false
        };
        // 绑定函数到实例
        this.fetchTemplateItemAndValue.bind(this);
        this.updateFeedback.bind(this);
        this.execute.bind(this)

        //绑定渲染函数到实例
        this.renderCommonString.bind(this);
        this.renderCommonFile.bind(this);
        this.renderCommonImage.bind(this);
    }

    /* ------------ 生命周期 ------------*/

    //生命周期--挂载完成 可以试用setState
    componentDidMount() {
        // 获取反馈项
        this.fetchTemplateItemAndValue(this.props.objectId);

        this.deEmitter = DeviceEventEmitter.addListener('taked', (file) => {
            this.setState({camVis: false})
            if (file) {
                $imgUpload(file).then(url => {
                    let current = this.state.feedbackItems[this.state.camIndex];
                    if (current.value) {
                        current.value += ( ',' + url);
                    } else {
                        current.value = url;
                    }
                    this.updateFeedback(current);
                })
            }
        });
    }

    //生命周期--即将卸载
    componentWillUnMount() {
        this.deEmitter.remove();
    }

    /* ------------ 渲染区域 ------------*/

    // 常规项渲染
    renderCommonString(item) {
        return (
            <Flex justify='between' align='start' style={commonStyle.formItem}>
                <Text style={commonStyle.itemLabel}>{item.name}</Text>
                <TextInput style={[commonStyle.listValue, {width: 200, textAlign: 'right'}]}
                           editable={!this.props.readOnly}
                           numberOfLines={1}
                           onChangeText={value => {item.value = value}}
                           onBlur={() => {this.updateFeedback(item)}}>{item.value}</TextInput>
            </Flex>
        )
    }
    // 文件列表渲染、只显示已上传的文件名，手机端不实现上传文件功能
    renderCommonFile(item) {
        let files = [];
        if (item.value) {
            files = item.value.split(',');
        }
        return (
            <Flex justify='between' direction='column' align='start' style={commonStyle.formItem}>
                <Text style={commonStyle.itemLabel}>{item.name}</Text>
                {
                    files.length === 0 ? <Text style={[commonStyle.listValue,{marginTop: 6}]}>暂无</Text> : files.map(file => <Text style={[commonStyle.listValue,{marginTop: 6}]} numberOfLines={1}>{file.split('&')[1]}</Text>)}
            </Flex>
        )
    }
    // 渲染执行活动的照片、显示已上传的照片、并且可以编辑
    renderCommonImage(item, index) {
        let images = [];
        if (item.value) {
            images = item.value.split(',').map((subItem) => {
                return { url: subItem, value: { uri: subItem }}
            });
        }
        return (
            <Flex justify='between' direction='column' align='start' style={commonStyle.formItem}>
                <Text style={[commonStyle.itemLabel, { marginBottom: 6 }]}>{item.name}</Text>
                <ImagePicker
                    selectable={!this.props.readOnly}
                    onChange={(files, type, subIndex) => {
                        if (type === 'remove' && !this.props.readOnly) {
                            images.splice(subIndex, 1)
                            item.value = images.map(item => item.url).join(',')
                            this.updateFeedback(item);
                        } else {
                            Alert.alert('提示', '待审核状态下不可编辑',[{text: '确认', onPress: () => {}}])
                        }
                    }}
                    onAddImageClick={() => {this.setState({camVis: true, camIndex: index})}}
                    files={images}
            />
            </Flex>
        )
        // officeAct.push(
        //     <Accordion.Panel header={<Text style={{fontSize: 14,flex: 1,paddingTop:8, paddingBottom: 8}}>{item.name}</Text>}>
        //         <ScrollView horizontal={true}>
        //             <Flex style={{overflowX: 'scroll'}}>
        //                 {images}
        //             </Flex>
        //         </ScrollView>
        //     </Accordion.Panel>
        // )
    }
    render() {
        let officeAct = [];

        this.state.feedbackItems.forEach((item, index) => {
            if (item.type === 'String') {
                officeAct.push(this.renderCommonString(item))
            } else if (item.type === 'File') {
                officeAct.push(this.renderCommonFile(item));
            } else if (item.type === 'Image')  {
                officeAct.push(this.renderCommonImage(item, index));
            }

        });

        officeAct.push(
            <Text style={{paddingLeft: 10,paddingTop:6, width: '100%', textAlign: 'left', color: '#409eff'}}>友情提示：该页面的数据实时保存!</Text>
        )
        if (!this.props.readOnly) {
            officeAct.push(
                <WhiteSpace size="lg"/>,
                <Button
                    style={{flex: 1,width: '100%',marginBottom: 30}}
                    onPress={() => {this.execute() }}
                    loading={this.state.executeLoading}
                    disabled={this.state.executeLoading}
                    type="primary"
                ><Text>提交</Text></Button>,
            )
        }
        officeAct.push(
            <Modal animationType={"slide"}
                transparent={false}
                visible={this.state.camVis}
                onRequestClose={() => {this.setState({camVis: false})}}>
                <CameraScreen/>
            </Modal>
        )
        return officeAct;
    }

    /* ------------ 函数区域 ------------*/

    //获取该任务的所有反馈项及数据
    fetchTemplateItemAndValue(objectId) {
        let path = 'identity/feedbackItemValue/list';
        $http(path, 'POST', { objectId: objectId }).then( result => {
            console.log(result, "res")
            this.setState({
                feedbackItems: result
            });
        });
    }
    //更新反馈项数据
    updateFeedback(item) {
        let path = `identity/feedbackItemValue/${item.id}id`;
        $http(path, 'PUT', item).then( _ => {
            this.fetchTemplateItemAndValue(this.props.objectId)
        });
    }
    // 机关任务执行
    execute() {
        this.setState({ executeLoading: true })
        let path = `identity/parActivityObject/officeExecute/${this.props.objectId}id`;
        $http(path, 'POST', {}).then( _ => {
            this.setState({ executeLoading: false })
            Alert.alert(
                '提示',
                '提交成功',
                [
                    {
                        text: '确认', onPress: () => {
                            this.props.onExecuteFinish();
                        }
                    },
                ],
            )
        })
    }
}
