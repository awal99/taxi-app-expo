import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity 
} from 'react-native';
import {Header} from 'react-native-elements';
import firebase from "../../utils/firebase";
import Icon from "react-native-vector-icons/FontAwesome";
import {home,history,logout} from "../../assets/images/index";

export default class ProfileView extends Component {

  render() {
    return (
      <View style={styles.container}>
                <Header
                placement="left"
                leftComponent={<TouchableOpacity style={{width:70,height:70,justifyContent:'center'}} onPress={()=>this.props.navigation.navigate("Home")}>
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>}
                centerComponent={{ text: 'Profile', style: { color: '#fff' } }}
                
                containerStyle={{
                    backgroundColor: '#2760E0',
                  }}
                />
          <View style={styles.header}>
            <View style={styles.headerContent}>
                <Image style={styles.avatar}
                  source={{uri: 'https://bootdey.com/img/Content/avatar/avatar6.png'}}/>

                <Text style={styles.name}>John Doe </Text>
                <Text style={styles.userInfo}>{firebase.auth().currentUser.email}</Text>
                <Text style={styles.userInfo}>{firebase.auth().currentUser.displayName}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <TouchableOpacity style={styles.item} onPress={()=>this.props.navigation.navigate("Home")}>
              <View style={styles.iconContent}>
                <Image style={styles.icon} source={home}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>Home</Text>
              </View>
            </TouchableOpacity>
 
            {/* <TouchableOpacity style={styles.item}>
              <View style={styles.iconContent}>
                <Image style={styles.icon} source={require('../../assets/payment.png')}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>Payment History</Text>
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.item} onPress={()=>this.props.navigation.navigate("Rides")}>
              <View style={styles.iconContent}>
                <Image style={styles.icon} source={history}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>Trips/Requests</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={()=>{firebase.auth().signOut().then(function(){console.log("loggin out...")},function(error){Alert.alert("Error",error.errorMessage)})}}>
              <View style={styles.iconContent}>
                <Image style={styles.icon} source={logout}/>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.info}>Logout</Text>
              </View>
            </TouchableOpacity>

          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header:{
    backgroundColor: "#2760E0",
  },
  headerContent:{
    padding:30,
    alignItems: 'center',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom:10,
  },
  name:{
    fontSize:22,
    color:"#ffffff",
    fontWeight:'600',
  },
  userInfo:{
    fontSize:16,
    color:"#778899",
    fontWeight:'600',
  },
  body:{
    backgroundColor: "#2760E0",
    height:500,
    alignItems:'flex-start',
  },
  item:{
    flexDirection : 'row',
  },
  infoContent:{
    
    alignItems:'flex-start',
    paddingLeft:5
  },
  iconContent:{
    width:100,
    alignItems:'flex-end',
    paddingRight:5,
  },
  icon:{
    width:20,
    height:20,
    marginTop:20,
  },
  info:{
    fontSize:12,
    marginTop:20,
    color: "#d2d2d2",
  }
});
 