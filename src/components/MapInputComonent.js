import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

class MapInput extends React.Component {

    render() {
        return (

            <GooglePlacesAutocomplete
                placeholder='Search Destination'
                minLength={2}
                autoFocus={true}
                returnKeyType={'search'} 
                listViewDisplayed={false}
               
                fetchDetails={true}
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                    this.props.searchTerm(data.description);
                    this.props.notifyChange(details.geometry.location);
                  }
                }
                // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                // currentLocationLabel="Current location"
                
                styles={{
                   
                    description: {
                      fontWeight: 'bold'
                    },
                    predefinedPlacesDescription: {
                      color: '#1faadb'
                     }
                     ,textInputContainer: {
                        flexDirection:'row',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderTopWidth: 0,
                        position:'absolute',
                        borderBottomWidth:0
                      },
                      textInput: {
                        marginLeft: 0,
                        marginRight: 0,
                        position:'absolute',
                        height: 38,
                        color: '#5d5d5d',
                        fontSize: 16
                      }
                  }}

                GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                    types: 'food'
                  }}

                query={{
                    key: 'API KEY',
                    language: 'en',
                    components: 'country:gh'
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={200}
            />
        );
    }
}
export default MapInput;