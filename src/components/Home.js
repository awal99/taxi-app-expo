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
import MapView, {
  MAP_TYPES,
  ProviderPropType,
  Marker
} from "react-native-maps";
import { Constants, Location, Permissions } from "expo";
import Modal from "react-native-modal";
import TimerMixin from "react-timer-mixin";
import { CheckBox,ListItem,Header } from "react-native-elements";
import geolib from "geolib";
import MapInput from "./MapInputComonent";
import calculateFare from "./FareCalculator";
import firebase from "../../utils/firebase";
import {single,shared,startMarker,endMarker,carMarker} from '../../assets/images/index';
import MapViewDirections from 'react-native-maps-directions';

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

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fare: 0.0,
      estimatedTime: 0,
      ride: '',
      requestID:'0',
      finalFare:0.0,
      spinner: false,
      navigation:false,
      readToRquest:false,
      pickUp:null,
      toggleModal:'',
      journeyStatus:'No Request Yet',
      searchTerm1: "",
      searchTerm2: "",
      searchStartTerm: "",
      searchEndTerm: "",
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
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      drivers: {},
      selectedDriver:null,
      isModalVisible:false,
    };
    //this.getRequestStatus();
    // this.myLocation();
     this.getDrivers();
    //this.getSearchTerm = this.getSearchTerm.bind(this);
  }

  getCoordsFromName(loc) {
    this.setState({
      destlatitude: loc.lat,
      destlongitude: loc.lng
    });
   // this.setState({ isVisible: true });
    //Alert.alert("Info",'Destination Picked:'+loc)
  }
  getCoordsFromName1(loc) {
    this.setState({
      sourcelatitude: loc.lat,
      sourcelongitude: loc.lng
    });
    this.setState({ isVisible: true });
    //Alert.alert("Info",'Destination Picked:'+loc)
  }

  calculateDistance(){
     ////////////calculate the distance//////////////////
     let mylat = this.state.region.latitude;
     let mylon = this.state.region.longitude;
     let deslat = this.state.destlatitude;
     let destlon = this.state.destlongitude;
     let dist= geolib.getDistance(
       { latitude: mylat, longitude: mylon },
       { latitude: deslat, longitude: destlon }
     );
    return dist;
  }

  getSearchTerm(type,term) {
    if(type == 'pickUp' && term != ""){
      
      this.getAddressPredictions(term);
      this.setState({pickUp:true,searchTerm1:term});
    }else if(type == 'dropOff' && term != ""){
      
      this.getAddressPredictions(term);
      this.setState({pickUp:false,searchTerm2:term})
    }else{
      this.setState({pickUp:null,searchTerm2:""})
    }
    //this.setState({ destination: term });
  }

  handleSelectedAddress = async(selected)=>{
      let search = selected.description;
      let placeID = selected.place_id;
      //https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJrTLr-GyuEmsRBfy61i59si0&key=YOUR_API_KEY

      //set state of selected terms
      if(this.state.toggleModal == "pickUp"){
        this.setState({searchTerm1:search,searchStartTerm:search});
        try{
          const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=AIzaSyDUBFYYKjalX9b9IBiKnivW912dN-zMWvU`)
          const posts = await response.json()
          console.log(posts.result.geometry.location.lat);
          this.setState({
           pickupLat:posts.result.geometry.location.lat,pickupLon:posts.result.geometry.location.lng
          })
          }catch (e) {
           console.log(e);
         }
       
      } 
      if(this.state.toggleModal == "dropOff"){
        this.setState({searchTerm2:search,searchEndTerm:search});
        try{
          const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=AIzaSyDUBFYYKjalX9b9IBiKnivW912dN-zMWvU`)
          const posts = await response.json()
          console.log(posts.result.geometry.location.lat);
          this.setState({
            dropOffLat:posts.result.geometry.location.lat,dropOffLon:posts.result.geometry.location.lng
           })
           Keyboard.dismiss();
          }catch (e) {
           console.log(e);
         }
       
      }

    
      if(this.state.searchStartTerm != "" && this.state.searchEndTerm != ""){
        this.setState({pickUp:null,isVisible:true,navigation:true});

        // this.setState({
        //   selectedAddress:{
        //     selectedPickup:{latitude:'',longitude:''},
        //     selectedDropOff:{latitude:'',longitude:''}
        //   }

        // })
        //console.log("ready to fly");
      }
  }

  toggleSearchResultModal(type){
    this.setState({toggleModal:type});
  }

  getAddressPredictions=async(sTerm)=>{
   // https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Vict&types=(cities)&language=pt_BR&key=YOUR_API_KEY
   try{
   const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${sTerm}&components=country%3AGH&key=AIzaSyDUBFYYKjalX9b9IBiKnivW912dN-zMWvU`)
   const posts = await response.json()
   this.setState({searchResult:posts.predictions})
   }catch (e) {
    console.log(e);
  }
  //   let userInput = sTerm;
	//  await	RNGooglePlaces.getAutocompletePredictions(userInput,
	// 		{
	// 			country:"GH"
	// 		}
	// 	)
	// 	.then((results)=>{
  //       //get result into  an array and set searchResult state
  //       this.setState({searchResult:results});
  //       console.log(results);
  //   })
	// 	.catch((error)=> console.log(error.message));
  }

  componentDidMount() {
    // this.interval = setInterval(() => {
    //   Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged);
    // }, 5000); //5 seconds
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
  getDrivers() {
    let database = firebase.database().ref("drivers");
    database
      .orderByChild("status")
      .equalTo("Active")
      .on("value", snapshot => {
        let drivers = snapshot.val();
        let availableDrivers = [];
        Object.keys(drivers).map((key, value) => {
          if (drivers[key].isLoaded != "false") {
            availableDrivers.push(drivers[key])
          }
        });
        this.setState({ drivers: availableDrivers });
      });

     
  }
  //the function above returns drivers who are currently empty

  //////////////////////////////END OF GET DRIVERS FROM FIREBASE//////////////////////////////

  randomCoordinate() {
    const region = this.state.region;
    return {
      latitude:
        region.latitude + (Math.random() - 0.5) * (region.latitudeDelta / 2),
      longitude:
        region.longitude + (Math.random() - 0.5) * (region.longitudeDelta / 2)
    };
  }

  async myLocation() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== "granted") {
        this.setState({
          errorMessage: "Permission to access location was denied"
        });
      }

      let location = await Location.getCurrentPositionAsync({});

      this.locationChanged(location);
      this.animateRandom();
    }
  }
 
 
 
 
 
  //////////////////////////////////////MODAL CONTENT////////////////////////////////////
  // renderModalContent = () => (
  //   <View style={styles.content}>
  //     <Text style={styles.contentTitle}>You are about to book a Ride</Text>
  //     <Text style={styles.contentTitle}>
  //       Choosen Destination: {this.state.destination}
  //     </Text>
  //     <View
  //       style={{
  //         flex: 1,
  //         flexDirection: "column",
  //         justifyContent: "center"
  //       }}
  //     >
  //       <CheckBox
  //         left
  //         title="Single Ride"
  //         checked={this.state.single}
  //         onPress={() => {
  //           this.setState({ single: !this.state.single,shared: false,booksingle: false,bookshared: false });
  //           //////////////calculate the fare////////////////////
  //           this.setState({spinner:true});
  //           let distance = this.calculateDistance();
  //           let fareC = calculateFare("single", 0, distance);
  //           this.setState({ fare: fareC,ride:'single' });
  //           this.setState({spinner:false});
  //         }}
  //       />
  //       <CheckBox
  //         left
  //         title="Shared Ride"
  //         checked={this.state.shared}
  //         onPress={() => {
  //           this.setState({ single: false,shared: !this.state.shared,booksingle: false,bookshared: false });
  //           //////////////calculate the fare////////////////////
  //           this.setState({spinner:true});
  //           let distance = this.calculateDistance();
  //           let fareC = calculateFare("shared", 0,distance);
  //           this.setState({ fare: fareC,ride:'shared' });
  //           this.setState({spinner:false});
  //         }}
  //       />
  //       <CheckBox
  //         left
  //         title="Book Single"
  //         checked={this.state.booksingle}
  //         onPress={() => {
  //           this.setState({ single: false,shared: false,booksingle: true,bookshared: false });
  //           //////////////calculate the fare////////////////////
  //           this.setState({spinner:true});
  //           let distance = this.calculateDistance();
  //           let fareC = calculateFare("booksingle", 0, distance);
  //           this.setState({ fare: fareC,booksingle:'booksingle' });
  //           this.setState({spinner:false});
  //         }}
  //       />
  //       <CheckBox
  //         left
  //         title="Book Shared"
  //         checked={this.state.bookshared}
  //         onPress={() => {
  //           this.setState({ single: false,shared: false,booksingle: false,bookshared: true });
  //           //////////////calculate the fare////////////////////
  //           this.setState({spinner:true});
  //            let distance = this.calculateDistance();
  //           let fareC = calculateFare("bookshared", 0, this.calculateDistance);
  //           this.setState({ fare: fareC,bookshared:'bookshared' });
  //           this.setState({spinner:false});
  //         }}
  //       />

  //       <Text>Your fair is: </Text>
  //       <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>
  //        GHS {this.state.fare}
  //       </Text>
  //     </View>
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         paddingHorizontal: 10,
  //         justifyContent: "space-between",
  //         alignItems: "space-between"
  //       }}
  //     >
  //       <Button
  //         onPress={() => this.setState({ isVisible: false })}
  //         title="Close"
  //       />
  //       <Button
  //         onPress={() => {
  //           this.setState({ spinner: true });
  //           let id = this.guidGenerator();
  //           this.setState({ requestID: id });
  //           //Alert.alert("Information", "Looking for the nearest driver")

           
  //           /////////////contact the driver////////////////////
  //           //send a request to the nearest driver
  //           //if he respond then draw polyline
  //           //else display a message to passenger.

  //           ////GET NEAREST DRIVER//////////////////////////////
  //           let mylat = this.state.region.latitude;
  //           let mylon = this.state.region.longitude;
  //           let deslat = this.state.destlatitude;
  //           let destlon = this.state.destlongitude;
            
  //           const arrayToObject = (array) =>
  //             array.reduce((obj, item) => {
  //               obj[item['license']] = item
  //               return obj
  //             }, {})

  //            //console.log( arrayToObject(this.state.drivers));
    
  //           let nearest = geolib.findNearest(
  //             { latitude: mylat, longitude: mylon },
  //             arrayToObject(this.state.drivers),
  //             1
  //           );
          
  //           ///////////SENDING THE REQUEST TO THE NEAREST DRIVER//////////////////

  //           let uid = firebase.auth().currentUser.uid;

  //           var tempDate = new Date();
  //           var dateCurrent = tempDate.getFullYear() + '-' + (tempDate.getMonth()+1) + '-' + tempDate.getDate() +' '+ tempDate.getHours()+':'+ tempDate.getMinutes()+':'+ tempDate.getSeconds();
           
  //           //console.log(dateCurrent);
  //           firebase
  //             .database()
  //             .ref("trips/" + id)
  //             .set({
  //               coordinates: [mylat,mylon,deslat,destlon],
  //               carID:'0',
  //               customer: uid,
  //               triptype: this.state.ride,
  //               date: dateCurrent,
  //               driverId: nearest.key,
  //               status: "Pending",
  //               distance:this.calculateDistance(),
  //               duration: 0,
  //               cost:0.0,
  //             })
  //             .then(data => {
  //               //success
            
  //             })
  //             .catch(error => {
  //               console.log("error", error);
  //             });
  //           ////////////////END OF BOOKING//////////////////////
  //           firebase.database().ref('trips/'+id+'/status').on("value",snapshot=>{
  //             if(snapshot.val()=="start"){
  //               //var tempDate = new Date();
  //               var time = tempDate.getFullYear() + '-' + (tempDate.getMonth()+1) + '-' + tempDate.getDate() +' '+ tempDate.getHours()+':'+ tempDate.getMinutes()+':'+ tempDate.getSeconds();
  //               timeS = "Journey Started @: "+time;
  //               this.setState({journeyStatus:timeS,navigation:true})

  //             }else if(snapshot.val()=="completed"){
  //               /////////////get final fare from firebase
  //               firebase.database().ref('trips/'+id+'/cost').once("value",snapshot=>{
  //                 let finalfare = "GHS"+" "+snapshot.val();
  //                 this.setState({finalFare:finalfare});
  //               });
  //             //this.setState({finalFare:snapshot.val()})
  //             }else{
  //               this.setState({journeyStatus:snapshot.val()})
  //             }
  //          });
  //           this.setState({ spinner: false,isVisible: false });
            
  //         }}
  //         color="#2E8301"
  //         title="Book"
  //       />
  //     </View>
  //   </View>
  // );
  //////////////////////////////////////END OF CONTENT MODAL///////////////////////////
 sendRequest(){
  let id = this.guidGenerator();
  this.setState({ requestID: id });

  const arrayToObject = (array) =>
  array.reduce((obj, item) => {
    obj[item['license']] = item
    return obj
  }, {})

  //console.log( arrayToObject(this.state.drivers));

let nearest = geolib.findNearest(
  { latitude: this.state.pickupLat, longitude: this.state.pickupLon },
  arrayToObject(this.state.drivers),
  1
);
//console.log(this.state.drivers);

  let uid = firebase.auth().currentUser.uid;

  var tempDate = new Date();
  var dateCurrent = tempDate.getFullYear() + '-' + (tempDate.getMonth()+1) + '-' + tempDate.getDate() +' '+ tempDate.getHours()+':'+ tempDate.getMinutes()+':'+ tempDate.getSeconds();
 
  //console.log(dateCurrent);
  firebase
    .database()
    .ref("trips/" + id)
    .set({
      coordinates: [this.state.pickupLat,this.state.pickupLon,this.state.dropOffLat,this.state.dropOffLon],
      carID: "0",
      customer: uid,
      triptype: this.state.ride,
      date: dateCurrent,
      driverId: nearest.key,
      status: "Pending",
      distance:this.state.distance,
      startLocName:this.state.searchTerm1,
      endLocName:this.state.searchTerm2,
      duration: this.state.estimatedTime,
      cost:this.state.fare,
    })
    .then(() => {
      //success
     let data = {
      coordinates: [this.state.pickupLat,this.state.pickupLon,this.state.dropOffLat,this.state.dropOffLon],
      carID: "0",
      customer: uid,
      triptype: this.state.ride,
      date: dateCurrent,
      driverId: nearest.key,
      status: "Pending",
      distance:this.state.distance,
      startLocName:this.state.searchTerm1,
      endLocName:this.state.searchTerm2,
      duration: this.state.estimatedTime,
      cost:this.state.fare,
      key:id,
    }
      this.setState({selectedDriver:nearest});
      this.props.navigation.navigate("Request",{data:data});
    })
    .catch(error => {
      console.log("error", error);
    });

  //   firebase.database().ref('trips/'+id+'/status').on("value",snapshot=>{
  //     if(snapshot.val()=="start"){
  //       //var tempDate = new Date();
  //       var time = tempDate.getFullYear() + '-' + (tempDate.getMonth()+1) + '-' + tempDate.getDate() +' '+ tempDate.getHours()+':'+ tempDate.getMinutes()+':'+ tempDate.getSeconds();
  //       timeS = "Journey Started @: "+time;
  //       this.setState({journeyStatus:timeS,navigation:true})

  //     }else if(snapshot.val()=="completed"){
  //       /////////////get final fare from firebase
  //       firebase.database().ref('trips/'+id+'/cost').once("value",snapshot=>{
  //         let finalfare = "GHS"+" "+snapshot.val();
  //         this.setState({finalFare:finalfare});
  //       });
  //     //this.setState({finalFare:snapshot.val()})
  //     }else if(snapshot.val() == "Accepted"){
  //       this.setState({journeyStatus:snapshot.val()})
  //     }
  //  });
  
 }

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
      

      let data = this.state.searchResult;
      
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
          {Object.keys(this.state.drivers).map(key=> (
            <Marker
              style={{ width: 10, height: 10 }}
              coordinate={{
                latitude: this.state.drivers[key].latitude,
                longitude: this.state.drivers[key].longitude
              }}
              image={carMarker}
            />
          ))}

          {this.state.navigation ?(
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
                    right: (width / 30),
                    bottom: (height / 30),
                    left: (width / 30),
                    top: (height / 30),
                  }
                });
              }}
            />
          </View>):null}
        </MapView>

        <Header
        placement="left"
        centerComponent={{ text: 'Trosky', style: { color: '#fff',fontWeight:"bold",fontSize:18 } }}
        rightComponent={<TouchableOpacity style={{width:70}} onPress={()=>this.props.navigation.navigate("ProfileView")}>
           <Icon name="align-justify" size={20} color="#FFFFFF" />
        </TouchableOpacity>}
        containerStyle={{
            backgroundColor: '#2760E0',
            top:0,
            width:"100%",
            position:"absolute"
            }}
        />



        {/* <View style={styles.searchContainer}> */}
        <View style={styles.searchBox}>
				<View style={styles.inputWrapper}>
					<Text style={styles.label}>PICK UP</Text>
            <View style={{flexDirection:'row',flex:1,paddingHorizontal:10}}>
						<Icon name="search" size={15} color="#FF5E3A"/>
						<TextInput 
							onFocus={()=>this.toggleSearchResultModal("pickUp")}
							style={styles.inputSearch}
							placeholder="Choose pick-up location"
						  onChangeText={(term)=>{this.getSearchTerm('pickUp',term)}}
							value={this.state.searchTerm1}
						/>
            </View>
				</View >
				<View style={styles.secondInputWrapper}>
					<Text style={styles.label}>DROP-OFF</Text>
            <View style={{flexDirection:'row',flex:1,paddingHorizontal:10}}>
						<Icon name="search" size={15} color="#FF5E3A"/>
						<TextInput
						  onFocus={()=>this.toggleSearchResultModal("dropOff")}
							style={styles.inputSearch}
							placeholder="Choose drop-off location"
							onChangeText={(term)=>{this.getSearchTerm('dropOff',term)}}
              value={this.state.searchTerm2}
						/>
            </View>
				</View>
			</View>
      { (this.state.pickUp != null) &&
        <View style={styles.searchResultsWrapper} >
         				<TouchableOpacity style={{borderBottomColor:'#ddd'}}>
                 {
                   
                   data != null ? data.map((terms, i) => (
                    <ListItem
                      onPress={()=>this.handleSelectedAddress(terms)}
                      key={i}
                      title={<Text style={styles.primaryText}>{terms.primaryText}</Text>}
                      subtitle={
                        <View style={{flexDirection:"row"}}>
                          <Icon name="location-arrow" size={15} color="#FF5E3A"/>
                        <Text style={styles.secondaryText}>{terms.description}</Text>
                        </View>
                     }
                    />
                  )): <Text>No Result</Text>
                }                
        				</TouchableOpacity>
        	</View>
        
        } 

        { (this.state.isVisible == true) &&
          <View style={styles.bookRideWrapper} >
              <View style={{flexDirection:'row',margin:20,justifyContent:'space-around'}}>
                  <TouchableOpacity
                    style={{
                      backgroundColor:'#fff',
                      borderRadius:100,
                      width:50,
                      height:50,
                      justifyContent:'center',
                      alignItems:'center',
                      alignSelf:'flex-start',
                      borderWidth:1,
                      borderColor:'rgba(0,0,0,0.2)'
                    }}
                    onPress={async()=>{
                      this.setState({fare:"calculating...",ride:"single"});
                      let time = this.state.estimatedTime;
                      let distance = this.state.distance
                      let newfare = await calculateFare("single",time,distance);
                      newfare = Math.round(newfare);
                      this.setState({fare:newfare});
                    }}
                  >
                  <Image style={{width:35,height:35}} source={single} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor:'#fff',
                      borderRadius:100,
                      width:50,
                      height:50,
                      justifyContent:'center',
                      alignItems:'center',
                      alignSelf:'center',
                      borderWidth:1,
                      borderColor:'rgba(0,0,0,0.2)'
                    }}
                    onPress={()=>{
                      // this.setState({fare:"calculating...",ride:"shared"});
                      // let time = this.state.estimatedTime;
                      // let distance = this.state.distance
                      // let newfare = await calculateFare("shared",time,distance);
                      // newfare = Math.round(newfare*100)/100;
                      // this.setState({fare:newfare});
                      this.setState({isModalVisible:true});
                    }}
                  >
                  <Image style={{width:35,height:35}} source={shared} />
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    style={{
                      backgroundColor:'#fff',
                      borderRadius:100,
                      width:50,
                      height:50,
                      justifyContent:'center',
                      alignItems:'center',
                      alignSelf:'flex-end',
                      borderWidth:1,
                      borderColor:'rgba(0,0,0,0.2)'
                    }} 
                    onPress={async()=>{
                      this.setState({fare:"calculating...",ride:"book"});
                      let time = this.state.estimatedTime;
                      let distance = this.state.distance
                      let newfare = await calculateFare("book",time,distance);
                      newfare = Math.round(newfare*100)/100;
                      this.setState({fare:newfare});
                    }}
                  >
                  <Image style={{width:25,height:25}} source={require('../../assets/carMarker.png')} />
                  <Text>Book</Text>
                  </TouchableOpacity> */}
              </View>
              
              <View style={{flexDirection:'row',flex:1,justifyContent:'space-between',paddingHorizontal:10}}>
                    <View style={{flexDirection:'column',justifyContent:'space-between'}}>
                        <Text style={{color:'#fff'}}>Total Distance: {this.state.distance}km</Text>
                        <Text style={{color:'#fff'}}>Estimated Time: <Text style={{color:'#fff',fontSize:18,fontWeight:'bold'}}>{this.state.estimatedTime} min</Text></Text>
                    </View>
                    <View style={{flexDirection:'column',justifyContent:'space-around'}}>
                        <Text style={{color:'#fff',fontSize:18,fontWeight:'bold'}}>GHS {this.state.fare}</Text>
                        <Text style={{color:'#fff'}}>Fare Estimated</Text>
                    </View>

              </View>
              <View style={{flexDirection:'row',flex:1,justifyContent:'space-between',marginHorizontal:10,}}>
                   <TouchableOpacity onPress={()=>this.sendRequest()} style={{width:'40%',height:40,justifyContent:'center',bottom:7,backgroundColor:'#fff',top:7}}>
                     <Text style={{alignSelf:'center'}}>Request Ride</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={{width:'40%',height:40,justifyContent:'center',bottom:7,backgroundColor:'#f00',top:7}}
                   onPress={()=>{
                     this.setState({
                       distance:0,
                       fare:0,
                       estimatedTime:0,
                       isVisible:false,
                       searchTerm1:"",
                       searchTerm2:""
                      })
                   }}>
                     <Text style={{alignSelf:'center'}}>Cancel</Text>
                   </TouchableOpacity>
              </View>
              
          </View> 
          
          } 

          {/* Driver details modal */}

           {/* { (this.state.journeyStatus == "Accepted") &&
          <View style={styles.bookRideWrapper} >
              <View style={{flexDirection:'row',margin:20,justifyContent:'center'}}>
                  <Text style={{color:'#fff'}}>Driver: {this.state.selectedDriver.username}</Text>
                  <Text style={{color:'#fff'}}>Car: {this.state.selectedDriver.carID}</Text>
              </View>
              
              <View style={{flexDirection:'row',flex:1,justifyContent:'space-between',paddingHorizontal:10}}>
                    <View style={{flexDirection:'column',justifyContent:'space-between'}}>
                        <Text style={{color:'#fff'}}>Start: {this.state.searchTerm1}</Text>
                        <Text style={{color:'#fff'}}>End: {this.state.searchTerm2}</Text>
                    </View>
                   

              </View>
              <View style={{flexDirection:'row',flex:1,justifyContent:'space-between',marginHorizontal:10,}}>
                   <TouchableOpacity onPress={()=>this.sendRequest()} style={{width:'40%',justifyContent:'center',bottom:7,backgroundColor:'#ff0',top:7}}>
                     <Text style={{alignSelf:'center'}}>Open Navigation</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={{width:'40%',justifyContent:'center',bottom:7,backgroundColor:'#f00',top:7}}
                   onPress={()=>{
                     this.setState({
                       distance:0,
                       fare:0,
                       estimatedTime:0,
                       isVisible:false,
                       searchTerm1:"",
                       searchTerm2:""
                      })
                   }}>
                     <Text style={{alignSelf:'center'}}>Cancel</Text>
                   </TouchableOpacity>
              </View>
          </View>  */}
          
          
  
          {/* End of driver details modal */}
  
        
          {/* {this.state.isVisible==false ?(
          <TouchableOpacity
                    style={{
                      backgroundColor:'#00f',
                      borderRadius:100,
                      width:70,
                      height:70,
                      position:'absolute',
                      justifyContent:'center',
                      alignItems:'center',
                      bottom:10,
                      right:10,
                      alignSelf:'flex-end',
                      borderWidth:2,
                      borderColor:'rgba(0,0,0,0.5)'
                    }} 
                  onPress={()=>{this.props.navigation.navigate("ProfileView")}}
                  >
                  <Text>Menu</Text>
          </TouchableOpacity>):null} */}

        <Modal isVisible={this.state.isModalVisible}
         animationIn="slideInLeft"
         animationOut="zoomOutUp">
          <View style={styles.content}>
            <Text style={{color:"#fff",marginBottom:15}} >TROSKY SHARED RIDE SELECTION</Text>

          <CheckBox
          left
          title="1 Seat"
          checked={this.state.single}
          onPress={async() => {
            this.setState({ single: !this.state.single,shared: false,booksingle: false,bookshared: false,fare:"calculating...",ride:"shared" });
            //////////////calculate the fare////////////////////
           // this.setState({fare:"calculating...",ride:"shared"});
            let time = this.state.estimatedTime;
            let distance = this.state.distance
            let newfare = await calculateFare("shared",time,distance);
            newfare = Math.round(newfare);
            this.setState({isModalVisible:false,fare:newfare});
          }}
        />
        <CheckBox
          left
          title="2 Seats"
          checked={this.state.shared}
          onPress={async() => {
            this.setState({ single: false,shared: !this.state.shared,booksingle: false,bookshared: false ,fare:"calculating...",ride:"shared"});
            //////////////calculate the fare////////////////////
            let time = this.state.estimatedTime;
            let distance = this.state.distance
            let newfare = await calculateFare("shared",time,distance);
            newfare = Math.round(newfare);
            newfare = newfare * 2;
            this.setState({isModalVisible:false,fare:newfare});
          }}
        />
        <CheckBox
          left
          title="3 Seats"
          checked={this.state.booksingle}
          onPress={async() => {
            this.setState({ single: false,shared: false,booksingle: true,bookshared: false,fare:"calculating...",ride:"shared" });
            //////////////calculate the fare////////////////////
            let time = this.state.estimatedTime;
            let distance = this.state.distance
            let newfare = await calculateFare("shared",time,distance);
            newfare = Math.round(newfare);
            newfare = newfare * 3;
            this.setState({isModalVisible:false,fare:newfare});
          }}
        />
        <CheckBox
          left
          title="4 Seats"
          checked={this.state.bookshared}
          onPress={async() => {
            this.setState({ single: false,shared: false,booksingle: false,bookshared: true,fare:"calculating...",ride:"shared" });
            //////////////calculate the fare////////////////////
            let time = this.state.estimatedTime;
            let distance = this.state.distance
            let newfare = await calculateFare("shared",time,distance);
            newfare = Math.round(newfare);
            newfare = newfare * 4;
            this.setState({isModalVisible:false,fare:newfare});
          }}
        />
          </View>
        </Modal>
  
      </View>
    );
  }
}

Home.propTypes = {
  provider: ProviderPropType
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    top:70,
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
   
},
secondInputWrapper:{
    marginLeft:15,
    marginRight:10,
    marginTop:0,
    backgroundColor:"#fff",
    opacity:0.9,
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
  top:190,
  position:"absolute",
  width:width,
  height:700,
  backgroundColor:"#fff",
  opacity:0.9
},
bookRideWrapper:{
  borderRadius:10,
  position:"absolute",
  width:width,
  height:200,
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

export default Home;
