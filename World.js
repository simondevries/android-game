import { StatusBar } from 'expo-status-bar';
import { Animated, Button,StyleSheet, Text, View ,Dimensions} from 'react-native';
import React, {Component, useState, useEffect } from 'react';
import { LongPressGestureHandler, TapGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import VillagerTile from './VillagerTile';
import { getXYPositionsFromPath } from './helpers';

export const tileSize = 30;

export const styles = StyleSheet.create({
  tile: {
    height: tileSize,
    width: tileSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box:{
    height: 100,
    width: 100,
    backgroundColor: 'red'
  },
  wood: {
    backgroundColor: 'brown'
  },
  food: {
    backgroundColor: 'red'
  },
  gold: {
    backgroundColor: 'gold'
  },
  water: {
    backgroundColor: 'aqua'
  },
  stone: {
    backgroundColor: 'gray'
  },
  land: {
    backgroundColor: 'green'
  },

  world: {
    backgroundColor: 'pink'
  },
  row: {
    height: tileSize,
    flexDirection: 'row'
  }
});



const mapSize = 30;

function LandTile() {
  return <View style={[styles.tile, styles.land]}/>
}

function StoneTile() {
  return <View style={[styles.tile, styles.stone]}/>
}

function GoldTile() {
  return <View style={[styles.tile, styles.gold]}/>
}

function FoodTile() {
  return <View style={[styles.tile, styles.food]}/>
}

function WoodTile() {
  return  <View style={[styles.tile, styles.wood]}/>
}

function WaterTile() {
  return  <View style={[styles.tile, styles.water]}/>
}


function RenderMap({units}){
  let world = [];
  for (var x = 0; x<= mapSize; x++) {
      world.push(Array(mapSize))
  }

  return Array.from(Array(mapSize)).map((z, y) => {
    const row = Array.from(Array(mapSize)).map((z1, x)=>{
        const unit = units.find(u => u.x === x && u.y === y);
        if (!unit) {
         return LandTile();
        }
        if (unit instanceof Stone) {
          return StoneTile();
        }
        if (unit instanceof Gold) {
          return GoldTile();
        }
        if (unit instanceof Wood) {
          return WoodTile();
        }
        if (unit instanceof Food) {
          return FoodTile();
        }
        if (unit instanceof Water) {
          return WaterTile();
        }
        if (unit instanceof Villager) {
          return <VillagerTile unit={unit} x={x} y={y}/>;
        }
    })
// asd
    return <View style={styles.world}>
      <View style={styles.row}>
      {row}
      </View>
    </View>

  })
}

function processTick(units, setUnits) {
  const u = units.map(unit => {
      if(unit instanceof Villager && unit.hasPath()){
        const vel = unit.velocity;
        console.log('unit', JSON.stringify(unit))
        const newX = unit.path[0][0];
        const newY = unit.path[0][1];

        const hasCollision = units.some(u => (u.x) === newX && (u.y) === newY);
        // const hasCollision = units.some(u =>  (u.x + u.velocity.x) === newX && (u.y + u.velocity.y) === newY);

        if (!hasCollision){
          unit.x = newX;
          unit.y = newY;
          unit.hasMoved();
        }
      }

      return unit;
  });

  setUnits(u)
}

export default function World() {

  const [units, setUnits] = useState(initUnits());

  useEffect(() => {
    window.setInterval(function(){
      processTick(units, setUnits)
    }, 1000);
  }, []);



return (
    <View style={{flex: 1}}>
      {/* <Multitap/> */}
      <RenderMap units={units}/>
      {/* <WorldWrapper/> */}
    </View>
  );
}

class Velocity{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}

class Unit {

  constructor(hp, x, y, velocity) {
    this.hp = hp;
    this.x = x;
    this.y = y;
    this.velocity = velocity;
  }

  onTick() { };

}

class Person extends Unit {

  constructor(hp, x, y, velocity, strength, path) {
    super(hp, x, y, velocity);
    this.strength = strength;
    this.path = path;
  }

  assignment() {
    console.log('do work')
  }

  setPath(coords) {
    this.path = getXYPositionsFromPath(coords, this.x, this.y)   
  };

  hasMoved(){
    this.path = this.path.splice(1, this.path.length - 1)
  }

  hasPath() {
    return this.path && this.path.length >= 1;
  }
}

class Villager extends Person {
  
}

class Building extends Unit {

}

class Resource extends Unit {

  constructor(hp, x, y, velocity, amount) {
    super(hp, x, y, velocity);
    this.amount = amount;
  }

}

class Wood extends Resource {
  constructor(hp, x, y, velocity) {
    super(hp, x, y, velocity);
    this.resourceType = "WOOD";
  }
}

class Gold extends Resource {
  constructor(hp, x, y, velocity) {
    super(hp, x, y, velocity);
    this.resourceType = "GOLD";
  }
}

class Food extends Resource {
  constructor(hp, x, y, velocity) {
    super(hp, x, y, velocity);
    this.resourceType = "FOOD";
  }
}

class Stone extends Resource {
  constructor(hp, x, y, velocity) {
    super(hp, x, y, velocity);
    this.resourceType = "STONE";
  }
}

class Water extends Resource {
  constructor(hp, x, y, velocity) {
    super(hp, x, y, velocity);
    this.resourceType = "STONE";
  }
}

function initUnits(){
  let u = [];
  
  for(var x = 0; x<mapSize;x++){
    for(var y = 0; y<mapSize;y++){

      const rType = Math.floor(Math.random() * 100); 

      switch(rType){
        case 0:
          u.push(new Stone(1,x,y,new Velocity(0,0)));
          break;
        case 1:
          u.push(new Gold(1,x,y,new Velocity(0,0)));
          break;
        case 2:
          u.push(new Water(1,x,y,new Velocity(0,0)));
          break;
        case 3:
          u.push(new Wood(1,x,y,new Velocity(0,0)));
          break;
        case 4:
          u.push(new Food(1,x,y,new Velocity(0,0)));
          break;
        case 5:
          u.push(new Villager(1,x,y,new Velocity(0, 0), 1, []));
          break;
          break;
        case 6:
          u.push(new Villager(1,x,y,new Velocity(0, 0), 1, []));
          break;
          break;
        case 7:
          u.push(new Villager(1,x,y,new Velocity(Math.floor((Math.random() * 3) - 1),Math.floor((Math.random() * 3) - 1)), 1), []);
          break;
          break;
        case 8:
          u.push(new Villager(1,x,y,new Velocity(Math.floor((Math.random() * 3) - 1),Math.floor((Math.random() * 3) - 1)), 1), []);
          break;
          break;
        case 9:
          u.push(new Villager(1,x,y,new Velocity(Math.floor((Math.random() * 3) - 1),Math.floor((Math.random() * 3) - 1)), 1), []);
          break;
          break;
        case 10:
          u.push(new Villager(1,x,y,new Velocity(Math.floor((Math.random() * 3) - 1),Math.floor((Math.random() * 3) - 1)), 1), []);
          break;
      }

    }
  }
  return u;
}