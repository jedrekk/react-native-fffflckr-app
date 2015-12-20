/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';


import React, {
  AlertIOS,
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View,
  ScrollView,
  ActivityIndicatorIOS,
  LinkingIOS,
  CameraRoll,
  Dimensions,
  TouchableHighlight,
} from 'react-native';

import RNFS from 'react-native-fs';
import RNOpenSettings from 'react-native-open-settings';


const SAVE_FILE_WAIT = 3;
const SAVE_FILE_COMPLETE = 4;
const ERROR_SAVING_FILE = 5;
const ERROR_CAMERA_ROLL = 6;
export default class PhotoElement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      file_uri: RNFS.CachesDirectoryPath + "/fffflckr.jpg",
      buttonCount: 3,
      flickrAppInstalled: false

    }
  }



  addToFav() {

  }

  onPress() {
    console.log(this.props.rowData.owner);
    this.props.loadMoreFunction(this.props.rowData.owner);
  }

  componentWillMount() {

    var url = "flickr://photos/jedrek/4233504430"

    LinkingIOS.canOpenURL(url, (supported) => {
      if (supported) {
        this.setState({ flickrAppInstalled: true });
      } else {

      }
    });
  }

  saveImage() {

    this.props.activityLoaderFunction(SAVE_FILE_WAIT);

    RNFS.downloadFile(this.props.rowData.url_c, this.state.file_uri)
    .then((result) => {

      CameraRoll.saveImageWithTag(this.state.file_uri, function(data) {
        this.props.activityLoaderFunction(4);
      }.bind(this), function(err) {
        if (err.domain == 'ALAssetsLibraryErrorDomain' || err.code == -3311) {

          AlertIOS.alert(
            'Access denied',
            'To save photos to your device, we need permission to access your photos.',
            [

              {text: 'Settings', onPress: () => { 
                this.props.activityLoaderFunction(0);
                RNOpenSettings.openSettings();
               }},
              {text: 'Maybe later', onPress: () => { this.props.activityLoaderFunction(0) } },
            ]

          )
        } else {
          AlertIOS.alert(
            'Error saving photo',
            'There seems to be an issue saving the photo!'
          );
        }
      }.bind(this));

      
    }.bind(this))
    .catch((error) => {
      console.log(error);
    }.bind(this));


  }


  makeFlickrFavoriteButton(rowData, buttonHeight) {
    return (
      <TouchableHighlight onPress={ this.openURL.bind(this) } >
        <View style={
          [
            styles.navigationLink,
            {
              height: buttonHeight,
              backgroundColor: '#76dbf2',
             }
          ]
        } ><Text style={ styles.navigationLinkText } >Add to Favorites</Text>
        </View>
      </TouchableHighlight>

    )
  }

  openURL() {

    var url;

    if (this.state.flickrAppInstalled) {
      url = "flickr://photos/" + this.props.rowData.owner + "/" + this.props.rowData.id;
    } else {
      url = "https://flickr.com/" + this.props.rowData.owner + "/" + this.props.rowData.id
    }

    LinkingIOS.openURL(url);
  }

  render() {
    var boundPress = this.onPress.bind(this);
    var rowData = this.props.rowData;

    var loader = this.state.loading ?
      <View style={styles.progress}>
        <ActivityIndicatorIOS size={ 'large' } />
      </View> : null;

    var buttonHeight = Math.floor((Dimensions.get("window").width / rowData.width_c) * rowData.height_c) / this.state.buttonCount;

    var flickrButtonCopy = (this.state.flickrAppInstalled) ? "Open in flickr app" : "Open on flickr";



    return (
      <ScrollView
        showsHorizontalScrollIndicator={ false }
        horizontal={ true }
        pagingEnabled={ true }
        style={{
          flex: 1,
          height: Math.floor((Dimensions.get("window").width / rowData.width_c) * rowData.height_c)

        }}>
        
        <TouchableHighlight onPress={ boundPress } >
          <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: '#eee',
          height: Math.floor((Dimensions.get("window").width / rowData.width_c) * rowData.height_c)

          }}>
          <Image
            onLoadStart={(e) => this.setState({ loading: true })}
            onLoad={() => this.setState({ loading: false })}
    
            style={{
              width: Dimensions.get("window").width,
              height: Math.floor((Dimensions.get("window").width / rowData.width_c) * rowData.height_c)
            }}
            source={{ uri: rowData.url_c }}
            >
            {loader}
            </Image>
          </View>
        </TouchableHighlight>


        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: "#555",
            width: (Dimensions.get("window").width / 2),
            height: Math.floor((Dimensions.get("window").width / rowData.width_c) * rowData.height_c)
          }}
          >

          {
            // this.makeFlickrFavoriteButton(rowData, buttonHeight)
          }
            <TouchableHighlight onPress={ this.openURL.bind(this) } >
              <View style={
                [
                  styles.navigationLink,
                  {
                    height: buttonHeight,
                    backgroundColor: 'rgba(246,199,10,1)',
                   }
                ]
              } ><Text style={ styles.navigationLinkText } >{ flickrButtonCopy }</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight onPress={ this.saveImage.bind(this) }>
              <View style={
                [
                  styles.navigationLink,
                  {
                    height: buttonHeight,
                    backgroundColor: 'rgba(12,199,130,1)',
                   }
                ]
              } ><Text style={ styles.navigationLinkText } >Save Pic</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight onPress={ this.addToFav.bind(this) } >
              <View style={
                [
                  styles.navigationLink,
                  {
                    height: buttonHeight,
                    backgroundColor: 'rgba(143,142,10,1)',
                   }
                ]
              }><Text style={ styles.navigationLinkText } >Add to Favorites</Text>
              </View>
            </TouchableHighlight>
        </View>
      </ScrollView>);
  }

};

var styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  navigationLinkText: {
    borderWidth: 1,
    borderColor: "white",
    textAlign: 'center',
    color: 'white',
    marginLeft: 25,
    marginRight: 25,
    padding: 10,
    borderRadius: 20,
  },
  navigationLink: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: (Dimensions.get("window").width / 2),
    // padding: 10,
    // margin: 10

  },
  progress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

