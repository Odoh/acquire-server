
/**
 * Functions for activating user input to submit various Acquire game requests,
 * and the infrastructure to submit game requests to the server.
 */
namespace AcquireRequest {

    /**
     * Activate the GUI elements for submitting requests relevant to the current state of hte game.
     * Returns a callback which will delete all the activated GUI elements.
     * 
     * @param connInfo connection information to the server.
     * @param phaser the acquire phaser.
     * @param server the state of the game to activate requests for.
     */
    export function activateRequest(connInfo: ConnectionInfo, phaser: AcquirePhaser.T, server: AcquireServer.T): () => void {
        let sm = AcquireServer.smState(server)
        switch (sm.state) {
            case AcquireServer.SmStateType.DrawTurnTile: 
                if (AcquirePhaser.Arr.contains(sm.players_drawn, connInfo.selfId)) return () => {} 
                return drawTile(connInfo, phaser)
            case AcquireServer.SmStateType.PlaceTurnTile:
                if (AcquirePhaser.Arr.contains(sm.players_placed, connInfo.selfId)) return () => {} 
                return placeTile(connInfo, phaser)
            case AcquireServer.SmStateType.DrawInitialTiles:
                if (AcquirePhaser.Arr.contains(sm.players_drawn, connInfo.selfId)) return () => {} 
                return drawTile(connInfo, phaser)
            case AcquireServer.SmStateType.PlaceTile:
                if (sm.current_player !== connInfo.selfId) return () => {}
                let ptFn = placeTile(connInfo, phaser)
                let egFn = undefined
                if (canEndGame(server)) egFn = endGame(connInfo, phaser, server)
                // return a cleanup callback that is a combination of both requests
                return () => {
                    ptFn()
                    if (egFn !== undefined) {
                        egFn()
                    }
                }
            case AcquireServer.SmStateType.StartHotel:
                if (sm.current_player !== connInfo.selfId) return () => {}
                let availableHotelIds = AcquireServer.hotels(server)
                                                     .filter(h => h.state.type === AcquireServer.HotelStateType.Available)
                                                     .map(h => h.id)
                return chooseHotel(connInfo, phaser, availableHotelIds)
            case AcquireServer.SmStateType.FoundersStock:
                if (sm.current_player !== connInfo.selfId) return () => {}
                return acceptStock(connInfo, phaser, sm.started_hotel)
            case AcquireServer.SmStateType.BuyStock:
                if (sm.current_player !== connInfo.selfId) return () => {}
                return buyStock(connInfo, phaser, server)
            case AcquireServer.SmStateType.DrawTile:
                if (sm.current_player !== connInfo.selfId) return () => {}
                let dtFn = drawTile(connInfo, phaser)
                let eggFn = undefined
                if (canEndGame(server)) eggFn = endGame(connInfo, phaser, server)
                // return a cleanup callback that is a combination of both requests
                return () => {
                    dtFn()
                    if (eggFn !== undefined) {
                        eggFn()
                    }
                }
            case AcquireServer.SmStateType.EndGamePayout:
                if (AcquirePhaser.Arr.contains(sm.players_paid, connInfo.selfId)) return () => {} 
                return acceptMoney(connInfo, phaser)
            case AcquireServer.SmStateType.GameOver:
                return () => {}
            case AcquireServer.SmStateType.ChooseSurvivingHotel:
                if (sm.current_player !== connInfo.selfId) return () => {}
                return chooseHotel(connInfo, phaser, sm.potential_surviving_hotels)
            case AcquireServer.SmStateType.ChooseDefunctHotel:
                if (sm.current_player !== connInfo.selfId) return () => {}
                return chooseHotel(connInfo, phaser, sm.potential_next_defunct_hotels)
            case AcquireServer.SmStateType.PayBonuses:
                if (!AcquirePhaser.Arr.contains(sm.players_to_pay.map(p => p.player), connInfo.selfId)) return () => {} 
                return acceptMoney(connInfo, phaser)
            case AcquireServer.SmStateType.HandleDefunctHotelStocks:
                if (sm.players_with_stock[0] !== connInfo.selfId) return () => {}
                return handleStocks(connInfo, phaser, server, sm.surviving_hotel, sm.defunct_hotel)
            default: throw new TypeError("Unhandled SM state type")
        }
    }

    /** Alpha value for created hotel overlay sprites. */
    let HOTEL_OVERLAY_ALPHA = 0.5

    /** Function to generically create a sprite which performs an Acquire request on user input. */
    function spriteClick(connInfo: ConnectionInfo,
                         phaser: AcquirePhaser.T,
                         aboveSprite: Phaser.Sprite,
                         acqReq: AcquireServer.Request,
                         text: string = "",
                         onSuccess: () => void = () => {}): Phaser.Sprite {
        return spriteClickSupplier(connInfo, phaser, aboveSprite, () => acqReq, text, onSuccess)
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
    function spriteClickSupplier(connInfo: ConnectionInfo,
                                 phaser: AcquirePhaser.T,
                                 aboveSprite: Phaser.Sprite,
                                 acqReqFn: () => AcquireServer.Request,
                                 text: string = "",
                                 onSuccess: () => void = () => {}): Phaser.Sprite {
        // add text to the to-be created sprite
        let bmd = phaser.game.add.bitmapData(aboveSprite.width, aboveSprite.height)
        bmd.ctx.textAlign = "center"
        bmd.ctx.textBaseline = "middle"
        bmd.ctx.font = "20px Rockwell"
        bmd.ctx.fillStyle = AcquirePhaser.Color.S.Yellow_Dark
        bmd.ctx.fillText(text, bmd.width / 2, 20)

        // create a sprite and configure it to receive user input
        let sprite = phaser.game.add.sprite(aboveSprite.x, aboveSprite.y, bmd)
        let border = new AcquirePhaser.Border.T(sprite)
        let onInputOver = () => AcquirePhaser.Border.toggleMany(border, phaser.game, [AcquirePhaser.Border.Type.Select, AcquirePhaser.Border.Type.Good])
        let onInputOut = () => AcquirePhaser.Border.toggle(border, phaser.game, AcquirePhaser.Border.Type.Good)
        let onInputDown = () => {
            let onResponse = response => {
                sprite.inputEnabled = false
                if (response.success) {
                    sprite.events.onInputOver.remove(onInputOver)
                    sprite.events.onInputOut.remove(onInputOut)
                    sprite.events.onInputDown.remove(onInputDown)
                    onSuccess()
                } else {
                    AcquirePhaser.Status.Response.drawText(phaser.status.response, response.message)
                    sprite.inputEnabled = true
                    sprite.events.onInputDown.addOnce(onInputDown)
                }
            }
            AcquireRequest.requestAsync(connInfo, acqReqFn(), onResponse)
        }

        sprite.inputEnabled = true
        AcquirePhaser.Border.toggle(border, phaser.game, AcquirePhaser.Border.Type.Good)
        sprite.events.onInputOver.add(onInputOver)
        sprite.events.onInputOut.add(onInputOut)
        sprite.events.onInputDown.addOnce(onInputDown)
        return sprite
    }

    /** Return whether the game may be ended. */
    function canEndGame(server: AcquireServer.T): boolean {
        let noneOnBoard = true
        let oneBig = false
        let allSafe = true
        AcquireServer.hotels(server)
                     .filter(h => h.state.type === AcquireServer.HotelStateType.OnBoard)
                     .forEach(h => {
                         noneOnBoard = false
                         if (h.is_end_game_size) oneBig = true
                         if (!h.is_safe) allSafe = false
                     })
        return !noneOnBoard && (allSafe || oneBig)
    }

    /*
     * Functions to activate GUI elements to submit their Acquire request
     * ------------------------------------------------------------------
     */

     /** Activate the AcceptMoney Acquire request. */
    function acceptMoney(connInfo: ConnectionInfo, phaser: AcquirePhaser.T): () => void {
        let sprite = phaser.self.player.sprite
        let acqReq: AcquireServer.RequestAcceptMoney = { type: AcquireServer.RequestType.AcceptMoney,
                                                         player: connInfo.selfId }
        let destroyFn = () => clickSprite.destroy(true)
        let clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "Accept Money", destroyFn)
        return destroyFn
    }

    /** Activate the AcceptStock Acquire request. */
    function acceptStock(connInfo: ConnectionInfo, phaser: AcquirePhaser.T, hotelId: AcquireServer.HotelId): () => void {
        let stock = phaser.self.stocks[hotelId]
        let sprite = stock.sprite
        let acqReq: AcquireServer.RequestAcceptStock = { type: AcquireServer.RequestType.AcceptStock,
                                                         player: connInfo.selfId }
        let destroyFn = () => clickSprite.destroy(true)
        let clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "Founder", destroyFn)
        return destroyFn
    }

    /** Activate the DrawTile Acquire request. */
    function drawTile(connInfo: ConnectionInfo, phaser: AcquirePhaser.T): () => void {
        // use an open tile, if applicable, otherwise use any tile
        let openTiles = phaser.self.tiles.filter(tile => tile.id === undefined)
        let openTile = undefined
        if (openTiles.length > 0) openTile = openTiles[0]
        else                      openTile = phaser.self.tiles[0]

        let sprite = openTile.sprite
        let acqReq: AcquireServer.RequestDrawTile = { type: AcquireServer.RequestType.DrawTile,
                                                      player: connInfo.selfId }
        let destroyFn = () => clickSprite.destroy(true)
        let clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "Draw", destroyFn)
        return destroyFn
    }

    /** Activate the EndGame Acquire request. */
    function endGame(connInfo: ConnectionInfo, phaser: AcquirePhaser.T, server: AcquireServer.T): () => void {
        // use an open stock, if applicable, otherwise use any stock
        let stocks = AcquireServer.player(server, connInfo.selfId).stocks
        let openStocks = Object.keys(stocks)
                               .filter(k => stocks[k] === 0)
        let hotelId = undefined
        if (openStocks.length > 0) hotelId = openStocks[0]
        else                       hotelId = stocks.american

        let stock = phaser.self.stocks[hotelId]
        let sprite = stock.sprite
        let acqReq: AcquireServer.RequestEndGame = { type: AcquireServer.RequestType.EndGame,
                                                     player: connInfo.selfId }
        let destroyFn = () => clickSprite.destroy(true)
        let clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "End Game", destroyFn)
        return destroyFn
    }

    /** Activat the HandleStocks Acquire request. */
    function handleStocks(connInfo: ConnectionInfo,
                          phaser: AcquirePhaser.T,
                          server: AcquireServer.T,
                          survivingHotelId: AcquireServer.HotelId,
                          defunctHotelId: AcquireServer.HotelId): () => void {
        let tiles = phaser.self.tiles.map(t => t.sprite)
        let handleBuffer = new HandleStocksBuffer(connInfo, phaser, server, survivingHotelId, defunctHotelId, tiles)

        let hotels: HotelOverlay.T[] = []

        // surviving hotel
        let survivingStockSprite = phaser.self.stocks[survivingHotelId].sprite
        let survivingHotel = new HotelOverlay.T(phaser.game, survivingHotelId,
                                                survivingStockSprite.height, survivingStockSprite.width, survivingStockSprite.x, survivingStockSprite.y)
        survivingHotel.sprite.alpha = HOTEL_OVERLAY_ALPHA
        survivingHotel.sprite.inputEnabled = true
        survivingHotel.sprite.events.onInputDown.add(() => handleBuffer.tradeStock(phaser.game, server, survivingHotel.sprite, defunctHotel.sprite))
        HotelOverlay.draw(survivingHotel)
        hotels.push(survivingHotel)

        // defunct hotel
        let defunctStockSprite = phaser.self.stocks[defunctHotelId].sprite
        let defunctHotel = new HotelOverlay.T(phaser.game, defunctHotelId,
                                              defunctStockSprite.height, defunctStockSprite.width, defunctStockSprite.x, defunctStockSprite.y)
        defunctHotel.sprite.alpha = HOTEL_OVERLAY_ALPHA
        defunctHotel.sprite.inputEnabled = true
        defunctHotel.sprite.events.onInputDown.add(() => handleBuffer.sellStock(phaser.game, server, defunctHotel.sprite))
        HotelOverlay.draw(defunctHotel)
        hotels.push(defunctHotel)

        // set player
        let sprite = phaser.self.player.sprite
        let acqReqFn: () => AcquireServer.RequestHandleStocks = () => ({ type: AcquireServer.RequestType.HandleStocks,
                                                                         player: connInfo.selfId,
                                                                         trade: handleBuffer.handle["trade"],
                                                                         sell: handleBuffer.handle["sell"],
                                                                         keep: handleBuffer.handle["keep"] })
        let destroyFn = () => {
            handleBuffer.destroy()
            hotels.forEach(h => HotelOverlay.destroy(h))
            clickSprite.destroy(true)
        }
        let clickSprite = spriteClickSupplier(connInfo, phaser, sprite, acqReqFn, "Handle Stocks", destroyFn)
        return destroyFn
    }

    /** Activate the PlaceTile Acquire request. */
    function placeTile(connInfo: ConnectionInfo, phaser: AcquirePhaser.T): () => void  {
        let tiles = phaser.self.tiles.filter(tile => tile.id !== undefined)
        let clickSprites = []
        let destroyFn = () => clickSprites.forEach(s => s.destroy(true))

        tiles.forEach(tile => {
            let tileId = tile.id
            let sprite = tile.sprite
            let acqReq: AcquireServer.RequestPlaceTile = { type: AcquireServer.RequestType.PlaceTile,
                                                           player: connInfo.selfId,
                                                           tile: tile.id }
            let clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "", destroyFn)
            clickSprite.events.onInputOver.add(() => AcquirePhaser.Border.toggleMany(phaser.board.tiles[tile.id].border, phaser.game, [AcquirePhaser.Border.Type.Select, AcquirePhaser.Border.Type.Outline]))
            clickSprite.events.onInputOut.add(() => AcquirePhaser.Border.toggle(phaser.board.tiles[tile.id].border, phaser.game, AcquirePhaser.Border.Type.Outline))
            clickSprite.events.onDestroy.add(() => AcquirePhaser.Border.toggle(phaser.board.tiles[tileId].border, phaser.game, AcquirePhaser.Border.Type.Outline))
            clickSprites.push(clickSprite)
        })
        return destroyFn
    }

    /** Activate the ChooseHotel Acquire request. */
    function chooseHotel(connInfo: ConnectionInfo, phaser: AcquirePhaser.T, hotelIds: AcquireServer.HotelId[]): () => void {
        let hotels = []
        let clickSprites = []
        let destroyFn = () => {
            hotels.forEach(h => HotelOverlay.destroy(h))
            clickSprites.forEach(s => s.destroy(true))
        }
        hotelIds.forEach(hotelId => {
            let stockSprite = phaser.self.stocks[hotelId].sprite
            let hotel = new HotelOverlay.T(phaser.game, hotelId,
                                    stockSprite.height, stockSprite.width, stockSprite.x, stockSprite.y)
            HotelOverlay.draw(hotel)
            hotels.push(hotel)

            let sprite = hotel.sprite
            sprite.alpha = HOTEL_OVERLAY_ALPHA
            let acqReq: AcquireServer.RequestChooseHotel = { type: AcquireServer.RequestType.ChooseHotel,
                                                             player: connInfo.selfId,
                                                             hotel: hotel.id }
            let clickSprite = spriteClick(connInfo, phaser, sprite, acqReq, "",  destroyFn)
            clickSprites.push(clickSprite)
        })
        return destroyFn
    }

    /** Activate the BuyStock Acquire request. */
    function buyStock(connInfo: ConnectionInfo, phaser: AcquirePhaser.T, server: AcquireServer.T): () => void {
        let bankStocks = AcquireServer.bank(server).stocks
        let hotelIds = AcquireServer.hotels(server)
                                    .filter(h => h.state.type === AcquireServer.HotelStateType.OnBoard)
                                    .filter(h => bankStocks[h.id] > 0)
                                    .map(h => h.id)

        // create hotels to buy stocks from, placing the stocks to buy in a buffer created on top of the tiles
        let tiles = phaser.self.tiles.map(t => t.sprite)
        let stockBuffer = new BuyStockBuffer(phaser.game, tiles)

        let hotels = []
        hotelIds.forEach(hotelId => {
            let stockSprite = phaser.self.stocks[hotelId].sprite
            let hotel = new HotelOverlay.T(phaser.game, hotelId,
                                    stockSprite.height, stockSprite.width, stockSprite.x, stockSprite.y)
            hotel.sprite.alpha = HOTEL_OVERLAY_ALPHA
            hotel.sprite.inputEnabled = true
            hotel.sprite.events.onInputDown.add(() => stockBuffer.addStock(phaser.game, server, hotelId, hotel.sprite))
            HotelOverlay.draw(hotel)
            hotels.push(hotel)
        })

        // set player
        let sprite = phaser.self.player.sprite
        let acqReqFn: () => AcquireServer.RequestBuyStock = () => ({ type: AcquireServer.RequestType.BuyStock,
                                                                     player: connInfo.selfId,
                                                                     stocks: stockBuffer.stocksToBuy })
        let destroyFn = () => {
            stockBuffer.destroy()
            hotels.forEach(h => h.sprite.destroy(true))
            clickSprite.destroy(true)
        }
        let clickSprite = spriteClickSupplier(connInfo, phaser, sprite, acqReqFn, "Buy Stocks", destroyFn)
        return destroyFn
    }

    /** An Overlay icon for a Hotel. */
    namespace HotelOverlay {
        export class T {
            readonly id: AcquireServer.HotelId
            readonly bmd: Phaser.BitmapData
            readonly sprite: Phaser.Sprite
            readonly border: AcquirePhaser.Border.T

            constructor(game: Phaser.Game, id: AcquireServer.HotelId,
                        height: number, width: number, x: number, y: number) {
                this.id = id
                this.bmd = game.add.bitmapData(width, height)
                this.sprite = game.add.sprite(x, y, this.bmd)
                this.border = new AcquirePhaser.Border.T(this.sprite)
                AcquirePhaser.Border.toggle(this.border, game, AcquirePhaser.Border.Type.Good)
            }
        }

        export function draw(t: T) {
            t.bmd.clear()
            AcquirePhaser.Bmd.fill(t.bmd, AcquirePhaser.Color.colorOf(t.id), 0)
            AcquirePhaser.Bmd.hotelText(t.bmd, AcquirePhaser.Str.capitalize(t.id.charAt(0)))
        }

        export function destroy(t: T) {
            t.border.sprite.destroy()
            t.sprite.destroy()
        }
    }

    /** Convienence buffer for animating/activating a BuyStock request.  */
    class BuyStockBuffer {
        /** Sprite/Bmd which contains information about what is going to be bought. */
        private infoSprite: Phaser.Sprite
        private infoBmd: Phaser.BitmapData
        /** Locations to move buffered stocks to buy sprites. */
        private locs: Phaser.Sprite[]
        /** The number of stocks currently buffered to buy. */
        private stockCount: number
        /** All the sprites created by this buffer. */
        private sprites: Phaser.Sprite[]

        /** The stocks to buy. */
        stocksToBuy: AcquireServer.Stocks

        constructor(game: Phaser.Game, locs: Phaser.Sprite[]) {
            this.sprites = []

            // create an info display
            let loc = locs.pop()
            let bmd = game.add.bitmapData(loc.width, loc.height)
            let sprite = game.add.sprite(loc.x, loc.y, bmd)
            this.infoSprite = sprite
            this.infoBmd = bmd
            this.sprites.push(sprite)

            this.locs = locs
            this.stockCount = 0
            this.stocksToBuy = { "american": 0,
                                 "continental": 0,
                                 "festival": 0,
                                 "imperial": 0,
                                 "luxor": 0,
                                 "tower": 0,
                                 "worldwide": 0 }
        }

        /**
         * Add a stock to buy to the buffer.
         * 
         * @param game the Phaser game.
         * @param server the Acquire server state.
         * @param hotelId the hotel to buy a stock of.
         * @param startLoc the starting location of the created hotel stock animation to move from.
         */
        public addStock(game: Phaser.Game,
                        server: AcquireServer.T,
                        hotelId: AcquireServer.HotelId,
                        startLoc: Phaser.Sprite) {
            // do nothing if buy stock limit reached
            if (this.stockCount >= 3) return

            // associate a loc with this stock
            let loc = this.locs.pop()

            // update stock counts
            this.stockCount += 1
            this.stocksToBuy[hotelId] += 1

            // create a stock sprite that may be removed and save it
            let sprite = game.add.sprite(startLoc.x, startLoc.y, AcquirePhaser.Image.stockOf(hotelId))
            let border = new AcquirePhaser.Border.T(sprite)
            AcquirePhaser.Border.toggle(border, game, AcquirePhaser.Border.Type.Good)
            sprite.height = loc.height
            sprite.width = loc.width
            this.sprites.push(sprite)

            sprite.events.onInputDown.add(() => {
                sprite.inputEnabled = false

                // return loc availability
                this.locs.push(loc)
                this.sprites.splice(this.sprites.indexOf(sprite), 1)

                // update stock counts
                this.stockCount -= 1
                this.stocksToBuy[hotelId] -= 1

                // animate moving stock back to hotel then delete it
                let tween = game.add.tween(sprite)
                tween.onComplete.add(() => {
                    sprite.destroy(true)
                    this.drawInfo(server)
                })
                tween.to(startLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true)
            })

            // animate the stock moving to the buffer
            let tween = game.add.tween(sprite)
            tween.onComplete.add(() => {
                sprite.inputEnabled = true
                this.drawInfo(server)
            })
            tween.to(loc.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true)
        }

        /** Destroy all GUI elements associated with this buffer. */
        public destroy() {
            this.sprites.forEach(s => s.destroy(true))
        }

        /** Draw the info window describing the stocks to bought. */
        private drawInfo(server: AcquireServer.T) {
            // find the total cost of the stocks to buy
            let cost = 0
            Object.keys(this.stocksToBuy)
                  .map(h => AcquireServer.toId(h))
                  .forEach(id => {
                      if (this.stocksToBuy[id] > 0) {
                        cost += this.stocksToBuy[id] * AcquireServer.hotel(server, id).stock_price
                      }
                  })
            // draw the cost
            let bmd = this.infoBmd
            bmd.clear()
            AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.White, 0)
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "20px Rockwell"
            bmd.ctx.fillStyle = AcquirePhaser.Color.S.Black
            bmd.ctx.fillText("Cost", this.infoBmd.width / 2, 20)
            bmd.ctx.fillText(AcquirePhaser.Num.moneyStr(cost), this.infoBmd.width / 2, 40)
        }
    }

    /** Convienence buffer for animating/activating a HandleStocks request.  */
    class HandleStocksBuffer {
        /** Sprite/Bmd which contains information about what stock handling is to be done. */
        private infoSprite: Phaser.Sprite
        private infoBmd: Phaser.BitmapData
        /** Icon representing the surviving hotel stocks. */
        private survivingStock: AcquirePhaser.Stock.T
        /** Icon representing the defunct hotel stocks. */
        private defunctStock: AcquirePhaser.Stock.T
        /** All the sprites created by this buffer. */
        private sprites = []

        /** The stock handling to be done. */
        handle: { "sell": number,
                  "trade": number,
                  "keep": number }

        constructor(connInfo: ConnectionInfo,
                    phaser: AcquirePhaser.T,
                    server: AcquireServer.T,
                    survivingHotelId: AcquireServer.HotelId,
                    defunctHotelId: AcquireServer.HotelId,
                    locs: Phaser.Sprite[]) {
            this.sprites = []
            this.handle = { "sell": 0,
                            "trade": 0,
                            "keep": AcquireServer.player(server, connInfo.selfId).stocks[defunctHotelId] }

            // create an info display
            let loc = locs.pop()
            let bmd = phaser.game.add.bitmapData(loc.width, loc.height)
            let sprite = phaser.game.add.sprite(loc.x, loc.y, bmd)
            this.infoSprite = sprite
            this.infoBmd = bmd
            this.sprites.push(sprite)

            // create stock images
            this.survivingStock = new AcquirePhaser.Stock.T(phaser.game, survivingHotelId,
                                                            locs[0].height, locs[0].width, locs[0].x, locs[0].y)
            this.defunctStock = new AcquirePhaser.Stock.T(phaser.game, defunctHotelId,
                                                          locs[1].height, locs[1].width, locs[1].x, locs[1].y)

            // draw the stocks and info
            this.drawInfo(server)
            this.drawStocks()
        }

        /**
         * Put selling a defunct hotel stock in the buffer.
         * 
         * @param game the Phaser game.
         * @param server the Acquire server state.
         * @param startLoc the starting location of the created hotel stock animation to move from.
         */
        public sellStock(game: Phaser.Game, server: AcquireServer.T, startLoc: Phaser.Sprite) {
            if (this.handle["keep"] <= 0) return
            this.handle["sell"] += 1
            this.handle["keep"] -= 1

            // setup return stock handler
            if (!this.defunctStock.sprite.inputEnabled) {
                this.defunctStock.sprite.inputEnabled = true
                this.defunctStock.sprite.events.onInputDown.add(() => this.returnSoldStock(game, server, startLoc))
                AcquirePhaser.Border.toggle(this.defunctStock.border, game, AcquirePhaser.Border.Type.Good)
            }

            // animate moving a stock to the sell pile
            let sprite = game.add.sprite(startLoc.x, startLoc.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId))
            sprite.height = this.defunctStock.sprite.height
            sprite.width = this.defunctStock.sprite.width

            let tween = game.add.tween(sprite)
            tween.onComplete.add(() => {
                sprite.destroy()

                this.drawStocks()
                this.drawInfo(server)
            })
            tween.to(this.defunctStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true)
        }

        /** Put returning a sold stock in the buffer; keeping it instead. */
        private returnSoldStock(game: Phaser.Game, server: AcquireServer.T, endLoc: Phaser.Sprite) {
            if (this.handle["sell"] <= 0) return
            this.handle["sell"] -= 1
            this.handle["keep"] += 1

            // animate moving a stock to the stock pile
            let sprite = game.add.sprite(this.defunctStock.sprite.x, this.defunctStock.sprite.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId))
            sprite.height = this.defunctStock.sprite.height
            sprite.width = this.defunctStock.sprite.width

            let tween = game.add.tween(sprite)
            tween.onComplete.add(() => {
                sprite.destroy()

                this.drawStocks()
                this.drawInfo(server)
            })
            tween.to(endLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 2, Phaser.Easing.Quadratic.InOut, true)
        }

        /**
         * Put trading two defunct hotel stocks for a suviving hotel stock in the buffer.
         * 
         * @param game the Phaser game.
         * @param server the Acquire server state.
         * @param survivingStartLoc the starting location of the created surviving hotel stock animation to move from.
         * @param defunctStartLoc  the starting location of the created defunct hotel stock animation to move from.
         */
        public tradeStock(game: Phaser.Game, server: AcquireServer.T, survivingStartLoc: Phaser.Sprite, defunctStartLoc: Phaser.Sprite) {
            if (this.handle["keep"] <= 1) return
            this.handle["trade"] += 2
            this.handle["keep"] -= 2

            // setup return stock handler
            if (!this.survivingStock.sprite.inputEnabled) {
                this.survivingStock.sprite.inputEnabled = true
                this.survivingStock.sprite.events.onInputDown.add(() => this.returnTradeStock(game, server, survivingStartLoc, defunctStartLoc))
                AcquirePhaser.Border.toggle(this.survivingStock.border, game, AcquirePhaser.Border.Type.Good)
            }

            // animate moving two stocks to the trade pile then one surviving stock
            let sprite1 = game.add.sprite(survivingStartLoc.x, survivingStartLoc.y, AcquirePhaser.Image.stockOf(this.survivingStock.hotelId))
            sprite1.height = this.survivingStock.sprite.height
            sprite1.width = this.survivingStock.sprite.width

            let sprite2 = game.add.sprite(defunctStartLoc.x, defunctStartLoc.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId))
            sprite2.height = this.defunctStock.sprite.height
            sprite2.width = this.defunctStock.sprite.width

            let sprite3 = game.add.sprite(defunctStartLoc.x, defunctStartLoc.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId))
            sprite3.height = this.defunctStock.sprite.height
            sprite3.width = this.defunctStock.sprite.width

            let tween1 = game.add.tween(sprite1)
            let tween2 = game.add.tween(sprite2)
            let tween3 = game.add.tween(sprite3)
            tween1.chain(tween2)
            tween2.chain(tween3)

            tween3.onComplete.add(() => {
                sprite1.destroy()
                sprite2.destroy()
                sprite3.destroy()

                this.drawStocks()
                this.drawInfo(server)
            })
            tween1.to(this.survivingStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, true)
            tween2.to(this.defunctStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false)
            tween3.to(this.defunctStock.sprite.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false)
        }

        /** Put returning a traded stock in the buffer; keeping them instead. */
        public returnTradeStock(game: Phaser.Game, server: AcquireServer.T, survivingEndLoc: Phaser.Sprite, defunctEndLoc: Phaser.Sprite) {
            if (this.handle["trade"] <= 1) return
            this.handle["trade"] -= 2
            this.handle["keep"] += 2

            // animate moving two stocks to the trade pile then one surviving stock
            let sprite1 = game.add.sprite(this.survivingStock.sprite.x, this.survivingStock.sprite.y, AcquirePhaser.Image.stockOf(this.survivingStock.hotelId))
            sprite1.height = this.survivingStock.sprite.height
            sprite1.width = this.survivingStock.sprite.width

            let sprite2 = game.add.sprite(this.defunctStock.sprite.x, this.defunctStock.sprite.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId))
            sprite2.height = this.defunctStock.sprite.height
            sprite2.width = this.defunctStock.sprite.width

            let sprite3 = game.add.sprite(this.defunctStock.sprite.x, this.defunctStock.sprite.y, AcquirePhaser.Image.stockOf(this.defunctStock.hotelId))
            sprite3.height = this.defunctStock.sprite.height
            sprite3.width = this.defunctStock.sprite.width

            let tween1 = game.add.tween(sprite1)
            let tween2 = game.add.tween(sprite2)
            let tween3 = game.add.tween(sprite3)
            tween1.chain(tween2)
            tween2.chain(tween3)

            tween3.onComplete.add(() => {
                sprite1.destroy()
                sprite2.destroy()
                sprite3.destroy()

                this.drawStocks()
                this.drawInfo(server)
            })
            tween1.to(survivingEndLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, true)
            tween2.to(defunctEndLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false)
            tween3.to(defunctEndLoc.position, AcquireAnimation.Global.TWEEN_DURATION / 3, Phaser.Easing.Quadratic.InOut, false)
        }

        /** Destroy all GUI elements that make up this buffer. */
        public destroy() {
            this.sprites.forEach(s => s.destroy(true))
            AcquirePhaser.Stock.destroy(this.defunctStock)
            AcquirePhaser.Stock.destroy(this.survivingStock)
        }

        /** Draw the buffer stock icons. */
        private drawStocks() {
            AcquirePhaser.Stock.draw(this.survivingStock, _ =>  this.handle["trade"] / 2)
            AcquirePhaser.Stock.draw(this.defunctStock, _ => this.handle["sell"] + this.handle["trade"])
        }

        /** Draw the info window describing the state of the stock handling currently buffered.  */
        private drawInfo(server: AcquireServer.T) {
            let bmd = this.infoBmd
            let height = bmd.height
            let width = bmd.width

            bmd.clear()
            AcquirePhaser.Bmd.fill(bmd, AcquirePhaser.Color.S.White, 0)
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "14px Rockwell"
            bmd.ctx.fillStyle = AcquirePhaser.Color.S.Black
            bmd.ctx.fillText("Trade " + this.handle["trade"], width / 2, height * (1. / 4.))
            bmd.ctx.fillText("Sell  " + this.handle["sell"], width / 2, height * (2. / 4.))
            bmd.ctx.fillText("Keep  " + this.handle["keep"], width / 2, height * (3. / 4.))
        }
    }

    /** Functions for sending Acquire game requests. */
    namespace AcquireRequest {

        type AsyncRequest = { readonly request: AcquireServer.Request,
                              readonly onComplete: (response: AcquireServer.Response) => void }

        /** Perform an async request to the specified url, calling onComplete with the response. */
        export function requestAsync(connInfo: ConnectionInfo,
                                     acqReq: AcquireServer.Request,
                                     onComplete: (response: AcquireServer.Response) => void) {
            request("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId + "/request",
                    { request: acqReq,
                      onComplete: onComplete })
        }

        /** Perform a request to the specified  url. Returns the response if sync, otherwise returns undefined */
        function request(url: string, request: AsyncRequest) {
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        request.onComplete(JSON.parse(xmlHttp.responseText))
                        return
                    } else if (xmlHttp.status == 0) {
                        console.log("Server not available!")
                    }
                }
            }
            xmlHttp.open("POST", url, true)
            xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
            xmlHttp.send(JSON.stringify(request.request));
        }
    }
}
