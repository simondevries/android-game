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

function LandTile(cellClicked) {
  return <View onClick={cellClicked} style={[styles.tile, styles.land]}/>
}

function StoneTile(cellClicked) {
  return <View  onClick={cellClicked} style={[styles.tile, styles.stone]}/>
}

function GoldTile(cellClicked) {
  return <View  onClick={cellClicked} style={[styles.tile, styles.gold]}/>
}

function FoodTile(cellClicked) {
  return <View  onClick={cellClicked} style={[styles.tile, styles.food]}/>
}

function WoodTile(cellClicked) {
  return  <View  onClick={cellClicked} style={[styles.tile, styles.wood]}/>
}

function WaterTile(cellClicked) {
  return  <View  onClick={cellClicked} style={[styles.tile, styles.water]}/>
}


function RenderMap({units, cellClicked}){
  let world = [];
  for (var x = 0; x<= mapSize; x++) {
      world.push(Array(mapSize))
  }

  return Array.from(Array(mapSize)).map((z, y) => {
    const row = Array.from(Array(mapSize)).map((z1, x)=>{
        const unit = units && units.find(u => u && u.x === x && u.y === y);
        if (!unit) {
         return LandTile(cellClicked(x, y));
        }
        if (unit instanceof Stone) {
          return StoneTile(cellClicked(x, y));
        }
        if (unit instanceof Gold) {
          return GoldTile(cellClicked(x, y));
        }
        if (unit instanceof Wood) {
          return WoodTile(cellClicked(x, y));
        }
        if (unit instanceof Food) {
          return FoodTile(cellClicked(x, y));
        }
        if (unit instanceof Water) {
          return WaterTile(cellClicked(x, y));
        }
        if (unit instanceof Villager) {
          return <VillagerTile cellClicked={cellClicked(x, y)} unit={unit} x={x} y={y}/>;
        }
    })
    
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
  const [selectedUnitPosition, setSelectedUnit] = useState();

  useEffect(() => {
    window.setInterval(function(){
      processTick(units, setUnits)
    }, 1000);
  }, []);

  const cellClicked = (x, y) => () => {
    const unitAtSite = units && units.find(u => u && u !== [] && u.x === x &&  u.y === y);
    const selectedUnit = units && units.find(u => u && u !== [] && selectedUnitPosition && selectedUnitPosition.x === u.x &&  selectedUnitPosition.y === u.y);
    if(!unitAtSite){
      return;
    } else if (!selectedUnit) { 
      setSelectedUnit(new Point(x, y))
    }else{
      if(selectedUnit instanceof Villager && unitAtSite instanceof Resource){
        selectedUnit.setTarget(new Point(x+1,y))
      }
    }
  }

return (
    <View style={{flex: 1}}>
      {/* <Multitap/> */}
      <RenderMap units={units} cellClicked={cellClicked}/>
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

  setTarget(point){
    this.target = point;
    this.path = [];
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
