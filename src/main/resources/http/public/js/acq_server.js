/**
 * Functions for querying the state of an Acquire game on the server at a given turn, point in time.
 */
var AcquireServer;
(function (AcquireServer) {
    var T = /** @class */ (function () {
        function T(state) {
            this.state = state;
            this.turn = state.turn;
        }
        return T;
    }());
    AcquireServer.T = T;
    /*
     * Acquire Data Model
     * ------------------
     */
    /* Acquire Requests */
    var RequestType;
    (function (RequestType) {
        RequestType["AcceptMoney"] = "accept_money";
        RequestType["AcceptStock"] = "accept_stock";
        RequestType["BuyStock"] = "buy_stock";
        RequestType["ChooseHotel"] = "choose_hotel";
        RequestType["DrawTile"] = "draw_tile";
        RequestType["EndGame"] = "end_game";
        RequestType["HandleStocks"] = "handle_stocks";
        RequestType["PlaceTile"] = "place_tile";
        RequestType["StartGame"] = "start_game";
    })(RequestType = AcquireServer.RequestType || (AcquireServer.RequestType = {}));
    /* Tile */
    var TileStateType;
    (function (TileStateType) {
        TileStateType["Discarded"] = "discarded";
        TileStateType["DrawPile"] = "draw_pile";
        TileStateType["OnBoard"] = "on_board";
        TileStateType["OnBoardHotel"] = "on_board_hotel";
        TileStateType["PlayerHand"] = "player_hand";
    })(TileStateType = AcquireServer.TileStateType || (AcquireServer.TileStateType = {}));
    /* Hotel */
    var HotelId;
    (function (HotelId) {
        HotelId["American"] = "american";
        HotelId["Continental"] = "continental";
        HotelId["Festival"] = "festival";
        HotelId["Imperial"] = "imperial";
        HotelId["Luxor"] = "luxor";
        HotelId["Tower"] = "tower";
        HotelId["Worldwide"] = "worldwide";
    })(HotelId = AcquireServer.HotelId || (AcquireServer.HotelId = {}));
    function toId(hotelId) {
        switch (hotelId) {
            case "american": return HotelId.American;
            case "continental": return HotelId.Continental;
            case "festival": return HotelId.Festival;
            case "imperial": return HotelId.Imperial;
            case "luxor": return HotelId.Luxor;
            case "tower": return HotelId.Tower;
            case "worldwide": return HotelId.Worldwide;
            default: throw new TypeError("Unhandled hotelId " + hotelId);
        }
    }
    AcquireServer.toId = toId;
    var HotelStateType;
    (function (HotelStateType) {
        HotelStateType["Available"] = "available";
        HotelStateType["OnBoard"] = "on_board";
    })(HotelStateType = AcquireServer.HotelStateType || (AcquireServer.HotelStateType = {}));
    /* Acquire StateMachine */
    var SmStateType;
    (function (SmStateType) {
        SmStateType["DrawTurnTile"] = "draw_turn_tile";
        SmStateType["PlaceTurnTile"] = "place_turn_tile";
        SmStateType["DrawInitialTiles"] = "draw_initial_tiles";
        SmStateType["PlaceTile"] = "place_tile";
        SmStateType["StartHotel"] = "start_hotel";
        SmStateType["FoundersStock"] = "founders_stock";
        SmStateType["BuyStock"] = "buy_stock";
        SmStateType["DrawTile"] = "draw_tile";
        SmStateType["EndGamePayout"] = "end_game_payout";
        SmStateType["GameOver"] = "game_over";
        SmStateType["ChooseSurvivingHotel"] = "choose_surviving_hotel";
        SmStateType["ChooseDefunctHotel"] = "choose_defunct_hotel";
        SmStateType["PayBonuses"] = "pay_bonuses";
        SmStateType["HandleDefunctHotelStocks"] = "handle_defunct_hotel_stocks";
    })(SmStateType = AcquireServer.SmStateType || (AcquireServer.SmStateType = {}));
    /*
     * Acquire Accessors
     * -----------------
     */
    /** Return the bank. */
    function bank(t) {
        if (t.state === undefined) {
            console.log("WHY IS UNDEFINED");
        }
        return t.state.objs.bank;
    }
    AcquireServer.bank = bank;
    /** Return the game baord. */
    function board(t) {
        return t.state.objs.board;
    }
    AcquireServer.board = board;
    /** Return the players in the game. */
    function players(t) {
        var players = t.state.objs.players;
        return Object.keys(players).map(function (id) { return players[id]; });
    }
    AcquireServer.players = players;
    /** Return the player with the specified id. */
    function player(t, id) {
        return t.state.objs.players[id];
    }
    AcquireServer.player = player;
    /** Return the tiles in the game. */
    function tiles(t) {
        var tiles = t.state.objs.tiles;
        return Object.keys(tiles).map(function (id) { return tiles[id]; });
    }
    AcquireServer.tiles = tiles;
    /** Return the tile with the specified id. */
    function tile(t, id) {
        return t.state.objs.tiles[id];
    }
    AcquireServer.tile = tile;
    /** Return the hotels in the game. */
    function hotels(t) {
        var hotels = t.state.objs.hotels;
        return Object.keys(hotels).map(function (id) { return hotels[id]; });
    }
    AcquireServer.hotels = hotels;
    /** Return the hotel with the specified id. */
    function hotel(t, id) {
        return t.state.objs.hotels[id];
    }
    AcquireServer.hotel = hotel;
    /** Return the SM state of this turn. */
    function smState(t) {
        return t.state.sm;
    }
    AcquireServer.smState = smState;
    /** Return the request which led to the state of this turn. */
    function request(t) {
        return t.state.request;
    }
    AcquireServer.request = request;
    /** Return the response which led to the state of this turn. */
    function response(t) {
        return t.state.response;
    }
    AcquireServer.response = response;
})(AcquireServer || (AcquireServer = {}));
//# sourceMappingURL=acq_server.js.map