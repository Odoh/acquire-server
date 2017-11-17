/**
 * A cache of AcquireServer objects which can describe the full state history of an Acquire game.
 * If an item is not found locally in the cache, a request to the server is made to pull it in.
 */
var AcquireServerCache;
(function (AcquireServerCache) {
    /* To improve access speed, preemptively request BUFFER historic cache entries and store them.
     * When the active GUI state is TRIGGER turns away from that last historic cache entry,
     * asynchronously populate more of the cache.
     */
    /** The number of previous turns to request when populating the history. */
    var HISTORY_CACHE_BUFFER = 10;
    /** The number of previous turns away from the end of the history cache to query for more history. */
    var HISTORY_CACHE_TRIGGER = 5;
    /** The number of retries to reconnect the WS on error. */
    var WS_ERROR_RETRIES = 5;
    var T = /** @class */ (function () {
        function T(connInfo, onUpdate) {
            var _this = this;
            this.connInfo = connInfo;
            this.cache = {};
            // initialize the cache with the current server state
            var server = new AcquireServer.T(currentStateSync(connInfo));
            this.currentTurn = server.turn;
            this.activeTurn = server.turn;
            this.historyCacheTurn = server.turn;
            this.cache[server.turn] = server;
            // asynchronously populate part of the history
            populateHistoryCacheAsync(this);
            // spin up the web socket for continual updates
            runAcquireWebSocket(connInfo, function (state) {
                if (state.turn > _this.currentTurn) {
                    _this.currentTurn = state.turn;
                    var server_1 = new AcquireServer.T(state);
                    _this.cache[server_1.turn] = server_1;
                    onUpdate(_this);
                }
            });
        }
        return T;
    }());
    AcquireServerCache.T = T;
    /** Retrieve the state from the cache, or sync request it. */
    function state(t, turn) {
        // console.log("T: currentTurn [" + t.currentTurn + "] activeTurn [" + t.activeTurn + "] historyCacheTurn [" + t.historyCacheTurn + "] historyCachePopulating [" + t.historyCachePopulating + "] cache " + t.cache)
        var state = t.cache[turn];
        if (state === undefined) {
            console.log("WARN: State for turn [" + turn + "] not in cache, sync requesting for it");
            state = new AcquireServer.T(JSON.parse(AcquireRequest.requestStateSync(t.connInfo, turn)));
            t.cache[turn] = state;
        }
        else {
            // console.log("Found state for turn [" + turn + "] in cache")
        }
        return state;
    }
    /** Return the AcquireServer for the current turn. */
    function currentTurn(t) {
        return state(t, t.currentTurn);
    }
    AcquireServerCache.currentTurn = currentTurn;
    /** Return the AcquireServer for the active turn. */
    function turn(t, turn) {
        return state(t, turn);
    }
    AcquireServerCache.turn = turn;
    /** Set the active turn to turn. */
    function setActiveTurn(t, turn) {
        t.activeTurn = turn;
    }
    AcquireServerCache.setActiveTurn = setActiveTurn;
    /** Return the AcquireServer for the next turn, or undefined if it does not exist. */
    function nextTurn(t, inc) {
        if (inc === void 0) { inc = 1; }
        if (t.activeTurn === t.currentTurn)
            return undefined;
        if ((t.activeTurn + inc) > t.currentTurn)
            t.activeTurn = t.currentTurn;
        else
            t.activeTurn += inc;
        return state(t, t.activeTurn);
    }
    AcquireServerCache.nextTurn = nextTurn;
    /** Return the AcquireServer for the previous turn, or undefined if it does not exist. */
    function prevTurn(t, dec) {
        if (dec === void 0) { dec = 1; }
        if (t.activeTurn === 0)
            return undefined;
        if ((t.activeTurn - dec) < 0)
            t.activeTurn = 0;
        else
            t.activeTurn -= dec;
        // if no history request is active and the active turn is past the history cache trigger, asynchronously populate more of the past history
        if (!t.historyCachePopulating && Math.max(0, t.activeTurn - HISTORY_CACHE_TRIGGER) < t.historyCacheTurn) {
            populateHistoryCacheAsync(t);
        }
        return state(t, t.activeTurn);
    }
    AcquireServerCache.prevTurn = prevTurn;
    /** Synchronously request, and return, the current game state. */
    function currentStateSync(connInfo) {
        return JSON.parse(AcquireRequest.requestCurrentStateSync(connInfo));
    }
    /** Asynchronously populate the server cache.  */
    function populateHistoryCacheAsync(t) {
        // flag ourselves as populating and calcuate the turns needing to be requested
        t.historyCachePopulating = true;
        var startTurn = Math.max(0, Math.min(t.activeTurn, t.historyCacheTurn) - HISTORY_CACHE_BUFFER);
        var endTurn = Math.max(0, t.historyCacheTurn - 1);
        console.log("requesting states in range [" + startTurn + ", " + endTurn + "]");
        // send the async history request
        AcquireRequest.requestHistoryAsync(t.connInfo, startTurn, endTurn, function (response) {
            // on completion, populate the cache iwth the results and set state according the results 
            for (var _i = 0, _a = JSON.parse(response); _i < _a.length; _i++) {
                var state_1 = _a[_i];
                var server = new AcquireServer.T(state_1);
                t.cache[server.turn] = server;
                // console.log("added server with turn [" + server.turn + "] to cache")
            }
            t.historyCacheTurn = startTurn;
            t.historyCachePopulating = false;
        });
    }
    /**
     * Create and run a WebSocket which will continually update the cache with new state on the server.
     * onUpdate is called when a new state is received.
     */
    function runAcquireWebSocket(connInfo, onUpdate, retry) {
        if (retry === void 0) { retry = 0; }
        var url = "ws://" + connInfo.rootUrl + "/game/ws";
        if (retry > WS_ERROR_RETRIES) {
            console.log("ERROR: Unable to connect to WS at url [" + url + "]");
            return;
        }
        // create a websocket and send the acquire game id we want updates for
        var ws = new WebSocket(url);
        ws.onopen = function () { return ws.send(connInfo.gameId); };
        ws.onmessage = function (e) { return onUpdate(JSON.parse(e.data)); };
        ws.onclose = function () { return console.log("WS closed"); };
        ws.onerror = function () {
            console.log("WS error, attempt to reconnect");
            runAcquireWebSocket(connInfo, onUpdate, retry + 1);
        };
    }
    /** Functions for requesting Acquire game state from a server. */
    var AcquireRequest;
    (function (AcquireRequest) {
        /** Synchronously request the current game state. */
        function requestCurrentStateSync(connInfo) {
            return requestSync("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId);
        }
        AcquireRequest.requestCurrentStateSync = requestCurrentStateSync;
        /** Synchronously request the game state at the specified turn. */
        function requestStateSync(connInfo, turn) {
            return requestSync("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId + "?turn=" + turn);
        }
        AcquireRequest.requestStateSync = requestStateSync;
        /**
         * Asynchronously request game history between startTurn and endTurn.
         * Call onComplete when the request completes.
         */
        function requestHistoryAsync(connInfo, startTurn, endTurn, onComplete) {
            requestAsync("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId + "/history" + "?startTurn=" + startTurn + "&endTurn=" + endTurn, onComplete);
        }
        AcquireRequest.requestHistoryAsync = requestHistoryAsync;
        /*
         * Generic GET request utility functions
         * -------------------------------------
         */
        var RequestType;
        (function (RequestType) {
            RequestType[RequestType["Async"] = 0] = "Async";
            RequestType[RequestType["Sync"] = 1] = "Sync";
        })(RequestType || (RequestType = {}));
        /** Perform an async request to the specified url, calling onComplete with the response. */
        function requestAsync(url, onComplete) {
            request(url, { type: RequestType.Async,
                onComplete: onComplete });
        }
        /** Perform a sync request to the specified url, returning the response. */
        function requestSync(url) {
            return request(url, { type: RequestType.Sync });
        }
        /** Perform a request to the specified  url. Returns the response if sync, otherwise returns undefined */
        function request(url, request) {
            var syncResponse = undefined;
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        switch (request.type) {
                            case RequestType.Async:
                                request.onComplete(xmlHttp.responseText);
                                return;
                            case RequestType.Sync:
                                syncResponse = xmlHttp.responseText;
                                return;
                            default:
                                throw new TypeError("Unhandled request type");
                        }
                    }
                    else if (xmlHttp.status == 0) {
                        console.log("Server not available!");
                    }
                }
            };
            xmlHttp.open("GET", url, request.type === RequestType.Async);
            xmlHttp.send(null);
            return syncResponse;
        }
    })(AcquireRequest || (AcquireRequest = {}));
})(AcquireServerCache || (AcquireServerCache = {}));
//# sourceMappingURL=acq_server_cache.js.map