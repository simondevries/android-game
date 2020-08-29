import { StatusBar } from 'expo-status-bar';
import { Animated, Button,StyleSheet, Text, View ,Dimensions, PanResponder} from 'react-native';
import React, {Component, useState, useEffect } from 'react';
import { LongPressGestureHandler, TapGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import { styles as WorldStyles, tileSize, Point } from './World';
// export default 
// function VillagerTile(unit) {
//   return  <View style={[styles.tile, styles.villager]}>
//         <View style={[styles.tile, styles.dude]}/>
//     </View>
// }



export default class VillagerTile extends Component {
  state = {
    dragging: false,
    offsetTop: 0,
    offsetLeft: 0,
    progress: []
  };

  panResponder = {};

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd,
    });
  }
  path = []
  render() {
    const {
      dragging,
      offsetTop,
      offsetLeft,
    } = this.state;

    // Update style with the state of the drag thus far
    const style = {
      backgroundColor: dragging ? 'blue' : 'green',
      top: 0,//offsetTop,
      left: 0,//  offsetLeft,
      flex: 1
    };

    return (
      <View style={styles.container} onClick={this.props.cellClicked}>
        <View {...this.panResponder.panHandlers} style={[styles.square, style]}>
          <View style={styles.dude}/>
        </View>
      </View>
    );
  }

  // Should we become active when the user presses down on the square?
  handleStartShouldSetPanResponder = () => {
    return true;
  };

  // We were granted responder status! Let's update the UI
  handlePanResponderGrant = () => {
    this.setState({ dragging: true });
  };

  // Every time the touch/mouse moves
  handlePanResponderMove = (e, gestureState) => {
    // Keep track of how far we've moved in total (dx and dy)



    this.path.push([gestureState.dx, gestureState.dy])
    this.setState({
      offsetTop: gestureState.dy,
      offsetLeft: gestureState.dx,
      // progress: this.state.progess.concat([[gestureState.dx, gestureState.dy]])
    });
  };

  // When the touch/mouse is lifted
  handlePanResponderEnd = (e, gestureState) => {
    // const { initialTop, initialLeft, progress } = this.state;
    // // this.path = this.path.map(p => [(p[0] + (this.props.x * tileSize)), (p[1] + (this.props.y * tileSize))])

    // const targetX = Math.floor(this.path[this.path.length][0]/tileSize)
    // const targetY = Math.floor(this.path[this.path.length][0]/tileSize)

    // this.props.unit.setTarget(this.path)
    // console.log('path',JSON.stringify(this.path))
    // this.path = []
    
    // this.setState({
    //   dragging: false,
    //   initialTop: initialTop + gestureState.dy,
    //   initialLeft: initialLeft + gestureState.dx,
    //   offsetTop: 0,
    //   offsetLeft: 0,
    //   progess: []
    // });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  square: {
    height: tileSize,
    width: tileSize,
    position: 'relative',
    width: tileSize,
    height: tileSize,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green'
  },
  dude: {
    borderRadius: 30,
    backgroundColor: 'orange',
    flex: 1,
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
});
