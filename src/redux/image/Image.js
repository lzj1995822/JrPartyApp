type GetImages = {
    value: Array,
};

export const initialState: GetImages = {
    value: [],
};

export default function GetImagesReducer(
    state: GetImages = initialState,
    action
): GetImages  {
    switch (action.type) {
        case 'SET_IMAGES':
            return Object.assign({}, state, {
                value: action.value,
            });
        default:
            return Object.assign({}, state, {
                value: state.value,
            });
    }
}
