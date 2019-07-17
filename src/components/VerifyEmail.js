import React, { Component } from 'react';
import firebase from '../../utils/firebase'
import Spinner from 'react-native-loading-spinner-overlay';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  Alert, KeyboardAvoidingView,AsyncStorage
} from 'react-native';
import {login} from "../../assets/images/index";

export default class VerifyEmail extends Component {


  constructor(props) {
    super(props);
    this.state = {
      email   : "email",
      spinner: false,
      mailSent: false
    }
}


  onClickListener = (viewId) => {
      
      let obj = this;
      obj.setState({spinner:true})
     var email = this.state.email
     firebase.auth().currentUser.sendEmailVerification().then(function() {
        Alert.alert("Information","Verification link has been sent to your Email");
        obj.props.navigation.navigate("Home");
        obj.setState({spinner:false})
       }, function(error) {
         Alert.alert("Error",error.toString());
         obj.setState({spinner:false})
       });
      
  }

  render() { 
    return (
      <View style={styles.container}>

      
        <Image source={login} style={{height:170,width:"100%"}}/>
       
        <Text style={{padding:10}}>An Email would be sent to you. Please follow the link there in to verify your email.</Text>
      
{this.state.spinner ?
    (<Spinner
     visible={true}
     textContent={'Loading...'}
     textStyle={styles.spinnerTextStyle}
   />) : null }

        <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('verification')}>
          <Text style={styles.loginText}>Send Email Verification</Text>
        </TouchableOpacity>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection:'column',
    width:'100%',
    height:'100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9F9',
  },
  inputContainer: {
      borderBottomColor: '#F5FCFF',
      backgroundColor: '#F8F9F9',
      borderRadius:0,
      borderBottomWidth: 1,
      width:250,
      height:45,
      borderBottomColor: '#000',
      borderBottomWidth: 1,
      marginBottom:15,
      flexDirection: 'row',
      alignItems:'center'
  },
  inputs:{
      height:45,
      marginLeft:16,
      borderBottomColor: '#FFFFFF',
      flex:1,
  },
  icon:{
    width:30,
    height:30,
  },
  inputIcon:{
    marginLeft:15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
   
  },
  loginButton: {
    backgroundColor: '#2760E0',
  },
  fabookButton: {
    backgroundColor: "#3b5998",
  },
  googleButton: {
    backgroundColor: "#ff0000",
  },
  loginText: {
    color: 'white',
  },
  restoreButtonContainer:{
    width:250,
    marginBottom:15,
    alignItems: 'flex-end'
  },
  socialButtonContent:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  socialIcon:{
    color: "#FFFFFF",
    marginRight:5
  }
});