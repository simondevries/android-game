import React from 'react';
import {View, Text} from 'react-native';
import {tileSize} from './World';

const styles = {
    slot:{
        borderColor: 'black', borderWidth: 2, borderStyle: 'solid',
        height: tileSize,
        width: tileSize,
    }
}

export default function({x,y}){
    return <View style={{position: 'absolute', top: tileSize*x, left: tileSize*y, width: tileSize*3, height: tileSize*3, borderColor: 'black', borderWidth: 2, borderStyle: 'solid'}}>
        <View style={styles.slot}></View>
   
        
        </View>
}