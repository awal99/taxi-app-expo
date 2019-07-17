import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LoginForm from './src/components/Login'
import { AppContainer } from './utils/routes';

// import TimerEnhance from 'react-native-smart-timer-enhance'
// import Toast from 'react-native-smart-loading-spinner-overlay'
//import 'bootstrap/dist/css/bootstrap.min.css';


export default class App extends React.Component {

  render() {
    return <AppContainer />
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});

