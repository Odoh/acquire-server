
/**
 * Describes this client's connetion information to an Acquire server.
 */
type ConnectionInfo = {
    rootUrl: string
    gameId: string,
    selfId: string,
}

/** Draw the Acquire game.
 *
 * @param phaser an instance of AcquirePhaser.
 * @param server the state of the AcquireServer to draw.
 */
function drawAcquire(phaser: AcquirePhaser.T, server: AcquireServer.T) {
    AcquirePhaser.Render.enable(phaser.game)
    AcquirePhaser.draw(phaser, server)
}

/** Draw the Acquire game and activate user inputs if its our turn.
 *
 * @param phaser an instance of AcquirePhaser.
 * @param server the state of the AcquireServer to draw.
 * @param selfId the ID of ourselves.
 * @param connInfo this client's connection information.
 * @param cleanRequestFn function to call which cleans
 *  the previous request's objects.
 * @returns a function to clear the current request's objects.
*/
function drawAndActivateAcquire(phaser: AcquirePhaser.T,
                                server: AcquireServer.T,
                                selfId: string,
                                connInfo: ConnectionInfo,
                                cleanRequestFn: () => void): () => void {
    drawAcquire(phaser, server)
    if (selfId.length !== 0) {
        cleanRequestFn()
        return AcquireRequest.activateRequest(connInfo, phaser, server)
    }
    return () => {}
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
        AcquireServerCache.setActiveTurn(cache, prevLocal.turn)

        drawAcquire(phaser, prevLocal)
        AcquireAnimation.animateRequest(phaser, local, prevLocal, () => {
            cleanRequestFn = drawAndActivateAcquire(phaser, local, selfId, connInfo, cleanRequestFn)
        })
    })

    /* Construct the phaser GUI using the current state of the game. */
    let server = AcquireServerCache.currentTurn(cache)
    let phaser = new AcquirePhaser.T(server, game, selfId)
    let cleanRequestFn = drawAndActivateAcquire(phaser, server, selfId, connInfo, () => {})

    /* Set an interval to disable rendering in the game loop. Since a large portion of the game is
     * watching the board and waiting for someone else to play, it wastes A LOT of CPU cycles re-rendering
     * the screen many times a second.
     *
     * Logic is in place to manual re-enable rendering when:
     * - A popup button becomes highlighted
     * - An animation is in progress
     * - It is our turn
     */
    setInterval(() => AcquirePhaser.Render.disable(game), 5000)

    /* Setup callbacks to navigate through the game history. */
    let drawNextTurn = (inc: number) => {
        // if already at the current turn, do nothing
        let local = AcquireServerCache.nextTurn(cache, inc)
        if (local === undefined) return

        // if incremented up to the current turn, activate requests in addition to drawing Acquire
        let draw = () => {
            if (cache.activeTurn === cache.currentTurn) {
                cleanRequestFn = drawAndActivateAcquire(phaser, local, selfId, connInfo, cleanRequestFn)
            } else {
                drawAcquire(phaser, local)
            }
        }

        if (inc == 1) {
            // animate the request
            let prevLocal = AcquireServerCache.turn(cache, local.turn - 1)
            AcquireAnimation.animateRequest(phaser, local, prevLocal, () => {
                draw()
            })
        } else {
            // incremented by more than one request, don't animate
            draw()
        }
    }

    let drawPrevTurn = (dec: number) => {
        // if already at the starting turn, do nothing
        let local = AcquireServerCache.prevTurn(cache, dec)
        if (local === undefined) return

        cleanRequestFn()
        cleanRequestFn = () => {}
        drawAcquire(phaser, local)
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