import { StatusBar } from 'expo-status-bar';
import { Animated, Button,StyleSheet, Text, View ,Dimensions} from 'react-native';
import React, {Component, useState, useEffect } from 'react';
import { LongPressGestureHandler, TapGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import VillagerTile from './VillagerTile';
import { getXYPositionsFromPath } from './helpers';
import pathfinding from 'pathfinding';
import generateMap from './mapGen';
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



export const mapSize = 30;

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
        const unit = units && units.find(u => u && u.x === x && u.y === y);
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

function calculatePathToTarget(unitToMove, units){
  const impassibleMap = Array.from(Array(mapSize)).map((z, y) => {
    return Array.from(Array(mapSize)).map((z1, x)=>{
      if (units && units.find(u => u.x === x && u.y === y)){
        return 1;
      }else{
        return 0;
      }
    });
  });

  var grid = new pathfinding.Grid(impassibleMap);
  var finder = new pathfinding.AStarFinder({allowDiagonal: true});

  const path = finder.findPath(unitToMove.x, unitToMove.y, unitToMove.target.x, unitToMove.target.y, grid);

  unitToMove.path = path.slice(1)
  return unitToMove;
}

function processTick(units, setUnits) {
  const u = units.map(unit => {
      if(unit instanceof Villager){
       
        if(unit.target === undefined){
          return unit;
        }

        if(unit.target !== undefined && (unit.path === [] || unit.path === undefined || unit.path.length === 0)){
          unit = calculatePathToTarget(unit, units);
        }

        // Could not compute path
        if(!unit.path || unit.path.length === 0) {return unit;}

        const newX = unit.path[0][0];
        const newY = unit.path[0][1];

        const hasCollision = units.some(u =>  (u.x) === newX && (u.y) === newY);

        if(hasCollision){
          unit.clearPath();
          return unit;
        }

        unit.x = newX;
        unit.y = newY;

        unit.hasMoved();
      }

      return unit;
  });

  setUnits(u)
}

export default function World() {

  const [units, setUnits] = useState(generateMap());

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



export class Unit {

  constructor(hp, x, y) {
    this.hp = hp;
    this.x = x;
    this.y = y;
  }

  onTick() { };

}

export class Person extends Unit {

  constructor(hp, x, y, strength, path, target) {
    super(hp, x, y);
    this.strength = strength;
    this.path = path;
    this.target = target;
  }

  assignment() {
    console.log('do work')
  }

  clearPath() { this.path = []; this.target = undefined;}

  hasMoved(){
    this.path = this.path.slice(1);
    if(!this.path || this.path.length === 0){
      this.target = undefined;
    }
  }

  hasPath() {
    return this.path && this.path.length >= 1;
  }
}

export class Villager extends Person {
  
}

export class Building extends Unit {

}

export class Resource extends Unit {

  constructor(hp, x, y, amount) {
    super(hp, x, y);
    this.amount = amount;
  }

}

export class Wood extends Resource {
  constructor(hp, x, y) {
    super(hp, x, y);
    this.resourceType = "WOOD";
  }
}

export class Gold extends Resource {
  constructor(hp, x, y) {
    super(hp, x, y);
    this.resourceType = "GOLD";
  }
}

export class Food extends Resource {
  constructor(hp, x, y) {
    super(hp, x, y);
    this.resourceType = "FOOD";
  }
}

export class Stone extends Resource {
  constructor(hp, x, y) {
    super(hp, x, y);
    this.resourceType = "STONE";
  }
}

export class Water extends Resource {
  constructor(hp, x, y) {
    super(hp, x, y);
    this.resourceType = "STONE";
  }
}

export class Point {
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}
