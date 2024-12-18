import dimensions from "../dimensions";
import Board from "./board";

export default class GamePlay extends Phaser.Group {
    constructor(game, parent,_game) {
        super(game, parent);

        this.game.main  = _game;
        this.init();
    }

    adjust(){

        if(this.ropeMoveTween)this.ropeMoveTween.stop();
        if(this.blockTween)this.blockTween.stop();

        if(dimensions.isLandscape){
            this.x = dimensions.gameWidth / 2 - 200;
            this.y = dimensions.bottomOffset-50 + this.offsetY;
            this.scale.set(1);
        }else{
            this.x = dimensions.gameWidth / 2;
            this.y = dimensions.bottomOffset - 400 + this.offsetY;
            this.scale.set(1);
        }

        if(this.rope)
        this.rope.y = dimensions.topOffset - this.y;

        // if(this.rope.y)
        // this.rope.y = (dimensions.topOffset - this.y)/this.scale.x;
        
    }

    init() {
        this.offsetY = 0;
        this.loadX = -1;
        this.swayDirection  = .5;
        this.moveDirection   = 1;
        this.swayAmount   = 5;
        this.swayRotation = 0.01;

        this.addBlocks();
        this.gravityVal = 0;
        this.debug = false;
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        
        this.game.physics.p2.gravity.y = 1400;
        // this.game.physics.p2.restitution = .1;
        this.game.physics.p2.updateBoundsCollisionGroup();
        this.wallCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.blockCollisonGroup = this.game.physics.p2.createCollisionGroup();
        

        this.buildingArr = [];
        this.landingBlockArr = [];
        this.builtCount = 0;

        this.visible = false;
       
    }

    show(){
        this.visible = true;
        this.game.add.tween(this).from({
            alpha: 0
        }, 100, "Linear", true).onComplete.add(()=>{
            this.addBuildingBlocks(5,true)
            this.addGrid();
            this.setRopePos();
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

    addBlocks(){
        this.builtArr = [];

        let startY = 300,xPos = [-250,-100,200];
        for(let i=0;i<6;i++){

            let built = this.game.add.sprite(xPos[this.game.rnd.integerInRange(0,xPos.length-1)],startY,"block"+(i+1));
            built.anchor.set(0.5);
            built.alpha = .5;
            this.add(built);
            this.builtArr.push(built);

            startY -=300;
        }
    }

    dropBlock(match,isFall){
        this.stopTween(match.length,isFall);
        this.game.main.board.stopPlay = true;

        if(isFall){
            this.game.main.bar.reduceHealth();
        }

        this.builtCount++
    }

    stopTween(val,isFall){
        this.ropeTween.stop();
        this.ropeTween = "";
        if(Math.abs(this.rope.angle) < 10){
            console.log("1");
            this.game.add.tween(this.rope).to({
                angle: 0
            }, 100, "Linear", true).onComplete.add(()=>{
                this.addBuildingBlocks(val,null,isFall);
                this.currentBuilding.body.static = false;
    
            })
        }else if(Math.abs(this.rope.angle) < 30){
            console.log("2");
            this.game.add.tween(this.rope).to({
                angle: 0
            }, 300, "Linear", true).onComplete.add(()=>{
                this.addBuildingBlocks(val,null,isFall);
                this.currentBuilding.body.static = false;
    
            })
        }else{
            console.log("3");
            this.game.add.tween(this.rope).to({
                angle: 0
            }, 600, "Linear", true).onComplete.add(()=>{
                this.addBuildingBlocks(val,null,isFall);
                this.currentBuilding.body.static = false;
    
            })
        }
        
        // this.addBuildingBlocks(val,null,isFall);
    }

    resumeTween(){
        if(!this.ropeTween){   
            this.addTween();
        }
        console.log("resume")
        this.tweenBuild.alpha = 1;

        // this.addBuildingBlocks();
    }

    addBuildingBlocks(val,firstTime,isFall){
        console.log("true")
        this.currentBuilding = this.game.add.sprite(0,0,"building");
        this.currentBuilding.anchor.set(0.5);
        this.currentBuilding.scale.set(0.5);
        this.add(this.currentBuilding);
        this.buildingArr.push(this.currentBuilding);

        this.game.physics.p2.enable(this.currentBuilding, this.debug);
        this.currentBuilding.body.collideWorldBounds = false;
        if(firstTime)
            this.currentBuilding.body.static = false;
        else 
            this.currentBuilding.body.static = true;
        this.currentBuilding.body.setCollisionGroup(this.blockCollisonGroup);
        this.currentBuilding.body.collides([this.wallCollisionGroup,this.blockCollisonGroup]);
        this.buildPos(val,firstTime,isFall);
    }

    buildPos(val,firstTime,isFall){

        if(firstTime){
            
            this.currentBuilding.body.y = -100;
        }else{
            var ropeX = this.rope.x;
            var ropeY = this.rope.y;
            var ropeAngleInDegrees = this.rope.angle;
            var ropeAngleInRadians = Phaser.Math.degToRad(ropeAngleInDegrees);

            // Get the local position of tweenBuild within the rope
            var localX = this.tweenBuild.x;
            var localY = this.tweenBuild.y;
            // Calculate the new global position based on the rope's angle and position
            var globalX = ropeX + localX * Math.cos(ropeAngleInRadians) - localY * Math.sin(ropeAngleInRadians);
            var globalY = ropeY + localX * Math.sin(ropeAngleInRadians) + localY * Math.cos(ropeAngleInRadians);

        
            this.tweenBuild.alpha = 0;
            this.currentBuilding.body.x = -5;
            this.currentBuilding.body.y = (dimensions.topOffset - this.y)+200;
            this.isFall = isFall;
            if(isFall){
                this.currentBuilding.body.x = globalX;
                this.currentBuilding.body.y = globalY;
                if(globalX>=0)
                    this.currentBuilding.body.velocity.x = this.game.rnd.integerInRange(1700,1000);
                if(globalX<0)
                    this.currentBuilding.body.velocity.x = this.game.rnd.integerInRange(-1700,-1000);

                this.currentBuilding.body.angularVelocity = 5;
            }else{
                this.isFall = false;
                if(val==5){
                    // this.currentBuilding.body.x = 0;
                    this.game.add.tween(this.currentBuilding.body).to({
                        x: 0
                    }, 500, "Linear", true)
                }else if(val==4){
                    this.lastXpos -= 10*this.loadX
                    let xPos = this.currentBuilding.body.x + this.lastXpos;
                    // this.currentBuilding.body.x += this.lastXpos;
                    this.game.add.tween(this.currentBuilding.body).to({
                        x: xPos
                    }, 500, "Linear", true)
                }else{

                    this.lastXpos -= 25*this.loadX
                    let xPos = this.currentBuilding.body.x + this.lastXpos;
    
                    // this.currentBuilding.body.x += this.lastXpos;
                    this.game.add.tween(this.currentBuilding.body).to({
                        x: xPos
                    }, 500, "Linear", true)
                }

                this.loadX *=-1;
            }
        }
        if(!isFall)
        this.lastXpos = this.currentBuilding.body.x;
    }

    setRopePos(){
        this.rope.y = (dimensions.topOffset - this.y)/this.scale.x;
    }

    addGrid(){
        let graphics = this.game.add.graphics(0, 0, this);
        graphics.beginFill(0xffffff, 1)
        graphics.drawRect(0, 0, 4465, 27.5);
        graphics.endFill();

        this.bottomGlass = this.game.add.sprite(0,0,graphics.generateTexture());
        this.bottomGlass.anchor.set(0.5);
        this.add(this.bottomGlass);
        graphics.destroy();

        graphics = this.game.add.graphics(0, 0, this);
        graphics.beginFill(0x000000, 1)
        graphics.drawRect(0, 0, 20, 200);
        graphics.endFill();

        this.rope = this.game.add.sprite(0,(dimensions.topOffset - this.y),graphics.generateTexture());
        this.rope.anchor.set(0);
        this.add(this.rope);

        this.tweenBuild = this.game.add.sprite(0,200,"building");
        this.tweenBuild.anchor.set(0.5);
        this.tweenBuild.scale.set(0.5);
        this.rope.addChild(this.tweenBuild);
        this.addTween();

        graphics.destroy();

        this.game.physics.p2.enable(this.bottomGlass, this.debug);
        this.bottomGlass.body.collideWorldBounds = false;
        this.bottomGlass.body.static = true;
        this.bottomGlass.body.setCollisionGroup(this.wallCollisionGroup);
        this.bottomGlass.body.collides([this.blockCollisonGroup]);

    }

    addTween(){
        
        this.ropeTween = this.game.add.tween(this.rope).to({
            angle: -45
        }, 700, "Linear", true)
        this.ropeTween.onComplete.add(()=>{
            this.ropeTween = this.game.add.tween(this.rope).to({
                angle: 45
            }, 1400, "Linear", true)
            this.ropeTween.onComplete.add(()=>{
                this.ropeTween = this.game.add.tween(this.rope).to({
                    angle: 0
                }, 700, "Linear", true)
                this.ropeTween.onComplete.add(()=>{
                    this.addTween();
                })
            })
        })
    }

    addGravity(){
        this.gravityTween.onComplete.add(()=>{
            this.ropeTween = this.game.add.tween(this.bottomGlass.body).to({
                angle: this.gravityVal
            }, 700, "Linear", true)
            this.gravityTween.onComplete.add(()=>{
                this.gravityTween = this.game.add.tween(this.bottomGlass.body).to({
                    angle: -this.gravityVal
                }, 1400, "Linear", true)
                this.gravityTween.onComplete.add(()=>{
                    this.gravityTween = this.game.add.tween(this.bottomGlass.body).to({
                        angle: 0
                    }, 700, "Linear", true)
                    this.gravityTween.onComplete.add(()=>{
                        this.addGravity();
                    })
                })
            })
        })
    }

    applySwayToStack() {
        // Sway all the blocks in the stack, including the base

        // this.landingBlockArr.forEach(block => {
        //     block.body.angularVelocity = this.swayRotation; // Apply a small angular velocity for sway
        // });
    
        // // Apply angular velocity to the base as well
        // if(this.bottomGlass)
        // this.bottomGlass.body.angularVelocity = this.swayRotation;
    
        // // Reverse the direction of the sway for the next block
        // this.swayRotation *= -1;

        // console.log(this.swayRotation);

        this.landingBlockArr.forEach(block => {
            if(block.body){
                if(block.tween)block.tween.stop();
                block.tween = this.game.add.tween(block.body).to({ x: block.body.x + this.swayDirection * this.swayAmount }, 1000, Phaser.Easing.Linear.None, -1, 0, -1, true);//true, 0, 0, true
            }
             
        });
    
        // Sway the base as well
        this.game.add.tween(this.bottomGlass.body).to({ x: this.bottomGlass.body.x + this.swayDirection * this.swayAmount }, 1000, Phaser.Easing.Linear.None, -1, 0, -1, true);
    
        // Switch sway direction for the next block
        this.swayDirection *= -1.2;

        if(this.swayDirection < -5){
            this.swayDirection = .5;
        }

    }

    update(){
        super.update();

        this.gravityVal +=.1;
       
        if(this.currentBuilding)
        if(this.currentBuilding.body && !this.currentBuilding.body.static){
            if(this.currentBuilding.body.y>(dimensions.bottomOffset - this.y)){
                this.currentBuilding.body.velocity.y = 0;
                this.currentBuilding.body.velocity.x = 0;
                this.landingBlockArr.push(this.currentBuilding);
                this.currentBuilding.body.static = true;
                this.game.main.board.stopPlay = false;
                this.currentBuilding.body.fixedRotation = true;
                this.resumeTween();
                this.currentBuilding.body.destroy();
                this.currentBuilding.alpha = 0;
                // console.log("11111111111111")
            }else if(Math.abs(this.currentBuilding.body.velocity.y)<10 && Math.abs(this.currentBuilding.body.velocity.x)<3){
                this.currentBuilding.body.velocity.y = 0;
                this.currentBuilding.body.velocity.x = 0;
                this.currentBuilding.body.startX = this.currentBuilding.body.x;
                this.landingBlockArr.push(this.currentBuilding);
                this.currentBuilding.body.static = true;
                // console.log("222222222222222")
                setTimeout(() => {
                    if(this.landingBlockArr.length>=4)
                    this.applySwayToStack(); 
                }, 100);
                console.log((dimensions.gameHeight/2-this.y),this.currentBuilding.y - this.currentBuilding.height/2)

                this.currentBuilding.body.fixedRotation = true;
                this.currentBuilding.body.angle = 0;
                if(((this.currentBuilding.y - this.currentBuilding.height/2)>(dimensions.gameHeight/2-this.y))){
                    this.game.main.board.stopPlay = false;
                    this.resumeTween();

                    if(this.isFall){
                        this.currentBuilding.body.destroy();
                    }
                }else{
                    let yPos = (this.currentBuilding.height)
                    this.offsetY +=yPos
                    this.ropeMoveTween = this.game.add.tween(this.rope).to({
                        y: this.rope.y-yPos
                    }, 500, "Linear", true)
                    this.blockTween = this.game.add.tween(this).to({
                        y: this.y+yPos
                    }, 500, "Linear", true)
                    this.blockTween.onComplete.add(() => {
                        this.setRopePos();
                        this.game.main.board.stopPlay = false;
                        this.resumeTween();
                    })                   
                }                
            }else{
                // console.log("3333333333333",this.currentBuilding.body.velocity.y,this.currentBuilding.body.velocity.x)
                // this.currentBuilding.body.angularVelocity = .1
            }
        }

        for(let i=0;i<this.builtArr.length;i++){
            if(this.builtArr[i].y>(dimensions.bottomOffset-this.y)+300){
                this.builtArr[i].y = dimensions.topOffset - this.y - 300;
            }
        }
    }
}