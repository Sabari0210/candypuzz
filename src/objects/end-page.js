import dimensions from "../dimensions";

export default class EndPage extends Phaser.Group {
    constructor(game, parent,_game) {
        super(game, parent);

        this.game.main  = _game;
        this.init();
    }

    adjust(){
        // this.emojii.x = dimensions.gameWidth/2;
        // this.emojii.y = dimensions.gameHeight/2;

        this.bg.width =  dimensions.actualWidth*1.2;
        this.bg.height = dimensions.actualHeight*1.2;
        this.bg.x = dimensions.leftOffset;
        this.bg.y = dimensions.topOffset;

        if(dimensions.isLandscape){
            this.emojii.x = dimensions.gameWidth/2;
            this.emojii.y = dimensions.gameHeight/2   - 60;
            this.emojii.scale.set(0.7);

            this.playBtn.x = dimensions.gameWidth/2;
            this.playBtn.y = dimensions.bottomOffset - 80;
        }else{
            this.emojii.x = dimensions.gameWidth/2;
            this.emojii.y = dimensions.gameHeight/2; 
            this.emojii.scale.set(0.8);

            this.playBtn.x = dimensions.gameWidth/2;
            this.playBtn.y = dimensions.bottomOffset - 100;   
        }
 
    }

    init() {
        this.bg = this.game.add.graphics(0,0);
        this.bg.beginFill(0x000000, 0.6);
        this.bg.drawRect(dimensions.leftOffset - this.x, dimensions.topOffset - this.y, dimensions.actualWidth, dimensions.actualHeight);
        this.bg.endFill();
        this.add(this.bg);

        this.emojii = this.game.add.sprite(0,0,"fail");
        this.emojii.anchor.set(0.5);
        this.add(this.emojii);

        this.playBtn = this.game.add.sprite(0,0,"playnowbtn");
        this.playBtn.anchor.set(0.5);
        this.playBtn.scale.set(0.2);
        this.add(this.playBtn);

        this.playTxt = this.game.add.sprite(0,-36,"Retry");
        this.playTxt.anchor.set(0.5);
        this.playTxt.scale.set(.7/this.playBtn.scale.x);
        this.playBtn.addChild(this.playTxt);

        this.playBtn.events.onInputDown.add(this.onDown, this);

        this.visible = false;
    }

    onDown(){
        this.playBtn.inputEnabled = false;
        this.game.add.tween(this.playBtn.scale).to({
            x:this.playBtn.scale.x - .05,
            y:this.playBtn.scale.x - .05
        }, 100, Phaser.Easing.Cubic.None,true, 0,0, true).onComplete.add(function () {
            this.game.main.restartGame();
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