import dimensions from "../dimensions";

export default class LifeBar extends Phaser.Group {
    constructor(game, parent,_game) {
        super(game, parent);

        this.game.main  = _game;
        this.init();
    }

    adjust(){
        if(dimensions.isLandscape){
            this.x = dimensions.rightOffset - 60;
            this.y = dimensions.gameHeight/2 - 20;
            this.scale.set(.8);
        }else{
            this.x = dimensions.gameWidth/2 - 200;
            this.y = dimensions.bottomOffset - 350;
            this.scale.set(1);
        }
    }

    init() {
        this.itemsCollected = 0;
        this.totalItems = 100;

        this.text = this.game.add.sprite(0, 150, "life");
        this.text.anchor.set(0.5);
        this.text.scale.set(0.8);
        this.add(this.text);

        this.bar = this.game.add.sprite(0, 0, "barframe");
        this.bar.anchor.set(0.5);
        this.add(this.bar);

        this.fill = this.game.add.sprite(0,0,"bar");
        this.fill.anchor.set(0.5, 1);
        this.fill.y += this.fill.height / 2;
        this.fill.scale.set(1,1)
        this.bar.addChild(this.fill);
        this.fill.orgHeight = this.fill.height;
        this.fill.startY = this.fill.y

        let mask = this.game.add.graphics(0, 0, this);
        mask.beginFill(0x0000ff, 0.5);
        mask.drawRoundedRect(0, 0, this.fill.width, this.fill.height,10);
        mask.endFill();
        //  mask.width = this.fill.width
        // mask.height = this.fill.height
        mask.x -= this.fill.width/2;
        mask.y -= this.fill.height/2;

        this.yPos = mask.y;
        this.fill.mask = mask

        this.visible = false;
    }

    show(){
        this.visible = true;
        this.game.add.tween(this).from({
            alpha: 0
        }, 100, "Linear", true).onComplete.add(()=>{
            this.addBuildingBlocks(5,true)
            this.addGrid();
        })
    }

    resetProgress() {
        // this.visible = true
        this.itemsCollected = 0;
        this.totalItems = 100;
        let w = this.fill.orgWidth;

        if (this.fillTween) this.fillTween.stop();
        this.fillTween = ""

        this.tween = this.game.add.tween(this.fill.mask).to({
            y: this.yPos
        }, 200, "Linear", true)
        this.tween.onUpdateCallback(() => {
           
            this.fill.updateCrop(this.fill)
        })
    }

    stopTween() {
      
        if (this.fillTween) this.fillTween.stop();
        this.fillTween = ""
        if(this.textTween) this.game.time.events.remove(this.textTween);

    }

    reduceHealth() {

        let speed = 1000
        let val = this.fill.height/3;

        this.started = true
        this.fillTween = this.game.add.tween(this.fill.mask).to({
            y: "+"+val
        }, speed, "Linear", true)
        this.fillTween.onUpdateCallback(() => {
           this.fill.updateCrop(this.cropRect)
        })
        
        this.fillTween.onComplete.add(() => {

            if(this.fill.mask.y>100){
                this.game.main.fail();
            }
            console.log(this.fill.mask.y,this.fill.height)
            this.fillTween = ""
            this.started = false;
        })
    }

    show(callback) {

        this.visible = true;
        // this.updateBar(0.5)

        this.game.add.tween(this).from({
            alpha:0
        }, 250, Phaser.Easing.Cubic.None, true).onComplete.add(function () {
            
        }, this)
    }

    hide() {

        this.game.add.tween(this).to({
            alpha: 0
        }, 250, "Linear", true).onComplete.add(() => {

            this.alpha = 1;
            this.visible = false;
            this.resetProgress();
        })
        
    }
}