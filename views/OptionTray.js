'use strict';

import React, {
  Text,
  Dimensions,
  AppRegistry,
  StyleSheet,
  TextInput,
  DeviceEventEmitter,
  View,
  TouchableHighlight,
  Image
} from 'react-native';

import { Icon, } from "react-native-icons";


export default class OptionTray extends React.Component {




  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      reloadIconVisible: false,
      lastSearchedText: '',
    }    
  }

  initializeSearch() {

    this.setState({ reloadIconVisible: true, lastSearchedText: this.state.searchText.toLowerCase() })
    this.props.searchFunction(this.state.searchText);

  }

  showMyFavs() {

  }

  getSearchIcon() {
    if (this.state.reloadIconVisible) {
      return (
        <Icon
          name='ion|loop'
          size={ 28 }
          color='white'
          style={{
            width: 40,
            height: 45
          }}
          />)
    }

    return (<Icon
        name='ion|search'
        size={ 28 }
        color='white'
        style={{
          width: 40,
          height: 45
        }}
        />)
  }

  render() {

    if (!this.props.visible) {
      return null;
    }

    return (
      <View style={ styles.optionTray } >
        <View
          style={{ 
          flex: 1,
          flexDirection: "row",
          padding: 8,
          }}>
        <TextInput
          style={{
            flex: 1,
            height: 45,
            borderColor: 'gray',
            backgroundColor: '#555',
            color: 'white',
            paddingTop: 10,
            paddingBottom: 10,
            paddingRight: 20,
            paddingLeft: 20,
            marginLeft: 15,
            }}
          autoCapitalize='none'
          enablesReturnKeyAutomatically={ true }
          returnKeyType='search'
          placeholder='Start over with a search'
          onSubmitEditing={ this.initializeSearch.bind(this) }
          onChangeText={(searchText) => { 
            this.setState( {searchText} );

            if (searchText.toLowerCase() == this.state.lastSearchedText.toLowerCase()) {
              this.setState({ reloadIconVisible: true })
            } else {
              this.setState({ reloadIconVisible: false })

            }
            }
          }
          value={ this.state.searchText }
          />
          <TouchableHighlight
            onPress={ this.initializeSearch.bind(this) }

            underlayColor="#222"
            style={{
              marginRight: 10,
              marginLeft: 10,
              width: 40,
              height: 45,
            }}
            >
            { this.getSearchIcon() }
          </TouchableHighlight>
        </View>
        <View
        style={{ 
          flex: 1,
          alignItems: 'flex-start',
          flexDirection: "row",
          justifyContent: 'space-around',
          padding: 8,
          }}>

          <TouchableHighlight
            underlayColor="#222"
            onPress={ this.showMyFavs.bind(this) }
            >
            <View style={
              [
                styles.navigationLink
              ]
            }><Text style={ styles.navigationLinkText } >Fav photos</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#222"
            onPress={ this.showMyFavs.bind(this) }
            >
            <View style={
              [
                styles.navigationLink
              ]
            }><Text style={ styles.navigationLinkText } >Start over</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
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
  navigationLink: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  navigationLinkText: {
    borderWidth: 1,
    borderColor: "white",
    textAlign: 'center',
    color: 'white',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
  },
  optionTray: {
    height: 130,
    backgroundColor: "#222"

  },
});