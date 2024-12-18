import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'

import config from './config'
import dimensions from './dimensions'

class Game extends Phaser.Game {
  constructor () {
    // const docElement = document.documentElement
    // const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    // const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    // super(width, height, Phaser.CANVAS, 'content', null)

    let ratio = 1;

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

      super(dimensions.fullWidth, dimensions.fullHeight, Phaser.CANVAS, ((hasAarki) ? 'gameContainer' : 'content'), null)

      
    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Game', GameState, false)

    // with Cordova with need to wait that the device is ready so we will call the Boot state in another file
    if (!window.cordova) {
      this.state.start('Boot')
    }
  }
}
var hasDAPI, hasMraid, hasMaio, hasNUC, hasAarki;

window.game = new Game()

if (window.cordova) {
  var app = {
    initialize: function () {
      document.addEventListener(
        'deviceready',
        this.onDeviceReady.bind(this),
        false
      )
    },

    // deviceready Event Handler
    //
    onDeviceReady: function () {
      this.receivedEvent('deviceready')

      // When the device is ready, start Phaser Boot state.
      window.game.state.start('Boot')
    },

    receivedEvent: function (id) {
      console.log('Received Event: ' + id)
    }
  }

  app.initialize()
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration)
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError)
    })
  })
}
