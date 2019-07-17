import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableHighlight,
  Alert,
  Image,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Header } from "react-native-elements";
import firebase from "../../utils/firebase";
import Icon from "react-native-vector-icons/FontAwesome";
import Spinner from "react-native-loading-spinner-overlay";

const extractKey = ({ key }) => key;

export default class Rides extends Component {
  constructor(props) {
    super(props);
    //const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      spinner:true,
      dataSource: []
    };
  }

  componentDidMount() {
    //this.setState({spinner:true})
    let uid = firebase.auth().currentUser.uid;
    firebase
      .database()
      .ref("trips/")
      .orderByChild("customer")
      .equalTo(uid)
      .on("value", snapshot => {
        let processed = [];
        let data = snapshot.val();
        if(data != null){
        Object.keys(data).map((key, value) => {
          data[key].key = key;
          processed.push(data[key]);
        });
      }
        // let data = obj.cloneWithRo console.log(processed);
        this.setState({ dataSource:processed,spinner:false });
        //console.log(processed);
      });

  }

  componentWillMount(){
   
  }


  renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.notificationBox} onPress={()=>this.props.navigation.navigate("Request",{data:item})}>
        <View style={{ flexDirection: "column" }}>
          <Text style={[styles.description, { color: "#000" }]}>
            {item.date}
          </Text>
          <Text style={styles.description}>
            Status:{" "}
            <Text
              style={
                item.status == "Pending"
                  ? styles.pending
                  : item.status == "Cancelled"
                  ? styles.cancelled
                  : item.status == "Completed"
                  ? styles.completed
                  : { color: "#000" }
              }
            >
              {item.status}
            </Text>
          </Text>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.description}>Trip Type: {item.triptype}</Text>
          <Text style={styles.description}>Cost: {item.cost}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
     
    return (
      <View style={styles.container}>
        <Header
          placement="left"
          leftComponent={
            <TouchableOpacity
            style={{width:70,height:70,justifyContent:'center'}}
              onPress={() => {this.props.navigation.navigate("ProfileView")}}
            >
              <Icon name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          }
          centerComponent={{ text: "Trips/Request History", style: { color: "#fff" } }}
          containerStyle={{
            backgroundColor: "#2760E0"
          }}
        />

        <FlatList
          style={styles.notificationList}
          data={this.state.dataSource}
          renderItem={this.renderItem}
          keyExtractor={extractKey}
        />
         {this.state.spinner ?
         (<Spinner
          visible={true}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />) : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2760E0"
  },
  notificationList: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#2760E0"
  },
  notificationBox: {
    padding: 20,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderRadius: 10
  },
  pending: { color: "#FFFF11" },
  completed: { color: "#11FF11" },
  cancelled: { color: "#FF1111" },
  icon: {
    width: 45,
    height: 45
  },
  description: {
    fontSize: 12,
    color: "#d2d2d2",
    marginLeft: 10
  }
});
