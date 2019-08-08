type GetToken = {
    value: String,
};

export const initialState: GetToken = {
    value: '',
};

export default function GetTokenReducer(
    state: GetToken = initialState,
    action
): GetToken  {
    switch (action.type) {
        case 'SET_TOKEN':
            return Object.assign({}, state, {
                value: action.value,
            });
        default:
            return Object.assign({}, state, {
                value: state.value,
            });
    }
}
