
import pathfinding from 'pathfinding';
import {mapSize} from './world';

export default function calculatePathToTarget(unitToMove, units){
    const impassibleMap = Array.from(Array(mapSize)).map((z, y) => {
      return Array.from(Array(mapSize)).map((z1, x)=>{

        if(unitToMove.target.x === x && unitToMove.target.y === y){
          return 0;
        }

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