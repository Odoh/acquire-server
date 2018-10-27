
/**
 * Collections of functions which construct the GUI from Phaser elements.
 * Also contains many utility functions for working with these Phaser elements.
 */
namespace AcquirePhaser {

    export class T {
        game: Phaser.Game
        players: Players.T
        status: Status.T
        hotels: Hotels.T
        board: Board.T
        self: Self.T

        constructor(server: AcquireServer.T, game: Phaser.Game, selfId: string) {
            this.game = game
            this.players = new Players.T(server, game)
            this.status = new Status.T(game)
            this.hotels = new Hotels.T(server, game)
            this.board = new Board.T(server, game)
            // if drawing the game as an observer, do not draw a first-person view
            if (selfId.length !== 0) this.self = new Self.T(server, game, selfId)
            else                     this.self = undefined

            // one-time initialize the background
            game.stage.backgroundColor = Color.S.White
        }
    }

    /**
     * Draw the state of the Acquire game represented by server.
     */
    export function draw(t: T, server: AcquireServer.T) {
        Players.draw(t.players, server, t.game)
        Status.draw(t.status, server, t.game)
        Hotels.draw(t.hotels, server, t.game)
        Board.draw(t.board, server)
        if (t.self !== undefined) Self.draw(t.self, server, t.game)
    }

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
    export namespace Size {
        export namespace Players {
            export function height(game: Phaser.Game): number { return game.height * (1. / 4.) }
            export function width(game: Phaser.Game): number { return game.width * (3. / 5.) }
        }
        export namespace Status {
            export function height(game: Phaser.Game): number { return game.height * (1. / 4.) }
            export function width(game: Phaser.Game): number { return game.width * (2. / 5.) }
        }
        export namespace Hotel {
            export function height(game: Phaser.Game): number { return game.height * (1. / 16.) }
            export function width(game: Phaser.Game): number { return game.width }
        }
        export namespace Board {
            export function height(game: Phaser.Game): number { return game.height * (9. / 16.) }
            export function width(game: Phaser.Game): number { return game.width }
        }
        export namespace Self {
            export function height(game: Phaser.Game): number { return game.height * (1. / 8.) }
            export function width(game: Phaser.Game): number { return game.width }
        }
        export namespace Tile {
            export function height(game: Phaser.Game): number { return Board.height(game) / 9 }
            export function width(game: Phaser.Game): number { return Board.width(game) / 12 }
        }
    }

    /** Global offset values. */
    export namespace Offset {
        export namespace Players {
            export function x(game: Phaser.Game): number { return 0 }
            export function y(game: Phaser.Game): number { return 0 }
        }
        export namespace Status {
            export function x(game: Phaser.Game): number { return game.width * (3. / 5.) }
            export function y(game: Phaser.Game): number { return 0 }
        }
        export namespace Hotel {
            export function x(game: Phaser.Game): number { return 0 }
            export function y(game: Phaser.Game): number { return game.height * (1. / 4.) }
        }
        export namespace Board {
            export function x(game: Phaser.Game): number { return 0 }
            export function y(game: Phaser.Game): number { return game.height * (5. / 16.) }
        }
        export namespace Self {
            export function x(game: Phaser.Game): number { return 0 }
            export function y(game: Phaser.Game): number { return game.height * (7. / 8.) }
        }
    }

    /** All color related constants and functions.  */
    export namespace Color {

        /** String color constants. */
        export enum S {
            Black = "#000000",
            White = "#ffffff",
            Blue_Hilite = "#87cefa",
            Blue_American = "#1d3853",
            Blue_Continental = "#1d8d91",
            Brown_Worldwide = "#74452b",
            Green_Festival = "#076530",
            Green_Good = "#00ff00",
            Pink_Imperial = "#b62550",
            Red_Luxor = "#ae1d18",
            Red_Light = "#ffcccc",
            Yellow_Tower = "#ba7c01",
            Yellow_Light = "#ffffaa",
            Yellow_Dark = "#333300",
        }

        /** Number color constants. */
        export enum N {
            White = 0xffffff,
            Yellow_Light = 0xffff99
        }

        /** The color of a hotel id. */
        export function colorOf(id: AcquireServer.HotelId): S {
            switch (id) {
                case AcquireServer.HotelId.American: return Color.S.Blue_American
                case AcquireServer.HotelId.Continental: return Color.S.Blue_Continental
                case AcquireServer.HotelId.Festival: return Color.S.Green_Festival
                case AcquireServer.HotelId.Imperial: return Color.S.Pink_Imperial
                case AcquireServer.HotelId.Luxor: return Color.S.Red_Luxor
                case AcquireServer.HotelId.Tower: return Color.S.Yellow_Tower
                case AcquireServer.HotelId.Worldwide: return Color.S.Brown_Worldwide
                default: throw new TypeError("Unhandled hotel id: " + id)
            }
        }
    }

    /** All image related functions. */
    export namespace Image {

        /** The name of the information card.  */
        export let informationCard = "information_card"

        /** The name of the money image. */
        export let money = "money"

        /** Return the image name for the stock of the specified hotel. */
        export function stockOf(id: AcquireServer.HotelId): string {
            switch (id) {
                case AcquireServer.HotelId.American: return "american_stock_1"
                case AcquireServer.HotelId.Continental: return "continental_stock_1"
                case AcquireServer.HotelId.Festival: return "festival_stock_1"
                case AcquireServer.HotelId.Imperial: return "imperial_stock_1"
                case AcquireServer.HotelId.Luxor: return "luxor_stock_1"
                case AcquireServer.HotelId.Tower: return "tower_stock_1"
                case AcquireServer.HotelId.Worldwide: return "worldwide_stock_1"
                default: throw new TypeError("Unhandled hotel id: " + id)
            }
        }
    }

    /** Functions relating to sorting. */
    namespace Sort {
        export function tiles(a: string, b: string) {
            if (a.length === b.length) {
                return a.localeCompare(b)
            } else {
                return a.length < b.length ? -1 : 1
            }
        }
    }

    /*
     * JS/TS Utility Functions
     * -----------------------
     */

    /** Utility functions for strings. */
    export namespace Str {

        /** Capitalize the first letter of the hotel id. */
        export function capitalize(id: string): string {
            return id.charAt(0).toUpperCase() + id.slice(1)
        }

        /** Pad the end of a string to make it length len. */
        export function padEnd(str: string, len: number): string {
            return (str + new Array(len + 1).join(" ")).slice(0, len)
        }

        /** Pad all strings in the area to the maximum length.  */
        export function padEndAll(array: string[]): string[] {
            let maxLength = Math.max.apply(null, array.map(s => s.length))
            return array.map(s => Str.padEnd(s, maxLength))
        }

        /** Split string into lines of the specified length. */
        export function intoLines(str: string, len: number): string[] {
            let lines = []
            for (let i = len; i < str.length;) {
                let sub = str.slice(0, i)
                let space = sub.lastIndexOf(" ")
                let line = str.slice(0, space)
                str = str.slice(space)
                lines.push(line)
                i += len - line.length
            }
            lines.push(str)
            return lines
        }
    }

    /** Utility functions for numbers. */
    export namespace Num {

        /** Pad stock amount string, if needed, to be 2 characters in length. */
        export function padStock(stock: number): string {
            if (stock < 10) return stock + " "
            else return stock.toString()
        }

        /** Turn a money amount into a human readable string. */
        export function moneyStr(money: number): string {
            return "$" + money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }

    /** Utility functions for arrays. */
    export namespace Arr {
        
        /** Whether two arrays have equal elements. */
        export function equal(array1, array2): boolean {
            if (array1.length !== array2.length) {
                return false
            }
            for (let i = 0; i < array1.length; i++) {
                if (array1[i] !== array2[i]) {
                    return false
                }
            }
            return true
        }

        /** Whether array contains element. */
        export function contains(array, element): boolean {
            for (let i = 0; i < array.length; i++) {
                if (array[i] === element) {
                    return true
                }
            }
            return false
        }
    }

    /** Utility functions for phaser game rendering. */
    export namespace Render {

        /** Flag which will force rendering to always be enabled. */
        let forceEnableRendering = false

        /** Force rendering to always be enabled. */
        export function forceEnabled() {
            forceEnableRendering = true
        }

        /** Allow rendering to be disabled. */
        export function allowDisabling() {
            forceEnableRendering = false
        }

        /** Enable rendering. */
        export function enable(game: Phaser.Game) {
            game.lockRender = false
        }

        /** Disable rendering. */
        export function disable(game: Phaser.Game) {
            if (forceEnableRendering) {
                return
            }
            game.lockRender = true
        }
    }

    /*
     * Phaser GUI Generalized Constructs
     * ---------------------------------
     */

    /** A border around a sprite. */
    export namespace Border {

        /** The type of the border. */
        export enum Type {
            None,
            Outline,
            Select,
            Good,
        }

        export class T {
            parentSprite: Phaser.Sprite
            borders: Type[]
            sprite: Phaser.Sprite
            bmd: Phaser.BitmapData

            constructor(parentSprite: Phaser.Sprite) {
                this.parentSprite = parentSprite
                this.borders = [Type.None]
                this.bmd = undefined
                this.sprite = undefined
            }
        }

        /** Toggle the creation, deletion, or redrawing of a border. */
        export function toggle(t: T,
                               game: Phaser.Game,
                               border: Type) {
            toggleMany(t, game, [border])
        }

        /** Toggle the creation, deletion, or redrawing of borders. */
        export function toggleMany(t: T,
                                   game: Phaser.Game,
                                   borders: Type[]) {
            if (!isValid(borders)) throw new TypeError("Illegal borders to toggle many: " + borders)

            // do nothing when no change
            if (Arr.equal(t.borders, borders)) {
                return
            }
            // clean up when border is cleared
            if (!isNone(t.borders) && isNone(borders)) {
                t.parentSprite.removeChild(t.sprite)
                t.sprite.destroy()

                t.borders = [Type.None]
                t.sprite = undefined
                t.bmd = undefined
                return
            }

            // create when border doesn't exist
            if (isNone(t.borders) && !isNone(borders)) {
                let height = t.parentSprite.height
                let width = t.parentSprite.width
                let x = t.parentSprite.offsetX
                let y = t.parentSprite.offsetY
                t.bmd = game.add.bitmapData(width, height)
                t.sprite = game.add.sprite(x, y, t.bmd)
                t.parentSprite.addChild(t.sprite)
            }

            // set border state
            t.borders = borders

            // draw the border
            t.bmd.clear()

            var fillEdge = 0
            for (let border of borders) {
                // outline the border
                switch (border) {
                    case Type.None: break
                    case Type.Outline:
                        Bmd.border(t.bmd, Color.S.Black, fillEdge, 1)
                        fillEdge += 1
                        break
                    case Type.Select:
                        Bmd.border(t.bmd, Color.S.Blue_Hilite, fillEdge, 4)
                        fillEdge += 4
                        break
                    case Type.Good:
                        Bmd.border(t.bmd, Color.S.Green_Good, fillEdge, 4)
                        fillEdge += 4
                        break;
                    default: throw new TypeError("Unhandled border type")
                }
            }
            // clear out inside
            Bmd.clear(t.bmd, fillEdge)
        }

        /** Whether the borders combination is valid. */
        function isValid(borders: Type[]) {
            if (borders.length !== 1 && Arr.contains(borders, Type.None)) return false
            return true
        }

        /** Whether the borders array is none. */
        function isNone(borders: Type[]) {
            return (borders.length === 1) && (borders[0] === Type.None)
        }
    }

    /** A popup window. */
    namespace Popup {

        /** The state of the popup. */
        export enum State {
            Open,
            Closed,
        }

        export class T {
            drawFn: (server, bmd, sprite) => void
            state: State
            bmd: Phaser.BitmapData
            sprite: Phaser.Sprite
            border: Border.T

            constructor(drawFn: (server, bmd, sprite) => void) {
                this.drawFn = drawFn
                this.state = State.Closed
                this.sprite = undefined
                this.bmd = undefined
            }
        }

        /** Toggle the creation, deletion, or redrawing of a popup. */
        export function toggle(t: T, game: Phaser.Game, server: AcquireServer.T, state: State,
                               height: number, width: number, x: number, y: number) {
            if (t.state === State.Closed && state === State.Closed) {
                // do nothing
            } else if (t.state === State.Closed && state === State.Open) {
                // create and draw popup
                t.bmd = game.add.bitmapData(width, height)
                t.sprite = game.add.sprite(x, y, t.bmd)
                t.drawFn(server, t.bmd, t.sprite)

                // toggle border
                t.border = new Border.T(t.sprite)
                Border.toggle(t.border, game, Border.Type.Select)

                // enable input
                t.sprite.inputEnabled = true
                t.sprite.events.onInputOver.add(() => AcquirePhaser.Render.enable(game))
                t.sprite.events.onInputOut.add(() => AcquirePhaser.Render.enable(game))
                t.sprite.events.onInputDown.add(() => toggle(t, game, server, State.Closed,
                                                             height, width, x, y))
            } else if (t.state === State.Open && state === State.Closed) {
                // clear border
                Border.toggle(t.border, game, Border.Type.None)

                // clear and cleanup the popup
                t.sprite.destroy()
                t.sprite = undefined
                t.bmd = undefined
            } else if (t.state === State.Open && state === State.Open) {
                // redraw the popup using server (in case it changed)
                t.drawFn(server, t.bmd, t.sprite)
            }
            t.state = state
        }
    }

    /** TilePile icon */
    export namespace TilePile {
        export class T {
            readonly bmd: Phaser.BitmapData
            readonly sprite: Phaser.Sprite
            readonly border: Border.T

            constructor(game: Phaser.Game,
                        height: number,
                        width: number,
                        x: number,
                        y: number) {
                this.bmd = game.add.bitmapData(width, height)
                this.sprite = game.add.sprite(x, y, this.bmd)

                this.border = new Border.T(this.sprite)
                Border.toggle(this.border, game, Border.Type.Outline)
            }
        }

        /** Draw a pile of tiles with the specified amount. */
        export function draw(t: T, game: Phaser.Game, amountFn: () => number) {
            t.bmd.clear()
            Bmd.fill(t.bmd, Color.S.Black, 0)
            Bmd.tileText(t.bmd, amountFn().toString(), Color.S.White)
        }
    }

    /** Stock icon. */
    export namespace Stock {
        export class T {
            readonly hotelId: AcquireServer.HotelId
            readonly imageSprite: Phaser.Sprite
            readonly shadowBmd: Phaser.BitmapData
            readonly shadowSprite: Phaser.Sprite
            readonly bmd: Phaser.BitmapData
            readonly sprite: Phaser.Sprite
            readonly border: Border.T

            constructor(game: Phaser.Game,
                        hotelId: AcquireServer.HotelId,
                        height: number,
                        width: number,
                        x: number,
                        y: number) {
                this.hotelId = hotelId

                // image
                this.imageSprite = game.add.sprite(x, y, Image.stockOf(hotelId))
                this.imageSprite.height = height
                this.imageSprite.width = width

                // shadow
                this.shadowBmd = game.add.bitmapData(width, height)
                this.shadowSprite = game.add.sprite(x, y, this.shadowBmd)
                this.shadowSprite.alpha = 0.6

                // text
                this.bmd = game.add.bitmapData(width, height)
                this.sprite = game.add.sprite(x, y, this.bmd)

                this.border = new Border.T(this.sprite)
            }
        }

        /** Draw the stock. */
        export function draw(t: T, stockAmountFn: (hotel: AcquireServer.HotelId) => number) {
            let amount = stockAmountFn(t.hotelId)

            t.bmd.clear()
            t.shadowBmd.clear()
            if (amount === 0) {
                Bmd.fill(t.bmd, Color.S.White, 0)
            } else {
                Bmd.fillRect(t.shadowBmd, Color.S.Black, 20, 20)
                Bmd.stockText(t.bmd, amount.toString())
            }
        }

        /** Destroy the stock sprites. */
        export function destroy(t: T) {
            t.imageSprite.destroy()
            t.sprite.destroy()
            t.shadowSprite.destroy()
        }
    }

    /*
     * Major Acquire GUI Elements
     * --------------------------
     */

    /** Summary of the state of the players in the game and the bank. */
    export namespace Players {
        export class T {
            readonly bank: Bank.T
            readonly players: { [id: string]: Player.T }

            constructor(server: AcquireServer.T, game: Phaser.Game) {
                this.players = {}
                let players = AcquireServer.players(server)
                let sortedPlayerIds = players.map(p => p.id).sort()
                let numberPlayers = sortedPlayerIds.length + 1 // + bank

                let height = Size.Players.height(game) / numberPlayers
                let width = Size.Players.width(game)
                let x = Offset.Players.x(game)
                let y = Offset.Players.y(game)

                let bankWidth = width * (2. / 6.)
                let playerWidth = width * (1. / 6.)
                let moneyWidth = width * (1. / 6.)
                let handWidth = width * (1. / 8.)
                let stockWidth = width - playerWidth - moneyWidth - handWidth

                this.bank = new Bank.T(server, game,
                                       height, width, x, y,
                                       bankWidth, handWidth, stockWidth)
                players.forEach(player =>
                    this.players[player.id] = new Player.T(server, game, player.id, sortedPlayerIds,
                                                           height, width, x, y,
                                                           playerWidth, moneyWidth, handWidth, stockWidth)
                )
            }
        }

        /** Draw all the players. */
        export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
            // bank
            Bank.draw(t.bank, server, game)

            // players
            Object.keys(t.players)
                  .map(id => t.players[id])
                  .forEach(t => Player.draw(t, server, game))
        }

        /** The bank. */
        namespace Bank {
            export class T {
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite
                readonly drawPile: TilePile.T
                readonly border: Border.T
                readonly stocks: { [id: string]: Stock.T }

                constructor(server: AcquireServer.T, game: Phaser.Game,
                            height: number, width: number, x: number, y: number,
                            playerWidth: number, handWidth: number, stockWidth: number) {
                    this.stocks = {}

                    // player
                    this.bmd = game.add.bitmapData(playerWidth, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)

                    // hand
                    this.drawPile = new TilePile.T(game, height, handWidth, x + playerWidth, y)

                    // stocks
                    AcquireServer.hotels(server).forEach(hotel => {
                        let sHeight = height
                        let sWidth = stockWidth / Hotels.HOTELS_WIDTH
                        let sX = x + playerWidth + handWidth + Hotels.idToX(hotel.id) * sWidth
                        let sY = y
                        this.stocks[hotel.id] = new Stock.T(game, hotel.id,
                                                            sHeight, sWidth, sX, sY)
                    })

                    this.border = new Border.T(this.sprite)
                }
            }

            /** Draw the bank icon. */
            export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
                let bank = AcquireServer.bank(server)

                t.bmd.clear()
                Bmd.fill(t.bmd, Color.S.White, 0)

                // bank name
                Bmd.playerText(t.bmd, "Bank")

                // bank draw pile
                TilePile.draw(t.drawPile, game, () => bank.draw_pile_size)

                // bank stocks
                Object.keys(t.stocks)
                      .map(id => t.stocks[id])
                      .forEach(stock => Stock.draw(stock, (id) => bank.stocks[id]))
            }
        }

        /** Player icon. */
        namespace Player {
            export class T {
                readonly id: string
                readonly idToY: (string) => number
                readonly nameBmd: Phaser.BitmapData
                readonly nameSprite: Phaser.Sprite
                readonly moneyBmd: Phaser.BitmapData
                readonly moneySprite: Phaser.Sprite
                readonly hand: TilePile.T
                readonly popup: Popup.T
                readonly border: Border.T
                readonly stocks: { [id: string]: Stock.T }

                constructor(server: AcquireServer.T, game: Phaser.Game, id: string, sortedPlayerIds: string[],
                            height: number, width: number, x: number, y: number,
                            playerWidth: number, moneyWidth: number, handWidth: number, stockWidth: number) {
                    this.id = id
                    this.stocks = {}
                    this.idToY = createIdToYFn(sortedPlayerIds)

                    let playerY = y + (this.idToY(id) + 1) * height 

                    // player
                    this.nameBmd = game.add.bitmapData(playerWidth, height)
                    this.nameSprite = game.add.sprite(x, playerY, this.nameBmd)

                    // money
                    this.moneyBmd = game.add.bitmapData(moneyWidth, height)
                    this.moneySprite = game.add.sprite(x + playerWidth, playerY, this.moneyBmd)

                    // hand
                    this.hand = new TilePile.T(game, height, handWidth, x + playerWidth + moneyWidth, playerY)

                    // stocks
                    AcquireServer.hotels(server).forEach(hotel => {
                        let sHeight = height
                        let sWidth = stockWidth / Hotels.HOTELS_WIDTH
                        let sX = x + playerWidth + moneyWidth + handWidth + Hotels.idToX(hotel.id) * sWidth
                        let sY =playerY 
                        this.stocks[hotel.id] = new Stock.T(game, hotel.id,
                                                            sHeight, sWidth, sX, sY)
                    })

                    this.popup = new Popup.T(createPopupDrawFn(id))
                    this.border = new Border.T(this.nameSprite)

                    this.nameSprite.inputEnabled = true
                    this.nameSprite.events.onInputOver.add(() => AcquirePhaser.Render.enable(game))
                    this.nameSprite.events.onInputOut.add(() => AcquirePhaser.Render.enable(game))
                    this.nameSprite.events.onInputOver.add(() => Border.toggle(this.border, game, Border.Type.Select))
                    this.nameSprite.events.onInputOut.add(() => Border.toggle(this.border, game, Border.Type.None))
                }
            }

            /** Partially apply arguments executing the popup toggle. */
            function applyPopupToggle(popup: Popup.T, game: Phaser.Game) {
                let width = Size.Board.width(game) / 3
                let height = Size.Board.height(game) + Size.Hotel.height(game)
                let x = Math.min(Math.max(0, game.input.activePointer.worldX - width / 2), game.width - width)
                let y = game.input.activePointer.worldY
                return (server: AcquireServer.T, state: Popup.State) =>
                       Popup.toggle(popup, game, server, state,
                                    height, width, x, y)
            }

            /** Draw the player icon. */
            export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
                if (t.popup.state === Popup.State.Open) {
                    applyPopupToggle(t.popup, game) (server, Popup.State.Open)
                }
                t.nameSprite.events.onInputDown.removeAll()
                t.nameSprite.events.onInputDown.add(() => {
                    applyPopupToggle(t.popup, game) (server, Popup.State.Open)
                    Border.toggle(t.border, game, Border.Type.None)
                })

                let player = AcquireServer.player(server, t.id)
                let hotels = AcquireServer.hotels(server)
                t.nameBmd.clear()
                t.moneyBmd.clear()
                Bmd.fill(t.nameBmd, Color.S.White, 0)
                Bmd.fill(t.moneyBmd, Color.S.White, 0)

                // player name
                Bmd.playerText(t.nameBmd, Str.capitalize(player.id))

                // player money
                Bmd.playerText(t.moneyBmd, Num.moneyStr(player.money))

                // player hand tiles
                TilePile.draw(t.hand, game, () => player.tiles.length)

                // player stocks
                Object.keys(t.stocks)
                      .map(id => t.stocks[id])
                      .forEach(stock => Stock.draw(stock, (id) => player.stocks[id]))
            }

            /** Create the draw function to draw the player popup. */
            function createPopupDrawFn(id: string) {
                return (server: AcquireServer.T, bmd: Phaser.BitmapData, sprite: Phaser.Sprite) => {
                    let player = AcquireServer.player(server, id)
                    let players = AcquireServer.players(server)
                    let hotels = AcquireServer.hotels(server)
                    let stocks = hotels.map(h => h.id).filter(id => player.stocks[id] > 0)

                    // net worth
                    let netWorthLines = []
                    // let netWorth = player.money
                    // for (let hotelId of stocks) {
                    //     let hotelWorth = hotelAssets(server, id, hotelId)
                    //     netWorth += hotelWorth
                    //     netWorthLines.push(Num.moneyStr(hotelWorth) + " from " + Str.capitalize(hotelId))
                    // }
                    // netWorthLines.push(Num.moneyStr(netWorth) + " net worth")
                    // netWorthLines.reverse() // overall net worth at the top

                    // share holder
                    let shareHolderLines = []
                    for (let hotelId of stocks) {
                        let shareHolder = shareHolderStatus(server, id, hotelId)
                        switch (shareHolder[0]) {
                            case Shareholder.Both: shareHolderLines.push(Str.capitalize(hotelId) + " both"); break
                            case Shareholder.Majority: shareHolderLines.push(Str.capitalize(hotelId) + " majority"); break
                            case Shareholder.TiedBoth: shareHolderLines.push(Str.capitalize(hotelId) + " both with " + shareHolder[1]); break
                            case Shareholder.Minority: shareHolderLines.push(Str.capitalize(hotelId) + " minority"); break
                            case Shareholder.TiedMinority: shareHolderLines.push(Str.capitalize(hotelId) + " minority with " + shareHolder[1]); break
                            case Shareholder.None: break;
                            default: throw new TypeError("Unhandled ShareHolder type")
                        }
                    }

                    // draw
                    bmd.clear()
                    Bmd.fill(bmd, Color.S.White, 0)
                    Bmd.playerPopupText(bmd, Str.capitalize(player.id), [
                                             "",
                                             Num.moneyStr(player.money) + " cash",
                                             "",
                                            ].concat(netWorthLines)
                                             .concat([""])
                                             .concat(shareHolderLines))
                }
            }

            /** Possible shareholder statuses. */
            enum Shareholder {
                Both,
                Majority,
                TiedBoth,
                Minority,
                TiedMinority,
                None
            }

            /** Return the share holder status of player in hotel and the number of other players with that status. */
            function shareHolderStatus(server: AcquireServer.T,
                                       playerId: string,
                                       hotelId: AcquireServer.HotelId): [Shareholder, number] {
                let playerStock = AcquireServer.player(server, playerId).stocks[hotelId]
                if (playerStock === 0) {
                    return [Shareholder.None, 0]
                }

                let playersAbove = 0
                let playersBelow = 0
                let playersTied = 0
                for (let player of AcquireServer.players(server)) {
                    if (player.id === playerId) continue
                    if (player.stocks[hotelId] > playerStock) playersAbove += 1
                    else if (player.stocks[hotelId] < playerStock) playersBelow += 1
                    else playersTied += 1
                }

                if (playersAbove === 0 && playersBelow === 0 && playersTied === 0) return [Shareholder.Both, 0]
                if (playersAbove === 0 && playersBelow >= 0 && playersTied > 0) return [Shareholder.TiedBoth, playersTied]
                if (playersAbove === 0 && playersBelow > 0 && playersTied === 0) return [Shareholder.Majority, 0]
                if (playersAbove === 1 && playersTied === 0) return [Shareholder.Minority, 0]
                if (playersAbove === 1 && playersTied > 0) return [Shareholder.TiedMinority, playersTied]
                return [Shareholder.None, 0]
            }

            /** Return the worth of hotel assets for player - includes share holder bonuses. */
            function hotelAssets(server: AcquireServer.T,
                                 playerId: string,
                                 hotelId: AcquireServer.HotelId): number {
                let player = AcquireServer.player(server, playerId)
                let hotel = AcquireServer.hotel(server, hotelId)
                let shareHolder = shareHolderStatus(server, playerId, hotelId)

                let stockWorth = player.stocks[hotelId] * hotel.stock_price
                let bonusWorth = 0
                switch (shareHolder[0]) {
                    case Shareholder.Both: bonusWorth += hotel.majority_bonus + hotel.minority_bonus; break
                    case Shareholder.Majority: bonusWorth += hotel.majority_bonus; break
                    case Shareholder.TiedBoth: bonusWorth += (hotel.majority_bonus + hotel.minority_bonus) / shareHolder[1]; break
                    case Shareholder.Minority: bonusWorth += hotel.minority_bonus; break
                    case Shareholder.TiedMinority: bonusWorth += hotel.minority_bonus / shareHolder[1]; break
                    case Shareholder.None: break;
                    default: throw new TypeError("Unhandled ShareHolder type")
                }
                return stockWorth + bonusWorth
            }

            /* Create a function to convert a player id into its y coordinate. */
            function createIdToYFn(sortedPlayerIds: string[]): (string) => number {
                return (id: string) => sortedPlayerIds.indexOf(id)
            }
        }
    }

    /** Acquire game State Machine state. */
    export namespace Status {
        export class T {
            readonly stateMachine: StateMachine.T
            readonly response: Response.T

            constructor(game: Phaser.Game) {
                let height = Size.Status.height(game)
                let width = Size.Status.width(game)
                let x = Offset.Status.x(game)
                let y = Offset.Status.y(game)

                let smHeight = height * (1. / 3.)
                let responseHeight = height - smHeight

                this.stateMachine = new StateMachine.T(game, smHeight, width, x, y)
                this.response = new Response.T(game, responseHeight, width, x, y + smHeight)
            }
        }

        /** Draw the status window. */
        export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
            // statemachine
            StateMachine.draw(t.stateMachine, server, game)

            // response
            Response.draw(t.response, server)
        }

        /** Response to the previous action. */
        export namespace Response {
            export class T {
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite

                constructor(game: Phaser.Game,
                            height: number, width: number, x: number, y: number) {
                    this.bmd = game.add.bitmapData(width, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)
                }
            }

            /** draw the previous action response. */
            export function draw(t: T, server: AcquireServer.T) {
                let response = AcquireServer.response(server)

                t.bmd.clear()
                Bmd.fill(t.bmd, Color.S.White, 0)
                Bmd.responseText(t.bmd, response.message)
            }

            /** Draw the specified text. */
            export function drawText(t: T, message: string) {
                t.bmd.clear()
                Bmd.fill(t.bmd, Color.S.Yellow_Light, 0)
                Bmd.responseText(t.bmd, message)
            }
        }
        
        /** State of the game. */
        namespace StateMachine {
            export class T {
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite
                readonly popup: Popup.T
                readonly border: Border.T

                constructor(game: Phaser.Game,
                            height: number, width: number, x: number, y: number) {
                    this.bmd = game.add.bitmapData(width, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)

                    this.popup = new Popup.T(createPopupDrawFn(game))
                    this.border = new Border.T(this.sprite)

                    this.sprite.inputEnabled = true
                    this.sprite.events.onInputOver.add(() => AcquirePhaser.Render.enable(game))
                    this.sprite.events.onInputOut.add(() => AcquirePhaser.Render.enable(game))
                    this.sprite.events.onInputOver.add(() => Border.toggle(this.border, game, Border.Type.Select))
                    this.sprite.events.onInputOut.add(() => Border.toggle(this.border, game, Border.Type.None))
                }
            }

            /** Partially apply arguments executing the popup toggle. */
            function applyPopupToggle(popup: Popup.T, game: Phaser.Game) {
                let width = Size.Board.width(game) / 2
                let height = Size.Board.height(game) + Size.Hotel.height(game) + Size.Status.height(game) / 2
                let x = Math.min(Math.max(0, game.input.activePointer.worldX - width / 2), game.width - width)
                let y = game.input.activePointer.worldY
                return (server: AcquireServer.T, state: Popup.State) =>
                        Popup.toggle(popup, game, server, state,
                                    height, width, x, y)
            }

            /** Draw the basic SM state. */
            export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
                if (t.popup.state === Popup.State.Open) {
                    applyPopupToggle(t.popup, game) (server, Popup.State.Open)
                }
                t.sprite.events.onInputDown.removeAll()
                t.sprite.events.onInputDown.add(() => {
                    applyPopupToggle(t.popup, game) (server, Popup.State.Open)
                    Border.toggle(t.border, game, Border.Type.None)
                })

                let sm = AcquireServer.smState(server)
                t.bmd.clear()

                // draw basic sm state
                switch (sm.state) {
                    case AcquireServer.SmStateType.DrawTurnTile: 
                        Bmd.smText(t.bmd, "Draw tile for turn order")
                        break
                    case AcquireServer.SmStateType.PlaceTurnTile:
                        Bmd.smText(t.bmd, "Place turn order tile")
                        break
                    case AcquireServer.SmStateType.DrawInitialTiles:
                        Bmd.smText(t.bmd, "Draw 6 tiles for hand")
                        break
                    case AcquireServer.SmStateType.PlaceTile:
                        Bmd.smText(t.bmd, "Place tile", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.StartHotel:
                        Bmd.smText(t.bmd, "Start hotel", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.FoundersStock:
                        Bmd.smText(t.bmd, "Receive founding stock", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.BuyStock:
                        Bmd.smText(t.bmd, "Buy stock", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.DrawTile:
                        Bmd.smText(t.bmd, "Draw tile", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.EndGamePayout:
                        Bmd.smText(t.bmd, "Payout total assets")
                        break
                    case AcquireServer.SmStateType.GameOver:
                        Bmd.smText(t.bmd, "Game Over", [Str.capitalize(sm.player_results[0]) + " wins!"])
                        break
                    case AcquireServer.SmStateType.ChooseSurvivingHotel:
                        Bmd.smText(t.bmd, "Choose hotel to survive merger", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.ChooseDefunctHotel:
                        Bmd.smText(t.bmd, "Choose next hotel to defunct", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.PayBonuses:
                        Bmd.smText(t.bmd, "Payout shareholder bonuses", [Str.capitalize(sm.current_player)])
                        break
                    case AcquireServer.SmStateType.HandleDefunctHotelStocks:
                        Bmd.smText(t.bmd, "Handle defunct stocks", [Str.capitalize(sm.players_with_stock[0])])
                        break
                    default: throw new TypeError("Unhandled SM state type")
                }
            }


            /** Create the draw function to draw the detailed SM state popup. */
            function createPopupDrawFn(game: Phaser.Game) {
                return (server: AcquireServer.T, bmd: Phaser.BitmapData, sprite: Phaser.Sprite) => {
                    let sm = AcquireServer.smState(server)

                    bmd.clear()
                    Bmd.fill(bmd, Color.S.White, 0)

                    // add a stock information card
                    let informationCard = game.add.image(0, sprite.height / 2, Image.informationCard)
                    informationCard.width = sprite.width
                    informationCard.height = sprite.height / 2
                    sprite.addChild(informationCard)

                    // draw details of sm state
                    switch (sm.state) {
                        case AcquireServer.SmStateType.DrawTurnTile: 
                            let drawnTileLines = []
                            if (sm.players_drawn.length === 0) drawnTileLines = ["No one has drawn tiles"]
                            else drawnTileLines = sm.players_drawn.map((id, index) => Str.capitalize(id) + " has drawn a tile")
                            Bmd.smPopupText(bmd, "Draw tile for turn order", [
                                                 "",
                                                ].concat(drawnTileLines))
                            break
                        case AcquireServer.SmStateType.PlaceTurnTile:
                            let placedTileLines = []
                            if (sm.players_placed.length === 0) placedTileLines = ["No one has placed their tile"]
                            else placedTileLines = sm.players_placed.map((o, index) => Str.capitalize(o.player) + " placed tile " + o.tile)
                            Bmd.smPopupText(bmd, "Place turn order tile", [
                                                 "",
                                                ].concat(placedTileLines))
                            break
                        case AcquireServer.SmStateType.DrawInitialTiles:
                            drawnTileLines = []
                            if (sm.players_drawn.length === 0) drawnTileLines = ["No one has drawn their hand"]
                            else drawnTileLines = sm.players_drawn.map((id, index) => Str.capitalize(id) + " has drawn their hand")
                            Bmd.smPopupText(bmd, "Draw 6 tiles for hand", [
                                                 "",
                                                ].concat(drawnTileLines))
                            break
                        case AcquireServer.SmStateType.PlaceTile:
                            Bmd.smPopupText(bmd, "Place tile", [
                                                 Str.capitalize(sm.current_player),
                                    ])
                            break
                        case AcquireServer.SmStateType.StartHotel:
                            Bmd.smPopupText(bmd, "Start hotel", [
                                                 Str.capitalize(sm.current_player),
                                                 "",
                                                 "Starting Tiles",
                                                 sm.tiles.toString(),
                                    ])
                            break
                        case AcquireServer.SmStateType.FoundersStock:
                            Bmd.smPopupText(bmd, "Receive founding stock", [
                                                 Str.capitalize(sm.current_player),
                                                 "",
                                                 "For founding " + Str.capitalize(sm.started_hotel),
                                    ])
                            break
                        case AcquireServer.SmStateType.BuyStock:
                            Bmd.smPopupText(bmd, "Buy stock", [
                                                 Str.capitalize(sm.current_player),
                                    ])
                            break
                        case AcquireServer.SmStateType.DrawTile:
                            Bmd.smPopupText(bmd, "Draw tile", [
                                                 Str.capitalize(sm.current_player),
                                    ])
                            break
                        case AcquireServer.SmStateType.EndGamePayout:
                            let paidLines = sm.players_paid.map(id => Str.capitalize(id) + " has been paid")
                            Bmd.smPopupText(bmd, "Payout total assets", [
                                                 "",
                                                ].concat(paidLines))
                            break
                        case AcquireServer.SmStateType.GameOver:
                            let players = sm.player_results.map(id => AcquireServer.player(server, id))
                                                        .map(p => Num.moneyStr(p.money) + " for " + Str.capitalize(p.id))
                            Bmd.smPopupText(bmd, "Game Over", [
                                                 Str.capitalize(sm.player_results[0]) + " wins!",
                                                 "",
                                                ].concat(Str.padEndAll(players)))
                            break
                        case AcquireServer.SmStateType.ChooseSurvivingHotel:
                            Bmd.smPopupText(bmd, "Choose hotel to survive merger", [
                                                 Str.capitalize(sm.current_player),
                                                 "",
                                                 "Potential Hotels",
                                                 sm.potential_surviving_hotels.map(h => Str.capitalize(h)).toString(),
                                    ])
                            break
                        case AcquireServer.SmStateType.ChooseDefunctHotel:
                            let remainingHotels = []
                            if (sm.remaining_hotels.length !== 0) {
                                remainingHotels = [ "",
                                                   "Remaining Hotels",
                                                    sm.remaining_hotels.map(h => Str.capitalize(h)).toString() ]
                            }
                            Bmd.smPopupText(bmd, "Choose next hotel to defunct", [
                                                 Str.capitalize(sm.current_player),
                                                 "",
                                                 "Merging into " + Str.capitalize(sm.surviving_hotel),
                                                 "",
                                                 "Potential Hotels",
                                                 sm.potential_next_defunct_hotels.map(h => Str.capitalize(h)).toString(),
                                                ].concat(remainingHotels))
                            break
                        case AcquireServer.SmStateType.PayBonuses:
                            let payLines = sm.players_to_pay.map((o, index) => Num.moneyStr(o.amount) + " to " + Str.capitalize(o.player))
                            remainingHotels = []
                            if (sm.remaining_hotels.length !== 0) {
                                remainingHotels = [ "",
                                                   "Remaining Hotels",
                                                    sm.remaining_hotels.map(h => Str.capitalize(h)).toString() ]
                            }
                            Bmd.smPopupText(bmd, "Payout shareholder bonuses", [
                                                 Str.capitalize(sm.current_player),
                                                 "",
                                                 "Merging " + Str.capitalize(sm.defunct_hotel) + " into " + Str.capitalize(sm.surviving_hotel),
                                                 "",
                                                 "Players to Pay",
                                        ].concat(payLines)
                                         .concat(remainingHotels))
                            break
                        case AcquireServer.SmStateType.HandleDefunctHotelStocks:
                            remainingHotels = []
                            if (sm.remaining_hotels.length !== 0) {
                                remainingHotels = [ "",
                                                   "Remaining Hotels",
                                                    sm.remaining_hotels.map(h => Str.capitalize(h)).toString() ]
                            }
                            Bmd.smPopupText(bmd, "Handle defunct stocks", [
                                                 Str.capitalize(sm.players_with_stock[0]),
                                                 "",
                                                 "Merging " + Str.capitalize(sm.defunct_hotel) + " into " + Str.capitalize(sm.surviving_hotel),
                                                 "",
                                                 "Players with Stock",
                                                 sm.players_with_stock.map(p => Str.capitalize(p)).toString(),
                                                ].concat(remainingHotels))
                            break
                        default: throw new TypeError("Unhandled SM state type")
                    }
                }
            }
        }
    }

    /** Hotel icons. */
    export namespace Hotels {
        export class T {
            readonly hotels: { [id: string]: Hotel.T }

            constructor(server: AcquireServer.T, game: Phaser.Game) {
                this.hotels = {}
                AcquireServer.hotels(server).forEach(hotel =>
                    this.hotels[hotel.id] = new Hotel.T(game, hotel.id)
                )
            }
        }

        /** Draw the hotels. */
        export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
            Object.keys(t.hotels)
                  .map(id => t.hotels[id])
                  .forEach(t => Hotel.draw(t, server, game))
        }

        /** Number of hotels to span. */
        export const HOTELS_WIDTH = 7

        /** Convert a hotel id into its x coordinate. */
        export function idToX(id: AcquireServer.HotelId): number {
            switch (id) {
                case AcquireServer.HotelId.American: return 2
                case AcquireServer.HotelId.Continental: return 5 
                case AcquireServer.HotelId.Festival: return 3
                case AcquireServer.HotelId.Imperial: return 6
                case AcquireServer.HotelId.Luxor: return 0
                case AcquireServer.HotelId.Tower: return 1
                case AcquireServer.HotelId.Worldwide: return 4
                default: throw new TypeError("Unhandled hotel id")
            }
        }

        /** Hotel icon. */
        export namespace Hotel {
            export class T {
                readonly id: AcquireServer.HotelId
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite
                readonly popup: Popup.T
                readonly border: Border.T

                constructor(game: Phaser.Game, id: AcquireServer.HotelId) {
                    this.id = id

                    let height = Size.Hotel.height(game)
                    let width = Size.Hotel.width(game) / HOTELS_WIDTH
                    let x = Offset.Hotel.x(game) + idToX(id) * width
                    let y = Offset.Hotel.y(game)
                    this.bmd = game.add.bitmapData(width, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)

                    this.popup = new Popup.T(createPopupDrawFn(id))
                    this.border = new Border.T(this.sprite)
                    Border.toggle(this.border, game, Border.Type.Outline)

                    this.sprite.inputEnabled = true
                    this.sprite.events.onInputOver.add(() => AcquirePhaser.Render.enable(game))
                    this.sprite.events.onInputOut.add(() => AcquirePhaser.Render.enable(game))
                    this.sprite.events.onInputOver.add(() => Border.toggleMany(this.border, game, [Border.Type.Outline, Border.Type.Select]))
                    this.sprite.events.onInputOut.add(() => Border.toggle(this.border, game, Border.Type.Outline))
                }
            }

            /** Partially apply arguments executing the popup toggle. */
            function applyPopupToggle(popup: Popup.T, game: Phaser.Game) {
                let width = Size.Board.width(game) / 4
                let height = Size.Board.height(game)
                let x = Math.min(Math.max(0, game.input.activePointer.worldX - width / 2), game.width - width)
                let y = game.input.activePointer.worldY
                return (server: AcquireServer.T, state: Popup.State) =>
                       Popup.toggle(popup, game, server, state,
                                    height, width, x, y)
            }

            /** Draw the hotel and the hotel popup. */
            export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
                if (t.popup.state === Popup.State.Open) {
                    applyPopupToggle(t.popup, game) (server, Popup.State.Open)
                }
                t.sprite.events.onInputDown.removeAll()
                t.sprite.events.onInputDown.add(() => {
                    applyPopupToggle(t.popup, game) (server, Popup.State.Open)
                    Border.toggle(t.border, game, Border.Type.None)
                })

                let hotel = AcquireServer.hotel(server, t.id)
                t.bmd.clear()

                // draw hotel based on state
                switch (hotel.state.type) {
                    case AcquireServer.HotelStateType.Available:
                        // write hotel id
                        Bmd.fill(t.bmd, Color.colorOf(hotel.id), 0)
                        Bmd.hotelText(t.bmd, Str.capitalize(t.id))
                        break
                    case AcquireServer.HotelStateType.OnBoard:
                        // write hotel id and stock price
                        Bmd.fill(t.bmd, Color.colorOf(hotel.id), 0)
                        Bmd.hotelText(t.bmd, Str.capitalize(t.id), [
                                             Num.moneyStr(hotel.stock_price)
                                      ])
                        break
                    default: throw new TypeError("Unhandled hotel state type")
                }
            }

            /** Create the draw function to draw the hotel popup. */
            function createPopupDrawFn(id: AcquireServer.HotelId) {
                return (server: AcquireServer.T, bmd: Phaser.BitmapData, sprite: Phaser.Sprite) => {
                    let hotel = AcquireServer.hotel(server, id)

                    // put together hotel stock info
                    let bank = AcquireServer.bank(server)
                    let playersWithStock = AcquireServer.players(server)
                                                        .filter(p => p.stocks[hotel.id] > 0)
                                                        .sort((p1, p2) => p1.stocks[hotel.id] - p2.stocks[hotel.id])

                    // stocks
                    let playerStockTextLines = playersWithStock.map(p => Num.padStock(p.stocks[hotel.id]) + " " + Str.capitalize(p.id))
                    playerStockTextLines.push(Num.padStock(bank.stocks[hotel.id]) + " in Bank")
                    let stockTextLines = Str.padEndAll(playerStockTextLines)
                    stockTextLines.push("Stocks")
                    stockTextLines.reverse() // most stock -> least stock

                    bmd.clear()
                    switch (hotel.state.type) {
                        case AcquireServer.HotelStateType.Available:
                            // hotel id and denote availability
                            Bmd.fill(bmd, Color.colorOf(hotel.id), 0)
                            Bmd.hotelPopupText(bmd, Str.capitalize(id), [
                                                    "",
                                                    "Available",
                                                    ""
                                               ].concat(stockTextLines))
                            break
                        case AcquireServer.HotelStateType.OnBoard:
                            // safe or end game size
                            let safeEndSizeLines = []
                            if (hotel.is_end_game_size) {
                                safeEndSizeLines.push("")
                                safeEndSizeLines.push("End Game")
                            } else if (hotel.is_safe) {
                                safeEndSizeLines.push("")
                                safeEndSizeLines.push("Safe")
                            }

                            // hotel info
                            let hotelInfo = [ hotel.state.tiles.length + " tiles",
                                              Num.moneyStr(hotel.stock_price) + " per stock",
                                              "",
                                              Num.moneyStr(hotel.majority_bonus) + " majority",
                                              Num.moneyStr(hotel.minority_bonus) + " minority",
                                            ]
                            // hotel id, denote size state, monetary state, and player stock state
                            Bmd.fill(bmd, Color.colorOf(hotel.id), 0)
                            Bmd.hotelPopupText(bmd, Str.capitalize(id), safeEndSizeLines
                                                                        .concat([""])
                                                                        .concat(hotelInfo)
                                                                        .concat([""])
                                                                        .concat(stockTextLines))
                            break
                        default: throw new TypeError("Unhandled hotel state type")
                    }
                }
            }
        }
    }

    /** GUI for the Board. */
    namespace Board {
        export class T {
            readonly tiles: { [id: string]: Tile.T }

            constructor(server: AcquireServer.T, game: Phaser.Game) {
                this.tiles = {}
                AcquireServer.tiles(server).forEach(tile =>
                    this.tiles[tile.id] = new Tile.T(server, game, tile.id)
                )
            }
        }

        /** Draw the board. */
        export function draw(t: T, server: AcquireServer.T) {
            Object.keys(t.tiles)
                  .map(id => t.tiles[id])
                  .forEach(t => Tile.draw(t, server))
        }

        /* 1 ... 12
         * .
         * 9      */
        const TILES_HEIGHT = 9
        const TILES_WIDTH = 12

        /** Convert a tile id into (x, y) coordinates. */
        function idToXY(id: string): [number, number] {
            let split = id.split("-")
            let y = Number(split[0]) - 1
            let x = split[1].charCodeAt(0) - 65
            return [x, y]
        }

        /** Tile on the board. */
        namespace Tile {
            export class T {
                readonly id: string
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite
                readonly border: Border.T

                constructor(server: AcquireServer.T, game: Phaser.Game, id: string) {
                    this.id = id

                    let height = Size.Board.height(game) / TILES_HEIGHT
                    let width = Size.Board.width(game) / TILES_WIDTH
                    let x = Offset.Board.x(game) + idToXY(id)[1] * width
                    let y = Offset.Board.y(game) + idToXY(id)[0] * height
                    this.bmd = game.add.bitmapData(width, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)

                    this.border = new Border.T(this.sprite)
                    Border.toggle(this.border, game, Border.Type.Outline)
                }
            }

            /** Draw the board tile. */
            export function draw(t: T, server: AcquireServer.T) {
                let tile = AcquireServer.tile(server, t.id)
                t.bmd.clear()

                // draw based on tile state
                switch (tile.state.type) {
                    case AcquireServer.TileStateType.Discarded: 
                        // fill tile light red
                        Bmd.fill(t.bmd, Color.S.Red_Light, 0)
                        Bmd.tileText(t.bmd, tile.id, Color.S.Black)
                        break
                    case AcquireServer.TileStateType.DrawPile:
                        // fill tile white
                        Bmd.fill(t.bmd, Color.S.White, 0)
                        Bmd.tileText(t.bmd, tile.id, Color.S.Black)
                        break
                    case AcquireServer.TileStateType.OnBoard:
                        // fill tile black
                        Bmd.fill(t.bmd, Color.S.Black, 0)
                        Bmd.tileText(t.bmd, tile.id, Color.S.White)
                        break
                    case AcquireServer.TileStateType.OnBoardHotel:
                        // file tile with the color matching its hotel
                        Bmd.fill(t.bmd, Color.colorOf(tile.state.hotel), 0)
                        Bmd.tileText(t.bmd, tile.id, Color.S.White)
                        break
                    case AcquireServer.TileStateType.PlayerHand:
                        // fill tile white
                        Bmd.fill(t.bmd, Color.S.White, 0)
                        Bmd.tileText(t.bmd, tile.id, Color.S.Black)
                        break
                    default: throw new TypeError("Unhandled tile state type")
                }
            }
        }
    }

    /** Draw the 1st person view of one player. */
    namespace Self {
        export class T {
            readonly id: string
            readonly player: Player.T
            readonly tiles: Tile.T[]
            readonly stocks: { [id: string]: Stock.T }

            constructor(server: AcquireServer.T, game: Phaser.Game, id: string) {
                this.id = id
                this.tiles = []
                this.stocks = {}

                let height = Size.Self.height(game)
                let width = Size.Self.width(game)
                let x = Offset.Self.x(game)
                let y = Offset.Self.y(game)

                let playerWidth = Size.Self.width(game) / 6
                let tileWidth = Size.Self.width(game)  * (2. / 5.)
                let stockWidth = Size.Self.width(game) - playerWidth - tileWidth

                // player
                this.player = new Player.T(game, id,
                                           height, playerWidth, x, y)

                // tiles
                for (let i = 0; i < TILES_WIDTH; i++) {
                    let tHeight = height
                    let tWidth = tileWidth / TILES_WIDTH
                    let tX = x + playerWidth + i * tWidth
                    let tY = y
                    this.tiles.push(new Tile.T(server, game,
                                               tHeight, tWidth, tX, tY))
                }

                // stocks
                AcquireServer.hotels(server).forEach(hotel => {
                    let sHeight = height
                    let sWidth = stockWidth / Hotels.HOTELS_WIDTH
                    let sX = x + playerWidth + tileWidth + Hotels.idToX(hotel.id) * sWidth
                    let sY = y
                    this.stocks[hotel.id] = new Stock.T(game, hotel.id,
                                                        sHeight, sWidth, sX, sY)
                })
            }
        }

        /** Number of tiles in hand to span. */
        const TILES_WIDTH = 6

        /** Draw oneself. */
        export function draw(t: T, server: AcquireServer.T, game: Phaser.Game) {
            let player = AcquireServer.player(server, t.id)

            // player
            Player.draw(t.player, server)

            // player tiles
            let playerTiles = player.tiles.sort(Sort.tiles)
            for (let i = 0; i < TILES_WIDTH; i++) {
                Tile.draw(t.tiles[i], server, game, playerTiles[i])
            }

            // player stocks
            Object.keys(t.stocks)
                  .map(id => t.stocks[id])
                  .forEach(stock => Stock.draw(stock, (id) => player.stocks[id]))
        }

        /** Status of the player. */
        namespace Player {
            export class T {
                readonly id: string
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite
                readonly border: Border.T

                constructor(game: Phaser.Game, id: string,
                            height: number, width: number, x: number, y: number) {
                    this.id = id
                    this.bmd = game.add.bitmapData(width, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)
                    this.border = new Border.T(this.sprite)
                }
            }

            /** draw the previous action response. */
            export function draw(t: T, server: AcquireServer.T) {
                let player = AcquireServer.player(server, t.id)

                t.bmd.clear()
                Bmd.fill(t.bmd, Color.S.White, 0)

                // player name and money
                Bmd.playerText(t.bmd, Str.capitalize(player.id), [Num.moneyStr(player.money)])
            }
        }

        /** A tile in ones hand. */
        namespace Tile {
            export class T {
                id: string
                readonly bmd: Phaser.BitmapData
                readonly sprite: Phaser.Sprite
                readonly border: Border.T

                constructor(server: AcquireServer.T, game: Phaser.Game,
                            height: number, width: number, x: number, y: number) {
                    this.id = undefined

                    this.bmd = game.add.bitmapData(width, height)
                    this.sprite = game.add.sprite(x, y, this.bmd)

                    this.border = new Border.T(this.sprite)
                }
            }

            /** Draw the player's hand tile. */
            export function draw(t: T, server: AcquireServer.T, game: Phaser.Game, id: string) {
                t.id = id

                t.bmd.clear()
                if (t.id === undefined) {
                    Bmd.fill(t.bmd, Color.S.White, 0)
                } else {
                    Bmd.fillHeight(t.bmd, Color.S.Black, Size.Tile.height(game))
                    Bmd.tileText(t.bmd, t.id, Color.S.White)
                }
            }
        }
    }

    /** Utility functions for drawing on a Phaser BitmapData. */
    export namespace Bmd {

        /** Fill the bmd with color start at edge from the outside. */
        export function clear(bmd: Phaser.BitmapData, edge: number) {
            bmd.ctx.clearRect(edge, edge, bmd.width - 2 * edge, bmd.height - 2 * edge)
        }

        /** Fill the bmd with color start at edge from the outside. */
        export function fill(bmd: Phaser.BitmapData,
                             color: Color.S,
                             edge: number) {
            bmd.ctx.fillStyle = color
            bmd.ctx.fillRect(edge, edge, bmd.width - 2 * edge, bmd.height - 2 * edge)
        }

        /** Fill the bmd with color in a rectangle with the specified height. */
        export function fillHeight(bmd: Phaser.BitmapData,
                                   color: Color.S,
                                   height: number) {
            bmd.ctx.fillStyle = color
            bmd.ctx.fillRect(0, Math.max(0, (bmd.height - height) / 2), bmd.width, height)
        }

        /** Fill the bmd with color in a rectangle with the specified height and width. */
        export function fillRect(bmd: Phaser.BitmapData,
                                 color: Color.S,
                                 height: number,
                                 width: number) {
            bmd.ctx.fillStyle = color
            bmd.ctx.fillRect(Math.max(0, (bmd.width - width) / 2), Math.max(0, (bmd.height - height) / 2), width, height)
        }

        /** Create a border in the bmd of color with an interior color. Start at edge and make it the specified thickness. */
        export function border(bmd: Phaser.BitmapData,
                               borderColor: Color.S,
                               edge: number,
                               thickness: number) {
            let height = bmd.height
            let width = bmd.width
            fill(bmd, borderColor, edge)
        }

        /** Add text to a stock image. */
        export function stockText(bmd: Phaser.BitmapData, text: string) {
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "18px Rockwell"
            bmd.ctx.fillStyle = Color.S.White
            bmd.ctx.fillText(text, bmd.width / 2, bmd.height / 2)
        }

        /** add text to a response. */
        export function responseText(bmd: Phaser.BitmapData, text: string) {
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "12px Monospace"
            bmd.ctx.fillStyle = Color.S.Black

            let textLines = Str.intoLines(text, bmd.width / 9)
            var y = (bmd.height / 3) + 20
            for (let textLine of textLines) {
                bmd.ctx.fillText(textLine, bmd.width / 2, y)
                y += 20
            }
        }

        /** Add text for a player. Optional other text may be added with new lines. */
        export function playerText(bmd: Phaser.BitmapData,
                                   text: string,
                                   moreTextLines: string[] = []) {
            return playerTextGeneric(bmd, bmd.width / 8, bmd.height / 2, text, moreTextLines)
        }

        /** Add text for a player popup. Optional other text may be added with new lines. */
        export function playerPopupText(bmd: Phaser.BitmapData,
                                        text: string,
                                        moreTextLines: string[] = []) {
            return playerTextGeneric(bmd, bmd.width / 8, bmd.height / 6, text, moreTextLines)
        }

        /** Add text for the basic SM info. Optional other text may be added with new lines. */
        export function smText(bmd: Phaser.BitmapData,
                               text: string,
                               moreTextLines: string[] = []) {
            return smTextGeneric(bmd, bmd.height / 4, text, moreTextLines)
        }

        /** Add text for the SM popup info. Optional other text may be added with new lines. */
        export function smPopupText(bmd: Phaser.BitmapData,
                                    text: string,
                                    moreTextLines: string[] = []) {
            return smTextGeneric(bmd, bmd.height / 8, text, moreTextLines)
        }

        /** Add text for a hotel icon. Optional other text may be added with new lines. */
        export function hotelText(bmd: Phaser.BitmapData,
                                  text: string,
                                  moreTextLines: string[] = []) {
            return hotelTextGeneric(bmd, bmd.height / 4, text, moreTextLines)
        }

        /** Add text for a hotel icon popup. Optional other text may be added with new lines. */
        export function hotelPopupText(bmd: Phaser.BitmapData,
                                       text: string,
                                       moreTextLines: string[] = []) {
            return hotelTextGeneric(bmd, bmd.height / 6, text, moreTextLines)
        }

        /** Add text of the specified color for a board tile to a bmd. */
        export function tileText(bmd: Phaser.BitmapData,
                                 text: string,
                                 color: Color.S) {
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "18px Rockwell"
            bmd.ctx.fillStyle = color
            bmd.ctx.fillText(text, bmd.width / 1.9, bmd.height / 1.9)
        }

        /** Generic function for adding player icon text. */
        function playerTextGeneric(bmd: Phaser.BitmapData,
                                   x: number,
                                   y: number,
                                   text: string,
                                   moreTextLines: string[] = []) {
            bmd.ctx.textAlign = "left"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "20px Rockwell"
            bmd.ctx.fillStyle = Color.S.Black
            bmd.ctx.fillText(text, x, y)
            var y = y + 25
            for (let textLine of moreTextLines) {
                bmd.ctx.textAlign = "left"
                bmd.ctx.textBaseline = "middle"
                bmd.ctx.font = "16px Monospace"
                bmd.ctx.fillStyle = Color.S.Black
                bmd.ctx.fillText(textLine, x, y)
                y += 25
            }
        }

        /** Generic function for adding sm state text. */
        function smTextGeneric(bmd: Phaser.BitmapData,
                               y: number,
                               text: string,
                               moreTextLines: string[] = []) {
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "20px Rockwell"
            bmd.ctx.fillStyle = Color.S.Black
            bmd.ctx.fillText(text, bmd.width / 2, y)
            var y = y + 25
            for (let textLine of moreTextLines) {
                bmd.ctx.textAlign = "center"
                bmd.ctx.textBaseline = "middle"
                bmd.ctx.font = "16px Monospace"
                bmd.ctx.fillStyle = Color.S.Black
                bmd.ctx.fillText(textLine, bmd.width / 2, y)
                y += 25
            }
        }

        /** Generic function for adding hotel icon text. */
        function hotelTextGeneric(bmd: Phaser.BitmapData,
                                  y: number,
                                  text: string,
                                  moreTextLines: string[] = []) {
            bmd.ctx.textAlign = "center"
            bmd.ctx.textBaseline = "middle"
            bmd.ctx.font = "20px Rockwell"
            bmd.ctx.fillStyle = Color.S.White
            bmd.ctx.fillText(text, bmd.width / 2, y)
            var y = y + 25
            for (let textLine of moreTextLines) {
                bmd.ctx.textAlign = "center"
                bmd.ctx.textBaseline = "middle"
                bmd.ctx.font = "16px Monospace"
                bmd.ctx.fillStyle = Color.S.White
                bmd.ctx.fillText(textLine, bmd.width / 2, y)
                y += 25
            }
        }
    }
}
