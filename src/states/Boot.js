import Phaser from 'phaser'
import WebFont from 'webfontloader'
import config from '../config';
import dimensions from '../dimensions';
import portrait from '../portrait';
import landscape from '../landscape';

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = '#EDEEC9'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)

    try {
      if (dapi) {
          this.scale.scaleMode = Phaser.ScaleManager.NONE;
      }
    } catch (error) {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }

    this.scale.refresh();
    console.log(this.scale.scaleMode);

    // if (game_orientation == "portrait") {
    //   dimensions.isPortrait = true;
    // } else if (game_orientation == "landscape") {
    //     dimensions.isPortrait = false;
    // } else {
        dimensions.isPortrait = dimensions.fullWidth < dimensions.fullHeight;
    // }

    dimensions.isLandscape = !dimensions.isPortrait;

    let mode = portrait;

    if (dimensions.isLandscape)
        mode = landscape;

    dimensions.gameWidth = mode.gameWidth;
    dimensions.gameHeight = mode.gameHeight;
    }

  preload() {
    if (config.webfonts.length) {
      WebFont.load({
        google: {
          families: config.webfonts
        },
        active: this.fontsLoaded
      })
    }

    this.load.image('blue', './assets/blue.png')
    this.load.image('bluegreen', './assets/bluegreen.png')
    this.load.image('building', './assets/building.png')
    this.load.image('green', './assets/green.png')
    this.load.image('orange', './assets/orange.png')
    this.load.image('purple', './assets/purple.png')
    this.load.image('red', './assets/red.png');


    this.load.image('block1', './assets/block1.png');
    this.load.image('block2', './assets/block2.png');
    this.load.image('block3', './assets/block3.png');
    this.load.image('block4', './assets/block4.png');
    this.load.image('block5', './assets/block5.png');
    this.load.image('block6', './assets/block6.png');

    this.load.image('bar', './assets/bar.png');
    this.load.image('barframe', './assets/barframe.png');
    this.load.image('mute', './assets/mute.png');
    this.load.image('sound', './assets/sound.png');
    this.load.image('playnowbtn', './assets/playnowbtn.png');
    this.load.image('life', './assets/life.png');

    this.load.image('getready', './assets/getready.png');
    this.load.image('fail', './assets/fail.png');
    this.load.image('playNow', './assets/playNow.png');
    this.load.image('Retry', './assets/Retry.png');

  }

  render() {
    if (config.webfonts.length && this.fontsReady) {
      this.state.start('Splash')
    }
    if (!config.webfonts.length) {
      this.state.start('Splash')
    }
  }

  fontsLoaded() {
    this.fontsReady = true
  }
}
