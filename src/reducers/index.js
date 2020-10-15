import { combineReducers } from 'redux'
import data from './data'
import ui from './ui'

const reducers = combineReducers({
  data,
  ui
})

export default reducers
