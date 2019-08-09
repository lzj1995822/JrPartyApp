import { combineReducers } from 'redux';

// ## Generator Reducer Imports
import token from './token/Token';
import user from './user/UserInfo';
import image from  './image/Image';

export default combineReducers({
  // ## Generator Reducers
  token,
  user,
  image
});
