import { tileSize } from './world';

export const getXYPositionsFromPath = (path, currX, currY) => {
    let cellsDragged = []
    
    path.forEach(p => {

        const x=  p[0];
        const y = p[1];
        
        const cellX = Math.max(Math.floor(x/tileSize), 0);
        const cellY = Math.max(Math.floor(y/tileSize), 0);
        if(cellsDragged.length >= 1 && cellsDragged[cellsDragged.length-1][0] !== cellX && cellsDragged[cellsDragged.length -1][0] !== cellY){
            cellsDragged.push([cellX, cellY])
        }else if (cellsDragged.length === 0) {
            cellsDragged = [[cellX, cellY]]
        }
    });


    cellsDragged = cellsDragged.filter(c => c[0] !== currX && c[1] !== currY)

    return cellsDragged;
}


export const getFreeSpaceAroundCell = (units, x, y) =>{
    const topLeft = units.find(u => (u.x === x - 1 && u.y === y - 1));
    const topCenter = units.find(u => u.x === x && u.y === y - 1);
    const topRight = units.find(u => u.x === x+1 && u.y === y - 1);
    const centerLeft = units.find(u => u.x === x-1 && u.y === y);
    const centerRight = units.find(u => u.x === x+1 && u.y === y);
    const bottomRight = units.find(u => u.x === x+1 && u.y === y+1);
    const bottomCenter = units.find(u => u.x === x && u.y === y+1);
    const bottomLeft = units.find(u => u.x === x-1 && u.y === y+1);

    if(!topLeft) return 'tl'
    if(!topCenter) return 'tc'
    if(!topRight) return 'tr'
    if(!centerLeft) return 'cl'
    if(!centerRight) return 'cr'
    if(!bottomLeft) return 'bl'
    if(!bottomCenter) return 'bc'
    if(!bottomRight) return 'br'
    return '';
}