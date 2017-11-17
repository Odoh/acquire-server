
/**
 * Functions for create Phaser animations for requests in an Acquire game.
 */
namespace AcquireAnimation {

    /** 
     * Animate the current Acquire request.
     * 
     * @param phaser acquire phaser elements.
     * @param server current acquire server turn state.
     * @param prevServer the previous acquire server turn state.
     * @param onComplete callback when the request has completed.
     */
    export function animateRequest(phaser: AcquirePhaser.T,
                                   server: AcquireServer.T,
                                   prevServer: AcquireServer.T,
                                   onComplete: () => void = () => {}) {
        // kill any currently active animations
        if (Global.areActiveTweens()) {
            Global.stopAll()
        }

        // animate the acquire request coming out of the previous game state
        let request = AcquireServer.request(server)
        let prevState = AcquireServer.smState(prevServer)
        switch (request.type) {
            case AcquireServer.RequestType.AcceptMoney:
                acceptMoney(phaser, request.player, onComplete)
                return
            case AcquireServer.RequestType.AcceptStock:
                if (prevState.state === AcquireServer.SmStateType.FoundersStock) {
                    acceptStock(phaser, request.player, prevState.started_hotel, onComplete)
                    return
                }
                console.log("ERROR: Unhandled AcceptStock request state [" + prevState.state + "]")
                return
            case AcquireServer.RequestType.BuyStock:
                buyStock(phaser, request.player, request.stocks, onComplete)
                return
            case AcquireServer.RequestType.ChooseHotel:
                if (prevState.state === AcquireServer.SmStateType.StartHotel) {
                    chooseHotel(phaser, request.player, request.hotel, onComplete, prevState.tiles[0])
                } else {
                    chooseHotel(phaser, request.player, request.hotel, onComplete)
                }
                return
            case AcquireServer.RequestType.DrawTile:
                if (prevState.state === AcquireServer.SmStateType.DrawTurnTile) {
                    drawTile(phaser, request.player, 1, onComplete)
                } else if (prevState.state === AcquireServer.SmStateType.DrawInitialTiles) {
                    drawTile(phaser, request.player, 6, onComplete)
                } else {
                    let prevTiles = AcquireServer.player(prevServer, request.player).tiles
                    drawTile(phaser, request.player, 6 - prevTiles.length, onComplete)
                }
                return
            case AcquireServer.RequestType.EndGame:
                onComplete()
                return
            case AcquireServer.RequestType.HandleStocks:
                if (prevState.state === AcquireServer.SmStateType.HandleDefunctHotelStocks) {
                    handleStocks(phaser,
                                 request.player,
                                 prevState.defunct_hotel,
                                 prevState.surviving_hotel,
                                 request.trade,
                                 request.sell,
                                 onComplete)
                    return
                }
                console.log("ERROR: Unhandled HandleStocks request state [" + prevState.state + "]")
                return
            case AcquireServer.RequestType.PlaceTile:
                placeTile(phaser, request.player, request.tile, onComplete)
                return
            case AcquireServer.RequestType.StartGame:
                onComplete()
                return
            default:
                console.log("ERROR: Unhandled request type [" + request + "]")
                return
        }
    }

    /** Global animation constants and state. */
    export namespace Global {
        /** Duration in ms for a tween to last. */
        export let TWEEN_DURATION = 1000

        /** Sprites which are actively being animated.  */
        let ACTIVE_SPRITES: Phaser.Sprite[] = undefined
        /** Tweens which are actively running. */
        let ACTIVE_TWEENS: Phaser.Tween[] = undefined
        /** Callback when the active tweens have completed. */
        let ACTIVE_TWEEN_ON_COMPLETE: () => void = undefined

        /** Whether any tweens are currently active. */
        export function areActiveTweens(): boolean {
            return ACTIVE_SPRITES !== undefined &&
                   ACTIVE_TWEENS !== undefined &&
                   ACTIVE_TWEEN_ON_COMPLETE !== undefined
        }

        /** Activate a sprite and tween. */
        export function activate(sprite: Phaser.Sprite,
                                 tween: Phaser.Tween,
                                 onComplete: () => void) {
            ACTIVE_SPRITES = [sprite]
            ACTIVE_TWEENS = [tween]
            ACTIVE_TWEEN_ON_COMPLETE = () => {
                sprite.destroy()
                onComplete()
                ACTIVE_SPRITES = undefined
                ACTIVE_TWEENS = undefined
                ACTIVE_TWEEN_ON_COMPLETE = undefined
            }
            tween.onComplete.add(ACTIVE_TWEEN_ON_COMPLETE)
        }

        /** Activate several sprites and tweens. */
        export function activateMany(sprites: Phaser.Sprite[],
                                     tweens: Phaser.Tween[],
                                     onComplete: () => void) {
            ACTIVE_SPRITES = sprites
            ACTIVE_TWEENS = tweens
            ACTIVE_TWEEN_ON_COMPLETE = () => {
                for (let sprite of sprites) sprite.destroy()
                onComplete()
                ACTIVE_SPRITES = undefined
                ACTIVE_TWEENS = undefined
                ACTIVE_TWEEN_ON_COMPLETE = undefined
            }

            if (sprites.length === 0 && tweens.length === 0) {
                ACTIVE_TWEEN_ON_COMPLETE()
            } else {
                tweens[tweens.length - 1].onComplete.add(ACTIVE_TWEEN_ON_COMPLETE)
            }
        }

        /** Stop all active tweens. */
        export function stopAll() {
            for (let tween of ACTIVE_TWEENS) tween.stop()
            ACTIVE_TWEEN_ON_COMPLETE()
        }
    }

    /** Animate accepting money. */
    function acceptMoney(phaser: AcquirePhaser.T,
                         playerId: string,
                         onComplete: () => void) {
        // animate a money sprite movining from the bank to the player's money amount
        let playerMoney = phaser.players.players[playerId].moneySprite
        let bank = phaser.players.bank.sprite

        let sprite = phaser.game.add.sprite(bank.x, bank.y, AcquirePhaser.Image.money)
        sprite.height = playerMoney.height
        sprite.width = playerMoney.width

        let tween = phaser.game.add.tween(sprite)
        tween.to(playerMoney.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)

        Global.activate(sprite, tween, onComplete)
    }

    /** Animate accepting a stock. */
    function acceptStock(phaser: AcquirePhaser.T,
                         playerId: string,
                         hotelId: AcquireServer.HotelId,
                         onComplete: () => void) {
        // animate a stock sprite of hotel moving from the bank to the player's stock
        let playerStock = phaser.players.players[playerId].stocks[hotelId].sprite
        let bankStock = phaser.players.bank.stocks[hotelId].sprite

        let sprite = phaser.game.add.sprite(bankStock.x, bankStock.y, AcquirePhaser.Image.stockOf(hotelId))
        sprite.height = bankStock.height
        sprite.width = bankStock.width

        let tween = phaser.game.add.tween(sprite)
        tween.to(playerStock.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)

        Global.activate(sprite, tween, onComplete)
    }

    /** Animate buying stocks. */
    function buyStock(phaser: AcquirePhaser.T,
                      playerId: string,
                      stocks: AcquireServer.Stocks,
                      onComplete: () => void) {
        // if no stocks were bought, do nothing but call onComplete()
        let hotelIds = Object.keys(stocks).filter(hotelId => stocks[hotelId] > 0)
        if (hotelIds.length === 0) {
            onComplete()
            return
        }

        // animate the transfer of stock/money between the bank and player for each stock bought
        let sprites: Phaser.Sprite[] = []
        let tweens: Phaser.Tween[] = []

        // animate the transfer of stocks
        for (let hotelId of hotelIds) {
            let playerStock = phaser.players.players[playerId].stocks[hotelId].sprite
            let bankStock = phaser.players.bank.stocks[hotelId].sprite

            let amount = stocks[hotelId]
            let prevTween: Phaser.Tween = undefined
            for (let i = 1; i <= amount; i++) {
                let sprite = phaser.game.add.sprite(bankStock.x, bankStock.y, AcquirePhaser.Image.stockOf(AcquireServer.toId(hotelId)))
                sprite.height = bankStock.height
                sprite.width = bankStock.width

                let tween = phaser.game.add.tween(sprite)
                if (prevTween === undefined) {
                    tween.to(playerStock.position, Global.TWEEN_DURATION / amount, Phaser.Easing.Quadratic.InOut, true)
                } else {
                    tween.to(playerStock.position, Global.TWEEN_DURATION / amount, Phaser.Easing.Quadratic.InOut, false)
                    prevTween.chain(tween)
                }
                prevTween = tween
                sprites.push(sprite)
                tweens.push(tween)
            }
        }

        // animate the transfer of money
        let playerMoney = phaser.players.players[playerId].moneySprite
        let bank = phaser.players.bank.sprite

        let sprite = phaser.game.add.sprite(playerMoney.x, playerMoney.y, AcquirePhaser.Image.money)
        sprite.height = playerMoney.height
        sprite.width = playerMoney.width

        let tween = phaser.game.add.tween(sprite)
        tween.to(bank.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)
        sprites.push(sprite)
        tweens.push(tween)

        Global.activateMany(sprites, tweens, onComplete)
    }

    /** Animate choosing a hotel. */
    function chooseHotel(phaser: AcquirePhaser.T,
                         playerId: string,
                         hotelId: AcquireServer.HotelId,
                         onComplete: () => void,
                         toTileId: string = undefined) {
        // animate moving a hotel icon to target
        // the target is either the response window or a tile on the board
        let hotel = phaser.hotels.hotels[hotelId].sprite
        let target = undefined
        if (toTileId === undefined) target = phaser.status.response.sprite
        else                        target = phaser.board.tiles[toTileId].sprite

        let bmd = phaser.game.add.bitmapData(hotel.width, hotel.height)
        let sprite = phaser.game.add.sprite(hotel.x, hotel.y, bmd)
        AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.colorOf(hotelId), 0)
        AcquirePhaser.Bmd.hotelText(bmd, AcquirePhaser.Str.capitalize(hotelId))

        let tween = phaser.game.add.tween(sprite)
        tween.to(target.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)

        Global.activate(sprite, tween, onComplete)
    }

    /** Animate drawing a number tiles equal to amount. */
    function drawTile(phaser: AcquirePhaser.T,
                      playerId: string,
                      amount: number,
                      onComplete: () => void) {
        // animate moving a tile from the bank draw pile to a player's hand
        let playerHand = phaser.players.players[playerId].hand.sprite
        let bankDrawPile = phaser.players.bank.drawPile.sprite

        let bmd = phaser.game.add.bitmapData(bankDrawPile.width, bankDrawPile.height)
        let sprite = phaser.game.add.sprite(bankDrawPile.x, bankDrawPile.y, bmd)
        AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.Black, 0)
        AcquirePhaser.Bmd.tileText(bmd, amount.toString(), AcquirePhaser.Color.S.White)

        let tween = phaser.game.add.tween(sprite)
        tween.to(playerHand.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)

        Global.activate(sprite, tween, onComplete)
    }

    /** Animate handling stocks from a merger. */
    function handleStocks(phaser: AcquirePhaser.T,
                          playerId: string,
                          defunctHotel: AcquireServer.HotelId,
                          survivingHotel: AcquireServer.HotelId,
                          trade: number,
                          sell: number,
                          onComplete: () => void) {
        // if all stocks were kept, do nothing but call onComplete()
        if (trade === 0 && sell === 0) {
            onComplete()
            return
        }

        // animate the trading of stocks and/or selling of stocks
        let sprites: Phaser.Sprite[] = []
        let tweens: Phaser.Tween[] = []

        let playerDefunctStock = phaser.players.players[playerId].stocks[defunctHotel].sprite
        let playerSurvivingStock = phaser.players.players[playerId].stocks[survivingHotel].sprite
        let bankDefunctStock = phaser.players.bank.stocks[defunctHotel].sprite
        let bankSurvivingStock = phaser.players.bank.stocks[survivingHotel].sprite

        let height = bankDefunctStock.height
        let width = bankDefunctStock.width

        // trade
        let prevTween: Phaser.Tween = undefined
        for (let i = 1; i <= trade; i++) {
            // defunct
            let defunctSprite = phaser.game.add.sprite(playerDefunctStock.x, playerDefunctStock.y, AcquirePhaser.Image.stockOf(defunctHotel))
            defunctSprite.height = height
            defunctSprite.width = width

            let defunctTween = phaser.game.add.tween(defunctSprite)
            if (prevTween === undefined) {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, true)
            } else {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, false)
                prevTween.chain(defunctTween)
            }
            prevTween = defunctTween
            sprites.push(defunctSprite)
            tweens.push(defunctTween)

            // surviving
            if (trade % 2 == 1) continue // trades are 2 for 1

            let survivingSprite = phaser.game.add.sprite(bankSurvivingStock.x, bankSurvivingStock.y, AcquirePhaser.Image.stockOf(survivingHotel))
            survivingSprite.height = height
            survivingSprite.width = width

            let survivingTween = phaser.game.add.tween(survivingSprite)
            if (prevTween === undefined) {
                survivingTween.to(playerSurvivingStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, true)
            } else {
                survivingTween.to(playerSurvivingStock.position, Global.TWEEN_DURATION / trade, Phaser.Easing.Quadratic.InOut, false)
                prevTween.chain(survivingTween)
            }
            prevTween = survivingTween
            sprites.push(survivingSprite)
            tweens.push(survivingTween)
        }

        // sell
        for (let i = 1; i <= sell; i++) {
            // defunct
            let defunctSprite = phaser.game.add.sprite(playerDefunctStock.x, playerDefunctStock.y, AcquirePhaser.Image.stockOf(defunctHotel))
            defunctSprite.height = height
            defunctSprite.width = width

            let defunctTween = phaser.game.add.tween(defunctSprite)
            if (prevTween === undefined) {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / sell, Phaser.Easing.Quadratic.InOut, true)
            } else {
                defunctTween.to(bankDefunctStock.position, Global.TWEEN_DURATION / sell, Phaser.Easing.Quadratic.InOut, false)
                prevTween.chain(defunctTween)
            }
            prevTween = defunctTween
            sprites.push(defunctSprite)
            tweens.push(defunctTween)
        }

        if (sell > 0) {
            let playerMoney = phaser.players.players[playerId].moneySprite
            let bank = phaser.players.bank.sprite

            let sprite = phaser.game.add.sprite(bank.x, bank.y, AcquirePhaser.Image.money)
            sprite.height = playerMoney.height
            sprite.width = playerMoney.width

            let tween = phaser.game.add.tween(sprite)
            if (prevTween === undefined) {
                tween.to(playerMoney.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)
            } else {
                tween.to(playerMoney.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, false)
                prevTween.chain(tween)
            }
            prevTween = tween
            sprites.push(sprite)
            tweens.push(tween)
        }

        Global.activateMany(sprites, tweens, onComplete)
    }

    /** Animate placing a tile. */
    function placeTile(phaser: AcquirePhaser.T,
                       playerId: string,
                       tileId: string,
                       onComplete: () => void) {
        // animate placing a tile from a player's hand to the board
        let playerHand = phaser.players.players[playerId].hand.sprite
        let boardTile = phaser.board.tiles[tileId].sprite

        let bmd = phaser.game.add.bitmapData(boardTile.width, boardTile.height)
        let sprite = phaser.game.add.sprite(playerHand.x, playerHand.y, bmd)
        AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.Black, 0)
        AcquirePhaser.Bmd.tileText(bmd, tileId, AcquirePhaser.Color.S.White)

        let tween = phaser.game.add.tween(sprite)
        tween.to(boardTile.position, Global.TWEEN_DURATION, Phaser.Easing.Quadratic.InOut, true)

        Global.activate(sprite, tween, onComplete)
    }
}