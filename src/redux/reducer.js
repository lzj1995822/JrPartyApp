import { combineReducers } from 'redux';

// ## Generator Reducer Imports
import token from './token/Token';
import user from './user/UserInfo';

export default combineReducers({
  // ## Generator Reducers
  token,
  user
});
