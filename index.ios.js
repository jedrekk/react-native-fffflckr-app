/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React, {
  Dimensions,
  AppRegistry,
  Image,
  StyleSheet,
  ScrollView,
  Text,
  Modal,
  View,
  StatusBarIOS,
  ActivityIndicatorIOS,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';

import { Icon, } from "react-native-icons";
import config from './Config';


import PhotoList from './views/PhotoList';
import OptionTray from './views/OptionTray';

const LOADING_PHOTOS_FROM_FLICKR = 1;
const ERROR_NOTHING_LOADED = 2;
const SAVE_FILE_WAIT = 3;
const SAVE_FILE_COMPLETE = 4;



// import DrawerLayout from 'react-native-drawer-layout';


class FirstProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activityLoaderStatus: 0,
      popupHideTimeout: 0,
      optionTrayVisible: false,
      searchText: ''
    }
  }

  componentWillMount() {
    // StatusBarIOS.setHidden(false);
  }
  componentDidMount() {
    this.setState({ optionTrayVisible: true })

  }

  setActivityLoaderStatus(statusCode) {
    this.setState({ activityLoaderStatus: statusCode })

  }

  showFavorites() {
    // console.log(this.refs.photoList)
    this.refs.photoList.restartAnew();
  }
  touchHeader() {
    // console.log(this.refs.photoList)
    this.refs.photoList.scrollToTop();
  }

  touchClearModal() {
    this.setState({ activityLoaderStatus: 0 });
  }

  hideModal() {
    this.setState({ activityLoaderStatus: 0 });
  }

  initializeSearch(searchText) {
    this.setState({ optionTrayVisible: false })

    this.setState({ searchText: searchText });
  }

  toggleOptionTray() {
    var optionTrayVisible = !this.state.optionTrayVisible;
    this.setState({ optionTrayVisible: optionTrayVisible });
  }

  closeFullScreen() {
    StatusBarIOS.setHidden(false);
    this.setState({ fullscreenImageVisible: false });
  }

  setFullscreenImageVisible(url) {
    StatusBarIOS.setHidden(true);
    this.setState({ fullscreenImageURL: url, fullscreenImageVisible: true })
  }


  render() {
    return (
      <View style={ styles.fullscreen }>
        <Modal transparent={ true } visible={ this.state.activityLoaderStatus == LOADING_PHOTOS_FROM_FLICKR }>
          <View style={{
            flex: 1,
            backgroundColor: "rgba(66,66,66,0.7)",
            alignItems: 'center',
            justifyContent: 'center',
            }}>
            <ActivityIndicatorIOS size="large" animating={true} />
            <Text style={{
              color: "rgba(200,200,200,0.8)",

            }}>loading from flickr!</Text>
          </View>
        </Modal>
        <Modal transparent={ true } visible={ this.state.activityLoaderStatus == ERROR_NOTHING_LOADED }>
          <TouchableHighlight style={{
              flex: 1,
            }}
            onPress={ this.touchClearModal.bind(this) }>
            <View style={{
              flex: 1,
              backgroundColor: "rgba(66,66,66,0.7)",
              alignItems: 'center',
              justifyContent: 'center',
              }}>
              <View style={{
                backgroundColor: "#660000",
                borderRadius: 25,
                width: 200,
                height: 140,
                padding: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  color: 'white',
                  textAlign: 'center',

                }}>This user has no favorite photos avalible.{"\n"}{"\n"}Choose another photo.</Text>
                </View>
            </View>
          </TouchableHighlight>
        </Modal>
        <Modal transparent={ true } visible={ this.state.activityLoaderStatus == SAVE_FILE_WAIT }>
            <View style={{
              flex: 1,
              backgroundColor: "rgba(66,66,66,0.7)",
              alignItems: 'center',
              justifyContent: 'center',
              }}>
              <View style={{
                backgroundColor: "rgba(200,200,200,0.5)",
                borderRadius: 25,
                width: 200,
                height: 140,
                padding: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <ActivityIndicatorIOS size="large" animating={true} />
                <Text style={{
                  color: 'white',
                  textAlign: 'center',

                }}>Saving...</Text>
                </View>
            </View>
        </Modal>
        <Modal transparent={ true } visible={ this.state.activityLoaderStatus == SAVE_FILE_COMPLETE }>
          <TouchableHighlight style={{
              flex: 1,
            }}
            onPress={ this.touchClearModal.bind(this) }>
            <View style={{
              flex: 1,
              backgroundColor: "rgba(66,66,66,0.7)",
              alignItems: 'center',
              justifyContent: 'center',
              }}>
              <View style={{
                backgroundColor: "rgba(200,200,200,0.5)",
                borderRadius: 25,
                width: 200,
                height: 140,
                padding: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  color: 'white',
                  textAlign: 'center',

                }}>Photo saved in your camera roll!</Text>
                </View>
            </View>
          </TouchableHighlight>
        </Modal>


        <View style={ styles.header }>
          <TouchableHighlight
            onPress={ this.showFavorites.bind(this) }

            underlayColor="#333"
            style={{
              width: 32,
              height: 40
            }}>
            <Icon
              name='ion|ios-heart'
              size={ 28 }
              color='white'
              style={{
                marginLeft: 10,
                width: 32,
                height: 40
              }}
              />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={ this.touchHeader.bind(this) }

            underlayColor="#333"
            style={{
              width: 80,
              height: 40,
              alignSelf: 'center',
             }}
              >
            <Image
              source={ require('./img/logo.png') }
              style={{
                width: 80,
                height: 40,
                alignSelf: 'center',
               }}
              />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={ this.toggleOptionTray.bind(this) }
            underlayColor="#333"

            style={{
              marginRight: 10,
              width: 32,
              height: 40
            }}>
            <Icon
              name='ion|navicon-round'
              size={ 28 }
              color='white'
              style={{
                marginRight: 15,
                width: 32,
                height: 40
              }}
              />
          </TouchableHighlight>
        </View>
        <OptionTray
          visible={ this.state.optionTrayVisible }
          searchFunction={ this.initializeSearch.bind(this) }
          />
        <PhotoList
          style={{
            flex: 1 }}
          apiKey={ config.API_KEY }
          fullscreenFunction = { this.setFullscreenImageVisible.bind(this) }
          activityLoaderFunction={ this.setActivityLoaderStatus.bind(this) }
          ref="photoList"

          searchText={ this.state.searchText }

          />
      </View>
        
    );
  }
};


var styles = StyleSheet.create({

  header: {
    borderTopWidth: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: "#333333",
  },
  fullscreen: {
    flex: 1,
    alignItems: 'stretch',
  },
  title: {
    color: "white",
    
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
  }
});

AppRegistry.registerComponent('FirstProject', () => FirstProject);
