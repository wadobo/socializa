const challenge = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_CHALLENGE':
      return {
        id: action.id,
        name: action.text,
      }
    default:
      return state
  }
}

const challenges = (state = [], action) => {
  switch (action.type) {
    case 'ADD_CHALLENGE':
      return [
        ...state,
        challenge(undefined, action)
      ]
    case 'REMOVE_CHALLENGE':
      var newst = [];
      state.forEach(c => {
        if (c.id != action.id) {
            newst.push(c);
        }
      });
      return newst;
    default:
      return state
  }
}

export default challenges;
