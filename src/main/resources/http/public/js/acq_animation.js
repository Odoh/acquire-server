/**
 * Functions for create Phaser animations for requests in an Acquire game.
 */
var AcquireAnimation;
(function (AcquireAnimation) {
    /**
     * Animate the current Acquire request.
     *
     * @param phaser acquire phaser elements.
     * @param server current acquire server turn state.
     * @param prevServer the previous acquire server turn state.
     * @param onComplete callback when the request has completed.
     */
    function animateRequest(phaser, server, prevServer, onComplete) {
        if (onComplete === void 0) { onComplete = function () { }; }
        // kill any currently active animations
        if (Global.areActiveTweens()) {
            Global.stopAll();
        }
        // animate the acquire request coming out of the previous game state
        var request = AcquireServer.request(server);
        var prevState = AcquireServer.smState(prevServer);
        switch (request.type) {
            case AcquireServer.RequestType.AcceptMoney:
                acceptMoney(phaser, request.player, onComplete);
                return;
            case AcquireServer.RequestType.AcceptStock:
                if (prevState.state === AcquireServer.SmStateType.FoundersStock) {
                    acceptStock(phaser, request.player, prevState.started_hotel, onComplete);
                    return;
                }
                console.log("ERROR: Unhandled AcceptStock request state [" + prevState.state + "]");
                return;
            case AcquireServer.RequestType.BuyStock:
                buyStock(phaser, request.player, request.stocks, onComplete);
                return;
            case AcquireServer.RequestType.ChooseHotel:
                if (prevState.state === AcquireServer.SmStateType.StartHotel) {
                    chooseHotel(phaser, request.player, request.hotel, onComplete, prevState.tiles[0]);
                }
                else {
                    chooseHotel(phaser, request.player, request.hotel, onComplete);
                }
                return;
            case AcquireServer.RequestType.DrawTile:
                if (prevState.state === AcquireServer.SmStateType.DrawTurnTile) {
                    drawTile(phaser, request.player, 1, onComplete);
                }
                else if (prevState.state === AcquireServer.SmStateType.DrawInitialTiles) {
                    drawTile(phaser, request.player, 6, onComplete);
                }
                else {
                    var prevTiles = AcquireServer.player(prevServer, request.player).tiles;
                    drawTile(phaser, request.player, 6 - prevTiles.length, onComplete);
                }
                return;
            case AcquireServer.RequestType.EndGame:
                onComplete();
                return;
            case AcquireServer.RequestType.HandleStocks:
                if (prevState.state === AcquireServer.SmStateType.HandleDefunctHotelStocks) {
                    handleStocks(phaser, request.player, prevState.defunct_hotel, prevState.surviving_hotel, request.trade, request.sell, onComplete);
                    return;
                }
                console.log("ERROR: Unhandled HandleStocks request state [" + prevState.state + "]");
                return;
            case AcquireServer.RequestType.PlaceTile:
                placeTile(phaser, request.player, request.tile, onComplete);
                return;
            case AcquireServer.RequestType.StartGame:
                onComplete();
                return;
            default:
                console.log("ERROR: Unhandled request type [" + request + "]");
                return;
        }
    }
    AcquireAnimation.animateRequest = animateRequest;
    /** Global animation constants and state. */
    var Global;
    (function (Global) {
        /** Duration in ms for a tween to last. */
        Global.TWEEN_DURATION = 1000;
        /** Sprites which are actively being animated.  */
        var ACTIVE_SPRITES = undefined;
        /** Tweens which are actively running. */
        var ACTIVE_TWEENS = undefined;
        /** Callback when the active tweens have completed. */
        var ACTIVE_TWEEN_ON_COMPLETE = undefined;
        /** Whether any tweens are currently active. */
        function areActiveTweens() {
            return ACTIVE_SPRITES !== undefined &&
                ACTIVE_TWEENS !== undefined &&
                ACTIVE_TWEEN_ON_COMPLETE !== undefined;
        }
        Global.areActiveTweens = areActiveTweens;
        /** Activate a sprite and tween. */
        function activate(sprite, tween, onComplete) {
            ACTIVE_SPRITES = [sprite];
            ACTIVE_TWEENS = [tween];
            ACTIVE_TWEEN_ON_COMPLETE = function () {
                sprite.destroy();
                onComplete();
                ACTIVE_SPRITES = undefined;
                ACTIVE_TWEENS = undefined;
                ACTIVE_TWEEN_ON_COMPLETE = undefined;
            };
            tween.onComplete.add(ACTIVE_TWEEN_ON_COMPLETE);
        }
        Global.activate = activate;
        /** Activate several sprites and tweens. */
        function activateMany(sprites, tweens, onComplete) {
            ACTIVE_SPRITES = sprites;
            ACTIVE_TWEENS = tweens;
            ACTIVE_TWEEN_ON_COMPLETE = function () {
                for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
                    var sprite = sprites_1[_i];
                    sprite.destroy();
                }
                onComplete();
                ACTIVE_SPRITES = undefined;
                ACTIVE_TWEENS = undefined;
                ACTIVE_TWEEN_ON_COMPLETE = undefined;
            };
            if (sprites.length === 0 && tweens.length === 0) {
                ACTIVE_TWEEN_ON_COMPLETE();
            }
            else {
                tweens[tweens.length - 1].onComplete.add(ACTIVE_TWEEN_ON_COMPLETE);
            }
        }
        Global.activateMany = activateMany;
        /** Stop all active tweens. */
        function stopAll() {
            for (var _i = 0, ACTIVE_TWEENS_1 = ACTIVE_TWEENS; _i < ACTIVE_TWEENS_1.length; _i++) {
                var tween = ACTIVE_TWEENS_1[_i];
                tween.stop();
            }
            ACTIVE_TWEEN_ON_COMPLETE();
        }
        Global.stopAll = stopAll;
    })(Global = AcquireAnimation.Global || (AcquireAnimation.Global = {}));
    /** Animate accepting money. */
    function acceptMoney(phaser, playerId, onComplete) {
        // animate a money sprite movining from the bank to the player's money amount
        var playerMoney = phaser.players.players[playerId].moneySprite;
        var bank = phaser.players.bank.sprite;
        var sprite = phaser.game.add.sprite(bank.x, bank.y, AcquirePhaser.Image.money);
        sprite.height = playerMoney.height;
        sprite.width = playerMoney.width;
        var tween = phaser.game.add.tween(sprite);
        tween.to(playerMoney.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
        Global.activate(sprite, tween, onComplete);
    }
    /** Animate accepting a stock. */
    function acceptStock(phaser, playerId, hotelId, onComplete) {
        // animate a stock sprite of hotel moving from the bank to the player's stock
        var playerStock = phaser.players.players[playerId].stocks[hotelId].sprite;
        var bankStock = phaser.players.bank.stocks[hotelId].sprite;
        var sprite = phaser.game.add.sprite(bankStock.x, bankStock.y, AcquirePhaser.Image.stockOf(hotelId));
        sprite.height = bankStock.height;
        sprite.width = bankStock.width;
        var tween = phaser.game.add.tween(sprite);
        tween.to(playerStock.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
        Global.activate(sprite, tween, onComplete);
    }
    /** Animate buying stocks. */
    function buyStock(phaser, playerId, stocks, onComplete) {
        // if no stocks were bought, do nothing but call onComplete()
        var hotelIds = Object.keys(stocks).filter(function (hotelId) { return stocks[hotelId] > 0; });
        if (hotelIds.length === 0) {
            onComplete();
            return;
        }
        // animate the transfer of stock/money between the bank and player for each stock bought
        var sprites = [];
        var tweens = [];
        // animate the transfer of stocks
        for (var _i = 0, hotelIds_1 = hotelIds; _i < hotelIds_1.length; _i++) {
            var hotelId = hotelIds_1[_i];
            var playerStock = phaser.players.players[playerId].stocks[hotelId].sprite;
            var bankStock = phaser.players.bank.stocks[hotelId].sprite;
            var amount = stocks[hotelId];
            var prevTween = undefined;
            for (var i = 1; i <= amount; i++) {
                var sprite_1 = phaser.game.add.sprite(bankStock.x, bankStock.y, AcquirePhaser.Image.stockOf(AcquireServer.toId(hotelId)));
                sprite_1.height = bankStock.height;
                sprite_1.width = bankStock.width;
                var tween_1 = phaser.game.add.tween(sprite_1);
                if (prevTween === undefined) {
                    tween_1.to(playerStock.position, Global.TWEEN_DURATION / amount, Phaser.Easing.Quadratic.InOut, true);
                }
                else {
                    tween_1.to(playerStock.position, Global.TWEEN_DURATION / amount, Phaser.Easing.Quadratic.InOut, false);
                    prevTween.chain(tween_1);
                }
                prevTween = tween_1;
                sprites.push(sprite_1);
                tweens.push(tween_1);
            }
        }
        // animate the transfer of money
        var playerMoney = phaser.players.players[playerId].moneySprite;
        var bank = phaser.players.bank.sprite;
        var sprite = phaser.game.add.sprite(playerMoney.x, playerMoney.y, AcquirePhaser.Image.money);
        sprite.height = playerMoney.height;
        sprite.width = playerMoney.width;
        var tween = phaser.game.add.tween(sprite);
        tween.to(bank.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
        sprites.push(sprite);
        tweens.push(tween);
        Global.activateMany(sprites, tweens, onComplete);
    }
    /** Animate choosing a hotel. */
    function chooseHotel(phaser, playerId, hotelId, onComplete, toTileId) {
        if (toTileId === void 0) { toTileId = undefined; }
        // animate moving a hotel icon to target
        // the target is either the response window or a tile on the board
        var hotel = phaser.hotels.hotels[hotelId].sprite;
        var target = undefined;
        if (toTileId === undefined)
            target = phaser.status.response.sprite;
        else
            target = phaser.board.tiles[toTileId].sprite;
        var bmd = phaser.game.add.bitmapData(hotel.width, hotel.height);
        var sprite = phaser.game.add.sprite(hotel.x, hotel.y, bmd);
        AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.colorOf(hotelId), 0);
        AcquirePhaser.Bmd.hotelText(bmd, AcquirePhaser.Str.capitalize(hotelId));
        var tween = phaser.game.add.tween(sprite);
        tween.to(target.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
        Global.activate(sprite, tween, onComplete);
    }
    /** Animate drawing a number tiles equal to amount. */
    function drawTile(phaser, playerId, amount, onComplete) {
        // animate moving a tile from the bank draw pile to a player's hand
        var playerHand = phaser.players.players[playerId].hand.sprite;
        var bankDrawPile = phaser.players.bank.drawPile.sprite;
        var bmd = phaser.game.add.bitmapData(bankDrawPile.width, bankDrawPile.height);
        var sprite = phaser.game.add.sprite(bankDrawPile.x, bankDrawPile.y, bmd);
        AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.Black, 0);
        AcquirePhaser.Bmd.tileText(bmd, amount.toString(), AcquirePhaser.Color.S.White);
        var tween = phaser.game.add.tween(sprite);
        tween.to(playerHand.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
        Global.activate(sprite, tween, onComplete);
    }
    /** Animate handling stocks from a merger. */
    function handleStocks(phaser, playerId, defunctHotel, survivingHotel, trade, sell, onComplete) {
        // if all stocks were kept, do nothing but call onComplete()
        if (trade === 0 && sell === 0) {
            onComplete();
            return;
        }
        // animate the trading of stocks and/or selling of stocks
        var sprites = [];
        var tweens = [];
        var playerDefunctStock = phaser.players.players[playerId].stocks[defunctHotel].sprite;
        var playerSurvivingStock = phaser.players.players[playerId].stocks[survivingHotel].sprite;
        var bankDefunctStock = phaser.players.bank.stocks[defunctHotel].sprite;
        var bankSurvivingStock = phaser.players.bank.stocks[survivingHotel].sprite;
        var height = bankDefunctStock.height;
        var width = bankDefunctStock.width;
        // trade
        var prevTween = undefined;
        for (var i = 1; i <= trade; i++) {
            // defunct
            var defunctSprite = phaser.game.add.sprite(playerDefunctStock.x, playerDefunctStock.y, AcquirePhaser.Image.stockOf(defunctHotel));
            defunctSprite.height = height;
            defunctSprite.width = width;
            var defunctTween = phaser.game.add.tween(defunctSprite);
            if (prevTween === undefined) {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, true);
            }
            else {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, false);
                prevTween.chain(defunctTween);
            }
            prevTween = defunctTween;
            sprites.push(defunctSprite);
            tweens.push(defunctTween);
            // surviving
            if (trade % 2 == 1)
                continue; // trades are 2 for 1
            var survivingSprite = phaser.game.add.sprite(bankSurvivingStock.x, bankSurvivingStock.y, AcquirePhaser.Image.stockOf(survivingHotel));
            survivingSprite.height = height;
            survivingSprite.width = width;
            var survivingTween = phaser.game.add.tween(survivingSprite);
            if (prevTween === undefined) {
                survivingTween.to(playerSurvivingStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, true);
            }
            else {
                survivingTween.to(playerSurvivingStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, false);
                prevTween.chain(survivingTween);
            }
            prevTween = survivingTween;
            sprites.push(survivingSprite);
            tweens.push(survivingTween);
        }
        // sell
        for (var i = 1; i <= sell; i++) {
            // defunct
            var defunctSprite = phaser.game.add.sprite(playerDefunctStock.x, playerDefunctStock.y, AcquirePhaser.Image.stockOf(defunctHotel));
            defunctSprite.height = height;
            defunctSprite.width = width;
            var defunctTween = phaser.game.add.tween(defunctSprite);
            if (prevTween === undefined) {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / sell, Phaser.Easing.Quadratic.InOut, true);
            }
            else {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / sell, Phaser.Easing.Quadratic.InOut, false);
                prevTween.chain(defunctTween);
            }
            prevTween = defunctTween;
            sprites.push(defunctSprite);
            tweens.push(defunctTween);
        }
        if (sell > 0) {
            var playerMoney = phaser.players.players[playerId].moneySprite;
            var bank = phaser.players.bank.sprite;
            var sprite = phaser.game.add.sprite(bank.x, bank.y, AcquirePhaser.Image.money);
            sprite.height = playerMoney.height;
            sprite.width = playerMoney.width;
            var tween = phaser.game.add.tween(sprite);
            if (prevTween === undefined) {
                tween.to(playerMoney.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
            }
            else {
                tween.to(playerMoney.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, false);
                prevTween.chain(tween);
            }
            prevTween = tween;
            sprites.push(sprite);
            tweens.push(tween);
        }
        Global.activateMany(sprites, tweens, onComplete);
    }
    /** Animate placing a tile. */
    function placeTile(phaser, playerId, tileId, onComplete) {
        // animate placing a tile from a player's hand to the board
        var playerHand = phaser.players.players[playerId].hand.sprite;
        var boardTile = phaser.board.tiles[tileId].sprite;
        var bmd = phaser.game.add.bitmapData(boardTile.width, boardTile.height);
        var sprite = phaser.game.add.sprite(playerHand.x, playerHand.y, bmd);
        AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.Black, 0);
        AcquirePhaser.Bmd.tileText(bmd, tileId, AcquirePhaser.Color.S.White);
        var tween = phaser.game.add.tween(sprite);
        tween.to(boardTile.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true);
        Global.activate(sprite, tween, onComplete);
    }
})(AcquireAnimation || (AcquireAnimation = {}));
//# sourceMappingURL=acq_animation.js.map