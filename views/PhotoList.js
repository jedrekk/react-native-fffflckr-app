'use strict';

import React, {
  Modal,
  Dimensions,
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  LinkingIOS,
  View,
  ActivityIndicatorIOS,
  Image
} from 'react-native';

import PhotoElement  from './PhotoElement';

var _ = require('lodash');



const LOADING_PHOTOS_FROM_FLICKR = 1;
const ERROR_NOTHING_LOADED = 2;


export default class PhotoList extends React.Component {




    constructor(props) {
      super(props);

      var ds = new ListView.DataSource({
          rowHasChanged: (r1, r2)=> r1 != r2
      });

      this.state = {
        loggedIn: false,
        footerHidden: true,
        firstUser: true,
        flickrData: [],
        showProgress: true,
        dataSource: ds.cloneWithRows([]),
        flickrAppInstalled: false,
      }    
    }


    componentDidMount() {
      var url = "flickr://photos/jedrek/4233504430"


      LinkingIOS.canOpenURL(url, (supported) => {
        if (supported) {
          this.setState({ flickrAppInstalled: true });
        } else {

        }
      });

      this.loadMoreFromUser(this.getInitialUser());
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.refs.listView) {


        // console.log(this.refs.listView.contentOffset)
        // console.log(this.refs.listView.getScrollResponder());
        // console.log(this.refs.listView.scrollProperties);
      }

    }

    restartAnew() {
      this.setState({ showProgress: true, firstUser: true })
      this.setState({ flickrData: [] })
      this.loadMoreFromUser(this.getInitialUser());

    }

    getInitialUser() {
      var initial_user = ["14280625%40N03", "26540085%40N08", "32662406%40N03", "33783444%40N05", "38177870%40N00", "42128445%40N00", "48848351%40N00", "53519312%40N08", "54167581%40N00", "59254826%40N00", "59697550%40N00", "60529400%40N06", "60898119%40N00", "7710444%40N03", "9511843%40N02"];
      return initial_user[_.random(initial_user.length - 1)];
    }

    loadTag(keyword) {
      this.setState({ showProgress: true, firstUser: true })
      this.setState({ flickrData: [] })
      url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&media=photos&tag_mode=all&tags=" + keyword + "&api_key=" + this.props.apiKey + "&extras=url_c&per_page=100&format=json&nojsoncallback=1";
      this.fetchFeed(url, 20);

    }

    loadMoreFromUser(user_id) {
      this.props.disableHeartIconFunction();
      url = "https://api.flickr.com/services/rest/?method=flickr.favorites.getList&api_key=" + this.props.apiKey + "&user_id=" + user_id.split('@').join('%40') + "&extras=url_c&per_page=100&format=json&nojsoncallback=1";
      this.fetchFeed(url);
    }

    addToFavorites(rowData) {
      this.props.addToFavoritesFunction(rowData);
    }

    removeFromFavorites(rowData) {
      this.props.removeFromFavoritesFunction(rowData);
    }

    showFavorites(rawRowData) {
      this.scrollToTop();
      console.log(rawRowData);
      this.setState({ footerHidden: false, loadingData: false, flickrData: rawRowData, showProgress: false, dataSource: this.state.dataSource.cloneWithRows(rawRowData) })
    }

    fetchFeed(url, photoCount) {

        this.setState({ loadingData: true });

        if (!this.state.firstUser) {
          this.props.activityLoaderFunction(LOADING_PHOTOS_FROM_FLICKR);
        }

        fetch(url, {
        })
        .then((response)=> response.json())
        .then((responseData)=> {

          var photoData = responseData.photos.photo;
          var feedItems = photoData.filter((ev)=> ev.url_c != null); //.filter((ev)=> ev.type.actor.login != null);

          if (feedItems.length <= 0) {
            this.props.activityLoaderFunction(ERROR_NOTHING_LOADED);
            return;
          }

          this.props.activityLoaderFunction(0);

          photoCount = photoCount || 10;

          if (!this.state.firstUser) {
            this.scrollToBottom();
          } else {
            this.setState({ firstUser: false });
          }

          console.log(responseData);



          feedItems = _.slice(_.shuffle(feedItems), 0, photoCount);
          // feedItems = _.slice(_.shuffle(feedItems), 0, 1);

          var tempItems = this.state.flickrData.concat(feedItems);

          console.log(feedItems)
          this.setState({ footerHidden: false, loadingData: false, flickrData: tempItems, showProgress: false, dataSource: this.state.dataSource.cloneWithRows(tempItems) })

          // this.setState({  });

            


        })
        .catch((err)=> {
            console.log(err);
        });
    }

    scrollToTop() {


      requestAnimationFrame(() => {
        this.refs.listView.getScrollResponder().scrollTo(0,0);
      });
    }


    scrollToBottom() {

      var listViewScrollView = this.refs.listView.getScrollResponder();
      var scrollProperties = this.refs.listView.scrollProperties;
      var scrollOffset = scrollProperties.contentLength - scrollProperties.visibleLength + Dimensions.get("window").height - 60;

      // console.log(listViewScrollView)

      // console.log(scrollProperties);
      // console.log(scrollOffset);

      requestAnimationFrame(() => {
        this.refs.listView.getScrollResponder().scrollTo(scrollOffset);
      });

      

    }

    onChangeVisibleRows(visibleRows, changedRows) {
      // console.log('onChangeVisibleRows called with', arguments);
      // console.log(changedRows.s1);
      var keys = [];
      for (var key in changedRows.s1) {
        if (changedRows.s1[key] == false) {
          console.log(key);
        }
      }


    }

    renderHeader() {
      return (
        <View style={{
          height: 30,
          alignItems: 'center',
          backgroundColor: "#333333",
          paddingTop: 5
        }}>
          <Text style={{
            color: "#ffffff"
          }}>ffff*lckr</Text>
        </View>
      )
    }
    renderFooter() {
      if (this.state.footerHidden) {
        return null;
      }

      return (
        <View style={{
          alignItems: 'center',
          backgroundColor: "#7ec0ee",
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 10,

          paddingBottom: 10
        }}>
          <Text style={{
            textAlign: 'center',
            color: "#FFFFFF",
          }}>That's it! You've run out of images. Touch an image to see what that image's creator likes!</Text>
        </View>
      )
    }

    renderRow(rowData, sec, i) {

      var boundFunction = this.loadMoreFromUser.bind(this);
      var addToFavoritesFunction = this.addToFavorites.bind(this);
      var removeFromFavoritesFunction = this.removeFromFavorites.bind(this);

      return <PhotoElement
        flickrAppInstalled= { this.state.flickrAppInstalled }
        fullscreenFunction={ this.props.fullscreenFunction.bind(this) }
        activityLoaderFunction={ this.props.activityLoaderFunction.bind(this) }
        loadMoreFunction={ boundFunction }
        removeFromFavoritesFunction={ removeFromFavoritesFunction }
        addToFavoritesFunction={ addToFavoritesFunction }
        rowData={ rowData }
        />
    }

//         ref={(row) => this.rows[i] = row}

    render() {

        console.log();

        if (this.state.showProgress) {
            return (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: "#999",

                }}>
                  <ActivityIndicatorIOS size="large" animating={true} />
                </View>
            );
        }


        return (
          <ListView
            ref="listView"
            style={{
              flex: 1,
              backgroundColor: "#999",
            }}
            onChangeVisibleRows={ this.onChangeVisibleRows.bind(this) }
            showsHorizontalScrollIndicator={ false }
            showsVerticalScrollIndicator={ false }
            removeClippedSubview={ true }
            dataSource={ this.state.dataSource }
            renderRow={ this.renderRow.bind(this) }
            // renderHeader={ this.renderHeader }
            renderFooter={ this.renderFooter.bind(this) }
          />
            );
          }
    }



var styles = StyleSheet.create({
  list: {
      flexDirection: 'row',
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  thumb: {

  },
  text: {
    flex: 1,
  },
});