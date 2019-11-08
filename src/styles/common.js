import {StyleSheet} from "react-native";

export default StyleSheet.create({
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
        textAlignVertical: 'top'
    },
    itemValue: {
        color: '#265498',
        width: 50,
        textAlign: 'right'
    },
    listValue: {
        color: '#9b9b9b',
        textAlignVertical: 'top',
    }
});
