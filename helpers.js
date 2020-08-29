import { tileSize } from './world';

export const getXYPositionsFromPath = (path, currX, currY) => {
    let cellsDragged = []
    
    path.forEach(p => {

        const x=  p[0];
        const y = p[1];
        
        const cellX = Math.max(Math.floor(x/tileSize), 0);
        const cellY = Math.max(Math.floor(y/tileSize), 0);
        if(cellsDragged.length >= 1 && cellsDragged[cellsDragged.length-1][0] !== cellX && cellsDragged[cellsDragged.length -1][0] !== cellY            ){
            cellsDragged.push([cellX, cellY])
        }else if (cellsDragged.length === 0) {
            cellsDragged = [[cellX, cellY]]
        }
    });


    cellsDragged = cellsDragged.filter(c => c[0] !== currX && c[1] !== currY)

    return cellsDragged;
}
