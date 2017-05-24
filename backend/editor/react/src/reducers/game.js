const game = (state = {}, action) => {
  switch (action.type) {
    case 'SET_PROP':
      var newp = {};
      newp[action.key] = action.value;
      return Object.assign({}, state, newp);
    default:
      return state
  }
}

export default game;
