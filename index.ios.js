/**
 * ffff*lckr react native app
 * https://github.com/jedrekk/react-native-fffflckr-app
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

import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(true);
SQLite.enablePromise(true);


const LOADING_PHOTOS_FROM_FLICKR = 1;
const ERROR_NOTHING_LOADED = 2;
const SAVE_FILE_WAIT = 3;
const SAVE_FILE_COMPLETE = 4;




// import DrawerLayout from 'react-native-drawer-layout';

var db;

class FirstProject extends React.Component {



  constructor(props) {
    super(props);


    this.state = {
      progress: [],
      activityLoaderStatus: 0,
      popupHideTimeout: 0,
      optionTrayVisible: false,
      searchText: '',
      database_name: "fffflckr.db",
      database_version: "0.1",
      database_displayname: "fffflckr favorites database",
      database_size: 200000,
    }
  }

  componentWillMount() {
    // StatusBarIOS.setHidden(false);
  }

  componentWillUnount() {
    this.closeDatabase();
  }
  componentDidMount() {
    this.setState({ optionTrayVisible: false })
    this.initializeDB();
  }





  initializeDB() {
      var that = this;
      that.state.progress.push("Opening database ...");
      that.setState(that.state);
      SQLite.openDatabase(this.state.database_name, this.state.database_version, this.state.database_displayname, this.state.database_size).then((DB) => {
        db = DB;
        that.state.progress.push("Database OPEN");
        that.setState(that.state);
        that.checkDatabase(db);
        console.log(that.state.progress);
      }).catch((error) => {
        console.log(error);
      });
  }


  errorCB(err) {
      console.log("error: ",err);
      this.state.progress.push("Error " + (err.message || err));
      this.setState(this.state);
  }

  checkDatabase(db){
    var that = this;
    that.state.progress.push("Database integrity check");
    that.setState(that.state);
    db.executeSql('SELECT 1 FROM favoritePhotos LIMIT 1').then(() =>{
    //   that.state.progress.push("Database is ready ... executing query ...");
    //   that.setState(that.state);
    //   // db.transaction(that.queryEmployees).then(() => {
    //   //   that.state.progress.push("Processing completed");
    //   //   that.setState(that.state);
    //   //   });
    }).catch((error) =>{
      console.log("Received error: ", error);
      if (error.code == 5) {
        db.transaction(that.createDatabaseTables).then(() =>{
          that.state.progress.push("Database populated ... executing query ...");
          that.setState(that.state);
        }).catch((error) =>{
          console.log(error);
        });
      }
    //   that.state.progress.push("Database not yet ready ... populating data");
    //   that.setState(that.state);
    //   db.transaction(that.populateDB).then(() =>{
    //     that.state.progress.push("Database populated ... executing query ...");
    //     that.setState(that.state);
    //     // db.transaction(that.queryEmployees).then((result) => { 
    //     //   console.log("Transaction is now finished"); 
    //     //   that.state.progress.push("Processing completed");
    //     //   that.setState(that.state);
    //     //   that.closeDatabase()});
    //     });
      });
    }


  createDatabaseTables(tx) {
    var that = this;


    var createDBQuery = 'CREATE TABLE IF NOT EXISTS favoritePhotos( '
      + 'id INTEGER PRIMARY KEY NOT NULL, '
      + 'flickr_id VARCHAR(20), '
      + 'owner VARCHAR(20), '
      + 'url_c VARCHAR(40), '
      + 'width_c INT, '
      + 'height_c INT, '
      + 'rowData BLOB )';

    console.log(createDBQuery);

    tx.executeSql(createDBQuery).catch((error) => {  
      that.errorCB(error) 
    });
  }

  closeDatabase(){
    var that = this;
    if (db) {
      console.log("Closing database ...");
      that.state.progress.push("Closing DB");
      that.setState(that.state);
      db.close().then((status) => {
        that.state.progress.push("Database CLOSED");
        that.setState(that.state);
      }).catch((error) => {
        that.errorCB(error);
      });
    } else {
      that.state.progress.push("Database was not OPENED");
      that.setState(that.state);
    }
  }

  addToFavorites(rowData) {
    console.log('addToFavorites');
    console.log(rowData);

    var addToFavoritesQueryString = "INSERT INTO favoritePhotos (flickr_id, owner, url_c, width_c, height_c) VALUES ('" +
      + rowData.id + "', '"
      + rowData.owner + "', '"
      + rowData.url_c + "', "
      + rowData.width_c + ", "
      + rowData.height_c + ")";

    db.executeSql(addToFavoritesQueryString).catch((error) => {  
      that.errorCB(error) 
    });

  }


  queryFavorites(tx) {
    var that = this;
    
    console.log("Executing query");

    tx.executeSql('SELECT id, flickr_id, owner, url_c, width_c, height_c FROM favoritePhotos').then(([tx,results]) => {
      var len = results.rows.length;

      if (len > 0) {
        var rawRowData = [];
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          var rowData = {};
          rowData.id = row.flickr_id;
          rowData.url_c = row.url_c;
          rowData.owner = row.owner;
          rowData.width_c = row.width_c;
          rowData.height_c = row.height_c;
          rawRowData.push(rowData);
        }
        that.refs.photoList.showFavorites(rawRowData);
      }
    }).catch((error) => { 
      console.log(error);
    });
  }


  setActivityLoaderStatus(statusCode) {
    this.setState({ activityLoaderStatus: statusCode })

  }

  showFavorites() {
    var that = this;
    db.transaction(that.queryFavorites.bind(this)).then(() => {
      that.state.progress.push("Processing completed");
      that.setState(that.state);
    });
    
  }
  restartRaw() {
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
    // this.setState({ searchText: searchText });
    this.refs.photoList.loadTag(searchText);
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

  makeOverlayRevealIcon() {

    if (this.state.optionTrayVisible) {
    return (
      <Icon
        name='ion|arrow-down-b'
        size={ 28 }
        color='white'
        style={{
          width: 32,
          height: 40
        }}
      />
    )
    }

    return (
      <Icon
        name='ion|search'
        size={ 28 }
        color='white'
        style={{
          width: 32,
          height: 40
        }}
      />
    )

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




        <PhotoList
          style={{
            flex: 1 }}
          apiKey={ config.API_KEY }
          fullscreenFunction = { this.setFullscreenImageVisible.bind(this) }
          activityLoaderFunction={ this.setActivityLoaderStatus.bind(this) }
          ref="photoList"
          addToFavoritesFunction={ this.addToFavorites.bind(this) }

          searchText={ this.state.searchText }

        />
        <OptionTray
          visible={ this.state.optionTrayVisible }
          searchFunction={ this.initializeSearch.bind(this) }
        />
        <View style={ styles.header }>
          <TouchableHighlight
            onPress={ this.showFavorites.bind(this) }

            underlayColor="#333"
            style={{
              alignSelf: 'center',
              width: 32,
              height: 40
            }}>
            <Icon
              name='ion|gear-a'
              size={ 28 }
              color='white'
              style={{
                alignSelf: 'center',
                width: 32,
                height: 40
              }}
              />
          </TouchableHighlight>

          <TouchableHighlight
            onPress={ this.restartRaw.bind(this) }

            underlayColor="#333"
            style={{
              alignSelf: 'center',
              width: 32,
              height: 40
            }}>
            <Icon
              name='ion|loop'
              size={ 28 }
              color='white'
              style={{
                width: 32,
                height: 40
              }}
              />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={ this.touchHeader.bind(this) }

            underlayColor="#333"
            style={{
              alignSelf: 'center',
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
               }}
              />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={ this.showFavorites.bind(this) }

            underlayColor="#333"
            style={{
              alignSelf: 'center',
              width: 32,
              height: 40
            }}>
            <Icon
              name='ion|ios-heart'
              size={ 28 }
              color='white'
              style={{
                width: 32,
                height: 40
              }}
              />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={ this.toggleOptionTray.bind(this) }
            underlayColor="#333"

            style={{
              alignSelf: 'center',
              width: 32,
              height: 40
            }}>

            { this.makeOverlayRevealIcon() }
          </TouchableHighlight>
        </View>          
      </View>
        
    );
  }
};


var styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 48,
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
