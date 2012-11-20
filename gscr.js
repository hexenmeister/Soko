
var Game = {},
keyMap = {},
act = 0,
keyDelay = 5, keyCounter = 0, moveCounter = 0, undoCounter = 0;
playTimeCounter=0,
UP = 3, LEFT = 2, DOWN = 1, RIGHT = 4;

Game.FPS = 30;
Game.ctxWidth;
Game.ctxHeight;
Game.level;
Game.bgcolor;

Game.EMPTY = ' ';
Game.WALL = '#';
Game.TARGET = '.';
Game.PLAYER = '@';
Game.PLAYER_IN_TARGET = '+';
Game.BOX = '$';
Game.BOX_IN_TARGET = '*';


/* Human readable keyCode index */
var KEY = {
                'BACKSPACE' : 8,
                'TAB' : 9,
        'NUM_PAD_CLEAR' : 12,
        'ENTER' : 13,
        'SHIFT' : 16,
        'CTRL' : 17,
        'ALT' : 18,
        'PAUSE' : 19,
        'CAPS_LOCK' : 20,
        'ESCAPE' : 27,
        'SPACEBAR' : 32,
        'PAGE_UP' : 33,
        'PAGE_DOWN' : 34,
        'END' : 35,
        'HOME' : 36,
        'ARROW_LEFT' : 37,
        'ARROW_UP' : 38,
        'ARROW_RIGHT' : 39,
        'ARROW_DOWN' : 40,
        'PRINT_SCREEN' : 44,
        'INSERT' : 45,
        'DELETE' : 46,
        'SEMICOLON' : 59,
        'WINDOWS_LEFT' : 91,
        'WINDOWS_RIGHT' : 92,
        'SELECT' : 93,
        'NUM_PAD_ASTERISK' : 106,
        'NUM_PAD_PLUS_SIGN' : 107,
        'NUM_PAD_HYPHEN-MINUS' : 109,
        'NUM_PAD_FULL_STOP' : 110,
        'NUM_PAD_SOLIDUS' : 111,
        'NUM_LOCK' : 144,
        'SCROLL_LOCK' : 145,
        'SEMICOLON' : 186,
        'EQUALS_SIGN' : 187,
        'COMMA' : 188,
        'HYPHEN-MINUS' : 189,
        'FULL_STOP' : 190,
        'SOLIDUS' : 191,
        'GRAVE_ACCENT' : 192,
        'LEFT_SQUARE_BRACKET' : 219,
        'REVERSE_SOLIDUS' : 220,
        'RIGHT_SQUARE_BRACKET' : 221,
        'APOSTROPHE' : 222
};

// Berechenbares ausfüllen
(function() {
        /* 0 - 9 */
        for ( var i = 48; i <= 57; i++) {
                KEY['' + (i - 48)] = i;
        }
        /* A - Z */
        for (i = 65; i <= 90; i++) {
                KEY['' + String.fromCharCode(i)] = i;
        }
        /* NUM_PAD_0 - NUM_PAD_9 */
        for (i = 96; i <= 105; i++) {
                KEY['NUM_PAD_' + (i - 96)] = i;
        }
        /* F1 - F12 */
        for (i = 112; i <= 123; i++) {
                KEY['F' + (i - 112 + 1)] = i;
        }
})();

// Steuerungskeys
keyMap[KEY.ARROW_LEFT] = LEFT;
keyMap[KEY.ARROW_UP] = UP;
keyMap[KEY.ARROW_RIGHT] = RIGHT;
keyMap[KEY.ARROW_DOWN] = DOWN;

Game.Map = function (size, context) {

        var height = null, width = null, blockSize = size, map = null, ctx = context, paused = false, msg=null, undoStack = new Array();

        function reset() {
                map = Game.MAP.clone();
                height = map.length;
                width = map[0].length;
        }

    function draw(refresh) {
            var i, j, size = blockSize;
            if (refresh) {
                    // Hintergrund
                    ctx.fillStyle = Game.bgcolor;
                    ctx.fillRect(0, 0, Game.ctxWidth, Game.ctxHeight);

                    // draw level
                    for (i = 0; i < height; i += 1) {
                            for (j = 0; j < width; j += 1) {
                                    drawBlock(i, j);
                            }
                    }
                    drawText(msg);
            }
            drawStat();
    }

    function drawStat() {
                var text = "Zeit: " + Math.round(playTimeCounter / Game.FPS)
                                + "  Schritte: " + moveCounter + "  Undo: " + undoCounter;

                ctx.font = "bold 12px Arial";
                var w = ctx.measureText(text).width, x = ((Game.ctxWidth) - w) / 2,
                y = Math.min((Game.ctxHeight - height * blockSize) / 2 + height * blockSize + 25, Game.ctxHeight - 25);

                ctx.beginPath();
                ctx.fillStyle = Game.bgcolor;
                ctx.fillRect(x - 10, y - 15, w + 20, 20);

                ctx.fillStyle = "#ff7733";
                ctx.fillText(text, x, y);
                ctx.closePath();
        }

    function drawBlock(y, x) {
                var item = map[y][x];

                var oX = (x * blockSize) + ((Game.ctxWidth - width * blockSize) / 2),
                        oY = (y * blockSize) + ((Game.ctxHeight - height * blockSize) / 2);

                var d = Math.round(blockSize / 9);
                if (item === Game.EMPTY || item === Game.TARGET
                                || item === Game.BOX_IN_TARGET
                                || item === Game.PLAYER_IN_TARGET || item === Game.PLAYER
                                || item === Game.BOX) {
                        ctx.beginPath();

                        ctx.lineWidth = 1;

                        ctx.fillStyle = "#FFF4d1";
                        ctx.fillRect((oX), (oY), blockSize, blockSize);
                        ctx.fillStyle = "#FFDC6B";
                        ctx.strokeStyle = "#D1A000";

                        ctx.moveTo((oX), (oY) + blockSize / 2);
                        ctx.lineTo((oX) + blockSize / 2, (oY));
                        ctx.lineTo((oX) + blockSize / 2, (oY) + blockSize / 2);
                        ctx.lineTo((oX), (oY));
                        ctx.lineTo((oX), (oY) + blockSize / 2);

                        ctx.moveTo((oX), (oY) + blockSize);
                        ctx.lineTo((oX) + blockSize / 2, (oY) + blockSize / 2);
                        ctx.lineTo((oX) + blockSize / 2, (oY) + blockSize);
                        ctx.lineTo((oX), (oY) + blockSize / 2);
                        ctx.lineTo((oX), (oY) + blockSize);

                        ctx.moveTo((oX) + blockSize / 2, (oY) + blockSize);
                        ctx.lineTo((oX) + blockSize, (oY) + blockSize / 2);
                        ctx.lineTo((oX) + blockSize, (oY) + blockSize);
                        ctx.lineTo((oX) + blockSize / 2, (oY) + blockSize / 2);
                        ctx.lineTo((oX) + blockSize / 2, (oY) + blockSize);

                        ctx.moveTo((oX) + blockSize / 2, (oY) + blockSize / 2);
                        ctx.lineTo((oX) + blockSize, (oY));
                        ctx.lineTo((oX) + blockSize, (oY) + blockSize / 2);
                        ctx.lineTo((oX) + blockSize / 2, (oY));
                        ctx.lineTo((oX) + blockSize / 2, (oY) + blockSize / 2);

                        ctx.stroke();
                        ctx.fill();

                        ctx.closePath();
                }
                if (item === Game.WALL) {
                        ctx.beginPath();
                        ctx.fillStyle = "#000000";
                        ctx.fillRect((oX), (oY), blockSize, blockSize);

                        ctx.fillStyle = "#bb0000";
                        ctx.fillRect(oX, oY, blockSize / 2 - 1, blockSize / 3 - 1);
                        ctx.fillRect(oX + blockSize / 2, oY, blockSize / 2 - 1, blockSize / 3 - 1);

                        ctx.fillRect(oX, oY + blockSize / 3, blockSize / 4 - 1, blockSize / 3 - 1);
                        ctx.fillRect(oX + blockSize / 4, oY + blockSize / 3, blockSize / 2 - 1, blockSize / 3 - 1);
                        ctx.fillRect(oX + blockSize / 4 + blockSize / 2, oY + blockSize / 3, blockSize / 4, blockSize / 3 - 1);

                        ctx.fillRect(oX, oY + blockSize / 3 * 2, blockSize / 8 - 1, blockSize / 3 - 1);
                        ctx.fillRect(oX + blockSize / 8, oY + blockSize / 3 * 2, blockSize / 2 - 1, blockSize / 3 - 1);
                        ctx.fillRect(oX + blockSize / 8 + blockSize / 2, oY + blockSize / 3 * 2, blockSize / 8 * 3, blockSize / 3 - 1);

                        ctx.stroke();
                        ctx.closePath();
                }
                if (item === Game.TARGET || item === Game.PLAYER_IN_TARGET) {
                        ctx.beginPath();
                        ctx.strokeStyle = "#D10000";
                        ctx.lineCap = "round";
                        ctx.lineWidth = d;
                        ctx.moveTo(oX + d * 3, oY + d * 3);
                        ctx.lineTo(oX + blockSize - d * 3, oY + blockSize - d * 3);
                        ctx.moveTo(oX + blockSize - d * 3, oY + d * 3);
                        ctx.lineTo(oX + d * 3, oY + blockSize - d * 3);
                        ctx.stroke();
                        ctx.closePath();
                }
                if (item === Game.BOX || item === Game.BOX_IN_TARGET) {
                        ctx.beginPath();
                        ctx.strokeStyle = "#000000";
                        if (item === Game.BOX_IN_TARGET) {
                                ctx.fillStyle = "#50bA20";
                        } else {
                                ctx.fillStyle = "#c88A00";
                        }
                        ctx.lineWidth = 1;
                        ctx.rect((oX) + d, (oY) + d, blockSize - 2 * d, blockSize / 5);
                        ctx.rect((oX) + d, (oY) + blockSize - d - blockSize / 5, blockSize - 2 * d, blockSize / 5);
                        ctx.rect((oX) + 2 * d, (oY) + d + blockSize / 5, blockSize - 4 * d, blockSize - blockSize / 5 * 2 - 2 * d);
                        ctx.fill();
                        ctx.stroke();
                        ctx.closePath();
                }

                if (item === Game.PLAYER || item === Game.PLAYER_IN_TARGET) {
                        // Männchen
                        ctx.beginPath();
                        ctx.strokeStyle = "#0099CC";
                        ctx.fillStyle = "#0099CC";
                        ctx.lineCap = "round";
                        ctx.lineWidth = d;

                        // // Kopf
                        // ctx.arc((oX)+blockSize/2, (oY)+d*1.5, d, 0, 2*Math.PI, true);
                        // // Korpus
                        // ctx.moveTo((oX)+blockSize/2, (oY)+d);
                        // ctx.lineTo((oX)+blockSize/2, oY+blockSize-d*4);
                        // // Arme
                        // ctx.moveTo((oX)+blockSize/2-d*1.7, oY+d*3.7);
                        // ctx.lineTo((oX)+blockSize/2+d*1.7, oY+d*3.7);
                        // // Beine
                        // ctx.moveTo((oX)+blockSize/2-d*1.5, oY+blockSize-d);
                        // ctx.lineTo((oX)+blockSize/2, oY+blockSize-d*4);
                        // ctx.lineTo((oX)+blockSize/2+d*1.5, oY+blockSize-d);

                        // Kreuzchen
                        // ctx.moveTo(oX+d*3, oY+d*3);
                        // ctx.lineTo(oX+blockSize-d*3, oY+blockSize-d*3);
                        // ctx.moveTo(oX+blockSize-d*3, oY+d*3);
                        // ctx.lineTo(oX+d*3, oY+blockSize-d*3);

                        // Andr
                        // Kopf
                        ctx.arc((oX) + blockSize / 2, (oY) + d * 2.5, d * 2, 0, Math.PI,true);
                        ctx.fill();
                        // Korpus
                        ctx.rect((oX) + blockSize / 2 - 2 * d, (oY) + 3.5 * d, 4 * d, 3 * d);
                        ctx.fill();
                        // Arme
                        ctx.moveTo(oX + blockSize / 2 - 3.3 * d, oY + d * 3.3);
                        ctx.lineTo(oX + blockSize / 2 - 3.3 * d, oY + d * 5);

                        ctx.moveTo(oX + blockSize / 2 + 3.3 * d, oY + d * 3.3);
                        ctx.lineTo(oX + blockSize / 2 + 3.3 * d, oY + d * 5);
                        // Beine
                        ctx.moveTo(oX + blockSize / 2 - d, oY + d * 7);
                        ctx.lineTo(oX + blockSize / 2 - d, oY + d * 8);

                        ctx.moveTo(oX + blockSize / 2 + d, oY + d * 7);
                        ctx.lineTo(oX + blockSize / 2 + d, oY + d * 8);
                        ctx.stroke();
                        ctx.closePath();

                        // Augen
                        ctx.beginPath();
                        ctx.strokeStyle = "#eeeeff";
                        ctx.moveTo(oX + blockSize / 2 - d / 1.5, (oY) + d * 1.2);
                        ctx.lineTo(oX + blockSize / 2 - d / 1.5, (oY) + d * 1.2);
                        ctx.moveTo(oX + blockSize / 2 + d / 1.5, (oY) + d * 1.2);
                        ctx.lineTo(oX + blockSize / 2 + d / 1.5, (oY) + d * 1.2);

                        ctx.stroke();
                        ctx.closePath();
                }
        }

    function dialog(text) {
            msg = text;
            draw(true);
    }

    function drawText(text) {
            if (text == null)
                    return;

                ctx.font = "bold 25px Times";
                var
                w = ctx.measureText(text).width,
                x = ((Game.ctxWidth ) - w) / 2,
                y = Math.max((Game.ctxHeight-height * blockSize)/2 - 25,45);

                ctx.lineWidth = "2";
                ctx.strokeStyle = "rgb(0, 50, 250)";
                ctx.fillStyle = "rgba(0, 50, 250, 0.6)";
                ctx.beginPath();
                ctx.rect(x-45, y-40, w+90, 60);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.fillStyle = "#eeeeff";
                ctx.fillText(text, x, y);
                ctx.closePath();
        }

    function move(act) {
                // Suche den Player
                var x, y;
                for (y = 0; y < height; y += 1) {
                        for (x = 0; x < width; x += 1) {
                                var item = map[y][x];
                                if (item === Game.PLAYER) {
                                        return movePlayer(x, y, act, Game.EMPTY);
                                } else if (item === Game.PLAYER_IN_TARGET) {
                                        return movePlayer(x, y, act, Game.TARGET);
                                }
                        }
                }
                return false;
        }

    function movePlayer(x, y, act, back) {
                // prüfen, ob möglich: Grenzen, Wände, Kisten

                var pos = {
                        "x" : x,
                        "y" : y
                };
                var npos = getNewCoord(act, pos);

                if (!withinBounds(npos)) {
                        return false;
                }

                var oldMap = map.clone(), ret = false;
                var item = map[npos.y][npos.x];
                if (item === Game.TARGET) {
                        map[npos.y][npos.x] = Game.PLAYER_IN_TARGET;
                        map[y][x] = back;
                        ret =  true;
                } else if (item === Game.EMPTY) {
                        map[npos.y][npos.x] = Game.PLAYER;
                        map[y][x] = back;
                        ret =  true;
                } else if (item === Game.BOX || item === Game.BOX_IN_TARGET) {
                        // wenn kiste, dann muss vor der Kiste EMPTY oder TARGET sein
                        var nnpos = getNewCoord(act, npos);
                        if (!withinBounds(nnpos)) {
                                return false;
                        }
                        var nnitem = map[nnpos.y][nnpos.x];
                        if (nnitem !== Game.EMPTY && nnitem !== Game.TARGET) {
                                return false;
                        }
                        // Move Player
                        if (item === Game.BOX) {
                                map[npos.y][npos.x] = Game.PLAYER;
                        } else {
                                map[npos.y][npos.x] = Game.PLAYER_IN_TARGET;
                        }
                        map[y][x] = back;
                        // move Kiste
                        if (nnitem === Game.EMPTY) {
                                map[nnpos.y][nnpos.x] = Game.BOX;
                        } else {
                                map[nnpos.y][nnpos.x] = Game.BOX_IN_TARGET;
                        }
                        ret =  true;
                }
                if (ret){
                        undoStack.push(oldMap);
                }
                return ret;
        }

    function withinBounds(pos) {
                return pos.y >= 0 && pos.y < height && pos.x >= 0 && pos.x < width;
        }

        function getNewCoord(act, pos) {
                return {
                        "x" : pos.x + (act === LEFT && -1 || act === RIGHT && 1 || 0),
                        "y" : pos.y + (act === DOWN && 1 || act === UP && -1 || 0)
                };
        }

        function checkCompleted() {
                var x, y;
                for (y = 0; y < height; y += 1) {
                        for (x = 0; x < width; x += 1) {
                                var item = map[y][x];
                                if (item === Game.BOX) {
                                        return false;
                                }
                        }
                }
                paused = true;
                return true;
        }

        function pause(text) {
                paused = true;
                dialog(text);
        }

        function resume() {
                paused = false;
                msg=null;
                draw(true);
        }

        function isPaused() {
                return paused;
        }

        function undo() {
                if (undoStack.length === 0)
                        return;
                undoCounter += 1;
                map = undoStack.pop().clone();
                draw(true);
        }

    reset();

        return {
                "draw" : draw,
                "drawText" : drawText,
                "drawStat" : drawStat,
                "move" : move,
                "dialog" : dialog,
                "resume" : resume,
                "pause" : pause,
                "isPaused" : isPaused,
                "height" : height,
                "width" : width,
                "blockSize" : blockSize,
                "checkCompleted" : checkCompleted,
                "undo" : undo
        };
};

var GAME = (function () {
        var ctx = null, map = null, gameOver = true, changeLevel = false;

        function keyDown(e) {
                if (gameOver) {
                        //  && e.keyCode === KEY.ENTER
                        gameOver = false;
                        if(changeLevel) {
                                nextLevel();
                        }
                        map.resume();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                } else if (e.keyCode === KEY.P) {
                        if (map.isPaused()) {
                                map.resume();
                        } else {
                                map.pause("PAUSE");
                        }
                } else if(e.keyCode === KEY.BACKSPACE) {
                        undo();
                }

                if (typeof keyMap[e.keyCode] !== "undefined") {
                        if (map.isPaused())
                                return false;

                        if (keyCounter >= keyDelay) {
                                keyCounter = 0;
                                act = keyMap[e.keyCode];
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                }

                // kein Tasten mehr an den Browser weiterleiten
                e.preventDefault();
                e.stopPropagation();

                return true;
        }

//        function keyPress(e) {
//                if (state !== WAITING && state !== PAUSE) {
//                        e.preventDefault();
//                        e.stopPropagation();
//                }
//        }

        var timer;

        function init(wrapper, root, bgcolor) {
                var canvas = document.createElement("canvas");
                // Neues Zeichenfeld erstellen
                wrapper.appendChild(canvas);
                // Größen
                Game.ctxWidth = wrapper.offsetWidth;
                Game.ctxHeight = wrapper.offsetHeight;
                Game.bgcolor = bgcolor;

                // Initialisieren
                canvas.setAttribute("width", (Game.ctxWidth) + "px");
                canvas.setAttribute("height", (Game.ctxHeight) + "px");
                ctx = canvas.getContext('2d');

                // Neues level definieren
                startLevel(0);

                document.addEventListener("keydown", keyDown, true);
                // document.addEventListener("keypress", keyPress, true);
                timer = window.setInterval(mainLoop, 1000 / Game.FPS);

        }

        function stop() {
                map.dialog("Auf wiedersehen!");
                clearInterval(timer);
                document.removeEventListener("keydown", keyDown, true);
        }

        function startLevel(level) {
                Game.level = level;
                var blockSize = 25, maxLevLen = 1;

                maxLevLen = Math.max(maxLevLen, Game.LEVELS[level][0].length);
                blockSize = Math.min(blockSize, (Game.ctxWidth / maxLevLen));

                if(blockSize>27) {
                        // soll durch 9 teilbar sein (für bessere Anzeige) (aber nur, wenn dabei die Anzeige auch 'reinpasst').
                        blockSize = Math.round(blockSize / 9) * 9;
                }
                 //blockSize = 24;

                // Array of Strings in ein (2-dimensionales) Array of chars umwandeln
                Game.MAP = new Array(Game.LEVELS[level].length);
                for (i = 0; i < Game.MAP.length; i += 1) {
                        var s = Game.LEVELS[level][i];
                        Game.MAP[i] = s.split('');
                }

                map = new Game.Map(blockSize, ctx);
                refreshNeeded = true;
                gameOver = true;
                changeLevel = false;
                moveCounter = 0;
                undoCounter = 0;
                playTimeCounter = 0;
                map.pause("Taste zum Start!");
        }

        var refreshNeeded = true;

        function mainLoop() {
                // regelt, wie schnell sich der Player bewegen darf
                keyCounter += 1;
                if(!map.isPaused()) {
                        playTimeCounter+=1;
                }
                // Steuerung
                if (act !== 0) {
                        var a = act;
                        act = 0;
                        refreshNeeded = map.move(a);
                        if(refreshNeeded) {
                                moveCounter+=1;
                                if(map.checkCompleted()) {
                                        gameOver = true;
                                        changeLevel = true;
                                        if(Game.level < Game.LEVELS.length - 1) {
                                                map.dialog("Level fertig!!!");
                                        } else {
                                                map.dialog("Alles fertig!!!");
                                                Game.level=-1;
                                        }
                                }
                        }
                }
                // neuzeichnen, falls Map geändert
                map.draw(refreshNeeded);
                refreshNeeded = false;
        }

        function nextLevel() {
                if (Game.level < Game.LEVELS.length - 1) {
                        startLevel(Game.level + 1);
                }
        }

        function prevLevel() {
                if (Game.level > 0) {
                        startLevel(Game.level - 1);
                }
        }

        function restartLevel() {
                startLevel(Game.level);
        }

        function undo() {
                map.undo();
        }


    return {
                "init" : init,
                "stop" : stop,
                "nextLevel" : nextLevel,
                "prevLevel" : prevLevel,
                "restartLevel" : restartLevel,
                "undo" : undo
        };
}());

Game.LEVELS = [
               [
                '---##########################---',
                '---#                        #---',
                '---# @  .* $ *   .  . $ $   #---',
                '---# $ * $.  .$ $.  *    $  #---',
                '---#  $.***  *   *  .$      #---',
                '---#   * $. $. * .$ * $.    #---',
                '####   .$ *  $.$.   .*.. $  ####',
                '#                              #',
                '#  **     * $    $ $ .  $      #',
                '# .$      *    $$   $.   $ $$  #',
                '#  *.$ ** **$  .. $ *. $*.  .* #',
                '#   * .$  .$. * .$ * . ..  * * #',
                '# *.$ $.* .$. ** *  ** $.* . * #',
                '#                              # ',
                '################################'
                ],
          [
          '####---',
          '#  #---',
          '#  #---',
          '#  #---',
          '#@.####',
          '#  $  #',
          '##*   #',
          '-#  ###',
          '-####--'
          ],
          [
                '####------------',
                '#  #############',
                '# ...          #',
                '# +.. # ###### #',
                '###  ##       *#',
                '--#$### $$$$ # #',
                '--#   # # $  # #',
                '--### # #   ## #',
                '----# # #####  #',
                '----#         ##',
                '----###########-'

          ],
          [
          '---#######---',
                '---#. # .#---',
                '-###  #  ###-',
                '-#   * *@  #-',
                '-# $  #  $ #-',
                '-###  #  ###-',
                '---#######---'
          ],
          [
                '######---####',
                '#  $.##### .#',
                '# $$.#   $$.#',
                '#  #.# #    #',
                '#    @   ####',
                '###########---'
           ],
           [
            '#############',
            '#. ...##   .#',
            '# $@# #.  $ #',
            '#$#$$ #$#$# #',
            '#    ##   $ #',
            '#   ###.  #.#',
            '## ####  ####',
            '-#    ## #---',
            '-#  $.   #---',
            '-#########---'
            ]
    /*[
     '-####---',
     '-# .#---',
     '-#  ###-',
     '-#*@  #-',
     '-#  $ #-',
     '-#  ###-',
     '-####---'
     ],
     [
      '--####---',
      '###  ####',
      '#     $ #',
      '# #  #$ #',
      '# . .#@ #',
      '#########'
      ],
      [
       '-#####---#####-',
       '-#   #####   #-',
       '##     *     ##',
       '# **##$.$##** #',
       '#  . # * # .  #',
       '# **##$.$##** #',
       '##   # . #   ##',
       '-### ## ## ###-',
       '--#  ## ##  #--',
       '--#    $    #--',
       '--#### @ ####--',
       '-----#####-----'
       ],
       [
        '#####################',
        '#.  #.  #.$.#  .#  .#',
        '# #   #   #   #   # #',
        '#  .#   . $ .   #.  #',
        '# #  .#$$ # $$#.  # #',
        '#  .#   # $ #   #.  #',
        '# #   #$$ # $$#   # #',
        '#  .#   # $ #   #.  #',
        '#@#   #$$$*$$$#   # #',
        '#  ..   # $ #   ..  #',
        '# #   #$$ # $$#   # #',
        '#  .#   # $ #   #.  #',
        '# #  .#$$ # $$#.  # #',
        '#  .#   # $ #   #.  #',
        '# #   #$  #  $#   # #',
        '#.  #.  #.$.#  .#  .#',
        '#####################'
        ],
        [
         '-----###---------###-----',
         '---##   ##-----##   ##---',
         '--#      .#---#   $   #--',
         '-#    # ...#-#  $$#  $ #-',
         '-# #    .#.#-#$#  $  # #-',
         '#    # #  ..#    # # $  #',
         '#  @   ....*.$ $$$$$$$  #',
         '#    # #  ..#    # # $  #',
         '-# #    .#.#-# #     # #-',
         '-#    # ...#-#  $ #    #-',
         '--#      .#---# $ $$$ #--',
         '---##   ##-----##   ##---',
         '-----###---------###-----'
         ],
         [
          '--#######--',
          '-#       #-',
          '# $$$ $$$ #',
          '#      #  #',
          '#   # $   #',
          '# $#  $ $ #',
          '# $  $# $ #',
          '-# $   $ #-',
          '--# $ $ #--',
          '---# $ #---',
          '----#@#----',
          '---# ..#---',
          '--#. ...#--',
          '--#. ...#--',
          '--#.....#--',
          '---#...#---',
          '----###----'
          ],
          [
           '-----###---------###-----',
           '----## ##-------## ##----',
           '---##   ##-----##   ##---',
           '--##   $ ##---##  $  ##--',
           '-## $##   ##-##  $##$ ##-',
           '##    $ $  ###  $   $  ##',
           '#   $$##$  $@$   ##$$$  #',
           '## $$ ##   ###   ## $  ##',
           '-## .*.*  ##-## $..*. ##-',
           '--##.....##---##.....##--',
           '---##...##-----##.*.##---',
           '----##*##-------##.##----',
           '-----###---------###-----'
           ]*/
    ];

Game.MAP  = Game.LEVELS[0];

Object.prototype.clone = function() {
        var i, newObj = (this instanceof Array) ? [] : {};
        for (i in this) {
                if (i === 'clone') {
                        continue;
                }
                if (this[i] && typeof this[i] === "object") {
                        newObj[i] = this[i].clone();
                } else {
                        newObj[i] = this[i];
                }
        }
        return newObj;
};
