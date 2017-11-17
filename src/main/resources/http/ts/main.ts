
/**
 * Describes this client's connetion information to an Acquire server.
 */
type ConnectionInfo = {
    rootUrl: string
    gameId: string,
    selfId: string,
}

/**
 * Main entry point.
 * 
 * @param game a instance of a Phaser game.
 * @param rootUrl the root URL of the aquire server ("localhost:8080")
 * @param gameId the id of the game.
 * @param selfId the id of the first person perspective.
 */
function main(game: Phaser.Game, rootUrl: string, gameId: string, selfId: string) {
    console.log("Starting.. rootUrl [" + rootUrl + "] gameId [" + gameId + "] selfId [" + selfId + "]")
    let connInfo: ConnectionInfo = { rootUrl: rootUrl, gameId: gameId, selfId: selfId }

    /* Construct a cache of AcquireServers which provides an efficient hook into the state of the game on the server
     * This cache is updated when the server pushes new state to the connected websocket; the specified
     * callback function is called at that time.
     */
    let cache = new AcquireServerCache.T(connInfo, update => {
        cache = update

        /* The current state of the game has changed, propagte this information to the user by:
         * 1. drawing the turn before the current state.
         * 2. animate the request which resulted into the current state.
         * 3. draw the current state.
         */
        let local = AcquireServerCache.currentTurn(cache)
        let prevLocal = AcquireServerCache.turn(cache, local.turn - 1)
        AcquirePhaser.draw(phaser, prevLocal)
        AcquireServerCache.setActiveTurn(cache, prevLocal.turn)
        AcquireAnimation.animateRequest(phaser, local, prevLocal, () => {
            // upon animation completion, draw the current state and activete player requests, if applicable
            AcquirePhaser.draw(phaser, local)
            if (selfId.length !== 0) {
                cleanRequestFn()
                cleanRequestFn = AcquireRequest.activateRequest(connInfo, phaser, local)
            }
        })
    })

    /* Construct the phaser GUI using the current state of the game.
     * Draw the current state.
     * Active player requests, if applicable
     */
    let server = AcquireServerCache.currentTurn(cache)
    let phaser = new AcquirePhaser.T(server, game, selfId)
    AcquirePhaser.draw(phaser, server)
    let cleanRequestFn: () => void = () => {}
    if (selfId.length !== 0) {
        cleanRequestFn = AcquireRequest.activateRequest(connInfo, phaser, server)
    }

    /* Setup callbacks to navigate through the game history. */

    let drawNextTurn = (inc: number) => {
        let local = AcquireServerCache.nextTurn(cache, inc)
        // if already at the current turn, do nothing
        if (local === undefined) return

        let prevLocal = AcquireServerCache.turn(cache, local.turn - 1)
        AcquireAnimation.animateRequest(phaser, local, prevLocal, () => {
            // upon animation completion, draw the current state
            // if now looking at the current turn on the server, activate player requests, if applicable
            AcquirePhaser.draw(phaser, local)
            if (cache.activeTurn === cache.currentTurn && selfId.length !== 0) {
                cleanRequestFn()
                cleanRequestFn = AcquireRequest.activateRequest(connInfo, phaser, local)
            }
        })
    }

    let drawPrevTurn = (dec: number) => {
        let local = AcquireServerCache.prevTurn(cache, dec)
        // if already at the starting turn, do nothing
        if (local === undefined) return
        AcquirePhaser.draw(phaser, local)
    }

    /* Create buttons on each side of the board to traverse the history. */
    let leftBoardSprite = game.add.sprite(AcquirePhaser.Offset.Board.x(game), AcquirePhaser.Offset.Board.y(game) + AcquirePhaser.Size.Tile.height(game))
    leftBoardSprite.height = AcquirePhaser.Size.Board.height(game) - AcquirePhaser.Size.Tile.height(game)
    leftBoardSprite.width = AcquirePhaser.Size.Board.width(game) / 3
    leftBoardSprite.inputEnabled = true
    leftBoardSprite.events.onInputDown.add(() => drawPrevTurn(1))

    let rightBoardSprite = game.add.sprite(AcquirePhaser.Offset.Board.x(game) + AcquirePhaser.Size.Board.width(game) * (2. / 3.),
                                           AcquirePhaser.Offset.Board.y(game) + AcquirePhaser.Size.Tile.height(game))
    rightBoardSprite.height = AcquirePhaser.Size.Board.height(game) - AcquirePhaser.Size.Tile.height(game)
    rightBoardSprite.width = AcquirePhaser.Size.Board.width(game) / 3
    rightBoardSprite.inputEnabled = true
    rightBoardSprite.events.onInputDown.add(() => drawNextTurn(1))


    /* Use arrow keys to traverse the history. */

    let up = game.input.keyboard.addKey(Phaser.Keyboard.UP)
    let down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    let right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    let left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT)

    up.onDown.add(() => drawPrevTurn(10))
    down.onDown.add(() => drawNextTurn(10))
    left.onDown.add(() => drawPrevTurn(1))
    right.onDown.add(() => drawNextTurn(1))

    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.RIGHT,
                                        Phaser.Keyboard.LEFT,
                                        Phaser.Keyboard.UP,
                                        Phaser.Keyboard.DOWN, ])
    console.log("Started!")
}