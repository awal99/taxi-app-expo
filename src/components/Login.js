import React, { Component } from 'react';
import firebase from '../../utils/firebase'
import ValidationComponent from 'react-native-form-validator';
import Spinner from 'react-native-loading-spinner-overlay';
import { Facebook } from 'expo';
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


export default class LoginForm extends ValidationComponent {


  constructor(props) {
    super(props);
    this.state = {
      email   : "email",
      password: "ppp",
      spinner: false,
      authenticated: false
    }
}


async logInWithFacebook() {
  try {
    const {
      type,
      token,
      expires,
      permissions,
      declinedPermissions,
    } = await Facebook.logInWithReadPermissionsAsync('1101917176671492', {
      permissions: ['public_profile'],
    });
    if (type === 'success') {
      // Get the user's name using Facebook's Graph API
      const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
      Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
      this.props.navigation.navigate("Home");
    } else {
      // type === 'cancel'
    }
  } catch ({ message }) {
    Alert.alert("Error",`Facebook Login Error: ${message}`);
  }
}

 saveUser = async userD => {
  try {
    await AsyncStorage.setItem('user', userD);
  } catch (error) {
    // Error retrieving data
    console.log(error.message);
  }
};

firebaseAuthenticate= async (e,p)=>{
   await firebase
    .auth()
    .signInWithEmailAndPassword(e,p)
    .then((user)=>{
        this.saveUser(user);
       
    })
    .catch(error => {if(error){
        Alert.alert("Error",error.message);
        this.setState({spinner:false});
    }}) 
  }

  // onLoginOrRegister = () => {
  //   const { phoneNumber } = this.state;
  //   firebase.auth().signInWithPhoneNumber(phoneNumber)
  //     .then((confirmResult) => {
  //       // This means that the SMS has been sent to the user
  //       // You need to:
  //       //   1) Save the `confirmResult` object to use later
  //       this.setState({ confirmResult });
  //       //   2) Hide the phone number form
  //       //   3) Show the verification code form
  //     })
  //     .catch((error) => {
  //       const { code, message } = error;
  //       // For details of error codes, see the docs
  //       // The message contains the default Firebase string
  //       // representation of the error
  //     });
  // }
  // onVerificationCode = () => {
  //   const { confirmResult, verificationCode } = this.state;
  //   confirmResult.confirm(verificationCode)
  //     .then((user) => {
  //       // If you need to do anything with the user, do it here
  //       // The user will be logged in automatically by the
  //       // `onAuthStateChanged` listener we set up in App.js earlier
  //     })
  //     .catch((error) => {
  //       const { code, message } = error;
  //       // For details of error codes, see the docs
  //       // The message contains the default Firebase string
  //       // representation of the error
  //     });
  // }


  onClickListener = (viewId) => {
      this.setState({spinner:true})
    this.validate({
        password: {minlength:6, maxlength:10, required: true},
        email: {email: false}
      });
        this.firebaseAuthenticate(this.state.email,this.state.password);
       
  }

  render() {
    return (
      <View style={styles.container}>

      {this.state.spinner ?
         (<Spinner
          visible={true}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />) : null }

        <Image source={login} style={{height:170,width:"100%"}}/>
        {this.isFieldInError('email') && this.getErrorsInField('email').map(errorMessage => <Text>{errorMessage}</Text>) }
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputs}
              placeholder="Email"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
              onChangeText={(email) => this.setState({email})}/>
              
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputs}
              placeholder="Password"
              secureTextEntry={true}
              underlineColorAndroid='transparent'
              onChangeText={(password) => this.setState({password})}/>
        </View>
     
        <TouchableOpacity style={styles.restoreButtonContainer} onPress={() =>this.props.navigation.navigate('PasswordReset')}>
            <Text>Forgot?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.loginContainer, styles.loginButton]} onPress={() => this.onClickListener('login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer} onPress={() => this.props.navigation.navigate('SignUp')}>
            <Text>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonContainer, styles.fabookButton]} onPress={()=>{this.logInWithFacebook()}}>
          <View style={styles.socialButtonContent}>
            <Image style={styles.icon} source={{uri: 'https://png.icons8.com/facebook/androidL/40/FFFFFF'}}/>
            <Text style={styles.loginText}>Continue with facebook</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonContainer, styles.googleButton]}>
          <View style={styles.socialButtonContent}>
            <Image style={styles.icon} source={{uri: 'https://png.icons8.com/google/androidL/40/FFFFFF'}}/>
            <Text style={styles.loginText}>Sign in with google</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  loginContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:300,
   
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
    backgroundColor: "#2760E0",
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
 



// import React, { Component } from 'react';
// import firebase from '../../utils/firebase'
// import ValidationComponent from 'react-native-form-validator';
// import Spinner from 'react-native-loading-spinner-overlay';
// import { createStackNavigator, createAppContainer } from 'react-navigation';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   Button,
//   TouchableHighlight,
//   Image,
//   Alert, KeyboardAvoidingView,AsyncStorage
// } from 'react-native';


// export default class LoginForm extends ValidationComponent {

//   constructor(props) {
//     super(props);
//     this.state = {
//       email   : "email",
//       password: "ppp",
//       spinner: false,
//       authenticated: false
//     }
   

    
//   }

 
//  saveUser = async userD => {
//   try {
//     await AsyncStorage.setItem('user', userD);
//   } catch (error) {
//     // Error retrieving data
//     console.log(error.message);
//   }
// };

// firebaseAuthenticate= async (e,p)=>{
//    await firebase
//     .auth()
//     .signInWithEmailAndPassword(e,p)
//     .then((user)=>{
//         this.saveUser(user);
//         this.props.navigation.navigate('Home');
//     })
//     .catch(error => {if(error){
//         Alert.alert("Error",error.message);
//         this.setState({spinner:false});
//     }}) 
//   }

//   onClickListener = (viewId) => {
//       this.setState({spinner:true})
//     this.validate({
//         password: {minlength:6, maxlength:10, required: true},
//         email: {email: false}
//       });
//         this.firebaseAuthenticate(this.state.email,this.state.password);
       
//   }



//   render() {
//     return (
//         <KeyboardAvoidingView style={styles.container} behavior="padding">
//       <View style={styles.container}>

//       {this.state.spinner ?
//          (<Spinner
//           visible={true}
//           textContent={'Loading...'}
//           textStyle={styles.spinnerTextStyle}
//         />) : null }


//          <View style={styles.container} >
//             <Image style={styles.troskyIcon} source={require("../../assets/trosky_logo.png")}/>
//          </View>
//         <View style={styles.inputContainer}>
//           <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
//           <TextInput ref="email" style={styles.inputs}
//               placeholder="Email"
//               keyboardType="email-address"
//               underlineColorAndroid='transparent'
//               onChangeText={(email) => this.setState({email})}
//               />
//         </View>
//         {this.isFieldInError('email') && this.getErrorsInField('email').map(errorMessage => <Text>{errorMessage}</Text>) }
//         <View style={styles.inputContainer}>
//           <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
//           <TextInput ref="password" style={styles.inputs}
//               placeholder="Password"
//               secureTextEntry={true}
//               underlineColorAndroid='transparent'
//               onChangeText={(password) => this.setState({password})}
//               />
//         </View>
        

//         <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('login')}>
//           <Text style={styles.loginText}>Login</Text>
//         </TouchableHighlight>

//         <TouchableHighlight style={styles.buttonContainer} onPress={() => console.log("forgot password")}>
//             <Text>Forgot your password?</Text>
//         </TouchableHighlight>

//         <TouchableHighlight style={styles.buttonContainer} onPress={() => this.props.navigation.push('SignUp')}>
//             <Text>Register</Text>
//         </TouchableHighlight>
        
//       </View>
//       </KeyboardAvoidingView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },spinnerTextStyle: {
//     color: '#FFF'
//   },
//   inputContainer: {
//       borderBottomColor: '#000',
//       backgroundColor: '#F2F2F2',
     
//       borderBottomWidth: 1,
//       width:250,
//       height:45,
//       marginBottom:10,
//       flexDirection: 'row',
//       alignItems:'center'
//   },
//   inputs:{
//       height:45,
//       marginLeft:16,
//       borderBottomColor: '#FFFFFF',
//       flex:1,
//   },
//   inputIcon:{
//     width:30,
//     height:30,
//     marginLeft:15,
//     justifyContent: 'center'
//   }, 
//   troskyIcon:{
//     width:150,
//     height:50,
//    marginBottom: 10,
//     justifyContent: 'center'
//   },
//   buttonContainer: {
//     height:45,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom:7,
//     width:250,
//     borderRadius:30,
//   },
//   loginButton: {
//     backgroundColor: "#00b5ec",
//   },
//   loginText: {
//     color: 'white',
//   }
// });
 