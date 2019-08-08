import {object} from "prop-types";

type GetUser = {
    value: object,
};

export const initialState: GetUser = {
    value: {},
};

export default function GetUserReducer(
    state: GetUser = initialState,
    action
): GetUser  {
    switch (action.type) {
        case 'SET_USER':
            return Object.assign({}, state, {
                value: action.value,
            });
        default:
            return Object.assign({}, state, {
                value: state.value,
            });
    }
}
