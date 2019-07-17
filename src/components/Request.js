import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Button,
  TextInput,
  Image,
  Alert,
  AsyncStorage,
  Keyboard
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Icon from "react-native-vector-icons/FontAwesome";
import RNGooglePlaces from "react-native-google-places";
import { OpenMapDirections } from "react-native-navigation-directions";
import MapView, {
  MAP_TYPES,
  ProviderPropType,
  Marker
} from "react-native-maps";
import { Constants, Location, Permissions } from "expo";
import Modal from "react-native-modal";
import TimerMixin from "react-timer-mixin";
import { CheckBox,ListItem, Header} from "react-native-elements";
import geolib from "geolib";
//import MapInput from "./MapInputComonent";
import calculateFare from "./FareCalculator";
import firebase from "../../utils/firebase";
import MapViewDirections from 'react-native-maps-directions';
import {startMarker,endMarker} from "../../assets/images/index";

//import MapInput from './MapInputComonent';

mixins: [TimerMixin]; 

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE = 9.3947217;
const LONGITUDE = -0.8169188;
const LATITUDE_DELTA = 0.0222;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 2000
};

// const drivers = {
//   driver1: { id: "1223", longitude: -0.8169188, latitude: 9.3947217 },
//   driver2: { id: "1234", longitude: -0.8157088, latitude: 9.3944517 },
//   driver3: { id: "1245", longitude: -0.8149188, latitude: 9.3943717 }
// };

class Request extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fare: 0.0,
      estimatedTime: 0,
      driverTime:0,
      ride: '',
      requestID:'0',
      finalFare:0.0,
      spinner: false,
      navigation:false,
      readToRquest:false,
      pickUp:null,
      toggleModal:'',
      searchTerm1:'NaN',
      searchTerm2:'NaN',
      searchStartTerm: "NaN",
      searchEndTerm: "NaN",
      journeyStatus:'Pending',
      pickupLat:'',
      pickupLon:'',
      dropOffLat:'',
      dropOffLon:'',
      searchResult:null,
      sourcelatitude:'',
      sourcelongitude:'',
      destlatitude: 0,
      destlongitude: 0,
      single: false,
      shared: false,
      bookshared: false,
      booksingle: false,
      isVisible: false,
     myLatitude:'',
     myLongitude:'',
      drivers: {},
      selectedDriver:null,
      selectedDriverID:'',
      car:null,
      tripID:''
    };
    //this.getRequestStatus();
    // this.myLocation();
     //this.getDrivers();
    //this.getSearchTerm = this.getSearchTerm.bind(this);
   
    
  }

  componentWillMount(){
    let data = this.props.navigation.getParam("data","No-Data");
   /// console.log(data);
    let coordinates = data.coordinates;

    let start = data.startLocName.split(",");
    start = start[0];
    let end = data.endLocName.split(",");
    console.log(data.status);
    end = end[0];
    this.setState({
        pickupLat:coordinates[0],
        pickupLon:coordinates[1],
        dropOffLat:coordinates[2],
        dropOffLon:coordinates[3],
        journeyStatus:data.status,
        selectedDriverID:data.driverId,
        searchTerm1:start,
        searchTerm2:end,
        tripID:data.key,
        
    })

    region = {
        latitude: coordinates[0],
        longitude: coordinates[1],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
        this.setState({ region });


        
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged);
    }, 5000); //5 seconds

    //get selected driver details
    firebase.database().ref("drivers/"+this.state.selectedDriverID).once("value",snapshot =>{
        let driver = snapshot.val();
        this.setState({selectedDriver:driver,driverLoaded:true});
    });
        //this.timer = setTimeout(()=>{
    firebase.database().ref("trips/"+this.state.tripID+"/status").on("value",snapshot => {
        let value = snapshot.val();
        console.log(value);
        this.setState({journeyStatus:value});
    });
    
  } 

  componentDidUpdate(){
    if(this.state.car==null){
    firebase.database().ref("cars/"+this.state.selectedDriver.carID).once("value",snapshot =>{
        let car = snapshot.val();
        this.setState({car:car});
    });
    }

    if(this.state.driverTime == 0){
        this.getDriverTime();
    }
  }

  _callShowDirections() {

    const GEOLOCATION_OPTIONS = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 2000
    };
    
    Location.watchPositionAsync(GEOLOCATION_OPTIONS, (location)=>{
      console.log(location);
      this.setState({
        myLatitude:location.coords.latitude,
        myLongitude:location.coords.longitude,

      }) 
     
    });


    const startPoint = {
      longitude: this.state.myLongitude,
      latitude: this.state.myLatitude,
    };

    const endPoint = {
      longitude: this.state.dropOffLon,
      latitude: this.state.dropOffLat 
    };

    const transportPlan = "d";

    OpenMapDirections(startPoint, endPoint, transportPlan).then(res => {
      console.log(res);
    });
  };


  // getTripStatus(){
  //   firebase.database().ref("trips/"+)
  // }

  getDriverTime = async()=>{
    let lat=this.state.selectedDriver.latitude;
    let long = this.state.selectedDriver.longitude;

    let desLat = this.state.pickupLat;
    let desLong = this.state.pickupLon;
    try{
        const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${lat},${long}&destinations=${desLat},${desLong}&key=AIzaSyDUBFYYKjalX9b9IBiKnivW912dN-zMWvU`)
        const posts = await response.json()
        //console.log(posts.rows[0].elements[0].duration.text);
        this.setState({driverTime:posts.rows[0].elements[0].duration.text});
        }catch (e) {
         console.log(e);
    }
  }

  componentWillUnmount() {
    this.setState({ isVisible: false });
    clearInterval(this.interval);
  }

  ////////////////////////////get user data from async storage///////////////////////////
  getUserData = async () => {
    return await AsyncStorage.getItem("user");
  };

  onRegionChange(region) {
    this.setState({ region });
  }

  //////////////////////////GENERATE UNIQUE IDS DOE REQUESTS///////////
  guidGenerator = () => {
    var S4 = function() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };

  //////////////////////END OF GENERATE ID///////////////////////
  // jumpRandom() {
  //   this.setState({ region: this.randomRegion() });
  // }

  animateRandom() {
    this.map.animateToRegion(this.state.region);
  }

  ////////////////////////////////GET LIST OF ACTIVE DRIVERS FROM FIREBASE////////////////////


  ////////////////////////////////////GET PATH FROM GOOGLE API///////////////////////
  // const origin = {latitude: 37.3318456, longitude: -122.0296002};
  // const destination = {latitude: 37.771707, longitude: -122.4053769};
  // const GOOGLE_MAPS_APIKEY = '…';
  //////////////////////////////END OF GET PATH ///////////////////////////////////////
 
 
  locationChanged = location => {
    // console.log(location);
    (region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }),
      this.setState({ region });
  };

  randomRegion() {
    return {
      ...this.state.region,
      ...this.randomCoordinate()
    };
  }

  render() {
      let mylat = this.state.pickupLat
      let mylon = this.state.pickupLon
      let deslat = this.state.dropOffLat
      let destlon = this.state.dropOffLon
      //const {searchEndTerm,searchStartTerm,searchTerm1,searchTerm2} = this.state;
      
      let journeyStatus = this.state.journeyStatus;
      //let data = this.state.searchResult;
      
    return (
      <View style={styles.container}>
    
        <MapView
          provider={this.props.provider}
          ref={ref => {
            this.map = ref;
          }}
          mapType={MAP_TYPES.TERRAIN}
          style={styles.map}
          initialRegion={this.state.region}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          //onRegionChange={region => this.onRegionChange(region)}
        >
        
            <View>
            <Marker
            style={{ width: 10, height: 10 }}
            coordinate={{
              latitude: mylat,
              longitude: mylon
            }}
            image={startMarker}
            />
            <Marker
            style={{ width: 10, height: 10 }}
            coordinate={{
              latitude: deslat,
              longitude: destlon
            }}
            image={endMarker}
            />
            <MapViewDirections
              origin={{latitude:mylat,longitude:mylon}}
              destination={{latitude:deslat,longitude:destlon}}
              apikey={"AIzaSyDUBFYYKjalX9b9IBiKnivW912dN-zMWvU"}
              strokeWidth={4}
              strokeColor="hotpink"
              onReady={result => {
                let time = Math.round(result.duration * 100) / 100
                this.setState({distance:result.distance,estimatedTime:time})
                this.map.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: (width / 20),
                    bottom: (height / 20),
                    left: (width / 20),
                    top: (height / 20),
                  }
                });
              }}
            />
          </View>
          {/* ):null} */}
        </MapView>
        <Header
        placement="center"
        leftComponent={<TouchableOpacity onPress={()=>this.props.navigation.navigate("Rides")}>
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>}
        centerComponent={{ text: 'Trosky', style: { color: '#fff',fontWeight:"bold" } }}
        
        containerStyle={{
            backgroundColor: '#2760E0',
            top:0,
            width:"100%",
            position:"absolute"
            }}
        />

          {/* Driver details modal */}

       
            {this.state.driverLoaded ?
          (<View style={styles.bookRideWrapper} >
              <View style={{flexDirection:'row',margin:10,justifyContent:'space-between'}}>
                <View style={{flexDirection:'column',justifyContent:'flex-start'}} >
                    <Image source={{uri:this.state.selectedDriver.img}} style={{height:50,width:50,borderRadius:50}}/>
                </View>
                <View style={{flexDirection:'row',justifyContent:'center'}} >
                    <View style={{flexDirection:'column',justifyContent:'center'}}>
                    <Text style={{color:'#fff'}}>{this.state.selectedDriver.username}</Text>
                     <Text style={{color:'#fff'}}>{this.state.car !=null ? this.state.car.plateno:"NaN"}</Text>
                     <Text style={{color:'#fff'}}>{this.state.car !=null ? this.state.car.description:"NaN"}</Text>
                    </View>
                   
                </View>

                <View style={{flexDirection:'column',justifyContent:'center'}} >
                    {journeyStatus==="Cancelled" ? null : (<Text style={{color:'#fff',fontSize:18}}>{this.state.driverTime}</Text>) } 
                </View>
                 
              </View>
              
              <View style={{flexDirection:'row',flex:1,justifyContent:'space-between',paddingHorizontal:10}}>
                    <View style={{flexDirection:'row',justifyContent:'flex-start'}}>
                        <Image source={startMarker} style={{width:20,height:20}}/><Text style={{color:'#fff'}}>{this.state.searchTerm1}</Text>
                        <Text> > </Text>
                        <Image source={endMarker} style={{width:20,height:20}}/><Text style={{color:'#fff'}}>{this.state.searchTerm2}</Text>
                    </View>
              </View>

              {this.state.journeyStatus=="Cancelled"? null : this.state.journeyStatus == "Started"?
              (
                <View style={{flexDirection:'row',flex:1,justifyContent:'center',marginHorizontal:10,}}>
                   
                     <TouchableOpacity style={{width:'80%',height:40,justifyContent:'center',alignItems:'center',bottom:7,backgroundColor:'#fff'}}
                     onPress={()=>{
                       //store cancel state to database and navigate to trips
                      this._callShowDirections();
                     }}>
                       <Text style={{alignSelf:'center'}}>Get Directions</Text>
                     </TouchableOpacity>
                </View>) : 
              (
                <View style={{flexDirection:'row',flex:1,justifyContent:'center',marginHorizontal:10,}}>
                   
                     <TouchableOpacity style={{width:'80%',height:40,justifyContent:'center',alignItems:'center',bottom:7,backgroundColor:'#fff'}}
                     onPress={()=>{
                       //store cancel state to database and navigate to trips
                       this.setState({spinner:true});
                       firebase
                          .database()
                          .ref("trips/" + this.state.tripID)
                          .update({
                          status: "Cancelled",
                          
                          })
                          .then(data => {
                          //success
                          this.setState({spinner:true,journeyStatus:"Cancelled"});
                          Alert.alert("Info","Trip cancelled successfully"); 
                          this.props.navigation.navigate("Rides")
                          })
                          .catch(error => {
                          console.log("error", error);
                          });
                     }}>
                       <Text style={{alignSelf:'center'}}>Cancel</Text>
                     </TouchableOpacity>
                </View>)  
              }


            </View>):
          
          (<View style={styles.bookRideWrapper}>
            <Text>Waiting for Pickup. Estimated duration <Text>20min</Text></Text>
          </View>)
        }

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

// Home.propTypes = {
//   provider: ProviderPropType
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    backgroundColor: "rgba(0,0,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 100,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5
  },
  buttonContainer: {
    justifyContent:'center',
    flexDirection: "row",
    width: '100%',
    height: 70,
    borderRadius: 10,
    bottom: -15,
    backgroundColor: "rgba(0,0,255,0.9)"
  },
  searchContainer: {
    flexDirection: "column",
    top: 10,
    marginHorizontal:10,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#eeff22"
  },
  buttonText: {
    textAlign: "center"
  },
  content: {
    flexDirection: "column",
    color: "#fff",
    height: 500,
    backgroundColor: "#3374FF",
    paddingLeft: 22,
    paddingRight: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  contentTitle: {
    fontSize: 16,
    marginBottom: 12,
    top: 10,
    color: "white"
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderBottomWidth: 1,
    width: 150,
    height: 30,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#808080",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF",
    flex: 1
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    justifyContent: "center"
  },
  spinnerTextStyle: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold"
  },
  searchBox:{
    top:0,
    position:"absolute",
    width:width,
    backgroundColor:'rgba(200,200,200,0.5)',
    borderBottomColor:'#000',
    borderBottomWidth:1,
},
inputWrapper:{
    marginLeft:15,
    marginRight:10,
    marginTop:10,
    marginBottom:0,
    backgroundColor:"#fff",
    opacity:0.9,
    borderRadius:7
},
secondInputWrapper:{
    marginLeft:15,
    marginRight:10,
    marginTop:0,
    backgroundColor:"#fff",
    opacity:0.9,
    borderRadius:7
},
inputSearch:{
    fontSize:14,
    paddingHorizontal:10
},
label:{
    fontSize:10,
    fontStyle: "italic",
    marginLeft:10,
    marginTop:10,
    marginBottom:0
},
searchResultsWrapper:{
  top:160,
  position:"absolute",
  width:width,
  height:1000,
  backgroundColor:"#fff",
  opacity:0.9
},
bookRideWrapper:{
  borderRadius:10,
  position:"absolute",
  width:width,
  height:190,
  backgroundColor:"#2760E0",
  opacity:1,
  bottom:0
},
primaryText:{
  fontWeight: "bold",
  color:"#373737"
},
secondaryText:{
  fontStyle: "italic",
  color:"#7D7D7D",
  marginLeft:5
},
leftContainer:{
  flexWrap: "wrap",
  alignItems: "flex-start",
  borderLeftColor:"#7D7D7D",
},
leftIcon:{
  fontSize:20,
  color:"#7D7D7D",
},
distance:{
  fontSize:12,
}
});




const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5"
      }
    ]
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161"
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5"
      }
    ]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff"
      }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161"
      }
    ]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e"
      }
    ]
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5"
      }
    ]
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e"
      }
    ]
  }
];

export default Request;
