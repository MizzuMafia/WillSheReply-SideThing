import { combineReducers } from "redux";

const initialState = {
  user: null,
  credits: 0,
  chats: {},
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_CREDITS":
      return { ...state, credits: action.payload };
    case "SET_CHATS":
      return { ...state, chats: action.payload };
    default:
      return state;
  }
};

export default combineReducers({ app: appReducer });