import { StatusBar } from 'expo-status-bar';
import { Animated, Button,StyleSheet, Text, View ,Dimensions} from 'react-native';
import React, {Component, useState, useEffect } from 'react';
import { LongPressGestureHandler, TapGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import WorldWrapper from './WorldWrapper';
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const circleRadius = 30;

function App() {

return (
    <View style={{flex: 1}}>
      {/* <Multitap/> */}
      {/* <RenderMap units={units}/> */}
      <WorldWrapper/>
    </View>
  );
}

export default App;

