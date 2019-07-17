import React from "react";
import firebase from "../../utils/firebase";
import {trosky_logo1} from "../../assets/images/index";
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Button,
  Image
} from "react-native";

class AuthLoading extends React.Component {
  constructor(props) {
    super(props);
    this._checkUserLoginStatus();
  }

  saveUser = async userD => {
    try {
      await AsyncStorage.setItem("userDetails", userD);
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  };

  _checkUserLoginStatus = async () => {
    await firebase.auth().onAuthStateChanged(
      userlog => {
        if (userlog != null) {
          console.log("We are authenticated now!");
          //this._bootstrapAsync();
          //userToken = AsyncStorage.getItem("userDetails");
          var check = firebase.auth().currentUser.emailVerified 
          if(check)
           this.props.navigation.navigate("Home")
           else
           this.props.navigation.navigate('VerifyEmail');
         
        }else{
        this.props.navigation.navigate("Auth");
        console.log("We are not authenticated");
        }
      },
      error => {
        if (error) {
          Alert.alert("Error", error.message);
        }
      }
    );
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <View style={styles.container}>
          <Image
            style={styles.logo}
            source={trosky_logo1}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  logo: {
    width: 150,
    height: 150,
    justifyContent: "center"
  }
});

export default AuthLoading;
