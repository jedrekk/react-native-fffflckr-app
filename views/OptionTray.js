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

  closeOverlay() {
    this.props.closeOverlayFunction();

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
            height: 35
          }}
          />)
    }

    return (<Icon
        name='ion|search'
        size={ 28 }
        color='white'
        style={{
          width: 40,
          height: 35
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
          <TouchableHighlight
            onPress={ this.closeOverlay.bind(this) }

            underlayColor="#222"
            style={{
              marginRight: 10,
              width: 30,
              height: 30,
            }}
            >
            <Icon
              name='ion|close'
              size={ 28 }
              color='white'
              style={{
                width: 40,
                height: 35
              }}
              />
        </TouchableHighlight>

        <TextInput
          style={{
            flex: 1,
            height: 35,
            borderColor: 'gray',
            backgroundColor: '#555',
            color: 'white',
            fontSize: 13,
            paddingTop: 3,
            paddingBottom: 3,
            paddingRight: 12,
            paddingLeft: 12,
            marginLeft: 15,
            }}
          autoFocus={ true }
          autoCapitalize='none'
          enablesReturnKeyAutomatically={ true }
          returnKeyType='search'
          placeholder='Start over with a search'
          placeholderTextColor="#999"
          onSubmitEditing={ this.initializeSearch.bind(this) }
          onChangeText={(searchText) => { 
            this.setState( {searchText} );

            if (searchText.toLowerCase() == this.state.lastSearchedText.toLowerCase()
                && searchText.toLowerCase() != "") {
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
              width: 30,
              height: 30,
            }}
            >
            { this.getSearchIcon() }
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
    borderTopWidth: 20,
    borderColor: "#333",
    height: 72,
    backgroundColor: "#222"

  },
});