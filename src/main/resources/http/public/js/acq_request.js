/**
 * Functions for activating user input to submit various Acquire game requests,
 * and the infrastructure to submit game requests to the server.
 */
var AcquireRequest;
(function (AcquireRequest_1) {
    /**
     * Activate the GUI elements for submitting requests relevant to the current state of hte game.
     * Returns a callback which will delete all the activated GUI elements.
     *
     * @param connInfo connection information to the server.
     * @param phaser the acquire phaser.
     * @param server the state of the game to activate requests for.
     */
    function activateRequest(connInfo, phaser, server) {
        var sm = AcquireServer.smState(server);
        switch (sm.state) {
            case AcquireServer.SmStateType.DrawTurnTile:
                if (AcquirePhaser.Arr.contains(sm.players_drawn, connInfo.selfId))
                    return function () { };
                return drawTile(connInfo, phaser);
            case AcquireServer.SmStateType.PlaceTurnTile:
                if (AcquirePhaser.Arr.contains(sm.players_placed, connInfo.selfId))
                    return function () { };
                return placeTile(connInfo, phaser);
            case AcquireServer.SmStateType.DrawInitialTiles:
                if (AcquirePhaser.Arr.contains(sm.players_drawn, connInfo.selfId))
                    return function () { };
                return drawTile(connInfo, phaser);
            case AcquireServer.SmStateType.PlaceTile:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                var ptFn_1 = placeTile(connInfo, phaser);
                var egFn_1 = undefined;
                if (canEndGame(server))
                    egFn_1 = endGame(connInfo, phaser, server);
                // return a cleanup callback that is a combination of both requests
                return function () {
                    ptFn_1();
                    if (egFn_1 !== undefined) {
                        egFn_1();
                    }
                };
            case AcquireServer.SmStateType.StartHotel:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                var availableHotelIds = AcquireServer.hotels(server)
                    .filter(function (h) { return h.state.type === AcquireServer.HotelStateType.Available; })
                    .map(function (h) { return h.id; });
                return chooseHotel(connInfo, phaser, availableHotelIds);
            case AcquireServer.SmStateType.FoundersStock:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                return acceptStock(connInfo, phaser, sm.started_hotel);
            case AcquireServer.SmStateType.BuyStock:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                return buyStock(connInfo, phaser, server);
            case AcquireServer.SmStateType.DrawTile:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                var dtFn_1 = drawTile(connInfo, phaser);
                var eggFn_1 = undefined;
                if (canEndGame(server))
                    eggFn_1 = endGame(connInfo, phaser, server);
                // return a cleanup callback that is a combination of both requests
                return function () {
                    dtFn_1();
                    if (eggFn_1 !== undefined) {
                        eggFn_1();
                    }
                };
            case AcquireServer.SmStateType.EndGamePayout:
                if (AcquirePhaser.Arr.contains(sm.players_paid, connInfo.selfId))
                    return function () { };
                return acceptMoney(connInfo, phaser);
            case AcquireServer.SmStateType.GameOver:
                return function () { };
            case AcquireServer.SmStateType.ChooseSurvivingHotel:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                return chooseHotel(connInfo, phaser, sm.potential_surviving_hotels);
            case AcquireServer.SmStateType.ChooseDefunctHotel:
                if (sm.current_player !== connInfo.selfId)
                    return function () { };
                return chooseHotel(connInfo, phaser, sm.potential_next_defunct_hotels);
            case AcquireServer.SmStateType.PayBonuses:
                if (!AcquirePhaser.Arr.contains(sm.players_to_pay.map(function (p) { return p.player; }), connInfo.selfId))
                    return function () { };
                return acceptMoney(connInfo, phaser);
            case AcquireServer.SmStateType.HandleDefunctHotelStocks:
                if (sm.players_with_stock[0] !== connInfo.selfId)
                    return function () { };
                return handleStocks(connInfo, phaser, server, sm.surviving_hotel, sm.defunct_hotel);
            default: throw new TypeError("Unhandled SM state type");
        }
    }
    AcquireRequest_1.activateRequest = activateRequest;
    /** Alpha value for created hotel overlay sprites. */
    var HOTEL_OVERLAY_ALPHA = 0.5;
    /** Function to generically create a sprite which performs an Acquire request on user input. */
    function spriteClick(connInfo, phaser, aboveSprite, acqReq, text, onSuccess) {
        if (text === void 0) { text = ""; }
        if (onSuccess === void 0) { onSuccess = function () { }; }
        return spriteClickSupplier(connInfo, phaser, aboveSprite, function () { return acqReq; }, text, onSuccess);
    }
    /**
     * Function to generically create a sprite which performs an Acquire request on user input.
     *
     * @param connInfo the connection info to the server.
     * @param phaser the acquire phaser.
     * @param aboveSprite the sprite this sprite will be created above.
     * @param acqReqFn function which returns the acquire request to send.
     * @param text text to display on the created sprite.
     * @param onSuccess callback when the submitted request completes successfully.
     */
    function spriteClickSupplier(connInfo, phaser, aboveSprite, acqReqFn, text, onSuccess) {
        if (text === void 0) { text = ""; }
        if (onSuccess === void 0) { onSuccess = function () { }; }
        // add text to the to-be created sprite
        var bmd = phaser.game.add.bitmapData(aboveSprite.width, aboveSprite.height);
        bmd.ctx.textAlign = "center";
        bmd.ctx.textBaseline = "middle";
        bmd.ctx.font = "20px Rockwell";
        bmd.ctx.fillStyle = AcquirePhaser.Color.S.Yellow_Dark;
        bmd.ctx.fillText(text, bmd.width / 2, 20);
        // create a sprite and configure it to receive user input
        var sprite = phaser.game.add.sprite(aboveSprite.x, aboveSprite.y, bmd);
        var border = new AcquirePhaser.Border.T(sprite);
        var onInputOver = function () { return AcquirePhaser.Border.toggleMany(border, phaser.game, [AcquirePhaser.Border.Type.Select, AcquirePhaser.Border.Type.Good]); };
        var onInputOut = function () { return AcquirePhaser.Border.toggle(border, phaser.game, AcquirePhaser.Border.Type.Good); };
        var onInputDown = function () {
            var onResponse = function (response) {
                sprite.inputEnabled = false;
                if (response.success) {
                    sprite.events.onInputOver.remove(onInputOver);
                    sprite.events.onInputOut.remove(onInputOut);
                    sprite.events.onInputDown.remove(onInputDown);
                    onSuccess();
                }
                else {
                    AcquirePhaser.Status.Response.drawText(phaser.status.response, response.message);
                    sprite.inputEnabled = true;
                    sprite.events.onInputDown.addOnce(onInputDown);
                }
            };
            AcquireRequest.requestAsync(connInfo, acqReqFn(), onResponse);
        };
        sprite.inputEnabled = true;
        AcquirePhaser.Border.toggle(border, phaser.game, AcquirePhaser.Border.Type.Good);
        sprite.events.onInputOver.add(onInputOver);
        sprite.events.onInputOut.add(onInputOut);
        sprite.events.onInputDown.addOnce(onInputDown);
        return sprite;
    }
    /** Return whether the game may be ended. */
    function canEndGame(server) {
        var noneOnBoard = true;
        var oneBig = false;
        var allSafe = true;
        AcquireServer.hotels(server)
            .filter(function (h) { return h.state.type === AcquireServer.HotelStateType.OnBoard; })
            .forEach(function (h) {
            noneOnBoard = false;
            if (h.is_end_game_size)
                oneBig = true;
            if (!h.is_safe)
                allSafe = false;
        });
        return !noneOnBoard && (allSafe || oneBig);
    }
    /*
     * Functions to activate GUI elements to submit their Acquire request
     * ------------------------------------------------------------------
     */
    /** Activate the AcceptMoney Acquire request. */
    function acceptMoney(connInfo, phaser) {
        var sprite = phaser.self.player.sprite;
        var acqReq = { type: AcquireServer.RequestType.AcceptMoney,
            player: connInfo.selfId };
        var destroyFn = function () { return clickSprite.destroy(true); };
        var clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "Accept Money", destroyFn);
        return destroyFn;
    }
    /** Activate the AcceptStock Acquire request. */
    function acceptStock(connInfo, phaser, hotelId) {
        var stock = phaser.self.stocks[hotelId];
        var sprite = stock.sprite;
        var acqReq = { type: AcquireServer.RequestType.AcceptStock,
            player: connInfo.selfId };
        var destroyFn = function () { return clickSprite.destroy(true); };
        var clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "Founder", destroyFn);
        return destroyFn;
    }
    /** Activate the DrawTile Acquire request. */
    function drawTile(connInfo, phaser) {
        // use an open tile, if applicable, otherwise use any tile
        var openTiles = phaser.self.tiles.filter(function (tile) { return tile.id === undefined; });
        var openTile = undefined;
        if (openTiles.length > 0)
            openTile = openTiles[0];
        else
            openTile = phaser.self.tiles[0];
        var sprite = openTile.sprite;
        var acqReq = { type: AcquireServer.RequestType.DrawTile,
            player: connInfo.selfId };
        var destroyFn = function () { return clickSprite.destroy(true); };
        var clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "Draw", destroyFn);
        return destroyFn;
    }
    /** Activate the EndGame Acquire request. */
    function endGame(connInfo, phaser, server) {
        // use an open stock, if applicable, otherwise use any stock
        var stocks = AcquireServer.player(server, connInfo.selfId).stocks;
        var openStocks = Object.keys(stocks)
            .filter(function (k) { return stocks[k] === 0; });
        var hotelId = undefined;
        if (openStocks.length > 0)
            hotelId = openStocks[0];
        else
            hotelId = stocks.american;
        var stock = phaser.self.stocks[hotelId];
        var sprite = stock.sprite;
        var acqReq = { type: AcquireServer.RequestType.EndGame,
            player: connInfo.selfId };
        var destroyFn = function () { return clickSprite.destroy(true); };
        var clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "End Game", destroyFn);
        return destroyFn;
    }
    /** Activat the HandleStocks Acquire request. */
    function handleStocks(connInfo, phaser, server, survivingHotelId, defunctHotelId) {
        var tiles = phaser.self.tiles.map(function (t) { return t.sprite; });
        var handleBuffer = new HandleStocksBuffer(connInfo, phaser, server, survivingHotelId, defunctHotelId, tiles);
        var hotels = [];
        // surviving hotel
        var survivingStockSprite = phaser.self.stocks[survivingHotelId].sprite;
        var survivingHotel = new HotelOverlay.T(phaser.game, survivingHotelId, survivingStockSprite.height, survivingStockSprite.width, survivingStockSprite.x, survivingStockSprite.y);
        survivingHotel.sprite.alpha = HOTEL_OVERLAY_ALPHA;
        survivingHotel.sprite.inputEnabled = true;
        survivingHotel.sprite.events.onInputDown.add(function () { return handleBuffer.tradeStock(phaser.game, server, survivingHotel.sprite, defunctHotel.sprite); });
        HotelOverlay.draw(survivingHotel);
        hotels.push(survivingHotel);
        // defunct hotel
        var defunctStockSprite = phaser.self.stocks[defunctHotelId].sprite;
        var defunctHotel = new HotelOverlay.T(phaser.game, defunctHotelId, defunctStockSprite.height, defunctStockSprite.width, defunctStockSprite.x, defunctStockSprite.y);
        defunctHotel.sprite.alpha = HOTEL_OVERLAY_ALPHA;
        defunctHotel.sprite.inputEnabled = true;
        defunctHotel.sprite.events.onInputDown.add(function () { return handleBuffer.sellStock(phaser.game, server, defunctHotel.sprite); });
        HotelOverlay.draw(defunctHotel);
        hotels.push(defunctHotel);
        // set player
        var sprite = phaser.self.player.sprite;
        var acqReqFn = function () { return ({ type: AcquireServer.RequestType.HandleStocks,
            player: connInfo.selfId,
            trade: handleBuffer.handle["trade"],
            sell: handleBuffer.handle["sell"],
            keep: handleBuffer.handle["keep"] }); };
        var destroyFn = function () {
            handleBuffer.destroy();
            hotels.forEach(function (h) { return HotelOverlay.destroy(h); });
            clickSprite.destroy(true);
        };
        var clickSprite = spriteClickSupplier(connInfo, phaser, sprite, acqReqFn, "Handle Stocks", destroyFn);
        return destroyFn;
    }
    /** Activate the PlaceTile Acquire request. */
    function placeTile(connInfo, phaser) {
        var tiles = phaser.self.tiles.filter(function (tile) { return tile.id !== undefined; });
        var clickSprites = [];
        var destroyFn = function () { return clickSprites.forEach(function (s) { return s.destroy(true); }); };
        tiles.forEach(function (tile) {
            var tileId = tile.id;
            var sprite = tile.sprite;
            var acqReq = { type: AcquireServer.RequestType.PlaceTile,
                player: connInfo.selfId,
                tile: tile.id };
            var clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "", destroyFn);
            clickSprite.events.onInputOver.add(function () { return AcquirePhaser.Border.toggleMany(phaser.board.tiles[tile.id].border, phaser.game, [AcquirePhaser.Border.Type.Select, AcquirePhaser.Border.Type.Outline]); });
            clickSprite.events.onInputOut.add(function () { return AcquirePhaser.Border.toggle(phaser.board.tiles[tile.id].border, phaser.game, AcquirePhaser.Border.Type.Outline); });
            clickSprite.events.onDestroy.add(function () { return AcquirePhaser.Border.toggle(phaser.board.tiles[tileId].border, phaser.game, AcquirePhaser.Border.Type.Outline); });
            clickSprites.push(clickSprite);
        });
        return destroyFn;
    }
    /** Activate the ChooseHotel Acquire request. */
    function chooseHotel(connInfo, phaser, hotelIds) {
        var hotels = [];
        var clickSprites = [];
        var destroyFn = function () {
            hotels.forEach(function (h) { return HotelOverlay.destroy(h); });
            clickSprites.forEach(function (s) { return s.destroy(true); });
        };
        hotelIds.forEach(function (hotelId) {
            var stockSprite = phaser.self.stocks[hotelId].sprite;
            var hotel = new HotelOverlay.T(phaser.game, hotelId, stockSprite.height, stockSprite.width, stockSprite.x, stockSprite.y);
            HotelOverlay.draw(hotel);
            hotels.push(hotel);
            var sprite = hotel.sprite;
            sprite.alpha = HOTEL_OVERLAY_ALPHA;
            var acqReq = { type: AcquireServer.RequestType.ChooseHotel,
                player: connInfo.selfId,
                hotel: hotel.id };
            var clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "", destroyFn);
            clickSprites.push(clickSprite);
        });
        return destroyFn;
    }
    /** Activate the BuyStock Acquire request. */
    function buyStock(connInfo, phaser, server) {
        var bankStocks = AcquireServer.bank(server).stocks;
        var hotelIds = AcquireServer.hotels(server)
            .filter(function (h) { return h.state.type === AcquireServer.HotelStateType.OnBoard; })
            .filter(function (h) { return bankStocks[h.id] > 0; })
            .map(function (h) { return h.id; });
        // create hotels to buy stocks from, placing the stocks to buy in a buffer created on top of the tiles
        var tiles = phaser.self.tiles.map(function (t) { return t.sprite; });
        var stockBuffer = new BuyStockBuffer(phaser.game, tiles);
        var hotels = [];
        hotelIds.forEach(function (hotelId) {
            var stockSprite = phaser.self.stocks[hotelId].sprite;
            var hotel = new HotelOverlay.T(phaser.game, hotelId, stockSprite.height, stockSprite.width, stockSprite.x, stockSprite.y);
            hotel.sprite.alpha = HOTEL_OVERLAY_ALPHA;
            hotel.sprite.inputEnabled = true;
            hotel.sprite.events.onInputDown.add(function () { return stockBuffer.addStock(phaser.game, server, hotelId, hotel.sprite); });
            HotelOverlay.draw(hotel);
            hotels.push(hotel);
        });
        // set player
        var sprite = phaser.self.player.sprite;
        var acqReqFn = function () { return ({ type: AcquireServer.RequestType.BuyStock,
            player: connInfo.selfId,
            stocks: stockBuffer.stocksToBuy }); };
        var destroyFn = function () {
            stockBuffer.destroy();
            hotels.forEach(function (h) { return h.sprite.destroy(true); });
            clickSprite.destroy(true);
        };
        var clickSprite = spriteClickSupplier(connInfo, phaser, sprite, acqReqFn, "Buy Stocks", destroyFn);
        return destroyFn;
    }
    /** An Overlay icon for a Hotel. */
    var HotelOverlay;
    (function (HotelOverlay) {
        var T = /** @class */ (function () {
            function T(game, id, height, width, x, y) {
                this.id = id;
                this.bmd = game.add.bitmapData(width, height);
                this.sprite = game.add.sprite(x, y, this.bmd);
                this.border = new AcquirePhaser.Border.T(this.sprite);
                AcquirePhaser.Border.toggle(this.border, game, AcquirePhaser.Border.Type.Good);
            }
            return T;
        }());
        HotelOverlay.T = T;
        function draw(t) {
            t.bmd.clear();
            AcquirePhaser.Bmd.fill(t.bmd, AcquirePhaser.Color.colorOf(t.id), 0);
            AcquirePhaser.Bmd.hotelText(t.bmd, AcquirePhaser.Str.capitalize(t.id.charAt(0)));
        }
        HotelOverlay.draw = draw;
        function destroy(t) {
            t.border.sprite.destroy();
            t.sprite.destroy();
        }
        HotelOverlay.destroy = destroy;
    })(HotelOverlay || (HotelOverlay = {}));
    /** Convienence buffer for animating/activating a BuyStock request.  */
    var BuyStockBuffer = /** @class */ (function () {
        function BuyStockBuffer(game, locs) {
            this.sprites = [];
            // create an info display
            var loc = locs.pop();
            var bmd = game.add.bitmapData(loc.width, loc.height);
            var sprite = game.add.sprite(loc.x, loc.y, bmd);
            this.infoSprite = sprite;
            this.infoBmd = bmd;
            this.sprites.push(sprite);
            this.locs = locs;
            this.stockCount = 0;
            this.stocksToBuy = { "american": 0,
                "continental": 0,
                "festival": 0,
                "imperial": 0,
                "luxor": 0,
                "tower": 0,
                "worldwide": 0 };
        }
        /**
         * Add a stock to buy to the buffer.
         *
         * @param game the Phaser game.
         * @param server the Acquire server state.
         * @param hotelId the hotel to buy a stock of.
         * @param startLoc the starting location of the created hotel stock animation to move from.
         */
        BuyStockBuffer.prototype.addStock = function (game, server, hotelId, startLoc) {
            var _this = this;
            // do nothing if buy stock limit reached
            if (this.stockCount >= 3)
                return;
            // associate a loc with this stock
            var loc = this.locs.pop();
            // update stock counts
            this.stockCount += 1;
            this.stocksToBuy[hotelId] += 1;
            // create a stock sprite that may be removed and save it
            var sprite = game.add.sprite(startLoc.x, startLoc.y, AcquirePhaser.Image.stockOf(hotelId));
            var border = new AcquirePhaser.Border.T(sprite);
            AcquirePhaser.Border.toggle(border, game, AcquirePhaser.Border.Type.Good);
            sprite.height = loc.height;
            sprite.width = loc.width;
            this.sprites.push(sprite);
            sprite.events.onInputDown.add(function () {
                sprite.inputEnabled = false;
                // return loc availability
                _this.locs.push(loc);
                _this.sprites.splice(_this.sprites.indexOf(sprite), 1);
                // update stock counts
                _this.stockCount -= 1;
                _this.stocksToBuy[hotelId] -= 1;
                // animate moving stock back to hotel then delete it
                var tween = game.add.tween(sprite);
                tween.onComplete.add(function () {
                    sprite.destroy(true);
                    _this.drawInfo(server);
                });
                tween.to(startLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true);
            });
            // animate the stock moving to the buffer
            var tween = game.add.tween(sprite);
            tween.onComplete.add(function () {
                sprite.inputEnabled = true;
                _this.drawInfo(server);
            });
            tween.to(loc.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true);
        };
        /** Destroy all GUI elements associated with this buffer. */
        BuyStockBuffer.prototype.destroy = function () {
            this.sprites.forEach(function (s) { return s.destroy(true); });
        };
        /** Draw the info window describing the stocks to bought. */
        BuyStockBuffer.prototype.drawInfo = function (server) {
            var _this = this;
            // find the total cost of the stocks to buy
            var cost = 0;
            Object.keys(this.stocksToBuy)
                .map(function (h) { return AcquireServer.toId(h); })
                .forEach(function (id) {
                if (_this.stocksToBuy[id] > 0) {
                    cost += _this.stocksToBuy[id] * AcquireServer.hotel(server, id).stock_price;
                }
            });
            // draw the cost
            var bmd = this.infoBmd;
            bmd.clear();
            AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.White, 0);
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "20px Rockwell";
            bmd.ctx.fillStyle = AcquirePhaser.Color.S.Black;
            bmd.ctx.fillText("Cost", this.infoBmd.width / 2, 20);
            bmd.ctx.fillText(AcquirePhaser.Num.moneyStr(cost), this.infoBmd.width / 2, 40);
        };
        return BuyStockBuffer;
    }());
    /** Convienence buffer for animating/activating a HandleStocks request.  */
    var HandleStocksBuffer = /** @class */ (function () {
        function HandleStocksBuffer(connInfo, phaser, server, survivingHotelId, defunctHotelId, locs) {
            /** All the sprites created by this buffer. */
            this.sprites = [];
            this.sprites = [];
            this.handle = { "sell": 0,
                "trade": 0,
                "keep": AcquireServer.player(server, connInfo.selfId).stocks[defunctHotelId] };
            // create an info display
            var loc = locs.pop();
            var bmd = phaser.game.add.bitmapData(loc.width, loc.height);
            var sprite = phaser.game.add.sprite(loc.x, loc.y, bmd);
            this.infoSprite = sprite;
            this.infoBmd = bmd;
            this.sprites.push(sprite);
            // create stock images
            this.survivingStock = new AcquirePhaser.Stock.T(phaser.game, survivingHotelId, locs[0].height, locs[0].width, locs[0].x, locs[0].y);
            this.defunctStock = new AcquirePhaser.Stock.T(phaser.game, defunctHotelId, locs[1].height, locs[1].width, locs[1].x, locs[1].y);
            // draw the stocks and info
            this.drawInfo(server);
            this.drawStocks();
        }
        /**
         * Put selling a defunct hotel stock in the buffer.
         *
         * @param game the Phaser game.
         * @param server the Acquire server state.
         * @param startLoc the starting location of the created hotel stock animation to move from.
         */
        HandleStocksBuffer.prototype.sellStock = function (game, server, startLoc) {
            var _this = this;
            if (this.handle["keep"] <= 0)
                return;
            this.handle["sell"] += 1;
            this.handle["keep"] -= 1;
            // setup return stock handler
            if (!this.defunctStock.sprite.inputEnabled) {
                this.defunctStock.sprite.inputEnabled = true;
                this.defunctStock.sprite.events.onInputDown.add(function () { return _this.returnSoldStock(game, server, startLoc); });
                AcquirePhaser.Border.toggle(this.defunctStock.border, game, AcquirePhaser.Border.Type.Good);
            }
            // animate moving a stock to the sell pile
            var sprite = game.add.sprite(startLoc.x, startLoc.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId));
            sprite.height = this.defunctStock.sprite.height;
            sprite.width = this.defunctStock.sprite.width;
            var tween = game.add.tween(sprite);
            tween.onComplete.add(function () {
                sprite.destroy();
                _this.drawStocks();
                _this.drawInfo(server);
            });
            tween.to(this.defunctStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true);
        };
        /** Put returning a sold stock in the buffer; keeping it instead. */
        HandleStocksBuffer.prototype.returnSoldStock = function (game, server, endLoc) {
            var _this = this;
            if (this.handle["sell"] <= 0)
                return;
            this.handle["sell"] -= 1;
            this.handle["keep"] += 1;
            // animate moving a stock to the stock pile
            var sprite = game.add.sprite(this.defunctStock.sprite.x, this.defunctStock.sprite.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId));
            sprite.height = this.defunctStock.sprite.height;
            sprite.width = this.defunctStock.sprite.width;
            var tween = game.add.tween(sprite);
            tween.onComplete.add(function () {
                sprite.destroy();
                _this.drawStocks();
                _this.drawInfo(server);
            });
            tween.to(endLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true);
        };
        /**
         * Put trading two defunct hotel stocks for a suviving hotel stock in the buffer.
         *
         * @param game the Phaser game.
         * @param server the Acquire server state.
         * @param survivingStartLoc the starting location of the created surviving hotel stock animation to move from.
         * @param defunctStartLoc  the starting location of the created defunct hotel stock animation to move from.
         */
        HandleStocksBuffer.prototype.tradeStock = function (game, server, survivingStartLoc, defunctStartLoc) {
            var _this = this;
            if (this.handle["keep"] <= 1)
                return;
            this.handle["trade"] += 2;
            this.handle["keep"] -= 2;
            // setup return stock handler
            if (!this.survivingStock.sprite.inputEnabled) {
                this.survivingStock.sprite.inputEnabled = true;
                this.survivingStock.sprite.events.onInputDown.add(function () { return _this.returnTradeStock(game, server, survivingStartLoc, defunctStartLoc); });
                AcquirePhaser.Border.toggle(this.survivingStock.border, game, AcquirePhaser.Border.Type.Good);
            }
            // animate moving two stocks to the trade pile then one surviving stock
            var sprite1 = game.add.sprite(survivingStartLoc.x, survivingStartLoc.y, AcquirePhaser.Image.stockOf(this.survivingStock.hotelId));
            sprite1.height = this.survivingStock.sprite.height;
            sprite1.width = this.survivingStock.sprite.width;
            var sprite2 = game.add.sprite(defunctStartLoc.x, defunctStartLoc.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId));
            sprite2.height = this.defunctStock.sprite.height;
            sprite2.width = this.defunctStock.sprite.width;
            var sprite3 = game.add.sprite(defunctStartLoc.x, defunctStartLoc.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId));
            sprite3.height = this.defunctStock.sprite.height;
            sprite3.width = this.defunctStock.sprite.width;
            var tween1 = game.add.tween(sprite1);
            var tween2 = game.add.tween(sprite2);
            var tween3 = game.add.tween(sprite3);
            tween1.chain(tween2);
            tween2.chain(tween3);
            tween3.onComplete.add(function () {
                sprite1.destroy();
                sprite2.destroy();
                sprite3.destroy();
                _this.drawStocks();
                _this.drawInfo(server);
            });
            tween1.to(this.survivingStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, true);
            tween2.to(this.defunctStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false);
            tween3.to(this.defunctStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false);
        };
        /** Put returning a traded stock in the buffer; keeping them instead. */
        HandleStocksBuffer.prototype.returnTradeStock = function (game, server, survivingEndLoc, defunctEndLoc) {
            var _this = this;
            if (this.handle["trade"] <= 1)
                return;
            this.handle["trade"] -= 2;
            this.handle["keep"] += 2;
            // animate moving two stocks to the trade pile then one surviving stock
            var sprite1 = game.add.sprite(this.survivingStock.sprite.x, this.survivingStock.sprite.y, AcquirePhaser.Image.stockOf(this.survivingStock.hotelId));
            sprite1.height = this.survivingStock.sprite.height;
            sprite1.width = this.survivingStock.sprite.width;
            var sprite2 = game.add.sprite(this.defunctStock.sprite.x, this.defunctStock.sprite.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId));
            sprite2.height = this.defunctStock.sprite.height;
            sprite2.width = this.defunctStock.sprite.width;
            var sprite3 = game.add.sprite(this.defunctStock.sprite.x, this.defunctStock.sprite.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId));
            sprite3.height = this.defunctStock.sprite.height;
            sprite3.width = this.defunctStock.sprite.width;
            var tween1 = game.add.tween(sprite1);
            var tween2 = game.add.tween(sprite2);
            var tween3 = game.add.tween(sprite3);
            tween1.chain(tween2);
            tween2.chain(tween3);
            tween3.onComplete.add(function () {
                sprite1.destroy();
                sprite2.destroy();
                sprite3.destroy();
                _this.drawStocks();
                _this.drawInfo(server);
            });
            tween1.to(survivingEndLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, true);
            tween2.to(defunctEndLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false);
            tween3.to(defunctEndLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false);
        };
        /** Destroy all GUI elements that make up this buffer. */
        HandleStocksBuffer.prototype.destroy = function () {
            this.sprites.forEach(function (s) { return s.destroy(true); });
            AcquirePhaser.Stock.destroy(this.defunctStock);
            AcquirePhaser.Stock.destroy(this.survivingStock);
        };
        /** Draw the buffer stock icons. */
        HandleStocksBuffer.prototype.drawStocks = function () {
            var _this = this;
            AcquirePhaser.Stock.draw(this.survivingStock, function (_) { return _this.handle["trade"] / 2; });
            AcquirePhaser.Stock.draw(this.defunctStock, function (_) { return _this.handle["sell"] + _this.handle["trade"]; });
        };
        /** Draw the info window describing the state of the stock handling currently buffered.  */
        HandleStocksBuffer.prototype.drawInfo = function (server) {
            var bmd = this.infoBmd;
            var height = bmd.height;
            var width = bmd.width;
            bmd.clear();
            AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.White, 0);
            bmd.ctx.textAlign = "center";
            bmd.ctx.textBaseline = "middle";
            bmd.ctx.font = "14px Rockwell";
            bmd.ctx.fillStyle = AcquirePhaser.Color.S.Black;
            bmd.ctx.fillText("Trade " + this.handle["trade"], width / 2, height * (1. / 4.));
            bmd.ctx.fillText("Sell  " + this.handle["sell"], width / 2, height * (2. / 4.));
            bmd.ctx.fillText("Keep  " + this.handle["keep"], width / 2, height * (3. / 4.));
        };
        return HandleStocksBuffer;
    }());
    /** Functions for sending Acquire game requests. */
    var AcquireRequest;
    (function (AcquireRequest) {
        /** Perform an async request to the specified url, calling onComplete with the response. */
        function requestAsync(connInfo, acqReq, onComplete) {
            request("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId + "/request", { request: acqReq,
                onComplete: onComplete });
        }
        AcquireRequest.requestAsync = requestAsync;
        /** Perform a request to the specified  url. Returns the response if sync, otherwise returns undefined */
        function request(url, request) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        request.onComplete(JSON.parse(xmlHttp.responseText));
                        return;
                    }
                    else if (xmlHttp.status == 0) {
                        console.log("Server not available!");
                    }
                }
            };
            xmlHttp.open("POST", url, true);
            xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlHttp.send(JSON.stringify(request.request));
        }
    })(AcquireRequest || (AcquireRequest = {}));
})(AcquireRequest || (AcquireRequest = {}));
//# sourceMappingURL=acq_request.js.map