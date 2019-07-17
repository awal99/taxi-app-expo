import React, { Component } from 'react';
import firebase from '../../utils/firebase'
import Spinner from 'react-native-loading-spinner-overlay';
import ValidationComponent from 'react-native-form-validator';
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
import {forgotpass} from "../../assets/images/index";

export default class PasswordReset extends ValidationComponent {


  constructor(props) {
    super(props);
    this.state = {
      email   : "email",
      spinner: false,
      mailSent: false
    }
}


// changePassword = (currentPassword, newPassword) => {
//     this.reauthenticate(currentPassword).then(() => {
//       var user = firebase.auth().currentUser;
//       user.updatePassword(newPassword).then(() => {
//         console.log("Password updated!");
//       }).catch((error) => { console.log(error); });
//     }).catch((error) => { console.log(error); });
//   }


  onClickListener = (viewId) => {
      
      let obj = this;
      obj.setState({spinner:true})
     var email = this.state.email
        firebase.auth().sendPasswordResetEmail(email)
          .then(function (user) {
              //console.log(user);
              obj.setState({spinner:false})
            Alert.alert("Infomation","A password reset email was sent to "+email);
          }).catch(function (e) {
            obj.setState({spinner:false})
            Alert.alert("Error",e.toString());
          })
      
  }

  render() {
    return (
      <View style={styles.container}>

      
        <Image source={forgotpass.png} style={{height:170,width:"100%"}}/>
       
        <Text style={{padding:10}}>An Email would be sent to you. Please follow the link therein to reset your password.</Text>
        {this.isFieldInError('email') && this.getErrorsInField('email').map(errorMessage => <Text>{errorMessage}</Text>) }
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputs}
              placeholder="Email"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
              onChangeText={(email) => this.setState({email})}/>
              
        </View>
        
{this.state.spinner ?
    (<Spinner
     visible={true}
     textContent={'Loading...'}
     textStyle={styles.spinnerTextStyle}
   />) : null }

        <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('ResetPassword')}>
          <Text style={styles.loginText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer} onPress={() => this.props.navigation.navigate('Auth')}>
            <Text>Go Back To Login</Text>
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