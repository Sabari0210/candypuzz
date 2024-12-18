/* globals __DEV__ */
import Phaser from 'phaser'
import dimensions from '../dimensions';
import portrait from '../portrait';
import landscape from '../landscape';
import Board from '../objects/board';
import GamePlay from '../objects/game-play';
import LifeBar from '../objects/Life-bar';
import Intro from '../objects/intro';
import EndPage from '../objects/end-page';

export default class extends Phaser.State {
  init() { 
    this.game.main = this;
  }
  preload() { }

  create() {
    this.setGameScale();
    this.stage.backgroundColor = '#000000';
    this.game.gameState = this;

    this.supergroup = this.add.group();
    this.gameGroup = this.add.group();
    this.supergroup.add(this.gameGroup);

    // this.mushroom = new Mushroom({
    //   game: this.game,
    //   x: this.world.centerX,
    //   y: this.world.centerY,
    //   asset: 'mushroom'
    // })

    // this.game.add.existing(this.mushroom);

    this.createEnvironment();
    this.setPositions();

    try {
        dapi.addEventListener("adResized", this.gameResized.bind(this));
        dapi.addEventListener("audioVolumeChange", this.setAudioVolume);
    } catch(error) {
        this.scale.setResizeCallback(this.gameResized, this);
    }


    // this.game.onBlur.add(this.onPause, this);
    // this.game.onFocus.add(this.onResume, this);

    this.gameResized();
  }

  createEnvironment() {

    this.bg = this.game.add.graphics(0, 0, this.gameGroup);
    this.bg.beginFill(0xdad4be,1);
    this.bg.drawRect(0, 0, 340, 330);
    this.bg.endFill();

    this.gamePlay = new GamePlay(this.game, this.gameGroup,this);
    this.bar = new LifeBar(this.game,this.gameGroup,this);

    this.board = new Board(this.game,this.gameGroup,this);

    this.intro = new Intro(this.game,this.gameGroup,this);

    this.endPage = new EndPage(this.game,this.gameGroup,this);

  }

  gameResized() {
    let ratio = 1;
    
    try {
        if (`${PLATFORM}` !== "tiktok") {
            try {
                if (mraid) {
                    console.log(mraid.getScreenSize())
                    var screenSize = mraid.getScreenSize();
                    mraid.setResizeProperties({"width": screenSize.width, "height": screenSize.height, "offsetX": 0, "offsetY": 0});
                    mraid.expand();
                }
            } catch (e) {

            }
        }
    }
    catch (e) {
        
    }
    

    if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI)
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    else if (window.devicePixelRatio !== undefined)
        ratio = window.devicePixelRatio;


    try {
        let size = dapi.getScreenSize();

        dimensions.fullWidth = size.width;
        dimensions.fullHeight = size.height;
    } catch(e) {
        dimensions.fullWidth = window.innerWidth * ratio;
        dimensions.fullHeight = window.innerHeight * ratio;
    }

    if (this.game.width === dimensions.fullWidth && this.game.height === dimensions.fullHeight)
        return;

    if (dimensions.isPortrait != dimensions.fullWidth < dimensions.fullHeight) {
        this.switchMode(!dimensions.isPortrait);
    } else {
        this.switchMode(dimensions.isPortrait);
    }

    this.game.scale.setGameSize(dimensions.fullWidth, dimensions.fullHeight);

    this.setGameScale();
    this.setPositions();				
}

  switchMode(isPortrait) {
      dimensions.isPortrait = isPortrait;
      dimensions.isLandscape = !isPortrait;

      let mode = portrait;

      if (dimensions.isLandscape)
          mode = landscape;

      dimensions.gameWidth = mode.gameWidth;
      dimensions.gameHeight = mode.gameHeight;
    }

    setGameScale() {
        let scaleX = dimensions.fullWidth / dimensions.gameWidth;
        let scaleY = dimensions.fullHeight / dimensions.gameHeight;

        this.gameScale = (scaleX < scaleY) ? scaleX : scaleY;

        dimensions.actualWidth = this.game.width / this.gameScale;
        dimensions.actualHeight = this.game.height / this.gameScale;
		
		try {
			if (`${PLATFORM}` === "unity") {
				dimensions.unityConstant = ((dimensions.actualHeight - dimensions.gameHeight) * 0.25);		
			} else {
				dimensions.unityConstant = 0;
			}
		} catch (err) {
			dimensions.unityConstant = 0;
		}				
		
		dimensions.actualHeight -= dimensions.unityConstant;

        dimensions.leftOffset = - (dimensions.actualWidth - dimensions.gameWidth) / 2;
        dimensions.rightOffset = dimensions.gameWidth - dimensions.leftOffset;
        dimensions.topOffset = - (dimensions.actualHeight - dimensions.gameHeight) / 2;
        dimensions.bottomOffset = dimensions.gameHeight - dimensions.topOffset;
    
    }

    fail(){
      this.gamePlay.hide();
      this.board.hide();
      this.bar.hide();

      this.endPage.show();
    }

    restartGame(){
      this.gamePlay.destroy();
      this.board.destroy();
      this.gamePlay = new GamePlay(this.game, this.gameGroup,this);
  
      this.board = new Board(this.game,this.gameGroup,this);

      this.bar.resetProgress();

      this.gameGroup.bringToTop(this.bar);
      this.gameGroup.bringToTop(this.intro);
      this.gameGroup.bringToTop(this.endPage);

      this.setPositions();

      this.intro.show();
  
    }

    startGamePlay(){
        this.gamePlay.show();
        this.bar.show();
        this.board.show();
    }

  setPositions() {
    this.supergroup.scale.set(this.gameScale);
    this.gameGroup.x = (this.game.width / this.gameScale - dimensions.gameWidth) / 2;
    this.gameGroup.y = (this.game.height / this.gameScale - dimensions.gameHeight) / 2 + dimensions.unityConstant / 2;
    
      this.bg.width = dimensions.actualWidth;
      this.bg.height = dimensions.actualHeight;
      this.bg.x = dimensions.gameWidth / 2 - this.bg.width/2;
      this.bg.y = dimensions.gameHeight / 2 - this.bg.height/2;

      // this.bar.x = dimensions.gameWidth / 2 - 200;
      // this.bar.y = dimensions.bottomOffset - 350;

        // if(dimensions.isLandscape){
        //   this.gameGroup.visible = false;
        // }else{
        //   this.gameGroup.visible = true;
        // }
     
    //   this.board.scale.set(.6);

    //   if (this.closeBtn) {
    //       this.closeBtn.x = dimensions.actualWidth - 20;
    //   }

      this.intro.adjust();
      this.bar.adjust();
      this.gamePlay.adjust();
      this.endPage.adjust();
      this.board.adjust();
  }

  offsetMouse() {
    return {
        x: (this.game.input.x * dimensions.actualWidth / this.game.width) + ((dimensions.gameWidth - dimensions.actualWidth) / 2),
        y: (this.game.input.y * dimensions.actualHeight / this.game.height) + ((dimensions.gameHeight - dimensions.actualHeight) / 2)
    };
  }

  offsetWorld(point) {
      return {
          x: (point.x * dimensions.actualWidth / this.game.width),
          y: (point.y * dimensions.actualHeight / this.game.height)
      };
  }

  // render() {
  //   if (__DEV__) {
  //     this.game.debug.spriteInfo(this.mushroom, 32, 32)
  //   }
  // }
}
