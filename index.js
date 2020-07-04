var _maze, _vue;
_vue = new Vue({
  el: ".app",
  data: {
    maze: {
      tiles: [],
      position: [0, 0],
      finish: null,
      rotation: 0,
    },
    options: {
      maxTiles: 300,
      bundled: true,
      tileSize: "m",
    },
    config: {
      touchscreen: "ontouchstart" in window,
      menuOpen: false,
      perspective: "full",
    },
  },
  computed: {
    finished: function () {
      return this.maze.finish
        ? this.maze.position[0] == this.maze.finish[0] &&
            this.maze.position[1] == this.maze.finish[1]
        : false;
    },
    direction: function () {
      return this.maze.finish
        ? this.maze.rotation +
            180 -
            (((Math.atan2(
              this.maze.finish[0] - this.maze.position[0],
              this.maze.finish[1] - this.maze.position[1]
            ) *
              180) /
              Math.PI) %
              360)
        : 0;
    },
    mazePosition: function () {
      var tx = -(100 * this.maze.position[0]),
        ty = -(100 * this.maze.position[1]),
        rx = 100 * this.maze.position[0] + 50,
        ry = 100 * this.maze.position[1] + 50;
      var css = {};
      css["transform"] = "translate(" + tx + "%, " + ty + "%)";
      if (this.config.perspective) {
        css["transform"] += " rotateX( 60deg )";
        css["transform-origin"] = rx + "% " + ry + "% 0";
      }
      if (this.config.perspective == "full") {
        css["transform"] += "rotate(" + this.maze.rotation + "deg)";
      }
      return css;
    },
    tileSizeClass: function () {
      return {
        "app__maze_tilesize-s": this.options.tileSize == "s",
        "app__maze_tilesize-m": this.options.tileSize == "m",
        "app__maze_tilesize-l": this.options.tileSize == "l",
      };
    },
  },
  methods: {
    move: function (dir) {
      if (this.config.perspective == "full") {
        var directions,
          rotation = 0;
        switch (dir) {
          case "left":
            this.maze.rotation += 90;
            break;
          case "right":
            this.maze.rotation -= 90;
            break;
          case "up":
          case "down":
            rotation = this.maze.rotation % 360;
            while (rotation < 0) {
              rotation += 360;
            }
            break;
        }
        switch (dir) {
          case "up":
            directions = {
              0: "up",
              90: "left",
              180: "down",
              270: "right",
            };
            break;
          case "down":
            directions = {
              0: "down",
              90: "right",
              180: "up",
              270: "left",
            };
            break;
        }
        if (directions) {
          _maze.move(directions[rotation]);
        }
      } else {
        _maze.move(dir);
      }
    },
    start: function (create) {
      if (create) {
        _maze.create();
      }
    },
  },
});
_maze = new Maze(_vue);

var webdriver = require("selenium-webdriver");

var userName = "kallyasmedia1";
var accessKey = "bqEJrKKHWZxaUyTYdN1U";
var browserstackURL =
  "https://" +
  userName +
  ":" +
  accessKey +
  "@hub-cloud.browserstack.com/wd/hub";

// Input capabilities
var capabilities = {
  os: "Windows",
  os_version: "10",
  browserName: "Chrome",
  browser_version: "81",

  name: "kallyasmedia1's First Test",
};

var driver = new webdriver.Builder()
  .usingServer(browserstackURL)
  .withCapabilities(capabilities)
  .build();

driver.get("http://www.google.com").then(function () {
  driver
    .findElement(webdriver.By.name("q"))
    .sendKeys("BrowserStack")
    .then(function () {
      driver.getTitle().then(function (title) {
        console.log(title);
        driver.quit();
      });
    });
});
