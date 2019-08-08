import React from 'react';
import {ScrollView, Text, View} from "react-native";

export default class PlanningActivity extends React.Component {

    constructor() {
        super();
        this.state = {
            activityList: []
        };
        this.fetchActivityData.bind(this)
    }
    componentDidMount() {
        this.fetchActivityData();
    }
    fetchActivityData() {
        let url = 'http://122.97.218.162:21018/api/identity/parActivity/page?page=0&size=7';
        let params = {
            currentStatus: "PLANNING"
        };
        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        }).then((res) => res.json()).then(res => {
            this.setState({
                activityList: this.state.activityList.concat(res.content.content)
            })
        })
    }
    renderActivityList() {
        return this.state.activityList.map(item => {
            return (
                <View>
                    <Text>{item.title}</Text>
                    <Text>{item.month}</Text>
                </View>
            )
        });
    }
    render() {
        return (
            <ScrollView>
                <Text>计划中</Text>
                {this.renderActivityList()}
            </ScrollView>
        )
    }
}