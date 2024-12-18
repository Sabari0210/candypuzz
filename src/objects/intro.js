import dimensions from "../dimensions";

export default class Intro extends Phaser.Group {
    constructor(game, parent,_game) {
        super(game, parent);

        this.game.main  = _game;
        this.init();
    }

    adjust(){
       
        this.bg.width =  dimensions.actualWidth*2;
        this.bg.height = dimensions.actualHeight*2;
        this.bg.x = dimensions.leftOffset;
        this.bg.y = dimensions.topOffset;

        this.playBtn.x = dimensions.gameWidth/2;
        this.playBtn.y = dimensions.bottomOffset - 100;

        if(dimensions.isLandscape){
            this.emojii.x = dimensions.gameWidth/2;
            this.emojii.y = dimensions.gameHeight/2   - 100;
        }else{
            this.emojii.x = dimensions.gameWidth/2;
            this.emojii.y = dimensions.gameHeight/2;    
        }
 
    }

    init() {
        this.playerCoins = 0
        this.bg = this.game.add.graphics(0,0);
        this.bg.beginFill(0x000000, 0.6);
        this.bg.drawRect(dimensions.leftOffset - this.x, dimensions.topOffset - this.y, dimensions.actualWidth, dimensions.actualHeight);
        this.bg.endFill();
        this.add(this.bg);

        this.emojii = this.game.add.sprite(0,0,"getready");
        this.emojii.anchor.set(0.5);
        this.add(this.emojii);

        this.playBtn = this.game.add.sprite(0,0,"playnowbtn");
        this.playBtn.anchor.set(0.5);
        this.playBtn.scale.set(0.2);
        this.add(this.playBtn);

        this.playTxt = this.game.add.sprite(0,-36,"playNow");
        this.playTxt.anchor.set(0.5);
        this.playTxt.scale.set(.5/this.playBtn.scale.x);
        this.playBtn.addChild(this.playTxt);

        this.playBtn.events.onInputDown.add(this.onDown, this);

        this.visible = false;
        this.show();
    }

    onDown(){

        this.playBtn.inputEnabled = false;
        this.game.add.tween(this.playBtn.scale).to({
            x:this.playBtn.scale.x - .05,
            y:this.playBtn.scale.x - .05
        }, 100, Phaser.Easing.Cubic.None,true, 0,0, true).onComplete.add(function () {
            this.game.main.startGamePlay();
            this.hide();
        }, this)
    }

    show(callback) {

        this.visible = true;

        this.game.add.tween(this).from({
            alpha:0
        }, 250, Phaser.Easing.Cubic.None, true).onComplete.add(function () {
            this.playBtn.inputEnabled = true;
        }, this)
    }

    hide() {

        this.game.add.tween(this).to({
            alpha: 0
        }, 250, "Linear", true).onComplete.add(() => {

            this.alpha = 1;
            this.visible = false;
        })
        
    }
}