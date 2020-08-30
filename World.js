import { StatusBar } from 'expo-status-bar';
import { Animated, Button,StyleSheet, Text, View ,Dimensions} from 'react-native';
import React, {Component, useState, useEffect, useReducer } from 'react';
import { LongPressGestureHandler, TapGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import VillagerTile from './VillagerTile';
import { getXYPositionsFromPath, getFreeSpaceAroundCell } from './helpers';
import generateMap from './mapGen';
import calculatePathToTarget from './PathFinding';
import useInterval from './interval';
import BuildMenu from './BuildMenu';
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
    backgroundColor: 'green'
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
  townCenter: {
    backgroundColor: 'purple'
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
  return <View  onClick={cellClicked} style={[styles.tile, styles.stone]}><Text>🗿</Text></View>
}

function GoldTile(cellClicked) {
  return <View  onClick={cellClicked} style={[styles.tile, styles.gold]}/>
}

function FoodTile(cellClicked) {
  return <View  onClick={cellClicked} style={[styles.tile, styles.food]}/>
}

function WoodTile(cellClicked) {
  return  <View  onClick={cellClicked} style={[styles.tile, styles.wood]}><Text style={{fontSize: '15pt'}}>🌳</Text></View>
}

function WaterTile(cellClicked) {
  return  <View  onClick={cellClicked} style={[styles.tile, styles.water]}><Text>🌊</Text></View>
}

function TownCenterTile(cellClicked, unit) {
return  <View  onClick={cellClicked} style={[styles.tile, styles.townCenter]}>{unit.timeRemainingOnBuild !== 0 && <Text style={{color: 'white'}}>{unit.timeRemainingOnBuild}</Text>}</View>
}


// const setIsSelected =(dispatch, x,y) => () => {
//   dispatch({type: selectedUnitPosition, actions})
// }

function RenderMap({dispatch, units, selectedUnitPosition, cellClicked}){
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
          return <VillagerTile cellClicked={cellClicked(x, y)} isSelected={selectedUnitPosition && selectedUnitPosition.x === x && selectedUnitPosition.y === y} unit={unit} x={x} y={y}/>;
        }
        if (unit instanceof TownCenter) {
          return TownCenterTile(cellClicked(x, y), unit);
        }
    })
    
    return <View style={styles.world}>
      <View style={styles.row}>
        {row}
      </View>
    </View>

  })
}


function ProcessMovement(unit, units) {
  if(unit instanceof Person){
       
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
}

function processTick (units, dispatch, adjustStoneCollected, adjustGoldCollected, adjustFoodCollected, adjustWoodCollected) {
  let unitsToAdd = [];
  let unitsToRemove = [];

  const u = units.map(unit => {
    // Process movement
    unit = ProcessMovement(unit, units)

    // Process resources
    if(unit instanceof Villager && unit.hasAssignment()){
        if (unit.isNextTo(unit.assignmentLocation)){
          const resouceAtLocation = units.find(u => u && u.x === unit.assignmentLocation.x && u.y === unit.assignmentLocation.y && u instanceof Resource);
          if(resouceAtLocation){
            const amountCollected = resouceAtLocation.collect(unit.strength);
            if(resouceAtLocation instanceof Stone){
              adjustStoneCollected(amountCollected)
            } else if (resouceAtLocation instanceof Gold){
              adjustGoldCollected(amountCollected)
            } else if (resouceAtLocation instanceof Food){
              adjustFoodCollected(amountCollected)
            } else if (resouceAtLocation instanceof Wood){
              adjustWoodCollected(amountCollected)
            } 
          } 
        }
    }

    // Remove spent resources
    if (unit instanceof Unit){
      if (unit.hp <= 0){
        unitsToRemove = unitsToRemove.concat([unit]);
      }
    }

    // Process buildings
    if (unit instanceof Building){
      if (unit.buildQueue !== undefined && unit.buildQueue.length > 0){
        unit.timeRemainingOnBuild -= 1;
        if (unit.timeRemainingOnBuild <= 0){

          const freeSpot = getFreeSpaceAroundCell(units, unit.x, unit.y)
          if (freeSpot !== ''){
            unit.buildQueue = unit.buildQueue.slice(1);
            unit.timeRemainingOnBuild = unit.buildQueue.slice(1);
          }
          switch (freeSpot){
            case 'tl':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x - 1, unit.y - 1, 5));
            break;
            case 'tc':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x, unit.y - 1, 5));
            break;
            case 'tr':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x + 1, unit.y - 1, 5));

            break;
            case 'cl':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x - 1, unit.y, 5));

            break;
            case 'cr':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x + 1, unit.y, 5));

            break;
            case 'bl':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x - 1, unit.y + 1, 5));

            break;
            case 'bc':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x, unit.y + 1, 5));

            break;
            case 'br':
              unitsToAdd = unitsToAdd.concat(new Villager(1, unit.x + 1, unit.y + 1, 5));

            break;
          }
        }
      }
    }

      return unit;
  });
  const newUnits = u.concat(unitsToAdd).filter(u => unitsToRemove && !unitsToRemove.some(utr => utr === u))

  dispatch({type:'setUnits', units: newUnits})
}

const initialState = {
  resources: {
    stone: 0, gold: 0, wood: 0, food: 200},
    selectedUnitPosition: undefined,
    units: []
  };

function reducer(state, action) {
  switch (action.type) {
    case 'adjustStone':
      return {...state, resources: {...state.resources, stone: state.resources.stone += action.amount}};
    case 'adjustGold':
      return {...state, resources: {...state.resources, gold: state.resources.gold += action.amount}};
    case 'adjustWood':
      return {...state, resources: {...state.resources, wood: state.resources.wood += action.amount}};
    case 'adjustFood':
      return {...state, resources: {...state.resources, food: state.resources.food += action.amount}};
    case 'setUnits':
      return {...state, units: action.units};
    case 'selectedUnitPosition':
      return {...state, selectedUnitPosition: action.selectedUnitPosition};
    default:
      throw new Error();
  }
}


export default function World() {

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const units = generateMap();
    dispatch({type: 'setUnits', units: units})
  }, []);


  useInterval(() => {
    const units = state.units;
    processTick(units || state.units, dispatch, adjustStoneCollected, adjustGoldCollected, adjustFoodCollected, adjustWoodCollected)
  }, 1000)

  const cellClicked = (x, y) => () => {
    const units = state.units;
    const unitAtSite = units && units.find(u => u && u !== [] && u.x === x &&  u.y === y);
    const selectedUnitPosition = state.selectedUnitPosition;
    const selectedUnit = units && units.find(u => u && u !== [] && selectedUnitPosition && selectedUnitPosition.x === u.x &&  selectedUnitPosition.y === u.y);
    if (selectedUnit instanceof Villager) {
      if(unitAtSite instanceof Resource){
        selectedUnit.setTarget(new Point(x, y))
        selectedUnit.collectResources(new Point(x, y))
        dispatch({type: 'selectedUnitPosition', selectedUnitPosition: new Point(x, y)})
      } else {
        selectedUnit.setTarget(new Point(x + 1, y))
      } 
    } else if (unitAtSite instanceof TownCenter) {
      unitAtSite.queueVillager()
    }else if (selectedUnit === undefined || (selectedUnit instanceof Person === false)) {
      dispatch({type: 'selectedUnitPosition', selectedUnitPosition: new Point(x, y)})
    }
  }

  const adjustStoneCollected = (amountToAdjust) => {
    dispatch({type: 'adjustStone', amount: amountToAdjust})
  }

  const adjustFoodCollected = (amountToAdjust) => {
    dispatch({type: 'adjustFood', amount: amountToAdjust})
  }

  const adjustWoodCollected = (amountToAdjust) => {
    dispatch({type: 'adjustWood', amount: amountToAdjust})
  }

  const adjustGoldCollected = (amountToAdjust) => {
    dispatch({type: 'adjustGold', amount: amountToAdjust})
  }

return (
    <View style={{flex: 1}}>
      {/* <Multitap/> */}
      <RenderMap dispatch={dispatch} units={state.units} selectedUnitPosition={state.selectedUnitPosition} cellClicked={cellClicked}/>
      
      <View style={{flexDirection: 'row'}}>
        <Text>Stone: {state.resources.stone}</Text>
        <Text>Food: {state.resources.food}</Text>
        <Text>Wood: {state.resources.wood}</Text>
        <Text>Gold: {state.resources.gold}</Text>
      </View>
      <BuildMenu x={12} y={4}/>
    </View>
  );
}



export class Unit {

  constructor(hp, x, y) {
    this.hp = hp;
    this.x = x;
    this.y = y;
  }

  isNextTo(point) {
    const pointX = point.x;
    const pointY = point.y;

    const acceptableX = (this.x === pointX -1) || (this.x === pointX +1) || (this.x === pointX);
    const acceptableY = (this.y === pointY -1) || (this.y === pointY +1) || (this.y === pointY);

    return acceptableX && acceptableY
  }
  adjustHp(adjustment){
    this.hp = this.hp += adjustment;
  }

}

export class Person extends Unit {

  constructor(hp, x, y, strength, path) {
    super(hp, x, y);
    this.strength = strength;
    this.path = path;
    this.target;
    this.assignmentLocation = undefined;
    this.assignmentType = undefined;
  }

  setTarget(point){
    this.target = point;
    this.path = [];
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

  setAssignment(type, point) {
    this.assignmentLocation = point;
    this.assignmentType = type;
  }

  hasAssignment(){
    return this.assignmentLocation !== undefined && this.assignmentType !== undefined;
  }
}

export class Villager extends Person {

  constructor(hp, x, y, strength){
    super(hp, x, y)
    this.strength = strength;
  }

  collectResources(point){
    super.setAssignment("Collect", point);
  }
}

export class Building extends Unit {
  constructor(hp, x, y) {
    super(hp, x, y);
    this.buildQueue = [];
    this.timeRemainingOnBuild = 0;
  }

 addToQueue (b) {
    this.buildQueue = this.buildQueue.concat([b])
  }
}

export class Resource extends Unit {

  constructor(hp, x, y,  resourceCollectionEffort) {
    super(hp, x, y);
    this.resourceCollectionEffort = resourceCollectionEffort; 
  }

  collect(strength){
    const amountCollecting = Math.ceil(Math.max(0, strength/this.resourceCollectionEffort))
    super.adjustHp(amountCollecting * -1);
    return amountCollecting;
  }
}

export class TownCenter extends Building {
  constructor(hp, x, y) {
    super(hp, x, y);
  }

  queueVillager() {
    super.addToQueue("Villager");
    super.timeRemainingOnBuild = 10;
  }
}

export class Wood extends Resource {
  constructor(x, y) {
    super(100, x, y, 2);
    this.resourceType = "WOOD";
  }
}

export class Gold extends Resource {
  constructor(x, y) {
    super(200, x, y, 2.2);
    this.resourceType = "GOLD";
  }
}

export class Food extends Resource {
  constructor(x, y) {
    super(120, x, y, 1.5);
    this.resourceType = "FOOD";
  }
}

export class Stone extends Resource {
  constructor(x, y) {
    super(200, x, y, 3);
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
