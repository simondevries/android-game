import {mapSize, Stone, Gold, Water, Wood, Food, Villager,TownCenter} from './World';
export default function initUnits(){
    let u = [];
    
    for(var x = 0; x<mapSize;x++){
      for(var y = 0; y<mapSize;y++){
  
        if(x === 5 && y === 5){
            u.push(new TownCenter(300, 5,5))
            continue;
        }
        const rType = Math.floor(Math.random() * 100); 
  
        switch(rType){
          case 0:
            u.push(new Stone(1,x,y));
            break;
          case 1:
            u.push(new Gold(1,x,y));
            break;
          case 2:
            u.push(new Water(1,x,y));
            break;
          case 3:
            u.push(new Wood(1,x,y));
            break;
          case 4:
            u.push(new Food(1,x,y));
            break;
          case 5:
            u.push(new Villager(1,x,y, 1));
            break;
        }
      }
    }
            // u.push(new Stone(1,2,2, ));
            // u.push(new Villager(1,1,1, 3));
    return u;
  }