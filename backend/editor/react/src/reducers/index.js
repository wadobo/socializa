import { combineReducers } from 'redux';
import game from './game';
import challenges from './challenges';

const GameApp = combineReducers({
  game,
  challenges,
});

export default GameApp;
