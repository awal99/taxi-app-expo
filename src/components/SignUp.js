import React, { Component } from 'react';
import firebase from '../../utils/firebase'
import ValidationComponent from 'react-native-form-validator';
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
import {signup} from "../../assets/images/index";


export default class SignUp extends ValidationComponent {


  constructor(props) {
    super(props);
    this.state = {
      email   : "email",
      password: "ppp",
      cpassword:'ppp',
      spinner: false,
      authenticated: false
    }
}


//  saveUser = async userD => {
//   try {
//     await AsyncStorage.setItem('user', userD);
//   } catch (error) {
//     // Error retrieving data
//     console.log(error.message);
//   }
// };

  firebaseUserSignUp=(e,p)=>{
    
    firebase
    .auth()
    .createUserWithEmailAndPassword(e, p)
    .then((user) => {
     Alert.alert("Information","Account Created Succefully")
        
    }) 
    .catch((error) => {
      this.setState({spinner:false});

      //this.setState({ error: error });
    
      Alert.alert("Signup Error",error.toString());
      
    });
  }

  onClickListener = (viewId) => {
      this.setState({spinner:true})
    if(this.state.password == this.state.cpassword){
    this.validate({
        password: {minlength:6, maxlength:10, required: true},
        email: {email: false}
      });
        this.firebaseUserSignUp(this.state.email,this.state.password);
    }else{
      this.setState({spinner:false});
      Alert.alert("Error","Password Mismatch");
     
    } 
       
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
 
        <Image source={signup} style={{height:170,width:"100%"}}/>
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
          <KeyboardAvoidingView behavior="padding">
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputs}
              placeholder="Confirm Password"
              secureTextEntry={true}
              underlineColorAndroid='transparent'
              onChangeText={(cpassword) => this.setState({cpassword})}/>
        </View>
          </KeyboardAvoidingView>
        <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('signup')}>
          <Text style={styles.loginText}>SignUp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonContainer]} onPress={() => this.props.navigation.navigate('Auth')}>
          <View style={styles.socialButtonContent}>
            <Text style={{color:'#000'}}>Have an Account? Singin!</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection:'column',
    height:'100%',
    width:'100%',
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
 


// import React, { Component } from 'react';
// import ValidationComponent from 'react-native-form-validator';
// import firebase from '../../utils/firebase';
// import { AppContainer } from '../../utils/routes';
// import {
// import { Spinner } from 'react-native-loading-spinner-overlay';
//   Text,
//   View,
//   TextInput,
//   Button,
//   TouchableOpacity,
//   Image,
//   Alert
// } from 'react-native';

// export default class SignUp extends Component {

//   constructor(props) {
//     super(props);
//     state = {
//       email   : '',
//       password: '',
//       error: null,
//     }
//   }

//   firebaseUserSignUp=(e,p)=>{
//     firebase
//     .auth()
//     .createUserWithEmailAndPassword(email, password)
//     .then((user) => {
//         this.props.navigation.push('Dashboard');
//     })
//     .catch((error) => {
//       this.setState({ error: error });
//     });
//   }

//   onClickListener = (viewId) => {
//     Alert.alert("Alert", "Button pressed "+viewId);
//   }

//   render() {
//     return (
//       <View style={styles.container}>
//         <Image style={styles.bgImage} source={{ uri: "https://lorempixel.com/900/1400/nightlife/8/" }}/>
//         <View style={styles.inputContainer}>
//         <Image style={styles.inputIcon} source={require("../../assets/user-circled.png")}/>
//           <TextInput style={styles.inputs}
//               placeholder="Full name"
//               underlineColorAndroid='transparent'
//               onChangeText={(email) => this.setState({email})}/>
//         </View>

//         <View style={styles.inputContainer}>
//         <Image style={styles.inputIcon} source={require("../../assets/secured-letter.png")}/>
//           <TextInput style={styles.inputs}
//               placeholder="Email"
//               keyboardType="email-address"
//               underlineColorAndroid='transparent'
//               onChangeText={(email) => this.setState({email})}/>
         
//         </View>
        
//         <View style={styles.inputContainer}>
//         <Image style={styles.inputIcon} source={require("../../assets/password.png")}/>
//           <TextInput style={styles.inputs}
//               placeholder="Password"
//               secureTextEntry={true}
//               underlineColorAndroid='transparent'
//               onChangeText={(password) => this.setState({password})}/>
         
//         </View>

//         <TouchableOpacity style={styles.btnByRegister} onPress={() => this.onClickListener('restore_password')}>
//             <Text style={styles.textByRegister}>By registering on this App you confirm that you have read and accept our policy</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('login')}>
//           <Text style={styles.loginText}>SignUp</Text>
//         </TouchableOpacity>


//         <TouchableOpacity style={styles.buttonContainer}  onPress={() => this.props.navigation.goBack()}>
//             <Text style={styles.btnText}>Have an account?</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// }

// const resizeMode = 'center';

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#DCDCDC',
//   },
//   inputContainer: {
//     borderBottomColor: '#F5FCFF',
//     backgroundColor: '#FFFFFF',
//     borderRadius:30,
//     borderBottomWidth: 1,
//     width:300,
//     height:45,
//     marginBottom:20,
//     flexDirection: 'row',
//     alignItems:'center',

//     shadowColor: "#808080",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,

//     elevation: 5,
//   },
//   inputs:{
//     height:45,
//     marginLeft:16,
//     borderBottomColor: '#FFFFFF',
//     flex:1,
//   },
//   inputIcon:{
//     width:30,
//     height:30,
//     marginRight:15,
//     justifyContent: 'center'
//   },
//   buttonContainer: {
//     height:45,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom:20,
//     width:300,
//     borderRadius:30,
//     backgroundColor:'transparent'
//   },
//   btnByRegister: {
//     height:15,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical:20,
//     width:300,
//     backgroundColor:'transparent'
//   },
//   loginButton: {
//     backgroundColor: "#00b5ec",

//     shadowColor: "#808080",
//     shadowOffset: {
//       width: 0,
//       height: 9,
//     },
//     shadowOpacity: 0.50,
//     shadowRadius: 12.35,

//     elevation: 19,
//   },
//   loginText: {
//     color: 'white',
//   },
//   bgImage:{
//     flex: 1,
//     resizeMode,
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//   },
//   btnText:{
//     color:"white",
//     fontWeight:'bold',
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: {width: -1, height: 1},
//     textShadowRadius: 10
//   },
//   textByRegister:{
//     color:"white",
//     fontWeight:'bold',
//     textAlign:'center',

//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: {width: -1, height: 1},
//     textShadowRadius: 10
//   }
// });  