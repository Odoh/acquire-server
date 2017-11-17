
/**
 * Functions for querying the state of an Acquire game on the server at a given turn, point in time.
 */
namespace AcquireServer {

    export class T {
        /** The deserialization of the Acquire game state() JSON. */
        state: any
        /** The turn in the Acquire game this state represents. */
        turn: number

        constructor(state: any) {
            this.state = state
            this.turn = state.turn
        }
    }

    /*
     * Acquire Data Model
     * ------------------
     */

    /* Acquire Requests */
    export enum RequestType {
        AcceptMoney = "accept_money",
        AcceptStock = "accept_stock",
        BuyStock = "buy_stock",
        ChooseHotel = "choose_hotel",
        DrawTile = "draw_tile",
        EndGame = "end_game",
        HandleStocks = "handle_stocks",
        PlaceTile = "place_tile",
        StartGame = "start_game",
    }
    export type RequestAcceptMoney = { readonly type: RequestType.AcceptMoney,
                                       readonly player: string }
    export type RequestAcceptStock = { readonly type: RequestType.AcceptStock,
                                       readonly player: string }
    export type RequestBuyStock = { readonly type: RequestType.BuyStock,
                                    readonly player: string,
                                    readonly stocks: Stocks }
    export type RequestChooseHotel = { readonly type: RequestType.ChooseHotel,
                                       readonly player: string,
                                       readonly hotel: HotelId }
    export type RequestDrawTile = { readonly type: RequestType.DrawTile,
                                    readonly player: string }
    export type RequestEndGame = { readonly type: RequestType.EndGame,
                                   readonly player: string }
    export type RequestHandleStocks = { readonly type: RequestType.HandleStocks,
                                        readonly player: string,
                                        readonly trade: number,
                                        readonly sell: number,
                                        readonly keep: number }
    export type RequestPlaceTile = { readonly type: RequestType.PlaceTile,
                                     readonly player: string,
                                     readonly tile: string }
    export type RequestStartGame = { readonly type: RequestType.StartGame,
                                     readonly player: string }
                
    export type Request =
    | RequestAcceptMoney
    | RequestAcceptStock
    | RequestBuyStock
    | RequestChooseHotel
    | RequestDrawTile
    | RequestEndGame
    | RequestHandleStocks
    | RequestPlaceTile
    | RequestStartGame

    /* Acquire Response */
    export type Response = { readonly success: boolean,
                             readonly message: string }

    /* Acquire Objects */
    export type Bank = { readonly draw_pile_size: number,
                         readonly stocks: Stocks }
    export type Board = { readonly tiles: string[] }
    export type Player = { readonly id: string,
                           readonly money: number,
                           readonly tiles: string[],
                           readonly stocks: Stocks }

    /* Tile */
    export enum TileStateType {
        Discarded = "discarded",
        DrawPile = "draw_pile",
        OnBoard = "on_board",
        OnBoardHotel = "on_board_hotel",
        PlayerHand = "player_hand",
    }
    export type TileStateDiscarded = { readonly type: TileStateType.Discarded }
    export type TileStateDrawPile = { readonly type: TileStateType.DrawPile }
    export type TileStateOnBoard = { readonly type: TileStateType.OnBoard }
    export type TileStateOnBoardHotel = { readonly type: TileStateType.OnBoardHotel,
                                          readonly hotel: HotelId }
    export type TileStatePlayerHand = { readonly type: TileStateType.PlayerHand,
                                        readonly player: string }
    export type TileState = 
    | TileStateDrawPile
    | TileStatePlayerHand
    | TileStateOnBoard
    | TileStateOnBoardHotel
    | TileStateDiscarded

    export type Tile = { readonly id: string,
                         readonly state: TileState }

    /* Hotel */
    export enum HotelId {
        American = "american",
        Continental = "continental",
        Festival = "festival",
        Imperial = "imperial",
        Luxor = "luxor",
        Tower = "tower",
        Worldwide = "worldwide"
    }

    export function toId(hotelId: string): HotelId {
        switch (hotelId) {
            case "american": return HotelId.American
            case "continental": return HotelId.Continental
            case "festival": return HotelId.Festival
            case "imperial": return HotelId.Imperial
            case "luxor": return HotelId.Luxor
            case "tower": return HotelId.Tower
            case "worldwide": return HotelId.Worldwide
            default: throw new TypeError("Unhandled hotelId " + hotelId)
        }
    }

    export enum HotelStateType {
        Available = "available",
        OnBoard = "on_board"
    }
    export type HotelStateAvailable = { readonly type: HotelStateType.Available }
    export type HotelStateOnBoard = { readonly type: HotelStateType.OnBoard,
                                      readonly tiles: string[] }
    export type HotelState =
    | HotelStateAvailable
    | HotelStateOnBoard

    export type Hotel = { readonly id: HotelId,
                          readonly state: HotelState,
                          readonly stock_price: number,
                          readonly majority_bonus: number,
                          readonly minority_bonus: number,
                          readonly is_safe: boolean,
                          readonly is_end_game_size: boolean }

    export type Stocks = { readonly [h in HotelId]: number }

    /* Acquire StateMachine */
    export enum SmStateType {
        DrawTurnTile = "draw_turn_tile",
        PlaceTurnTile = "place_turn_tile",
        DrawInitialTiles = "draw_initial_tiles",
        PlaceTile = "place_tile",
        StartHotel = "start_hotel",
        FoundersStock = "founders_stock",
        BuyStock = "buy_stock",
        DrawTile = "draw_tile",
        EndGamePayout = "end_game_payout",
        GameOver = "game_over",
        ChooseSurvivingHotel = "choose_surviving_hotel",
        ChooseDefunctHotel = "choose_defunct_hotel",
        PayBonuses = "pay_bonuses",
        HandleDefunctHotelStocks = "handle_defunct_hotel_stocks"
    }
    export type SmStateDrawTurnTile = { readonly state: SmStateType.DrawTurnTile,
                                        readonly players_drawn: string[] }
    export type SmStatePlaceTurnTile = { readonly state: SmStateType.PlaceTurnTile,
                                         readonly players_placed: { player: string, tile: string }[] }
    export type SmStateDrawInitialTiles = { readonly state: SmStateType.DrawInitialTiles,
                                            readonly players_drawn: string[] }
    export type SmStatePlaceTile = { readonly state: SmStateType.PlaceTile,
                                     readonly current_player: string } 
    export type SmStateStartHotel = { readonly state: SmStateType.StartHotel,
                                      readonly current_player: string,
                                      readonly tiles: string[] }
    export type SmStateFoundersStock = { readonly state: SmStateType.FoundersStock,
                                         readonly current_player: string,
                                         readonly started_hotel: HotelId }
    export type SmStateBuyStock = { readonly state: SmStateType.BuyStock,
                                    readonly current_player: string }
    export type SmStateDrawTile = { readonly state: SmStateType.DrawTile,
                                    readonly current_player: string }
    export type SmStateEndGamePayout = { readonly state: SmStateType.EndGamePayout,
                                         readonly players_paid: string[] }
    export type SmStateGameOver = { readonly state: SmStateType.GameOver,
                                    readonly player_results: string[] }
    export type SmStateChooseSurvivingHotel = { readonly state: SmStateType.ChooseSurvivingHotel,
                                                readonly current_player: string,
                                                readonly potential_surviving_hotels: HotelId[] }
    export type SmStateChooseDefunctHotel = { readonly state: SmStateType.ChooseDefunctHotel,
                                              readonly current_player: string,
                                              readonly surviving_hotel: HotelId,
                                              readonly potential_next_defunct_hotels: HotelId[],
                                              readonly remaining_hotels: HotelId[] }
    export type SmStatePayBonuses = { readonly state: SmStateType.PayBonuses,
                                      readonly current_player: string,
                                      readonly surviving_hotel: HotelId,
                                      readonly defunct_hotel: HotelId,
                                      readonly remaining_hotels: HotelId[],
                                      readonly players_to_pay: { player: string, amount: number }[], }
    export type SmStateHandleDefunctHotelStocks = { readonly state: SmStateType.HandleDefunctHotelStocks,
                                                    readonly current_player: string,
                                                    readonly surviving_hotel: HotelId,
                                                    readonly defunct_hotel: HotelId,
                                                    readonly remaining_hotels: HotelId[],
                                                    readonly players_with_stock: string[] }
    export type SmState =
    | SmStateDrawTurnTile
    | SmStatePlaceTurnTile
    | SmStateDrawInitialTiles
    | SmStatePlaceTile
    | SmStateStartHotel
    | SmStateFoundersStock
    | SmStateBuyStock
    | SmStateDrawTile
    | SmStateEndGamePayout
    | SmStateGameOver
    | SmStateChooseSurvivingHotel
    | SmStateChooseDefunctHotel
    | SmStatePayBonuses
    | SmStateHandleDefunctHotelStocks

    /*
     * Acquire Accessors
     * -----------------
     */
                
     /** Return the bank. */
    export function bank(t: T): Bank {
        if (t.state === undefined) {
            console.log("WHY IS UNDEFINED")
        }
        return t.state.objs.bank
    }

    /** Return the game baord. */
    export function board(t: T): Board {
        return t.state.objs.board
    }

    /** Return the players in the game. */
    export function players(t: T): Player[] {
        let players = t.state.objs.players
        return Object.keys(players).map(id => players[id])
    }

    /** Return the player with the specified id. */
    export function player(t: T, id: string): Player {
        return t.state.objs.players[id]
    }

    /** Return the tiles in the game. */
    export function tiles(t: T): Tile[] {
        let tiles = t.state.objs.tiles
        return Object.keys(tiles).map(id => tiles[id])
    }

    /** Return the tile with the specified id. */
    export function tile(t: T, id: string): Tile {
        return t.state.objs.tiles[id]
    }

    /** Return the hotels in the game. */
    export function hotels(t: T): Hotel[] {
        let hotels = t.state.objs.hotels
        return Object.keys(hotels).map(id => hotels[id])
    }

    /** Return the hotel with the specified id. */
    export function hotel(t: T, id: HotelId): Hotel {
        return t.state.objs.hotels[id]
    }

    /** Return the SM state of this turn. */
    export function smState(t: T): SmState {
        return t.state.sm
    }

    /** Return the request which led to the state of this turn. */
    export function request(t: T): Request {
        return t.state.request
    }

    /** Return the response which led to the state of this turn. */
    export function response(t: T): Response {
        return t.state.response
    }
}