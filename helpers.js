import { tileSize } from './world';

export const getXYPositionsFromPath = (path) => {
    let cellsDragged = []
    
    path.forEach(p => {
        const x=  p[0];
        const y = p[1];
        
        const cellX = Math.floor(x/tileSize);
        const cellY = Math.floor(y/tileSize);

        if(cellsDragged.length >= 1 && cellsDragged[cellsDragged.length-1][0] !== cellX && cellsDragged[cellsDragged.length -1][0] !== cellY){
            cellsDragged.push([cellX, cellY])
        }else if (cellsDragged.length === 0) {
            cellsDragged = [[cellX, cellY]]
        }
    });

    return cellsDragged;
}