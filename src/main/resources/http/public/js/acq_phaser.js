/**
 * Collections of functions which construct the GUI from Phaser elements.
 * Also contains many utility functions for working with these Phaser elements.
 */
var AcquirePhaser;
(function (AcquirePhaser) {
    var T = /** @class */ (function () {
        function T(server, game, selfId) {
            this.game = game;
            this.players = new Players.T(server, game);
            this.status = new Status.T(game);
            this.hotels = new Hotels.T(server, game);
            this.board = new Board.T(server, game);
            // if drawing the game as an observer, do not draw a first-person view
            if (selfId.length !== 0)
                this.self = new Self.T(server, game, selfId);
            else
                this.self = undefined;
            // one-time initialize the background
            game.stage.backgroundColor = Color.S.White;
        }
        return T;
    }());
    AcquirePhaser.T = T;
    /**
     * Draw the state of the Acquire game represented by server.
     */
    function draw(t, server) {
        Players.draw(t.players, server, t.game);
        Status.draw(t.status, server, t.game);
        Hotels.draw(t.hotels, server, t.game);
        Board.draw(t.board, server);
        if (t.self !== undefined)
            Self.draw(t.self, server, t.game);
    }
    AcquirePhaser.draw = draw;
    /*
     * Acquire GUI Constants
     * ---------------------
     */
    /*
     *              GUI Dimensions
     * |----------------------------------------|
     * | h=(1/4)  Players   | h=(1/8)  SM       |
     * |                    |-------------------|
     * |                    | h=(1/8)  Response |
     * |----------------------------------------|
     * | h=(1/16)  Hotels                       |
     * |----------------------------------------|
     * |                                        |
     * | h=(9/16)  Board                        |
     * |                                        |
     * |----------------------------------------|
     * | h=(1/8)  Self                          |
     * |----------------------------------------|
     */
    /** Global size values. */
    var Size;
    (function (Size) {
        var Players;
        (function (Players) {
            function height(game) { return game.height * (1. / 4.); }
            Players.height = height;
            function width(game) { return game.width * (3. / 5.); }
            Players.width = width;
        })(Players = Size.Players || (Size.Players = {}));
        var Status;
        (function (Status) {
            function height(game) { return game.height * (1. / 4.); }
            Status.height = height;
            function width(game) { return game.width * (2. / 5.); }
            Status.width = width;
        })(Status = Size.Status || (Size.Status = {}));
        var Hotel;
        (function (Hotel) {
            function height(game) { return game.height * (1. / 16.); }
            Hotel.height = height;
            function width(game) { return game.width; }
            Hotel.width = width;
        })(Hotel = Size.Hotel || (Size.Hotel = {}));
        var Board;
        (function (Board) {
            function height(game) { return game.height * (9. / 16.); }
            Board.height = height;
            function width(game) { return game.width; }
            Board.width = width;
        })(Board = Size.Board || (Size.Board = {}));
        var Self;
        (function (Self) {
            function height(game) { return game.height * (1. / 8.); }
            Self.height = height;
            function width(game) { return game.width; }
            Self.width = width;
        })(Self = Size.Self || (Size.Self = {}));
        var Tile;
        (function (Tile) {
            function height(game) { return Board.height(game) / 9; }
            Tile.height = height;
            function width(game) { return Board.width(game) / 12; }
            Tile.width = width;
        })(Tile = Size.Tile || (Size.Tile = {}));
    })(Size = AcquirePhaser.Size || (AcquirePhaser.Size = {}));
    /** Global offset values. */
    var Offset;
    (function (Offset) {
        var Players;
        (function (Players) {
            function x(game) { return 0; }
            Players.x = x;
            function y(game) { return 0; }
            Players.y = y;
        })(Players = Offset.Players || (Offset.Players = {}));
        var Status;
        (function (Status) {
            function x(game) { return game.width * (3. / 5.); }
            Status.x = x;
            function y(game) { return 0; }
            Status.y = y;
        })(Status = Offset.Status || (Offset.Status = {}));
        var Hotel;
        (function (Hotel) {
            function x(game) { return 0; }
            Hotel.x = x;
            function y(game) { return game.height * (1. / 4.); }
            Hotel.y = y;
        })(Hotel = Offset.Hotel || (Offset.Hotel = {}));
        var Board;
        (function (Board) {
            function x(game) { return 0; }
            Board.x = x;
            function y(game) { return game.height * (5. / 16.); }
            Board.y = y;
        })(Board = Offset.Board || (Offset.Board = {}));
        var Self;
        (function (Self) {
            function x(game) { return 0; }
            Self.x = x;
            function y(game) { return game.height * (7. / 8.); }
            Self.y = y;
        })(Self = Offset.Self || (Offset.Self = {}));
    })(Offset = AcquirePhaser.Offset || (AcquirePhaser.Offset = {}));
    /** All color related constants and functions.  */
    var Color;
    (function (Color) {
        /** String color constants. */
        var S;
        (function (S) {
            S["Black"] = "#000000";
            S["White"] = "#ffffff";
            S["Blue_Hilite"] = "#87cefa";
            S["Blue_American"] = "#1d3853";
            S["Blue_Continental"] = "#1d8d91";
            S["Brown_Worldwide"] = "#74452b";
            S["Green_Festival"] = "#076530";
            S["Green_Good"] = "#00ff00";
            S["Pink_Imperial"] = "#b62550";
            S["Red_Luxor"] = "#ae1d18";
            S["Red_Light"] = "#ffcccc";
            S["Yellow_Tower"] = "#ba7c01";
            S["Yellow_Light"] = "#ffffaa";
            S["Yellow_Dark"] = "#333300";
        })(S = Color.S || (Color.S = {}));
        /** Number color constants. */
        var N;
        (function (N) {
            N[N["White"] = 16777215] = "White";
            N[N["Yellow_Light"] = 16777113] = "Yellow_Light";
        })(N = Color.N || (Color.N = {}));
        /** The color of a hotel id. */
        function colorOf(id) {
            switch (id) {
                case AcquireServer.HotelId.American: return Color.S.Blue_American;
                case AcquireServer.HotelId.Continental: return Color.S.Blue_Continental;
                case AcquireServer.HotelId.Festival: return Color.S.Green_Festival;
                case AcquireServer.HotelId.Imperial: return Color.S.Pink_Imperial;
                case AcquireServer.HotelId.Luxor: return Color.S.Red_Luxor;
                case AcquireServer.HotelId.Tower: return Color.S.Yellow_Tower;
                case AcquireServer.HotelId.Worldwide: return Color.S.Brown_Worldwide;
                default: throw new TypeError("Unhandled hotel id: " + id);
            }
        }
        Color.colorOf = colorOf;
    })(Color = AcquirePhaser.Color || (AcquirePhaser.Color = {}));
    /** All image related functions. */
    var Image;
    (function (Image) {
        /** The name of the information card.  */
        Image.informationCard = "information_card";
        /** The name of the money image. */
        Image.money = "money";
        /** Return the image name for the stock of the specified hotel. */
        function stockOf(id) {
            switch (id) {
                case AcquireServer.HotelId.American: return "american_stock_1";
                case AcquireServer.HotelId.Continental: return "continental_stock_1";
                case AcquireServer.HotelId.Festival: return "festival_stock_1";
                case AcquireServer.HotelId.Imperial: return "imperial_stock_1";
                case AcquireServer.HotelId.Luxor: return "luxor_stock_1";
                case AcquireServer.HotelId.Tower: return "tower_stock_1";
                case AcquireServer.HotelId.Worldwide: return "worldwide_stock_1";
                default: throw new TypeError("Unhandled hotel id: " + id);
            }
        }
        Image.stockOf = stockOf;
    })(Image = AcquirePhaser.Image || (AcquirePhaser.Image = {}));
    /** Functions relating to sorting. */
    var Sort;
    (function (Sort) {
        function tiles(a, b) {
            if (a.length === b.length) {
                return a.localeCompare(b);
            }
            else {
                return a.length < b.length ? -1 : 1;
            }
        }
        Sort.tiles = tiles;
    })(Sort || (Sort = {}));
    /*
     * JS/TS Utility Functions
     * -----------------------
     */
    /** Utility functions for strings. */
    var Str;
    (function (Str) {
        /** Capitalize the first letter of the hotel id. */
        function capitalize(id) {
            return id.charAt(0).toUpperCase() + id.slice(1);
        }
        Str.capitalize = capitalize;
        /** Pad the end of a string to make it length len. */
        function padEnd(str, len) {
            return (str + new Array(len + 1).join(" ")).slice(0, len);
        }
        Str.padEnd = padEnd;
        /** Pad all strings in the area to the maximum length.  */
        function padEndAll(array) {
            var maxLength = Math.max.apply(null, array.map(function (s) { return s.length; }));
            return array.map(function (s) { return Str.padEnd(s, maxLength); });
        }
        Str.padEndAll = padEndAll;
        /** Split string into lines of the specified length. */
        function intoLines(str, len) {
            var lines = [];
            for (var i = len; i < str.length;) {
                var sub = str.slice(0, i);
                var space = sub.lastIndexOf(" ");
                var line = str.slice(0, space);
                str = str.slice(space);
                lines.push(line);
                i += len - line.length;
            }
            lines.push(str);
            return lines;
        }
        Str.intoLines = intoLines;
    })(Str = AcquirePhaser.Str || (AcquirePhaser.Str = {}));
    /** Utility functions for numbers. */
    var Num;
    (function (Num) {
        /** Pad stock amount string, if needed, to be 2 characters in length. */
        function padStock(stock) {
            if (stock < 10)
                return stock + " ";
            else
                return stock.toString();
        }
        Num.padStock = padStock;
        /** Turn a money amount into a human readable string. */
        function moneyStr(money) {
            return "$" + money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        Num.moneyStr = moneyStr;
    })(Num = AcquirePhaser.Num || (AcquirePhaser.Num = {}));
    /** Utility functions for arrays. */
    var Arr;
    (function (Arr) {
        /** Whether two arrays have equal elements. */
        function equal(array1, array2) {
            if (array1.length !== array2.length) {
                return false;
            }
            for (var i = 0; i < array1.length; i++) {
                if (array1[i] !== array2[i]) {
                    return false;
                }
            }
            return true;
        }
        Arr.equal = equal;
        /** Whether array contains element. */
        function contains(array, element) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === element) {
                    return true;
                }
            }
            return false;
        }
        Arr.contains = contains;
    })(Arr = AcquirePhaser.Arr || (AcquirePhaser.Arr = {}));
    /** Utility functions for phaser game rendering. */
    var Render;
    (function (Render) {
        /** Flag which will force rendering to always be enabled. */
        var forceEnableRendering = false;
        /** Force rendering to always be enabled. */
        function forceEnabled() {
            forceEnableRendering = true;
        }
        Render.forceEnabled = forceEnabled;
        /** Allow rendering to be disabled. */
        function allowDisabling() {
            forceEnableRendering = false;
        }
        Render.allowDisabling = allowDisabling;
        /** Enable rendering. */
        function enable(game) {
            game.lockRender = false;
        }
        Render.enable = enable;
        /** Disable rendering. */
        function disable(game) {
            if (forceEnableRendering) {
                return;
            }
            game.lockRender = true;
        }
        Render.disable = disable;
    })(Render = AcquirePhaser.Render || (AcquirePhaser.Render = {}));
    /*
     * Phaser GUI Generalized Constructs
     * ---------------------------------
     */
    /** A border around a sprite. */
    var Border;
    (function (Border) {
        /** The type of the border. */
        var Type;
        (function (Type) {
            Type[Type["None"] = 0] = "None";
            Type[Type["Outline"] = 1] = "Outline";
            Type[Type["Select"] = 2] = "Select";
            Type[Type["Good"] = 3] = "Good";
        })(Type = Border.Type || (Border.Type = {}));
        var T = /** @class */ (function () {
            function T(parentSprite) {
                this.parentSprite = parentSprite;
                this.borders = [Type.None];
                this.bmd = undefined;
                this.sprite = undefined;
            }
            return T;
        }());
        Border.T = T;
        /** Toggle the creation, deletion, or redrawing of a border. */
        function toggle(t, game, border) {
            toggleMany(t, game, [border]);
        }
        Border.toggle = toggle;
        /** Toggle the creation, deletion, or redrawing of borders. */
        function toggleMany(t, game, borders) {
            if (!isValid(borders))
                throw new TypeError("Illegal borders to toggle many: " + borders);
            // do nothing when no change
            if (Arr.equal(t.borders, borders)) {
                return;
            }
            // clean up when border is cleared
            if (!isNone(t.borders) && isNone(borders)) {
                t.parentSprite.removeChild(t.sprite);
                t.sprite.destroy();
                t.borders = [Type.None];
                t.sprite = undefined;
                t.bmd = undefined;
                return;
            }
            // create when border doesn't exist
            if (isNone(t.borders) && !isNone(borders)) {
                var height = t.parentSprite.height;
                var width = t.parentSprite.width;
                var x = t.parentSprite.offsetX;
                var y = t.parentSprite.offsetY;
                t.bmd = game.add.bitmapData(width, height);
                t.sprite = game.add.sprite(x, y, t.bmd);
                t.parentSprite.addChild(t.sprite);
            }
            // set border state
            t.borders = borders;
            // draw the border
            t.bmd.clear();
            var fillEdge = 0;
            for (var _i = 0, borders_1 = borders; _i < borders_1.length; _i++) {
                var border = borders_1[_i];
                // outline the border
                switch (border) {
                    case Type.None: break;
                    case Type.Outline:
                        Bmd.border(t.bmd, Color.S.Black, fillEdge, 1);
                        fillEdge += 1;
                        break;
                    case Type.Select:
                        Bmd.border(t.bmd, Color.S.Blue_Hilite, fillEdge, 4);
                        fillEdge += 4;
                        break;
                    case Type.Good:
                        Bmd.border(t.bmd, Color.S.Green_Good, fillEdge, 4);
                        fillEdge += 4;
                        break;
                    default: throw new TypeError("Unhandled border type");
                }
            }
            // clear out inside
            Bmd.clear(t.bmd, fillEdge);
        }
        Border.toggleMany = toggleMany;
        /** Whether the borders combination is valid. */
        function isValid(borders) {
            if (borders.length !== 1 && Arr.contains(borders, Type.None))
                return false;
            return true;
        }
        /** Whether the borders array is none. */
        function isNone(borders) {
            return (borders.length === 1) && (borders[0] === Type.None);
        }
    })(Border = AcquirePhaser.Border || (AcquirePhaser.Border = {}));
    /** A popup window. */
    var Popup;
    (function (Popup) {
        /** The state of the popup. */
        var State;
        (function (State) {
            State[State["Open"] = 0] = "Open";
            State[State["Closed"] = 1] = "Closed";
        })(State = Popup.State || (Popup.State = {}));
        var T = /** @class */ (function () {
            function T(drawFn) {
                this.drawFn = drawFn;
                this.state = State.Closed;
                this.sprite = undefined;
                this.bmd = undefined;
            }
            return T;
        }());
        Popup.T = T;
        /** Toggle the creation, deletion, or redrawing of a popup. */
        function toggle(t, game, server, state, height, width, x, y) {
            if (t.state === State.Closed && state === State.Closed) {
                // do nothing
            }
            else if (t.state === State.Closed && state === State.Open) {
                // create and draw popup
                t.bmd = game.add.bitmapData(width, height);
                t.sprite = game.add.sprite(x, y, t.bmd);
                t.drawFn(server, t.bmd, t.sprite);
                // toggle border
                t.border = new Border.T(t.sprite);
                Border.toggle(t.border, game, Border.Type.Select);
                // enable input
                t.sprite.inputEnabled = true;
                t.sprite.events.onInputOver.add(function () { return AcquirePhaser.Render.enable(game); });
                t.sprite.events.onInputOut.add(function () { return AcquirePhaser.Render.enable(game); });
                t.sprite.events.onInputDown.add(function () { return toggle(t, game, server, State.Closed, height, width, x, y); });
            }
            else if (t.state === State.Open && state === State.Closed) {
                // clear border
                Border.toggle(t.border, game, Border.Type.None);
                // clear and cleanup the popup
                t.sprite.destroy();
                t.sprite = undefined;
                t.bmd = undefined;
            }
            else if (t.state === State.Open && state === State.Open) {
                // redraw the popup using server (in case it changed)
                t.drawFn(server, t.bmd, t.sprite);
            }
            t.state = state;
        }
        Popup.toggle = toggle;
    })(Popup || (Popup = {}));
    /** TilePile icon */
    var TilePile;
    (function (TilePile) {
        var T = /** @class */ (function () {
            function T(game, height, width, x, y) {
                this.bmd = game.add.bitmapData(width, height);
                this.sprite = game.add.sprite(x, y, this.bmd);
                this.border = new Border.T(this.sprite);
                Border.toggle(this.border, game, Border.Type.Outline);
            }
            return T;
        }());
        TilePile.T = T;
        /** Draw a pile of tiles with the specified amount. */
        function draw(t, game, amountFn) {
            t.bmd.clear();
            Bmd.fill(t.bmd, Color.S.Black, 0);
            Bmd.tileText(t.bmd, amountFn().toString(), Color.S.White);
        }
        TilePile.draw = draw;
    })(TilePile = AcquirePhaser.TilePile || (AcquirePhaser.TilePile = {}));
    /** Stock icon. */
    var Stock;
    (function (Stock) {
        var T = /** @class */ (function () {
            function T(game, hotelId, height, width, x, y) {
                this.hotelId = hotelId;
                // image
                this.imageSprite = game.add.sprite(x, y, Image.stockOf(hotelId));
                this.imageSprite.height = height;
                this.imageSprite.width = width;
                // shadow
                this.shadowBmd = game.add.bitmapData(width, height);
                this.shadowSprite = game.add.sprite(x, y, this.shadowBmd);
                this.shadowSprite.alpha = 0.6;
                // text
                this.bmd = game.add.bitmapData(width, height);
                this.sprite = game.add.sprite(x, y, this.bmd);
                this.border = new Border.T(this.sprite);
            }
            return T;
        }());
        Stock.T = T;
        /** Draw the stock. */
        function draw(t, stockAmountFn) {
            var amount = stockAmountFn(t.hotelId);
            t.bmd.clear();
            t.shadowBmd.clear();
            if (amount === 0) {
                Bmd.fill(t.bmd, Color.S.White, 0);
            }
            else {
                Bmd.fillRect(t.shadowBmd, Color.S.Black, 20, 20);
                Bmd.stockText(t.bmd, amount.toString());
            }
        }
        Stock.draw = draw;
        /** Destroy the stock sprites. */
        function destroy(t) {
            t.imageSprite.destroy();
            t.sprite.destroy();
            t.shadowSprite.destroy();
        }
        Stock.destroy = destroy;
    })(Stock = AcquirePhaser.Stock || (AcquirePhaser.Stock = {}));
    /*
     * Major Acquire GUI Elements
     * --------------------------
     */
    /** Summary of the state of the players in the game and the bank. */
    var Players;
    (function (Players) {
        var T = /** @class */ (function () {
            function T(server, game) {
                var _this = this;
                this.players = {};
                var players = AcquireServer.players(server);
                var sortedPlayerIds = players.map(function (p) { return p.id; }).sort();
                var numberPlayers = sortedPlayerIds.length + 1; // + bank
                var height = Size.Players.height(game) / numberPlayers;
                var width = Size.Players.width(game);
                var x = Offset.Players.x(game);
                var y = Offset.Players.y(game);
                var bankWidth = width * (2. / 6.);
                var playerWidth = width * (1. / 6.);
                var moneyWidth = width * (1. / 6.);
                var handWidth = width * (1. / 8.);
                var stockWidth = width - playerWidth - moneyWidth - handWidth;
                this.bank = new Bank.T(server, game, height, width, x, y, bankWidth, handWidth, stockWidth);
                players.forEach(function (player) {
                    return _this.players[player.id] = new Player.T(server, game, player.id, sortedPlayerIds, height, width, x, y, playerWidth, moneyWidth, handWidth, stockWidth);
                });
            }
            return T;
        }());
        Players.T = T;
        /** Draw all the players. */
        function draw(t, server, game) {
            // bank
            Bank.draw(t.bank, server, game);
            // players
            Object.keys(t.players)
                .map(function (id) { return t.players[id]; })
                .forEach(function (t) { return Player.draw(t, server, game); });
        }
        Players.draw = draw;
        /** The bank. */
        var Bank;
        (function (Bank) {
            var T = /** @class */ (function () {
                function T(server, game, height, width, x, y, playerWidth, handWidth, stockWidth) {
                    var _this = this;
                    this.stocks = {};
                    // player
                    this.bmd = game.add.bitmapData(playerWidth, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                    // hand
                    this.drawPile = new TilePile.T(game, height, handWidth, x + playerWidth, y);
                    // stocks
                    AcquireServer.hotels(server).forEach(function (hotel) {
                        var sHeight = height;
                        var sWidth = stockWidth / Hotels.HOTELS_WIDTH;
                        var sX = x + playerWidth + handWidth + Hotels.idToX(hotel.id) * sWidth;
                        var sY = y;
                        _this.stocks[hotel.id] = new Stock.T(game, hotel.id, sHeight, sWidth, sX, sY);
                    });
                    this.border = new Border.T(this.sprite);
                }
                return T;
            }());
            Bank.T = T;
            /** Draw the bank icon. */
            function draw(t, server, game) {
                var bank = AcquireServer.bank(server);
                t.bmd.clear();
                Bmd.fill(t.bmd, Color.S.White, 0);
                // bank name
                Bmd.playerText(t.bmd, "Bank");
                // bank draw pile
                TilePile.draw(t.drawPile, game, function () { return bank.draw_pile_size; });
                // bank stocks
                Object.keys(t.stocks)
                    .map(function (id) { return t.stocks[id]; })
                    .forEach(function (stock) { return Stock.draw(stock, function (id) { return bank.stocks[id]; }); });
            }
            Bank.draw = draw;
        })(Bank || (Bank = {}));
        /** Player icon. */
        var Player;
        (function (Player) {
            var T = /** @class */ (function () {
                function T(server, game, id, sortedPlayerIds, height, width, x, y, playerWidth, moneyWidth, handWidth, stockWidth) {
                    var _this = this;
                    this.id = id;
                    this.stocks = {};
                    this.idToY = createIdToYFn(sortedPlayerIds);
                    var playerY = y + (this.idToY(id) + 1) * height;
                    // player
                    this.nameBmd = game.add.bitmapData(playerWidth, height);
                    this.nameSprite = game.add.sprite(x, playerY, this.nameBmd);
                    // money
                    this.moneyBmd = game.add.bitmapData(moneyWidth, height);
                    this.moneySprite = game.add.sprite(x + playerWidth, playerY, this.moneyBmd);
                    // hand
                    this.hand = new TilePile.T(game, height, handWidth, x + playerWidth + moneyWidth, playerY);
                    // stocks
                    AcquireServer.hotels(server).forEach(function (hotel) {
                        var sHeight = height;
                        var sWidth = stockWidth / Hotels.HOTELS_WIDTH;
                        var sX = x + playerWidth + moneyWidth + handWidth + Hotels.idToX(hotel.id) * sWidth;
                        var sY = playerY;
                        _this.stocks[hotel.id] = new Stock.T(game, hotel.id, sHeight, sWidth, sX, sY);
                    });
                    this.popup = new Popup.T(createPopupDrawFn(id));
                    this.border = new Border.T(this.nameSprite);
                    this.nameSprite.inputEnabled = true;
                    this.nameSprite.events.onInputOver.add(function () { return AcquirePhaser.Render.enable(game); });
                    this.nameSprite.events.onInputOut.add(function () { return AcquirePhaser.Render.enable(game); });
                    this.nameSprite.events.onInputOver.add(function () { return Border.toggle(_this.border, game, Border.Type.Select); });
                    this.nameSprite.events.onInputOut.add(function () { return Border.toggle(_this.border, game, Border.Type.None); });
                }
                return T;
            }());
            Player.T = T;
            /** Partially apply arguments executing the popup toggle. */
            function applyPopupToggle(popup, game) {
                var width = Size.Board.width(game) / 3;
                var height = Size.Board.height(game) + Size.Hotel.height(game);
                var x = Math.min(Math.max(0, game.input.activePointer.worldX - width / 2), game.width - width);
                var y = game.input.activePointer.worldY;
                return function (server, state) {
                    return Popup.toggle(popup, game, server, state, height, width, x, y);
                };
            }
            /** Draw the player icon. */
            function draw(t, server, game) {
                if (t.popup.state === Popup.State.Open) {
                    applyPopupToggle(t.popup, game)(server, Popup.State.Open);
                }
                t.nameSprite.events.onInputDown.removeAll();
                t.nameSprite.events.onInputDown.add(function () {
                    applyPopupToggle(t.popup, game)(server, Popup.State.Open);
                    Border.toggle(t.border, game, Border.Type.None);
                });
                var player = AcquireServer.player(server, t.id);
                var hotels = AcquireServer.hotels(server);
                t.nameBmd.clear();
                t.moneyBmd.clear();
                Bmd.fill(t.nameBmd, Color.S.White, 0);
                Bmd.fill(t.moneyBmd, Color.S.White, 0);
                // player name
                Bmd.playerText(t.nameBmd, Str.capitalize(player.id));
                // player money
                Bmd.playerText(t.moneyBmd, Num.moneyStr(player.money));
                // player hand tiles
                TilePile.draw(t.hand, game, function () { return player.tiles.length; });
                // player stocks
                Object.keys(t.stocks)
                    .map(function (id) { return t.stocks[id]; })
                    .forEach(function (stock) { return Stock.draw(stock, function (id) { return player.stocks[id]; }); });
            }
            Player.draw = draw;
            /** Create the draw function to draw the player popup. */
            function createPopupDrawFn(id) {
                return function (server, bmd, sprite) {
                    var player = AcquireServer.player(server, id);
                    var players = AcquireServer.players(server);
                    var hotels = AcquireServer.hotels(server);
                    var stocks = hotels.map(function (h) { return h.id; }).filter(function (id) { return player.stocks[id] > 0; });
                    // net worth
                    var netWorthLines = [];
                    // let netWorth = player.money
                    // for (let hotelId of stocks) {
                    //     let hotelWorth = hotelAssets(server, id, hotelId)
                    //     netWorth += hotelWorth
                    //     netWorthLines.push(Num.moneyStr(hotelWorth) + " from " + Str.capitalize(hotelId))
                    // }
                    // netWorthLines.push(Num.moneyStr(netWorth) + " net worth")
                    // netWorthLines.reverse() // overall net worth at the top
                    // share holder
                    var shareHolderLines = [];
                    for (var _i = 0, stocks_1 = stocks; _i < stocks_1.length; _i++) {
                        var hotelId = stocks_1[_i];
                        var shareHolder = shareHolderStatus(server, id, hotelId);
                        switch (shareHolder[0]) {
                            case Shareholder.Both:
                                shareHolderLines.push(Str.capitalize(hotelId) + " both");
                                break;
                            case Shareholder.Majority:
                                shareHolderLines.push(Str.capitalize(hotelId) + " majority");
                                break;
                            case Shareholder.TiedBoth:
                                shareHolderLines.push(Str.capitalize(hotelId) + " both with " + shareHolder[1]);
                                break;
                            case Shareholder.Minority:
                                shareHolderLines.push(Str.capitalize(hotelId) + " minority");
                                break;
                            case Shareholder.TiedMinority:
                                shareHolderLines.push(Str.capitalize(hotelId) + " minority with " + shareHolder[1]);
                                break;
                            case Shareholder.None: break;
                            default: throw new TypeError("Unhandled ShareHolder type");
                        }
                    }
                    // draw
                    bmd.clear();
                    Bmd.fill(bmd, Color.S.White, 0);
                    Bmd.playerPopupText(bmd, Str.capitalize(player.id), [
                        "",
                        Num.moneyStr(player.money) + " cash",
                        "",
                    ].concat(netWorthLines)
                        .concat([""])
                        .concat(shareHolderLines));
                };
            }
            /** Possible shareholder statuses. */
            var Shareholder;
            (function (Shareholder) {
                Shareholder[Shareholder["Both"] = 0] = "Both";
                Shareholder[Shareholder["Majority"] = 1] = "Majority";
                Shareholder[Shareholder["TiedBoth"] = 2] = "TiedBoth";
                Shareholder[Shareholder["Minority"] = 3] = "Minority";
                Shareholder[Shareholder["TiedMinority"] = 4] = "TiedMinority";
                Shareholder[Shareholder["None"] = 5] = "None";
            })(Shareholder || (Shareholder = {}));
            /** Return the share holder status of player in hotel and the number of other players with that status. */
            function shareHolderStatus(server, playerId, hotelId) {
                var playerStock = AcquireServer.player(server, playerId).stocks[hotelId];
                if (playerStock === 0) {
                    return [Shareholder.None, 0];
                }
                var playersAbove = 0;
                var playersBelow = 0;
                var playersTied = 0;
                for (var _i = 0, _a = AcquireServer.players(server); _i < _a.length; _i++) {
                    var player = _a[_i];
                    if (player.id === playerId)
                        continue;
                    if (player.stocks[hotelId] > playerStock)
                        playersAbove += 1;
                    else if (player.stocks[hotelId] < playerStock)
                        playersBelow += 1;
                    else
                        playersTied += 1;
                }
                if (playersAbove === 0 && playersBelow === 0 && playersTied === 0)
                    return [Shareholder.Both, 0];
                if (playersAbove === 0 && playersBelow >= 0 && playersTied > 0)
                    return [Shareholder.TiedBoth, playersTied];
                if (playersAbove === 0 && playersBelow > 0 && playersTied === 0)
                    return [Shareholder.Majority, 0];
                if (playersAbove === 1 && playersTied === 0)
                    return [Shareholder.Minority, 0];
                if (playersAbove === 1 && playersTied > 0)
                    return [Shareholder.TiedMinority, playersTied];
                return [Shareholder.None, 0];
            }
            /** Return the worth of hotel assets for player - includes share holder bonuses. */
            function hotelAssets(server, playerId, hotelId) {
                var player = AcquireServer.player(server, playerId);
                var hotel = AcquireServer.hotel(server, hotelId);
                var shareHolder = shareHolderStatus(server, playerId, hotelId);
                var stockWorth = player.stocks[hotelId] * hotel.stock_price;
                var bonusWorth = 0;
                switch (shareHolder[0]) {
                    case Shareholder.Both:
                        bonusWorth += hotel.majority_bonus + hotel.minority_bonus;
                        break;
                    case Shareholder.Majority:
                        bonusWorth += hotel.majority_bonus;
                        break;
                    case Shareholder.TiedBoth:
                        bonusWorth += (hotel.majority_bonus + hotel.minority_bonus) / shareHolder[1];
                        break;
                    case Shareholder.Minority:
                        bonusWorth += hotel.minority_bonus;
                        break;
                    case Shareholder.TiedMinority:
                        bonusWorth += hotel.minority_bonus / shareHolder[1];
                        break;
                    case Shareholder.None: break;
                    default: throw new TypeError("Unhandled ShareHolder type");
                }
                return stockWorth + bonusWorth;
            }
            /* Create a function to convert a player id into its y coordinate. */
            function createIdToYFn(sortedPlayerIds) {
                return function (id) { return sortedPlayerIds.indexOf(id); };
            }
        })(Player || (Player = {}));
    })(Players = AcquirePhaser.Players || (AcquirePhaser.Players = {}));
    /** Acquire game State Machine state. */
    var Status;
    (function (Status) {
        var T = /** @class */ (function () {
            function T(game) {
                var height = Size.Status.height(game);
                var width = Size.Status.width(game);
                var x = Offset.Status.x(game);
                var y = Offset.Status.y(game);
                var smHeight = height * (1. / 3.);
                var responseHeight = height - smHeight;
                this.stateMachine = new StateMachine.T(game, smHeight, width, x, y);
                this.response = new Response.T(game, responseHeight, width, x, y + smHeight);
            }
            return T;
        }());
        Status.T = T;
        /** Draw the status window. */
        function draw(t, server, game) {
            // statemachine
            StateMachine.draw(t.stateMachine, server, game);
            // response
            Response.draw(t.response, server);
        }
        Status.draw = draw;
        /** Response to the previous action. */
        var Response;
        (function (Response) {
            var T = /** @class */ (function () {
                function T(game, height, width, x, y) {
                    this.bmd = game.add.bitmapData(width, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                }
                return T;
            }());
            Response.T = T;
            /** draw the previous action response. */
            function draw(t, server) {
                var response = AcquireServer.response(server);
                t.bmd.clear();
                Bmd.fill(t.bmd, Color.S.White, 0);
                Bmd.responseText(t.bmd, response.message);
            }
            Response.draw = draw;
            /** Draw the specified text. */
            function drawText(t, message) {
                t.bmd.clear();
                Bmd.fill(t.bmd, Color.S.Yellow_Light, 0);
                Bmd.responseText(t.bmd, message);
            }
            Response.drawText = drawText;
        })(Response = Status.Response || (Status.Response = {}));
        /** State of the game. */
        var StateMachine;
        (function (StateMachine) {
            var T = /** @class */ (function () {
                function T(game, height, width, x, y) {
                    var _this = this;
                    this.bmd = game.add.bitmapData(width, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                    this.popup = new Popup.T(createPopupDrawFn(game));
                    this.border = new Border.T(this.sprite);
                    this.sprite.inputEnabled = true;
                    this.sprite.events.onInputOver.add(function () { return AcquirePhaser.Render.enable(game); });
                    this.sprite.events.onInputOut.add(function () { return AcquirePhaser.Render.enable(game); });
                    this.sprite.events.onInputOver.add(function () { return Border.toggle(_this.border, game, Border.Type.Select); });
                    this.sprite.events.onInputOut.add(function () { return Border.toggle(_this.border, game, Border.Type.None); });
                }
                return T;
            }());
            StateMachine.T = T;
            /** Partially apply arguments executing the popup toggle. */
            function applyPopupToggle(popup, game) {
                var width = Size.Board.width(game) / 2;
                var height = Size.Board.height(game) + Size.Hotel.height(game) + Size.Status.height(game) / 2;
                var x = Math.min(Math.max(0, game.input.activePointer.worldX - width / 2), game.width - width);
                var y = game.input.activePointer.worldY;
                return function (server, state) {
                    return Popup.toggle(popup, game, server, state, height, width, x, y);
                };
            }
            /** Draw the basic SM state. */
            function draw(t, server, game) {
                if (t.popup.state === Popup.State.Open) {
                    applyPopupToggle(t.popup, game)(server, Popup.State.Open);
                }
                t.sprite.events.onInputDown.removeAll();
                t.sprite.events.onInputDown.add(function () {
                    applyPopupToggle(t.popup, game)(server, Popup.State.Open);
                    Border.toggle(t.border, game, Border.Type.None);
                });
                var sm = AcquireServer.smState(server);
                t.bmd.clear();
                // draw basic sm state
                switch (sm.state) {
                    case AcquireServer.SmStateType.DrawTurnTile:
                        Bmd.smText(t.bmd, "Draw tile for turn order");
                        break;
                    case AcquireServer.SmStateType.PlaceTurnTile:
                        Bmd.smText(t.bmd, "Place turn order tile");
                        break;
                    case AcquireServer.SmStateType.DrawInitialTiles:
                        Bmd.smText(t.bmd, "Draw 6 tiles for hand");
                        break;
                    case AcquireServer.SmStateType.PlaceTile:
                        Bmd.smText(t.bmd, "Place tile", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.StartHotel:
                        Bmd.smText(t.bmd, "Start hotel", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.FoundersStock:
                        Bmd.smText(t.bmd, "Receive founding stock", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.BuyStock:
                        Bmd.smText(t.bmd, "Buy stock", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.DrawTile:
                        Bmd.smText(t.bmd, "Draw tile", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.EndGamePayout:
                        Bmd.smText(t.bmd, "Payout total assets");
                        break;
                    case AcquireServer.SmStateType.GameOver:
                        Bmd.smText(t.bmd, "Game Over", [Str.capitalize(sm.player_results[0]) + " wins!"]);
                        break;
                    case AcquireServer.SmStateType.ChooseSurvivingHotel:
                        Bmd.smText(t.bmd, "Choose hotel to survive merger", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.ChooseDefunctHotel:
                        Bmd.smText(t.bmd, "Choose next hotel to defunct", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.PayBonuses:
                        Bmd.smText(t.bmd, "Payout shareholder bonuses", [Str.capitalize(sm.current_player)]);
                        break;
                    case AcquireServer.SmStateType.HandleDefunctHotelStocks:
                        Bmd.smText(t.bmd, "Handle defunct stocks", [Str.capitalize(sm.players_with_stock[0])]);
                        break;
                    default: throw new TypeError("Unhandled SM state type");
                }
            }
            StateMachine.draw = draw;
            /** Create the draw function to draw the detailed SM state popup. */
            function createPopupDrawFn(game) {
                return function (server, bmd, sprite) {
                    var sm = AcquireServer.smState(server);
                    bmd.clear();
                    Bmd.fill(bmd, Color.S.White, 0);
                    // add a stock information card
                    var informationCard = game.add.image(0, sprite.height / 2, Image.informationCard);
                    informationCard.width = sprite.width;
                    informationCard.height = sprite.height / 2;
                    sprite.addChild(informationCard);
                    // draw details of sm state
                    switch (sm.state) {
                        case AcquireServer.SmStateType.DrawTurnTile:
                            var drawnTileLines = [];
                            if (sm.players_drawn.length === 0)
                                drawnTileLines = ["No one has drawn tiles"];
                            else
                                drawnTileLines = sm.players_drawn.map(function (id, index) { return Str.capitalize(id) + " has drawn a tile"; });
                            Bmd.smPopupText(bmd, "Draw tile for turn order", [
                                "",
                            ].concat(drawnTileLines));
                            break;
                        case AcquireServer.SmStateType.PlaceTurnTile:
                            var placedTileLines = [];
                            if (sm.players_placed.length === 0)
                                placedTileLines = ["No one has placed their tile"];
                            else
                                placedTileLines = sm.players_placed.map(function (o, index) { return Str.capitalize(o.player) + " placed tile " + o.tile; });
                            Bmd.smPopupText(bmd, "Place turn order tile", [
                                "",
                            ].concat(placedTileLines));
                            break;
                        case AcquireServer.SmStateType.DrawInitialTiles:
                            drawnTileLines = [];
                            if (sm.players_drawn.length === 0)
                                drawnTileLines = ["No one has drawn their hand"];
                            else
                                drawnTileLines = sm.players_drawn.map(function (id, index) { return Str.capitalize(id) + " has drawn their hand"; });
                            Bmd.smPopupText(bmd, "Draw 6 tiles for hand", [
                                "",
                            ].concat(drawnTileLines));
                            break;
                        case AcquireServer.SmStateType.PlaceTile:
                            Bmd.smPopupText(bmd, "Place tile", [
                                Str.capitalize(sm.current_player),
                            ]);
                            break;
                        case AcquireServer.SmStateType.StartHotel:
                            Bmd.smPopupText(bmd, "Start hotel", [
                                Str.capitalize(sm.current_player),
                                "",
                                "Starting Tiles",
                                sm.tiles.toString(),
                            ]);
                            break;
                        case AcquireServer.SmStateType.FoundersStock:
                            Bmd.smPopupText(bmd, "Receive founding stock", [
                                Str.capitalize(sm.current_player),
                                "",
                                "For founding " + Str.capitalize(sm.started_hotel),
                            ]);
                            break;
                        case AcquireServer.SmStateType.BuyStock:
                            Bmd.smPopupText(bmd, "Buy stock", [
                                Str.capitalize(sm.current_player),
                            ]);
                            break;
                        case AcquireServer.SmStateType.DrawTile:
                            Bmd.smPopupText(bmd, "Draw tile", [
                                Str.capitalize(sm.current_player),
                            ]);
                            break;
                        case AcquireServer.SmStateType.EndGamePayout:
                            var paidLines = sm.players_paid.map(function (id) { return Str.capitalize(id) + " has been paid"; });
                            Bmd.smPopupText(bmd, "Payout total assets", [
                                "",
                            ].concat(paidLines));
                            break;
                        case AcquireServer.SmStateType.GameOver:
                            var players = sm.player_results.map(function (id) { return AcquireServer.player(server, id); })
                                .map(function (p) { return Num.moneyStr(p.money) + " for " + Str.capitalize(p.id); });
                            Bmd.smPopupText(bmd, "Game Over", [
                                Str.capitalize(sm.player_results[0]) + " wins!",
                                "",
                            ].concat(Str.padEndAll(players)));
                            break;
                        case AcquireServer.SmStateType.ChooseSurvivingHotel:
                            Bmd.smPopupText(bmd, "Choose hotel to survive merger", [
                                Str.capitalize(sm.current_player),
                                "",
                                "Potential Hotels",
                                sm.potential_surviving_hotels.map(function (h) { return Str.capitalize(h); }).toString(),
                            ]);
                            break;
                        case AcquireServer.SmStateType.ChooseDefunctHotel:
                            var remainingHotels = [];
                            if (sm.remaining_hotels.length !== 0) {
                                remainingHotels = ["",
                                    "Remaining Hotels",
                                    sm.remaining_hotels.map(function (h) { return Str.capitalize(h); }).toString()];
                            }
                            Bmd.smPopupText(bmd, "Choose next hotel to defunct", [
                                Str.capitalize(sm.current_player),
                                "",
                                "Merging into " + Str.capitalize(sm.surviving_hotel),
                                "",
                                "Potential Hotels",
                                sm.potential_next_defunct_hotels.map(function (h) { return Str.capitalize(h); }).toString(),
                            ].concat(remainingHotels));
                            break;
                        case AcquireServer.SmStateType.PayBonuses:
                            var payLines = sm.players_to_pay.map(function (o, index) { return Num.moneyStr(o.amount) + " to " + Str.capitalize(o.player); });
                            remainingHotels = [];
                            if (sm.remaining_hotels.length !== 0) {
                                remainingHotels = ["",
                                    "Remaining Hotels",
                                    sm.remaining_hotels.map(function (h) { return Str.capitalize(h); }).toString()];
                            }
                            Bmd.smPopupText(bmd, "Payout shareholder bonuses", [
                                Str.capitalize(sm.current_player),
                                "",
                                "Merging " + Str.capitalize(sm.defunct_hotel) + " into " + Str.capitalize(sm.surviving_hotel),
                                "",
                                "Players to Pay",
                            ].concat(payLines)
                                .concat(remainingHotels));
                            break;
                        case AcquireServer.SmStateType.HandleDefunctHotelStocks:
                            remainingHotels = [];
                            if (sm.remaining_hotels.length !== 0) {
                                remainingHotels = ["",
                                    "Remaining Hotels",
                                    sm.remaining_hotels.map(function (h) { return Str.capitalize(h); }).toString()];
                            }
                            Bmd.smPopupText(bmd, "Handle defunct stocks", [
                                Str.capitalize(sm.players_with_stock[0]),
                                "",
                                "Merging " + Str.capitalize(sm.defunct_hotel) + " into " + Str.capitalize(sm.surviving_hotel),
                                "",
                                "Players with Stock",
                                sm.players_with_stock.map(function (p) { return Str.capitalize(p); }).toString(),
                            ].concat(remainingHotels));
                            break;
                        default: throw new TypeError("Unhandled SM state type");
                    }
                };
            }
        })(StateMachine || (StateMachine = {}));
    })(Status = AcquirePhaser.Status || (AcquirePhaser.Status = {}));
    /** Hotel icons. */
    var Hotels;
    (function (Hotels) {
        var T = /** @class */ (function () {
            function T(server, game) {
                var _this = this;
                this.hotels = {};
                AcquireServer.hotels(server).forEach(function (hotel) {
                    return _this.hotels[hotel.id] = new Hotel.T(game, hotel.id);
                });
            }
            return T;
        }());
        Hotels.T = T;
        /** Draw the hotels. */
        function draw(t, server, game) {
            Object.keys(t.hotels)
                .map(function (id) { return t.hotels[id]; })
                .forEach(function (t) { return Hotel.draw(t, server, game); });
        }
        Hotels.draw = draw;
        /** Number of hotels to span. */
        Hotels.HOTELS_WIDTH = 7;
        /** Convert a hotel id into its x coordinate. */
        function idToX(id) {
            switch (id) {
                case AcquireServer.HotelId.American: return 2;
                case AcquireServer.HotelId.Continental: return 5;
                case AcquireServer.HotelId.Festival: return 3;
                case AcquireServer.HotelId.Imperial: return 6;
                case AcquireServer.HotelId.Luxor: return 0;
                case AcquireServer.HotelId.Tower: return 1;
                case AcquireServer.HotelId.Worldwide: return 4;
                default: throw new TypeError("Unhandled hotel id");
            }
        }
        Hotels.idToX = idToX;
        /** Hotel icon. */
        var Hotel;
        (function (Hotel) {
            var T = /** @class */ (function () {
                function T(game, id) {
                    var _this = this;
                    this.id = id;
                    var height = Size.Hotel.height(game);
                    var width = Size.Hotel.width(game) / Hotels.HOTELS_WIDTH;
                    var x = Offset.Hotel.x(game) + idToX(id) * width;
                    var y = Offset.Hotel.y(game);
                    this.bmd = game.add.bitmapData(width, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                    this.popup = new Popup.T(createPopupDrawFn(id));
                    this.border = new Border.T(this.sprite);
                    Border.toggle(this.border, game, Border.Type.Outline);
                    this.sprite.inputEnabled = true;
                    this.sprite.events.onInputOver.add(function () { return AcquirePhaser.Render.enable(game); });
                    this.sprite.events.onInputOut.add(function () { return AcquirePhaser.Render.enable(game); });
                    this.sprite.events.onInputOver.add(function () { return Border.toggleMany(_this.border, game, [Border.Type.Outline, Border.Type.Select]); });
                    this.sprite.events.onInputOut.add(function () { return Border.toggle(_this.border, game, Border.Type.Outline); });
                }
                return T;
            }());
            Hotel.T = T;
            /** Partially apply arguments executing the popup toggle. */
            function applyPopupToggle(popup, game) {
                var width = Size.Board.width(game) / 4;
                var height = Size.Board.height(game);
                var x = Math.min(Math.max(0, game.input.activePointer.worldX - width / 2), game.width - width);
                var y = game.input.activePointer.worldY;
                return function (server, state) {
                    return Popup.toggle(popup, game, server, state, height, width, x, y);
                };
            }
            /** Draw the hotel and the hotel popup. */
            function draw(t, server, game) {
                if (t.popup.state === Popup.State.Open) {
                    applyPopupToggle(t.popup, game)(server, Popup.State.Open);
                }
                t.sprite.events.onInputDown.removeAll();
                t.sprite.events.onInputDown.add(function () {
                    applyPopupToggle(t.popup, game)(server, Popup.State.Open);
                    Border.toggle(t.border, game, Border.Type.None);
                });
                var hotel = AcquireServer.hotel(server, t.id);
                t.bmd.clear();
                // draw hotel based on state
                switch (hotel.state.type) {
                    case AcquireServer.HotelStateType.Available:
                        // write hotel id
                        Bmd.fill(t.bmd, Color.colorOf(hotel.id), 0);
                        Bmd.hotelText(t.bmd, Str.capitalize(t.id));
                        break;
                    case AcquireServer.HotelStateType.OnBoard:
                        // write hotel id and stock price
                        Bmd.fill(t.bmd, Color.colorOf(hotel.id), 0);
                        Bmd.hotelText(t.bmd, Str.capitalize(t.id), [
                            Num.moneyStr(hotel.stock_price)
                        ]);
                        break;
                    default: throw new TypeError("Unhandled hotel state type");
                }
            }
            Hotel.draw = draw;
            /** Create the draw function to draw the hotel popup. */
            function createPopupDrawFn(id) {
                return function (server, bmd, sprite) {
                    var hotel = AcquireServer.hotel(server, id);
                    // put together hotel stock info
                    var bank = AcquireServer.bank(server);
                    var playersWithStock = AcquireServer.players(server)
                        .filter(function (p) { return p.stocks[hotel.id] > 0; })
                        .sort(function (p1, p2) { return p1.stocks[hotel.id] - p2.stocks[hotel.id]; });
                    // stocks
                    var playerStockTextLines = playersWithStock.map(function (p) { return Num.padStock(p.stocks[hotel.id]) + " " + Str.capitalize(p.id); });
                    playerStockTextLines.push(Num.padStock(bank.stocks[hotel.id]) + " in Bank");
                    var stockTextLines = Str.padEndAll(playerStockTextLines);
                    stockTextLines.push("Stocks");
                    stockTextLines.reverse(); // most stock -> least stock
                    bmd.clear();
                    switch (hotel.state.type) {
                        case AcquireServer.HotelStateType.Available:
                            // hotel id and denote availability
                            Bmd.fill(bmd, Color.colorOf(hotel.id), 0);
                            Bmd.hotelPopupText(bmd, Str.capitalize(id), [
                                "",
                                "Available",
                                ""
                            ].concat(stockTextLines));
                            break;
                        case AcquireServer.HotelStateType.OnBoard:
                            // safe or end game size
                            var safeEndSizeLines = [];
                            if (hotel.is_end_game_size) {
                                safeEndSizeLines.push("");
                                safeEndSizeLines.push("End Game");
                            }
                            else if (hotel.is_safe) {
                                safeEndSizeLines.push("");
                                safeEndSizeLines.push("Safe");
                            }
                            // hotel info
                            var hotelInfo = [hotel.state.tiles.length + " tiles",
                                Num.moneyStr(hotel.stock_price) + " per stock",
                                "",
                                Num.moneyStr(hotel.majority_bonus) + " majority",
                                Num.moneyStr(hotel.minority_bonus) + " minority",
                            ];
                            // hotel id, denote size state, monetary state, and player stock state
                            Bmd.fill(bmd, Color.colorOf(hotel.id), 0);
                            Bmd.hotelPopupText(bmd, Str.capitalize(id), safeEndSizeLines
                                .concat([""])
                                .concat(hotelInfo)
                                .concat([""])
                                .concat(stockTextLines));
                            break;
                        default: throw new TypeError("Unhandled hotel state type");
                    }
                };
            }
        })(Hotel = Hotels.Hotel || (Hotels.Hotel = {}));
    })(Hotels = AcquirePhaser.Hotels || (AcquirePhaser.Hotels = {}));
    /** GUI for the Board. */
    var Board;
    (function (Board) {
        var T = /** @class */ (function () {
            function T(server, game) {
                var _this = this;
                this.tiles = {};
                AcquireServer.tiles(server).forEach(function (tile) {
                    return _this.tiles[tile.id] = new Tile.T(server, game, tile.id);
                });
            }
            return T;
        }());
        Board.T = T;
        /** Draw the board. */
        function draw(t, server) {
            Object.keys(t.tiles)
                .map(function (id) { return t.tiles[id]; })
                .forEach(function (t) { return Tile.draw(t, server); });
        }
        Board.draw = draw;
        /* 1 ... 12
         * .
         * 9      */
        var TILES_HEIGHT = 9;
        var TILES_WIDTH = 12;
        /** Convert a tile id into (x, y) coordinates. */
        function idToXY(id) {
            var split = id.split("-");
            var y = Number(split[0]) - 1;
            var x = split[1].charCodeAt(0) - 65;
            return [x, y];
        }
        /** Tile on the board. */
        var Tile;
        (function (Tile) {
            var T = /** @class */ (function () {
                function T(server, game, id) {
                    this.id = id;
                    var height = Size.Board.height(game) / TILES_HEIGHT;
                    var width = Size.Board.width(game) / TILES_WIDTH;
                    var x = Offset.Board.x(game) + idToXY(id)[1] * width;
                    var y = Offset.Board.y(game) + idToXY(id)[0] * height;
                    this.bmd = game.add.bitmapData(width, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                    this.border = new Border.T(this.sprite);
                    Border.toggle(this.border, game, Border.Type.Outline);
                }
                return T;
            }());
            Tile.T = T;
            /** Draw the board tile. */
            function draw(t, server) {
                var tile = AcquireServer.tile(server, t.id);
                t.bmd.clear();
                // draw based on tile state
                switch (tile.state.type) {
                    case AcquireServer.TileStateType.Discarded:
                        // fill tile light red
                        Bmd.fill(t.bmd, Color.S.Red_Light, 0);
                        Bmd.tileText(t.bmd, tile.id, Color.S.Black);
                        break;
                    case AcquireServer.TileStateType.DrawPile:
                        // fill tile white
                        Bmd.fill(t.bmd, Color.S.White, 0);
                        Bmd.tileText(t.bmd, tile.id, Color.S.Black);
                        break;
                    case AcquireServer.TileStateType.OnBoard:
                        // fill tile black
                        Bmd.fill(t.bmd, Color.S.Black, 0);
                        Bmd.tileText(t.bmd, tile.id, Color.S.White);
                        break;
                    case AcquireServer.TileStateType.OnBoardHotel:
                        // file tile with the color matching its hotel
                        Bmd.fill(t.bmd, Color.colorOf(tile.state.hotel), 0);
                        Bmd.tileText(t.bmd, tile.id, Color.S.White);
                        break;
                    case AcquireServer.TileStateType.PlayerHand:
                        // fill tile white
                        Bmd.fill(t.bmd, Color.S.White, 0);
                        Bmd.tileText(t.bmd, tile.id, Color.S.Black);
                        break;
                    default: throw new TypeError("Unhandled tile state type");
                }
            }
            Tile.draw = draw;
        })(Tile || (Tile = {}));
    })(Board || (Board = {}));
    /** Draw the 1st person view of one player. */
    var Self;
    (function (Self) {
        var T = /** @class */ (function () {
            function T(server, game, id) {
                var _this = this;
                this.id = id;
                this.tiles = [];
                this.stocks = {};
                var height = Size.Self.height(game);
                var width = Size.Self.width(game);
                var x = Offset.Self.x(game);
                var y = Offset.Self.y(game);
                var playerWidth = Size.Self.width(game) / 6;
                var tileWidth = Size.Self.width(game) * (2. / 5.);
                var stockWidth = Size.Self.width(game) - playerWidth - tileWidth;
                // player
                this.player = new Player.T(game, id, height, playerWidth, x, y);
                // tiles
                for (var i = 0; i < TILES_WIDTH; i++) {
                    var tHeight = height;
                    var tWidth = tileWidth / TILES_WIDTH;
                    var tX = x + playerWidth + i * tWidth;
                    var tY = y;
                    this.tiles.push(new Tile.T(server, game, tHeight, tWidth, tX, tY));
                }
                // stocks
                AcquireServer.hotels(server).forEach(function (hotel) {
                    var sHeight = height;
                    var sWidth = stockWidth / Hotels.HOTELS_WIDTH;
                    var sX = x + playerWidth + tileWidth + Hotels.idToX(hotel.id) * sWidth;
                    var sY = y;
                    _this.stocks[hotel.id] = new Stock.T(game, hotel.id, sHeight, sWidth, sX, sY);
                });
            }
            return T;
        }());
        Self.T = T;
        /** Number of tiles in hand to span. */
        var TILES_WIDTH = 6;
        /** Draw oneself. */
        function draw(t, server, game) {
            var player = AcquireServer.player(server, t.id);
            // player
            Player.draw(t.player, server);
            // player tiles
            var playerTiles = player.tiles.sort(Sort.tiles);
            for (var i = 0; i < TILES_WIDTH; i++) {
                Tile.draw(t.tiles[i], server, game, playerTiles[i]);
            }
            // player stocks
            Object.keys(t.stocks)
                .map(function (id) { return t.stocks[id]; })
                .forEach(function (stock) { return Stock.draw(stock, function (id) { return player.stocks[id]; }); });
        }
        Self.draw = draw;
        /** Status of the player. */
        var Player;
        (function (Player) {
            var T = /** @class */ (function () {
                function T(game, id, height, width, x, y) {
                    this.id = id;
                    this.bmd = game.add.bitmapData(width, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                    this.border = new Border.T(this.sprite);
                }
                return T;
            }());
            Player.T = T;
            /** draw the previous action response. */
            function draw(t, server) {
                var player = AcquireServer.player(server, t.id);
                t.bmd.clear();
                Bmd.fill(t.bmd, Color.S.White, 0);
                // player name and money
                Bmd.playerText(t.bmd, Str.capitalize(player.id), [Num.moneyStr(player.money)]);
            }
            Player.draw = draw;
        })(Player || (Player = {}));
        /** A tile in ones hand. */
        var Tile;
        (function (Tile) {
            var T = /** @class */ (function () {
                function T(server, game, height, width, x, y) {
                    this.id = undefined;
                    this.bmd = game.add.bitmapData(width, height);
                    this.sprite = game.add.sprite(x, y, this.bmd);
                    this.border = new Border.T(this.sprite);
                }
                return T;
            }());
            Tile.T = T;
            /** Draw the player's hand tile. */
            function draw(t, server, game, id) {
                t.id = id;
                t.bmd.clear();
                if (t.id === undefined) {
                    Bmd.fill(t.bmd, Color.S.White, 0);
                }
                else {
                    Bmd.fillHeight(t.bmd, Color.S.Black, Size.Tile.height(game));
                    Bmd.tileText(t.bmd, t.id, Color.S.White);
                }
            }
            Tile.draw = draw;
        })(Tile || (Tile = {}));
    })(Self || (Self = {}));
    /** Utility functions for drawing on a Phaser BitmapData. */
    var Bmd;
    (function (Bmd) {
        /** Fill the bmd with color start at edge from the outside. */
        function clear(bmd, edge) {
            bmd.ctx.clearRect(edge, edge, bmd.width - 2 * edge, bmd.height - 2 * edge);
        }
        Bmd.clear = clear;
        /** Fill the bmd with color start at edge from the outside. */
        function fill(bmd, color, edge) {
            bmd.ctx.fillStyle = color;
            bmd.ctx.fillRect(edge, edge, bmd.width - 2 * edge, bmd.height - 2 * edge);
        }
        Bmd.fill = fill;
        /** Fill the bmd with color in a rectangle with the specified height. */
        function fillHeight(bmd, color, height) {
            bmd.ctx.fillStyle = color;
            bmd.ctx.fillRect(0, Math.max(0, (bmd.height - height) / 2), bmd.width, height);
        }
        Bmd.fillHeight = fillHeight;
        /** Fill the bmd with color in a rectangle with the specified height and width. */
        function fillRect(bmd, color, height, width) {
            bmd.ctx.fillStyle = color;
            bmd.ctx.fillRect(Math.max(0, (bmd.width - width) / 2), Math.max(0, (bmd.height - height) / 2), width, height);
        }
        Bmd.fillRect = fillRect;
        /** Create a border in the bmd of color with an interior color. Start at edge and make it the specified thickness. */
        function border(bmd, borderColor, edge, thickness) {
            var height = bmd.height;
            var width = bmd.width;
            fill(bmd, borderColor, edge);
        }
        Bmd.border = border;
        /** Add text to a stock image. */
        function stockText(bmd, text) {
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "18px Rockwell";
            bmd.ctx.fillStyle = Color.S.White;
            bmd.ctx.fillText(text, bmd.width / 2, bmd.height / 2);
        }
        Bmd.stockText = stockText;
        /** add text to a response. */
        function responseText(bmd, text) {
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "12px Monospace";
            bmd.ctx.fillStyle = Color.S.Black;
            var textLines = Str.intoLines(text, bmd.width / 9);
            var y = (bmd.height / 3) + 20;
            for (var _i = 0, textLines_1 = textLines; _i < textLines_1.length; _i++) {
                var textLine = textLines_1[_i];
                bmd.ctx.fillText(textLine, bmd.width / 2, y);
                y += 20;
            }
        }
        Bmd.responseText = responseText;
        /** Add text for a player. Optional other text may be added with new lines. */
        function playerText(bmd, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            return playerTextGeneric(bmd, bmd.width / 8, bmd.height / 2, text, moreTextLines);
        }
        Bmd.playerText = playerText;
        /** Add text for a player popup. Optional other text may be added with new lines. */
        function playerPopupText(bmd, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            return playerTextGeneric(bmd, bmd.width / 8, bmd.height / 6, text, moreTextLines);
        }
        Bmd.playerPopupText = playerPopupText;
        /** Add text for the basic SM info. Optional other text may be added with new lines. */
        function smText(bmd, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            return smTextGeneric(bmd, bmd.height / 4, text, moreTextLines);
        }
        Bmd.smText = smText;
        /** Add text for the SM popup info. Optional other text may be added with new lines. */
        function smPopupText(bmd, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            return smTextGeneric(bmd, bmd.height / 8, text, moreTextLines);
        }
        Bmd.smPopupText = smPopupText;
        /** Add text for a hotel icon. Optional other text may be added with new lines. */
        function hotelText(bmd, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            return hotelTextGeneric(bmd, bmd.height / 4, text, moreTextLines);
        }
        Bmd.hotelText = hotelText;
        /** Add text for a hotel icon popup. Optional other text may be added with new lines. */
        function hotelPopupText(bmd, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            return hotelTextGeneric(bmd, bmd.height / 6, text, moreTextLines);
        }
        Bmd.hotelPopupText = hotelPopupText;
        /** Add text of the specified color for a board tile to a bmd. */
        function tileText(bmd, text, color) {
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "18px Rockwell";
            bmd.ctx.fillStyle = color;
            bmd.ctx.fillText(text, bmd.width / 1.9, bmd.height / 1.9);
        }
        Bmd.tileText = tileText;
        /** Generic function for adding player icon text. */
        function playerTextGeneric(bmd, x, y, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            bmd.ctx.textAlign = "left";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "20px Rockwell";
            bmd.ctx.fillStyle = Color.S.Black;
            bmd.ctx.fillText(text, x, y);
            var y = y + 25;
            for (var _i = 0, moreTextLines_1 = moreTextLines; _i < moreTextLines_1.length; _i++) {
                var textLine = moreTextLines_1[_i];
                bmd.ctx.textAlign = "left";
                bmd.ctx.textBaseline = "middle";
                bmd.ctx.font = "16px Monospace";
                bmd.ctx.fillStyle = Color.S.Black;
                bmd.ctx.fillText(textLine, x, y);
                y += 25;
            }
        }
        /** Generic function for adding sm state text. */
        function smTextGeneric(bmd, y, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "20px Rockwell";
            bmd.ctx.fillStyle = Color.S.Black;
            bmd.ctx.fillText(text, bmd.width / 2, y);
            var y = y + 25;
            for (var _i = 0, moreTextLines_2 = moreTextLines; _i < moreTextLines_2.length; _i++) {
                var textLine = moreTextLines_2[_i];
                bmd.ctx.textAlign = "center";
                bmd.ctx.textBaseline = "middle";
                bmd.ctx.font = "16px Monospace";
                bmd.ctx.fillStyle = Color.S.Black;
                bmd.ctx.fillText(textLine, bmd.width / 2, y);
                y += 25;
            }
        }
        /** Generic function for adding hotel icon text. */
        function hotelTextGeneric(bmd, y, text, moreTextLines) {
            if (moreTextLines === void 0) { moreTextLines = []; }
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "20px Rockwell";
            bmd.ctx.fillStyle = Color.S.White;
            bmd.ctx.fillText(text, bmd.width / 2, y);
            var y = y + 25;
            for (var _i = 0, moreTextLines_3 = moreTextLines; _i < moreTextLines_3.length; _i++) {
                var textLine = moreTextLines_3[_i];
                bmd.ctx.textAlign = "center";
                bmd.ctx.textBaseline = "middle";
                bmd.ctx.font = "16px Monospace";
                bmd.ctx.fillStyle = Color.S.White;
                bmd.ctx.fillText(textLine, bmd.width / 2, y);
                y += 25;
            }
        }
    })(Bmd = AcquirePhaser.Bmd || (AcquirePhaser.Bmd = {}));
})(AcquirePhaser || (AcquirePhaser = {}));
//# sourceMappingURL=acq_phaser.js.map