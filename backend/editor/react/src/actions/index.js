let nextChallengeId = 0

export const addChallenge = (text) => {
  return {
    type: 'ADD_CHALLENGE',
    id: nextChallengeId++,
    text: text,
  }
}

export const removeChallenge = (id) => {
  return {
    type: 'REMOVE_CHALLENGE',
    id: id,
  }
}

export const setGameProp = (k, v) => {
  return {
    type: 'SET_PROP',
    key: k,
    value: v,
  }
}
