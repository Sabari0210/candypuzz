import GameConstants from '../data/constants.js'
import dimensions from '../dimensions.js';
export default class Board extends Phaser.Group {
    constructor(game, parent,_game) {
        super(game, parent);

        // Meta Data (Override to customize)
        this.dropTime = 200;

        this.tileTypes = ["blue", "bluegreen", "red", "green", "orange", "purple"];

        // Data Variables
        this.tiles = [];

        // Flags
        this.canClick = false;
        this.gameStarted = false;
        this.gameEnded = false;
        this.stopPlay = false;
        this.game.main = _game;
        this.init();

        this.isMatch = 0;
    }

    adjust(){
        if(dimensions.isLandscape){
            this.x = dimensions.gameWidth / 2 + 200;
            this.y = dimensions.gameHeight/2 + 50;
            this.scale.set(1);
        }else{
            this.x = dimensions.gameWidth / 2;
            this.y = dimensions.bottomOffset - 100;
            this.scale.set(1);
        }
    }

    init() {

        this.columns = 5;
        this.rows = 5;

        this.tileSize = 1;
        this.offsetX = -90;
        this.offsetY = -180;
        this.tileWidth = 54;
        this.tileHeight = 54;

        this.board = this.game.add.group();
        this.add(this.board);

        this.createTiles();

        this.createLevel();

        this.bg = this.game.add.graphics(this.offsetX - this.tileWidth / 2, this.offsetY - this.tileHeight / 2);
        this.bg.beginFill(0x000000, 0.1);
        this.bg.drawRect(0, 0, this.columns * this.tileWidth, this.rows * this.tileHeight);
        this.bg.endFill();
        this.add(this.bg);

        this.visible = false;
        // this.show();
    }
 
    show() {
        this.visible = true;
        this.game.add.tween(this).from({
            alpha: 0
        }, 300, "Linear", true).onComplete.add(() => {
            this.startGame();
        })
    }

    hide() {

        this.game.add.tween(this).to({
            alpha: 0
        }, 250, "Linear", true).onComplete.add(() => {

            this.alpha = 1;
            this.visible = false;
        })
        
    }

    startGame() {
        this.canClick = true;
        this.gameStarted = true;

        this.bg.events.onInputDown.add(this.onTap, this);
        this.bg.events.onInputUp.add(this.onTapUp, this);

        this.bg.inputEnabled = true;
    }

    disable() {
        this.bg.inputEnabled = false;
    }

    onTap(pointer) {
        if(this.stopPlay)return;

        if (!this.canClick)
            return;

        if (!this.gameStarted)
            return;

        if (this.gameEnded)
            return;

        this.selectedTile = this.getTileUnderMouse();

        if (!this.selectedTile) {
            this.selectedTile = null;
            return;
        }

        if (this.selectedTile.type == GameConstants.BLOCKED || this.selectedTile.level == GameConstants.LOCKED) {
            this.selectedTile = null;
        }
    }

    onTapUp() {
        if(this.stopPlay)return;
        if (!this.gameStarted)
            return;

        if (!this.canClick)
            return;

        if (this.selectedTile)
            this.setTileType(this.selectedTile, this.selectedTile.type);

        this.selectedTile = null;

    }

    getTileUnderMouse() {
        let row, col;

        let mouse = this.game.main.offsetMouse();

        mouse.x -= (this.x) + this.offsetX - this.tileWidth / 2;
        mouse.y -= ((this.y) + this.offsetY - this.tileHeight / 2)

        row = Math.floor((mouse.y / this.scale.y) / this.tileHeight);
        col = Math.floor((mouse.x / this.scale.x) / this.tileWidth);

        if (row < 0 || col < 0 || row >= this.rows || col >= this.columns)
            return;

        return this.tiles[col][row];
    }

    update() {

        if (this.selectedTile && this.selectedTile != this.getTileUnderMouse()) {
            let tile = this.getTileUnderMouse();

            // console.log("____________________________")
            if (tile && ((Math.abs(tile.x - this.selectedTile.x) <= this.tileWidth && tile.y - this.selectedTile.y == 0) || (tile.x - this.selectedTile.x == 0 && Math.abs(tile.y - this.selectedTile.y) <= this.tileHeight))) {
    
                if (tile.type == GameConstants.BLOCKED || tile.level == GameConstants.LOCKED) {
                    if (this.selectedTile) {
                        this.setTileType(this.selectedTile, this.selectedTile.type);
                    }
                    this.selectedTile = null;
                    return;
                }


                this.canClick = false;

                let x1 = this.selectedTile.x;
                let x2 = tile.x;
                let y1 = this.selectedTile.y;
                let y2 = tile.y;

                let t1 = this.game.add.tween(this.selectedTile).to({
                    x: x2,
                    y: y2
                }, 200, "Linear", false);
                let t2 = this.game.add.tween(tile).to({
                    x: x1,
                    y: y1
                }, 200, "Linear", false);
                t2.onComplete.add(function (selectedTile, tile) {
                    let x = selectedTile.x;
                    selectedTile.x = tile.x;
                    tile.x = x;

                    let y = selectedTile.y;
                    selectedTile.y = tile.y;
                    tile.y = y;
                    this.swap(selectedTile, tile);

                    let matches = this.findMatches();

                    if (matches.length > 0) {
                        this.isMatch = 0;
                        this.resolveMatches(selectedTile, tile,matches);
                    } else {
                        this.isMatch++;
                        let x1 = selectedTile.x;
                        let x2 = tile.x;
                        let y1 = selectedTile.y;
                        let y2 = tile.y;

                        let t1 = this.game.add.tween(selectedTile).to({
                            x: x2,
                            y: y2
                        }, 200, "Linear", false);
                        let t2 = this.game.add.tween(tile).to({
                            x: x1,
                            y: y1
                        }, 200, "Linear", false);
                        t2.onComplete.add(function (selectedTile, tile) {
                            let x = selectedTile.x;
                            selectedTile.x = tile.x;
                            tile.x = x;

                            let y = selectedTile.y;
                            selectedTile.y = tile.y;
                            tile.y = y;

                            this.swap(selectedTile, tile);
                            if(this.isMatch == 2){
                                this.game.main.gamePlay.dropBlock(0,true);
                                this.isMatch = 0;
                            }
                            this.canClick = true;

                        }.bind(this, selectedTile, tile));

                        t1.start();
                        t2.start();
                    }
                }.bind(this, this.selectedTile, tile));

                t1.start();
                t2.start();
            }

            if (this.selectedTile) {
                this.setTileType(this.selectedTile, this.selectedTile.type);

            }

            this.selectedTile = null;
        }
    }

    resolveMatches(tile1, tile2,match) {
        let matches = this.findMatches();

        if (matches.length > 0) {
            if(tile1 && tile2){
                this.game.main.gamePlay.dropBlock(match[0].tiles);
            }
            let bonusTiles = this.removeMatches(matches, tile1, tile2);
            this.removeBonus(bonusTiles, function () {
                this.shiftTiles();
                this.populateTiles();

                // Check if any possible moves
                if (this.findMoves().length < 1 && this.gameStarted) {
                    this.setRiggedTiles(matches[0]);
                }
            }.bind(this));
        } else {
            if (this.gameStarted) {
                this.canClick = true;
            }
        }
    }

    removeBonus(bonusTiles, callback, pCount) {
        if (!this.gameStarted) {
            callback();
        } else {
            let chainBonusTiles = [];
            let delay = 100;

            for (let k = 0; k < bonusTiles.length; k++) {
                switch (bonusTiles[k].tile.level) {
                    case GameConstants.VERTICLE:
                        for (let j = 0; j < this.rows; j++) {
                            let tile = this.tiles[bonusTiles[k].tile.i][j];

                            if (tile.type !== GameConstants.DESTROYED && tile.type !== GameConstants.BLOCKED && tile.level !== GameConstants.LOCKED) {

                                if (tile.level !== GameConstants.NORMAL)
                                    chainBonusTiles.push({
                                        tile: tile,
                                        type: tile.type
                                    });

                                tile.type = GameConstants.DESTROYED;
                                tile.visible = false;
                            }
                        }

                        break;
                    case GameConstants.HORIZONTAL:

                        for (let i = 0; i < this.columns; i++) {
                            let tile = this.tiles[i][bonusTiles[k].tile.j];

                            if (tile.type !== GameConstants.DESTROYED && tile.type !== GameConstants.BLOCKED && tile.level !== GameConstants.LOCKED) {

                                if (tile.level !== GameConstants.NORMAL)
                                    chainBonusTiles.push({
                                        tile: tile,
                                        type: tile.type
                                    });

                                tile.type = GameConstants.DESTROYED;
                                tile.visible = false;
                            }
                        }
                        break;
                }
            }

            if (chainBonusTiles.length > 0) {
                this.removeBonus(chainBonusTiles, callback, pCount);
            } else {
                if (bonusTiles.length > 0)
                    this.game.time.events.add(delay, callback);
                else
                    callback();
            }
        }
    }

    removeMatches(matches, matchedTile1, matchedTile2) {

        let bonusTiles = [];

        for (let i = 0; i < matches.length; i++) {
            let match = matches[i];
            let matchedTile;

            // Check the tile which was used to complete the match, on auto matches pick the 3rd tile in match
            if (matchedTile1) {
                matchedTile = (matchedTile1.type == match.type) ? matchedTile1 : matchedTile2;
            } else {
                if (match.match != "T")
                    matchedTile = match.tiles[Math.floor(match.tiles.length / 2)];
                else
                    matchedTile = match.tiles[1];
            }

            let tile = match.tiles[0];
            let type = tile.type;

            if (this.gameStarted) {
                let x, y;

                x = (tile.x + match.tiles[match.tiles.length - 1].x) / 2;
                y = (tile.y + match.tiles[match.tiles.length - 1].y) / 2;

                let loopVariable = 0;

                while (type === GameConstants.DESTROYED) {
                    type = match.tiles[loopVariable].type;
                    loopVariable++;
                }

            } else {
                matchedTile = null;
            }

            for (let j = 0; j < match.tiles.length; j++) {
                if (this.gameStarted) {

                    if (match.tiles[j].level !== GameConstants.NORMAL)
                        bonusTiles.push({
                            tile: match.tiles[j],
                            type: type
                        });
                }

                if (matchedTile) {
                    if (match.tiles[j].x == matchedTile.x && match.tiles[j].y == matchedTile.y) {

                        this.setTileType(matchedTile, matchedTile.type);
                        match.tiles[j].type = GameConstants.DESTROYED;
                    } else {
                        match.tiles[j].type = GameConstants.DESTROYED;
                    }
                } else {
                    match.tiles[j].type = GameConstants.DESTROYED;
                }
            }
        }

        return bonusTiles;
    }

    shiftTiles() {
        for (let i = 0; i < this.columns; i++) {
            for (let j = this.rows - 1; j >= 0; j--) {
                if (this.tiles[i][j].type === GameConstants.DESTROYED) {
                    let tileToSwap;
                    for (let k = j - 1; k >= 0; k--) {
                        if (this.tiles[i][k].type !== GameConstants.DESTROYED && this.tiles[i][k].type !== GameConstants.BLOCKED && this.tiles[i][k].level !== GameConstants.LOCKED) {
                            tileToSwap = this.tiles[i][k];
                            break;
                        }
                    }

                    if (tileToSwap) {
                        this.tiles[i][j].level = tileToSwap.level;
                        this.setTileType(this.tiles[i][j], tileToSwap.type);
                        this.tiles[i][j].visible = true;

                        if (this.gameStarted) {
                            this.tiles[i][j].dropTween(tileToSwap.y);

                            if (tileToSwap.explodeEffect) {
                                if (!this.gameEnded) {
                                    this.tiles[i][j].explodeEffect = tileToSwap.explodeEffect
                                    this.tiles[i][j].explodeEffect.frameName = this.tiles[i][j].frameName + "_highlighted";

                                    tileToSwap.removeChild(tileToSwap.explodeEffect);
                                    this.tiles[i][j].addChild(this.tiles[i][j].explodeEffect);
                                    tileToSwap.explodeEffect = null;
                                } else {
                                    tileToSwap.explodeEffect.destroy();
                                    tileToSwap.explodeEffect = null;
                                }
                            }
                        }

                        tileToSwap.type = GameConstants.DESTROYED;
                        tileToSwap.visible = false;
                    } else {
                        this.tiles[i][j].type = GameConstants.DESTROYED;
                        this.tiles[i][j].visible = false;
                    }
                }
            }
        }
    }

    populateTiles() {
        let count = [];
        let max = 0;
        let populatedTiles = [];
     
        for (let i = this.columns - 1; i >= 0; i--) {
            for (let j = this.rows - 1; j >= 0; j--) {
                if (this.tiles[i][j].type === GameConstants.DESTROYED) {

                    if (!count[i])
                        count[i] = 0;

                    count[i]++;

                    this.tiles[i][j].level = 0;
                    let type;

                    type = this.game.rnd.integerInRange(0, this.tileTypes.length - 1);

                    this.setTileType(this.tiles[i][j], type);

                    this.tiles[i][j].visible = true;

                    if (this.gameStarted) {
                        max = Math.max(this.tiles[i][j].dropTween(this.offsetY - this.tileHeight * count[i]), max);
                    }

                    populatedTiles.push(this.tiles[i][j])
                }
            }
        }

        if (this.gameStarted) {
            this.game.time.events.add(this.dropTime * max / 2 + 300, function () {
                this.resolveMatches();
            }.bind(this));
        } else {
            this.resolveMatches();
        }
    }

    setRiggedTiles(match) {
        let col = match.tiles[0].i,
            row = 0;
        let type;


        // check neighbours
        if (match.match === "horizontal") {
            if (col !== 0) {
                type = this.tiles[col - 1][row].type
            } else {
                type = this.tiles[col + 3][row].type
            }
        } else {
            type = this.tiles[col][row + 3].type;
        }

        let type2 = type;

        while (type2 == type)
            type2 = this.game.rnd.integerInRange(0, this.tileTypes.length - 1);

        for (let j = 0; j < match.tiles.length; j++) {
            if (j === 1)
                this.setTileType(this.tiles[col][row], type2);
            else
                this.setTileType(this.tiles[col][row], type);

            if (match.match === "horizontal") {
                col++;
            } else {
                row++;
            }
        }
    }

    findMoves() {
        let moves = []

        // Check horizontal swaps
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.columns - 1; i++) {

                // Swap, find clusters and swap back
                this.swapType(this.tiles[i][j], this.tiles[i + 1][j]);
                let matches = this.findMatches();

                // Check if the swap made a cluster
                if (matches.length > 0) {
                    // Found a move
                    moves.push({
                        column1: i,
                        row1: j,
                        column2: i + 1,
                        row2: j,
                        match: matches[0],
                        type: matches[0].tiles[0].type
                    });
                }

                this.swapType(this.tiles[i][j], this.tiles[i + 1][j]);
            }
        }

        // Check vertical swaps
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows - 1; j++) {
                // Swap, find clusters and swap back
                this.swapType(this.tiles[i][j], this.tiles[i][j + 1]);
                let matches = this.findMatches();

                // Check if the swap made a match
                if (matches.length > 0) {
                    // Found a move
                    moves.push({
                        column1: i,
                        row1: j,
                        column2: i,
                        row2: j + 1,
                        match: matches[0],
                        type: matches[0].tiles[0].type
                    });
                }

                this.swapType(this.tiles[i][j], this.tiles[i][j + 1]);
            }
        }

        return moves;
    }

    findMatches() {
        let matches = [];
        let tilesMatched = [];

        // Find L & T matches and Horizontal Matches
        for (let j = 0; j < this.rows; j++) {
            let match = [this.tiles[0][j]];
            for (let i = 0; i < this.columns; i++) {
                let checkMatch = false;

                if (i === this.columns - 1) {
                    checkMatch = true;
                } else {
                    let type = this.tiles[i][j].type;
                    let level = this.tiles[i][j].level;

                    if (type === this.tiles[i + 1][j].type && type !== GameConstants.DESTROYED && type !== this.tileTypes.length) {
                        match.push(this.tiles[i + 1][j]);
                    } else {
                        checkMatch = true;
                    }
                }

                if (checkMatch) {
                    if (match.length >= 3) {
                        // Give color bomb higher priorty and dont check for L match
                        if (match.length === 5 || !this.gameStarted)
                            matches.push({
                                match: "horizontal",
                                type: match[0].type,
                                tiles: match
                            });
                        else {
                            let isWrapped = false;

                            let length = match.length;

                            for (let k = 0; k < length; k++) {
                                let tile = match[k];

                                if (this.tiles[tile.i][tile.j + 1] && this.tiles[tile.i][tile.j + 2] && this.tiles[tile.i][tile.j + 1].type === tile.type && this.tiles[tile.i][tile.j + 2].type === tile.type) {
                                    // bottom
                                    match.push(this.tiles[tile.i][tile.j + 1]);
                                    match.push(this.tiles[tile.i][tile.j + 2]);
                                    matches.push({
                                        match: (k === 0 || k === length - 1) ? "L" : "T",
                                        type: tile.type,
                                        tiles: match
                                    });
                                    isWrapped = true;
                                } else if (this.tiles[tile.i][tile.j - 1] && this.tiles[tile.i][tile.j - 2] && this.tiles[tile.i][tile.j - 1].type === tile.type && this.tiles[tile.i][tile.j - 2].type === tile.type) {
                                    // top
                                    match.push(this.tiles[tile.i][tile.j - 1]);
                                    match.push(this.tiles[tile.i][tile.j - 2]);
                                    matches.push({
                                        match: (k === 0 || k === length - 1) ? "L" : "T",
                                        type: tile.type,
                                        tiles: match
                                    });
                                    isWrapped = true;
                                } else if (this.tiles[tile.i][tile.j - 1] && this.tiles[tile.i][tile.j + 1] && this.tiles[tile.i][tile.j - 1].type === tile.type && this.tiles[tile.i][tile.j + 1].type === tile.type) {
                                    if (k === 0 || k === length - 1) {
                                        // top - bottom for T
                                        match.push(this.tiles[tile.i][tile.j - 1]);
                                        match.push(this.tiles[tile.i][tile.j + 1]);
                                        matches.push({
                                            match: "T",
                                            type: tile.type,
                                            tiles: match
                                        });
                                        isWrapped = true;
                                    }
                                }
                            }

                            if (!isWrapped)
                                matches.push({
                                    match: "horizontal",
                                    type: match[0].type,
                                    tiles: match
                                });

                            tilesMatched = tilesMatched.concat(match);
                        }
                    }

                    if (i !== this.columns - 1)
                        match = [this.tiles[i + 1][j]];
                }
            }
        }

        // Find Verticle Matches
        for (let i = 0; i < this.columns; i++) {
            let match = [this.tiles[i][0]];
            for (let j = 0; j < this.rows; j++) {
                let checkMatch = false;

                if (j === this.rows - 1) {
                    checkMatch = true;
                } else {
                    let type = this.tiles[i][j].type;
                    let level = this.tiles[i][j].level;

                    if (tilesMatched.indexOf(this.tiles[i][j]) === -1 && type === this.tiles[i][j + 1].type && type !== GameConstants.DESTROYED && type !== GameConstants.BLOCKED && level !== GameConstants.LOCKED && type !== this.tileTypes.length) {
                        match.push(this.tiles[i][j + 1]);
                    } else {
                        checkMatch = true;
                    }
                }

                if (checkMatch) {
                    if (match.length >= 3) {
                        matches.push({
                            match: "verticle",
                            type: match[0].type,
                            tiles: match
                        });
                    }

                    if (j !== this.rows - 1)
                        match = [this.tiles[i][j + 1]];
                }
            }
        }

        return matches;
    }

    setTileType(tile, type) {
        tile.type = type;

        tile.loadTexture(this.tileTypes[type]);
        tile.scale.set(this.tileSize);
    }

    swapType(tile1, tile2) {

        let type = tile1.type;
        tile1.type = tile2.type;
        tile2.type = type;

        let level = tile1.level;

        tile1.level = tile2.level;
        tile2.level = level;
    }

    swap(tile1, tile2) {
        let type = tile1.type;
        let level = tile1.level;

        tile1.level = tile2.level;
        tile2.level = level;

        this.setTileType(tile1, tile2.type);
        this.setTileType(tile2, type);
    }

    createLevel() {
        
        this.pattern = [
            [4, 3, 3, 1, 3],
            [1, 4, 5, 1, 4],
            [4, 5, 3, 5, 4],
            [1, 3, 1, 1, 5],
            [4, 5, 5, 4, 5],
        ];
       
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.setTileType(this.tiles[i][j], this.pattern[i][j]);
            }
        }
    }

    createTiles() {
        for (let i = 0; i < this.columns; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.rows; j++) {

                let tile = this.game.add.sprite(this.offsetX + this.tileWidth * i, this.offsetY + this.tileHeight * j, this.tileTypes[0]);
                tile.anchor.set(0.5);
                tile.scale.set(this.tileSize);
                tile.type = 0;
                tile.level = 0;
                tile.dropTween = function (tile, y) {
                    var distance = tile.y - y;
                    distance /= this.tileHeight;

                    tile.y = this.offsetY + this.tileHeight * tile.j;
                    this.game.add.tween(tile).from({
                        y: y
                    }, this.dropTime * distance / 2, "Linear", true).onComplete.add(function () {
                        this.game.add.tween(tile).to({
                            y: tile.y - 4
                        }, 50, "Linear", true, 0, 0, true);
                    }.bind(this));

                    return distance;
                }.bind(this, tile);
                tile.i = i;
                tile.j = j;

                this.tiles[i][j] = tile;
                this.board.add(tile);
            }
        }

        for (let i = 0; i < this.columns; i++) {
            for (let j = this.rows-1; j >=0; j--) {
                this.board.bringToTop(this.tiles[i][j])
            }
        }
       
        this.createMask();
    }

    createMask() {
        let mask = this.game.add.graphics(0, 0);

        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j].type !== GameConstants.BLOCKED) {
                    mask.beginFill(0xFF3300);
                    mask.lineStyle(1, 0x000000, 1);

                    let x = this.offsetX - this.tileWidth / 2 + i * this.tileWidth;
                    let y = this.offsetY - this.tileHeight / 2 + j * this.tileHeight;

                    mask.moveTo(x, y);
                    mask.lineTo(x + this.tileWidth, y);
                    mask.lineTo(x + this.tileWidth, y + this.tileHeight);
                    mask.lineTo(x, y + this.tileHeight);
                    mask.endFill();
                }
            }
        }

        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].mask = mask;
            }
        }

        this.add(mask);
    }
}