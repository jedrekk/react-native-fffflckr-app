/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';


import React, {
  AlertIOS,
  AppRegistry,
  StyleSheet,
  ActionSheetIOS,
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
      favorite: false,
      offsetX: 0

    }
  }

  // setNativeProps (nativeProps) {
  //   this._root.setNativeProps(nativeProps);
  // }


  addToFav() {
    if (!this.state.favorite) {
      this.setState({ favorite: true });
      this.props.addToFavoritesFunction(this.props.rowData);
    } else {
      this.setState({ favorite: false });
      this.props.removeFromFavoritesFunction(this.props.rowData);
    }
  }

  onPress() {

    if (this.state.offsetX < 20) { // Is photo the main thing being displayed? Load more pics
      this.props.loadMoreFunction(this.props.rowData.owner);
    } else {
      this.scrollToTop();
    }

  }

  componentDidMount() {
    // this.refs.photoView.scrollWithoutAnimationTo(0,Dimensions.get("window").width);

  }

  componentWillMount() {


  }

  shareImage() {


    ActionSheetIOS.showShareActionSheetWithOptions({
      url: "https://flickr.com/" + this.props.rowData.owner + "/" + this.props.rowData.id,
      excludedActivityTypes: [
        'com.apple.UIKit.activity.PostToTwitter'
      ]
    },
    (error) => {
      console.error(error);
    },
    (success, method) => {
      var text;
      if (success) {
        text = `Shared via ${method}`;
      } else {
        text = 'You didn\'t share';
      }
      this.setState({text});
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

  makeFavoriteButton(buttonHeight) {

    var favoritesText = 'Add to favorites';

    if (this.state.favorite) {
      favoritesText = 'Remove from favorites';
    }

    return(
      <TouchableHighlight onPress={ this.addToFav.bind(this) } >
        <View style={
          [
            styles.navigationLink,
            {
              height: buttonHeight,
              backgroundColor: 'rgba(143,142,10,1)',
             }
          ]
        }><Text style={ styles.navigationLinkText } >{ favoritesText }</Text>
        </View>
      </TouchableHighlight>);
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


  scrollToTop() {
    requestAnimationFrame(() => {
      this.refs.photo.getScrollResponder().scrollTo(0,0);
    });
  }


  openURL() {

    var url;

    if (this.props.flickrAppInstalled) {
      url = "flickr://photos/" + this.props.rowData.owner + "/" + this.props.rowData.id;
    } else {
      url = "https://flickr.com/" + this.props.rowData.owner + "/" + this.props.rowData.id
    }

    LinkingIOS.openURL(url);
  }

  onScrollEnd() {
    console.log('onScrollEnd')
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


    // scrollsToTop is set false, so that our ListView is the only ScrollView on our screen at once.



    return (
      <ScrollView
        alwaysBounceHorizontal={ false }
        bounces={ false }
        showsHorizontalScrollIndicator={ false }
        horizontal={ true }
        scrollsToTop={ false }
        pagingEnabled={ true }
        scrollEventThrottle={ 16 }
        onScroll={ (e) => { this.setState({ offsetX: (e.nativeEvent.contentOffset.x) }) }.bind(this) }
        onScrollAnimationEnd={ (e) => { console.log(e) }}
        ref="photo"
        style={{
          flex: 1,
          height: Math.floor((Dimensions.get("window").width / rowData.width_c) * rowData.height_c),
          // width: (Dimensions.get("window").width * 1.5),

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
            width: (Dimensions.get("window").width / 1.3),
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
            <View
              style={
                  [
                    styles.navigationLink,
                    {
                      flexDirection: 'row',
                      height: buttonHeight,
                      backgroundColor: 'rgba(246,199,10,1)',
                     }
                  ]
                } >
              <TouchableHighlight onPress={ this.saveImage.bind(this) }>
                <View style={
                  [
                    styles.navigationLink,
                    {
                      height: buttonHeight,
                      backgroundColor: 'rgba(12,199,110,1)',
                      width: (Dimensions.get("window").width / 1.3) / 2,
                     }
                  ]
                } ><Text style={
                  [
                    styles.navigationLinkText,
                    {
                      width: (Dimensions.get("window").width / 1.3) / 3,
                    }
                  ]
                } >Save</Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight onPress={ this.shareImage.bind(this) }>
                <View style={
                  [
                    styles.navigationLink,
                    {
                      height: buttonHeight,
                      backgroundColor: 'rgba(109,202,213,1)',
                      width: (Dimensions.get("window").width / 1.3) / 2,
                     }
                  ]
                } ><Text style={
                  [
                    styles.navigationLinkText,
                    {
                      width: (Dimensions.get("window").width / 1.3) / 3,
                    }
                  ]
                } >Share Link</Text>
                </View>
              </TouchableHighlight>

            </View>
            { this.makeFavoriteButton(buttonHeight) }
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
    width: (Dimensions.get("window").width / 1.3),
    // padding: 10,
    // margin: 10

  },
  progress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

