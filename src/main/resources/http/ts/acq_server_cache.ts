
/**
 * A cache of AcquireServer objects which can describe the full state history of an Acquire game.
 * If an item is not found locally in the cache, a request to the server is made to pull it in.
 */
namespace AcquireServerCache {

    /* To improve access speed, preemptively request BUFFER historic cache entries and store them.
     * When the active GUI state is TRIGGER turns away from that last historic cache entry,
     * asynchronously populate more of the cache.
     */

    /** The number of previous turns to request when populating the history. */
    const HISTORY_CACHE_BUFFER = 10

    /** The number of previous turns away from the end of the history cache to query for more history. */
    const HISTORY_CACHE_TRIGGER = 5

    /** The number of retries to reconnect the WS on error. */
    const WS_ERROR_RETRIES = 30

    export class T {
        /** Connection information about the Acquire server. */
        readonly connInfo: ConnectionInfo
        /** The current turn of the Acquire game on the server. */
        currentTurn: number
        /** The turn which is active in the GUI. */
        activeTurn: number
        /** The previous turn which contains cached history, back from currentTurn. */
        historyCacheTurn: number
        /** Flag denoting whether a populate cache history request is active.  */
        historyCachePopulating: boolean
        /** Map of JSON responses indexed by turn:
         *  ie: cache[1] = JSON.parse(..) */
        cache: any

        constructor(connInfo: ConnectionInfo, onUpdate: (cache: AcquireServerCache.T) => void) {
            this.connInfo = connInfo
            this.cache = {}

            // initialize the cache with the current server state
            let server = new AcquireServer.T(currentStateSync(connInfo))
            this.currentTurn = server.turn
            this.activeTurn = server.turn
            this.historyCacheTurn = server.turn
            this.cache[server.turn] = server

            // asynchronously populate part of the history
            populateHistoryCacheAsync(this)

            // spin up the web socket for continual updates
            runAcquireWebSocket(connInfo, state => {
                if (state.turn > this.currentTurn) {
                    this.currentTurn = state.turn
                    let server = new AcquireServer.T(state)
                    this.cache[server.turn] = server
                    onUpdate(this)
                } 
            })
        }
    }

    /** Retrieve the state from the cache, or sync request it. */
    function state(t: T, turn: number): AcquireServer.T {
        // console.log("T: currentTurn [" + t.currentTurn + "] activeTurn [" + t.activeTurn + "] historyCacheTurn [" + t.historyCacheTurn + "] historyCachePopulating [" + t.historyCachePopulating + "] cache " + t.cache)

        let state = t.cache[turn]
        if (state === undefined) {
            console.log("WARN: State for turn [" + turn + "] not in cache, sync requesting for it")
            state = new AcquireServer.T(JSON.parse(AcquireRequest.requestStateSync(t.connInfo, turn)))
            t.cache[turn] = state
        } else {
            // console.log("Found state for turn [" + turn + "] in cache")
        }
        return state
    }

    /** Return the AcquireServer for the current turn. */
    export function currentTurn(t: T): AcquireServer.T {
        return state(t, t.currentTurn)
    }

    /** Return the AcquireServer for the active turn. */
    export function turn(t: T, turn: number): AcquireServer.T {
        return state(t, turn)
    }

    /** Set the active turn to turn. */
    export function setActiveTurn(t: T, turn: number) {
        t.activeTurn = turn
    }

    /** Return the AcquireServer for the next turn, or undefined if it does not exist. */
    export function nextTurn(t: T, inc: number = 1): AcquireServer.T {
        if (t.activeTurn === t.currentTurn) return undefined
        if ((t.activeTurn + inc) > t.currentTurn) t.activeTurn = t.currentTurn
        else                                      t.activeTurn += inc
        return state(t, t.activeTurn)
    }

    /** Return the AcquireServer for the previous turn, or undefined if it does not exist. */
    export function prevTurn(t: T, dec: number = 1): AcquireServer.T {
        if (t.activeTurn ===  0) return undefined
        if ((t.activeTurn - dec) < 0) t.activeTurn = 0
        else                          t.activeTurn -= dec

        // if no history request is active and the active turn is past the history cache trigger, asynchronously populate more of the past history
        if (!t.historyCachePopulating && Math.max(0, t.activeTurn - HISTORY_CACHE_TRIGGER) < t.historyCacheTurn) {
            populateHistoryCacheAsync(t)
        }
        return state(t, t.activeTurn)
    }

    /** Synchronously request, and return, the current game state. */
    function currentStateSync(connInfo: ConnectionInfo): any {
        return JSON.parse(AcquireRequest.requestCurrentStateSync(connInfo))
    }

    /** Asynchronously populate the server cache.  */
    function populateHistoryCacheAsync(t: T) {
        // flag ourselves as populating and calcuate the turns needing to be requested
        t.historyCachePopulating = true
        let startTurn = Math.max(0, Math.min(t.activeTurn, t.historyCacheTurn) - HISTORY_CACHE_BUFFER)
        let endTurn = Math.max(0, t.historyCacheTurn - 1)
        console.log("requesting states in range [" + startTurn + ", " + endTurn + "]")

        // send the async history request
        AcquireRequest.requestHistoryAsync(t.connInfo, startTurn, endTurn, response => {
            // on completion, populate the cache iwth the results and set state according the results 
            for (let state of JSON.parse(response)) {
                let server = new AcquireServer.T(state)
                t.cache[server.turn] = server
                // console.log("added server with turn [" + server.turn + "] to cache")
            }
            t.historyCacheTurn = startTurn
            t.historyCachePopulating = false
        })
    }

    /** 
     * Create and run a WebSocket which will continually update the cache with new state on the server.
     * onUpdate is called when a new state is received. 
     */
    function runAcquireWebSocket(connInfo: ConnectionInfo,
                                 onUpdate: ({ turn: number }) => void,
                                 retry: number = 0) {
        let url = "ws://" + connInfo.rootUrl + "/game/ws"
        if (retry > WS_ERROR_RETRIES) {
            console.log("ERROR: Unable to connect to WS at url [" + url + "]")
            return
        }

        // create a websocket and send the acquire game id we want updates for
        let ws = new WebSocket(url)
        ws.onopen = () => ws.send(connInfo.gameId)
        ws.onmessage = e => onUpdate(JSON.parse(e.data))
        ws.onclose = () => {
            console.log("WS closed, attempt to reconnect")
            runAcquireWebSocket(connInfo, onUpdate, retry + 1)
        }
        ws.onerror = () => {
            console.log("WS error, attempt to reconnect")
            runAcquireWebSocket(connInfo, onUpdate, retry + 1)
        }
    }

    /** Functions for requesting Acquire game state from a server. */
    namespace AcquireRequest {

        /** Synchronously request the current game state. */
        export function requestCurrentStateSync(connInfo: ConnectionInfo): string {
            return requestSync("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId)
        }

        /** Synchronously request the game state at the specified turn. */
        export function requestStateSync(connInfo: ConnectionInfo, turn: number): string {
            return requestSync("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId + "?turn=" + turn)
        }

        /** 
         * Asynchronously request game history between startTurn and endTurn.
         * Call onComplete when the request completes.
         */
        export function requestHistoryAsync(connInfo: ConnectionInfo,
                                            startTurn: number,
                                            endTurn: number,
                                            onComplete: (string) => void) {
            requestAsync("http://" + connInfo.rootUrl + "/game/" + connInfo.gameId + "/history" + "?startTurn=" + startTurn + "&endTurn=" + endTurn,
                         onComplete)
        }

        /*
         * Generic GET request utility functions
         * -------------------------------------
         */

        enum RequestType {
            Async,
            Sync
        }

        type Request = 
        | AsyncRequest
        | SyncRequest

        type AsyncRequest = { readonly type: RequestType.Async,
                              readonly onComplete: (string) => void }
        type SyncRequest = { readonly type: RequestType.Sync }

        /** Perform an async request to the specified url, calling onComplete with the response. */
        function requestAsync(url: string, onComplete: (string) => void) {
            request(url, { type: RequestType.Async,
                           onComplete: onComplete })
        }

        /** Perform a sync request to the specified url, returning the response. */
        function requestSync(url: string): string {
            return request(url, { type: RequestType.Sync})
        }

        /** Perform a request to the specified  url. Returns the response if sync, otherwise returns undefined */
        function request(url: string, request: Request): string {
            let syncResponse = undefined
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        switch (request.type) {
                            case RequestType.Async:
                                request.onComplete(xmlHttp.responseText)
                                return
                            case RequestType.Sync:
                                syncResponse = xmlHttp.responseText
                                return
                            default:
                                throw new TypeError("Unhandled request type")
                        }
                    } else if (xmlHttp.status == 0) {
                        console.log("Server not available!")
                    }
                }
            }
            xmlHttp.open("GET", url, request.type === RequestType.Async)
            xmlHttp.send(null);
            return syncResponse
        }
    }
}