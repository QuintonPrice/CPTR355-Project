var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(4, 4, 0), scene);
    camera.setPosition(new BABYLON.Vector3(4, 4, 15));
    camera.attachControl(canvas, true);
    camera.allowUpsideDown = true;
    camera.invertRotation = false;

    // Setup lights
    const hemiLight = new BABYLON.HemisphericLight("hemiLght", new BABYLON.Vector3(1, 1, 0));
    hemiLight.intensity = 1;

    const light = new BABYLON.PointLight("light", new BABYLON.Vector3(-2, 7, 2), scene);
    light.intensity = 1.5;

    var lightOn = true;
    light.setEnabled(lightOn);

    // Particles
    const jumpParticles = new BABYLON.ParticleSystem("particles", 2000);
    jumpParticles.particleTexture = new BABYLON.Texture("img/flare.png");
    jumpParticles.emitRate = 100;
    jumpParticles.manualEmitCount = 500;


    // Antialiasing
    var pipeline = new BABYLON.DefaultRenderingPipeline(
        "defaultPipeline", // The name of the pipeline
        false, // Do you want the pipeline to use HDR texture?
        scene, // The scene instance
        [camera] // The list of cameras to be attached to
    );

    pipeline.samples = 4;

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 4;

    // GUI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var guiWidthLeft = "150px";
    var guiWidthRight = "300px";

    // Stack panel right
    var rightPanel = new BABYLON.GUI.StackPanel();
    rightPanel.width = guiWidthRight;
    rightPanel.isVertical = true;
    rightPanel.paddingRight = "20px";
    rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(rightPanel);

    // Stack panel left
    var leftPanel = new BABYLON.GUI.StackPanel();
    leftPanel.width = guiWidthLeft;
    leftPanel.isVertical = true;
    rightPanel.paddingRight = "20px";
    leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(leftPanel);

    // Light toggle button
    var toggleLightButton = BABYLON.GUI.Button.CreateSimpleButton("toggleLight", "Toggle Lamp");
    toggleLightButton.width = guiWidthLeft;
    toggleLightButton.height = "40px";
    toggleLightButton.color = "white";
    toggleLightButton.background = "orange";
    toggleLightButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    toggleLightButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // Toggle the light switch
    toggleLightButton.onPointerUpObservable.add(function () {
        console.log("pushing button, : " + lightOn);
        light.setEnabled(!lightOn);
        lightOn = !lightOn;
    });
    leftPanel.addControl(toggleLightButton);

    // Mute button
    var muteSound = false;
    var muteButton = BABYLON.GUI.Button.CreateSimpleButton("mute", "Mute/Unmute Sound");
    muteButton.width = guiWidthLeft;
    muteButton.height = "45px";
    muteButton.color = "white";
    muteButton.background = "orange";
    muteButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    muteButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    // Toggle the light switch
    muteButton.onPointerUpObservable.add(function () {
        muteSound = !muteSound;
    });
    leftPanel.addControl(muteButton);

    // Reset game button
    var resetGameButton = BABYLON.GUI.Button.CreateSimpleButton("resetGame", "Reset Game");
    resetGameButton.width = guiWidthLeft;
    resetGameButton.height = "40px";
    resetGameButton.color = "white";
    resetGameButton.background = "red";
    resetGameButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    resetGameButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // Reset the game
    resetGameButton.onPointerUpObservable.add(function () {
        resetGame();
    });
    leftPanel.addControl(resetGameButton);

    // Status indicator
    var infoText = new BABYLON.GUI.TextBlock();
    infoText.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    infoText.text = "None Selected";
    infoText.width = guiWidthRight;
    infoText.height = "100px";
    infoText.color = "white";
    infoText.fontSize = 24;
    rightPanel.addControl(infoText);

    var turnText = new BABYLON.GUI.TextBlock();
    turnText.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    turnText.text = "Player 1's Turn";
    turnText.width = guiWidthRight;
    turnText.height = "100px";
    turnText.color = "white";
    turnText.fontSize = 24;
    rightPanel.addControl(turnText);

    // Materials
    const whiteMaterial = new BABYLON.StandardMaterial("White");
    whiteMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#FFFFFF");

    const blackMaterial = new BABYLON.StandardMaterial("Black");
    blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const pOneMaterial = new BABYLON.StandardMaterial("pOneMaterial");
    pOneMaterial.diffuseTexture = new BABYLON.Texture("img/LightWood.jpg");
    pOneMaterial.specularTexture = new BABYLON.Texture("img/LightWood.jpg");
    pOneMaterial.emissiveTexture = new BABYLON.Texture("img/LightWood.jpg");
    pOneMaterial.ambientTexture = new BABYLON.Texture("img/LightWood.jpg");

    const pTwoMaterial = new BABYLON.StandardMaterial("pTwoMaterial");
    pTwoMaterial.diffuseTexture = new BABYLON.Texture("img/RedTexture.jpg");
    pTwoMaterial.specularTexture = new BABYLON.Texture("img/RedTexture.jpg");
    pTwoMaterial.emissiveTexture = new BABYLON.Texture("img/RedTexture.jpg");
    pTwoMaterial.ambientTexture = new BABYLON.Texture("img/RedTexture.jpg");

    // Highlight variables for picking pieces
    var highlight = new BABYLON.HighlightLayer("highlight", scene);
    highlight.blurHorizontalSize = 0.3 + Math.cos(0) * 0.6 + 0.6;
    highlight.blurVerticalSize = 0.3 + Math.sin(0 / 3) * 0.6 + 0.6;

    // Sound for moving checkers
    var moveSound = new BABYLON.Sound("Music", "sound/moving_effect.wav", scene, null, {
        loop: false,
        volume: 1,
        autoplay: false
    });


    // Create an individual tile for the checkerboard
    function createBox(positionX, positionY, material, height, width, depth) {
        const box = BABYLON.MeshBuilder.CreateBox("t" + positionX + positionY, { height: height, width: width, depth: depth });

        // an ID of "e" means empty. "f" means full
        box.id = "e";
        box.material = material;
        box.position.x = positionX;
        box.position.y = positionY;
        box.receiveShadows = true;
    }

    // Creates the checker piceces
    function createChecker(positionX, positionY, material, id) {
        var cylinder = BABYLON.MeshBuilder.CreateCylinder(id, { tessellation: 32, diameter: 0.85, height: 0.20 });

        var torus = BABYLON.MeshBuilder.CreateTorus("torus", { thickness: 0.10, diameter: 0.75, tessellation: 32 });
        torus.position.y = 0.1;

        var checker = BABYLON.Mesh.MergeMeshes([cylinder, torus]);
        checker.material = material;
        checker.position.x = positionX;
        checker.position.y = positionY;

        // "p" for normal piece, "k" for king
        checker.name = id + positionX + positionY;
        checker.id = "p";
        checker.rotation = new BABYLON.Vector3(0, 0, 0);
        checker.rotation.x = 1.5708;
        checker.position.z = 0.10;

        // update tile to be full
        var selectedTile = scene.getMeshByName("t" + positionX + positionY);
        selectedTile.id = "f";

        shadowGenerator.addShadowCaster(checker);
    }

    // Create the checkerboard
    function createBoard(size) {
        var material;
        var yVal = 0;
        for (let row = 0; row < size; row++) {
            var xVal = 0;
            for (let col = 0; col < size; col++) {
                if (row % 2 === col % 2) {
                    material = whiteMaterial;
                } else {
                    material = blackMaterial;
                }
                createBox(xVal, yVal, material, 1, 1, 0.05);
                xVal += 1;
            }
            yVal += 1;
        }
    }

    // Populates the board with checkers pieces
    function populateBoard(playerOneMaterial, playerTwoMaterial) {

        var playerOneID = 0;
        var playerTwoID = 0;

        // Player 1 pieces
        var yVal = 0;
        for (let row = 0; row < 3; row++) {
            var xVal = 0;
            for (let col = 0; col < 8; col++) {
                if (row % 2 === col % 2) {
                    // player 1 piece, denoted by 1_ and then the checker piece ID
                    createChecker(xVal, yVal, playerOneMaterial, "1_");
                    playerOneID++;
                }
                xVal += 1;
            }
            yVal += 1;
        }

        // Player 2 pieces
        yVal = 7;
        for (let row = 8; row > 5; row--) {
            xVal = 7;
            for (let col = 8; col > 0; col--) {
                if (row % 2 === col % 2) {
                    // player 1 piece, denoted by 1_ and then the checker piece ID
                    createChecker(xVal, yVal, playerTwoMaterial, "2_");
                    playerTwoID++;
                }
                xVal -= 1;
            }
            yVal -= 1;
        }
    }

    // Determines if clicked piece is a checker piece
    function isChecker(piece) {
        return (piece.material.name === "pOneMaterial" || piece.material.name === "pTwoMaterial");
    }

    // Checks to make sure tile is available
    function isNeighboringTile(piece, tile, turn) {
        if (turn) {
            return (
                ((piece.position.x + 1 === tile.position.x) || (piece.position.x - 1 === tile.position.x))
                && (piece.position.y + 1 === tile.position.y)
                && tile.material.name && tile.id === "e");

        } else {
            return (
                ((piece.position.x + 1 === tile.position.x) || (piece.position.x - 1 === tile.position.x))
                && (piece.position.y - 1 === tile.position.y)
                && tile.material.name && tile.id === "e");
        }
    }

    // Tells if piece is jumpable
    // If so, removes jumped piece, adds particles
    function isJumpable(piece, tile, turn) {
        var name;
        var name2;
        var jumpedTile;
        if (turn) {
            if (((piece.position.x + 2 === tile.position.x) || (piece.position.x - 2 === tile.position.x)) && piece.position.y + 2 === tile.position.y) {
                name = "2_" + (piece.position.x + 1) + (piece.position.y + 1);
                name2 = "2_" + (piece.position.x - 1) + (piece.position.y + 1);
                console.log((name));
                console.log((name2));
                if (scene.getMeshByName(name) != null) {
                    jumpedTile = scene.getMeshByName("t" + (piece.position.x + 1) + (piece.position.y + 1));
                    jumpedTile.id = "e";

                    jumpParticles.emitter = jumpedTile;
                    jumpParticles.start();
                    scene.getMeshByName(name).dispose();

                    return true;
                } else if (scene.getMeshByName(name2) != null) {
                    jumpedTile = scene.getMeshByName("t" + (piece.position.x - 1) + (piece.position.y + 1));
                    jumpedTile.id = "e";

                    jumpParticles.emitter = jumpedTile;
                    jumpParticles.start();
                    scene.getMeshByName(name2).dispose();

                    return true;
                } else {
                    return false;
                }
            }

        } else {
            if (((piece.position.x + 2 === tile.position.x) || (piece.position.x - 2 === tile.position.x)) && piece.position.y - 2 === tile.position.y) {
                name = "1_" + (piece.position.x + 1) + (piece.position.y - 1);
                name2 = "1_" + (piece.position.x - 1) + (piece.position.y - 1);
                console.log((name));
                console.log((name2));
                if (scene.getMeshByName(name) != null) {
                    jumpedTile = scene.getMeshByName("t" + (piece.position.x + 1) + (piece.position.y - 1));
                    jumpedTile.id = "e";

                    jumpParticles.emitter = jumpedTile;
                    jumpParticles.start();

                    scene.getMeshByName(name).dispose();
                    return true;
                } else if (scene.getMeshByName(name2) != null) {
                    jumpedTile = scene.getMeshByName("t" + (piece.position.x - 1) + (piece.position.y - 1));
                    jumpedTile.id = "e";

                    jumpParticles.emitter = jumpedTile;
                    jumpParticles.start();
                    scene.getMeshByName(name2).dispose();

                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    // This determines if a move is valid
    function isValidMove(piece, tile, turn) {
        if (turn) {
            return (isChecker(piece) && piece.name[0] === "1" && (isNeighboringTile(piece, tile, turn) || isJumpable(piece, tile, turn)));
        } else if (!turn) {
            return (isChecker(piece) && piece.name[0] === "2" && (isNeighboringTile(piece, tile, turn) || isJumpable(piece, tile, turn)));
        }
    }

    // moves piece from point a to b. 
    function movePiece(piece, tile) {

        // updates old/new tiles to be empty/full respectively
        var selectedTile = scene.getMeshByName("t" + piece.position.x + piece.position.y);
        selectedTile.id = "e";

        var selectedTile2 = scene.getMeshByName("t" + tile.position.x + "" + tile.position.y);
        selectedTile2.id = "f";

        // animation variable
        const moveAnimation = new BABYLON.Animation("moveAnimation", "position", 45, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        // Animation keys
        var keys = []
        keys.push({
            frame: 0,
            value: new BABYLON.Vector3(piece.position.x, piece.position.y, piece.position.z)
        });

        keys.push({
            frame: 5,
            value: new BABYLON.Vector3(piece.position.x, piece.position.y, 0.50)
        });

        keys.push({
            frame: 20,
            value: new BABYLON.Vector3(tile.position.x, tile.position.y, 0.50)
        });

        keys.push({
            frame: 25,
            value: new BABYLON.Vector3(tile.position.x, tile.position.y, 0.10)
        });

        moveAnimation.setKeys(keys);
        piece.animations.push(moveAnimation);
        var checkerMoveAnimation = scene.beginAnimation(piece, 0, 25, false);

        checkerMoveAnimation.onAnimationEnd = function () {

            if (!muteSound) {
                moveSound.play();
            }

            highlight.removeMesh(piece);
            piece.name = piece.name[0] + "_" + tile.position.x + tile.position.y;
            if (turn) {
                turnText.text = "Player 1's Turn"
            } else {
                turnText.text = "Player 2's Turn"
            }
        }
    }

    // Used to "store" the piece that is selected
    var lastSelection = null;

    // Bool to keep track of turn.
    // true = p1, false = p2
    var turn;

    // Function to handle clicking meshes
    scene.onPointerDown = function (evt, pickResult) {

        if (pickResult.hit) {
            infoText.text = pickResult.pickedMesh.name + " \n" + pickResult.pickedMesh.id;
            console.log("Mesh ID: " + pickResult.pickedMesh.id);

            if (lastSelection) {
                if (isValidMove(lastSelection, pickResult.pickedMesh, turn)) {
                    movePiece(lastSelection, pickResult.pickedMesh, turn);
                    turn = !turn;
                }

                // Clear Selection
                highlight.removeMesh(lastSelection);
                lastSelection = null;

            } else {
                lastSelection = pickResult.pickedMesh;

                if (isChecker(lastSelection)) {
                    highlight.addMesh(lastSelection, BABYLON.Color3.Yellow());
                }
            }
        }
        else {
            lastSelection = null;
        }
    };

    // Resets game and game state
    function resetGame() {
        for (var i = 0; i < scene.meshes.length; i++) {
            scene.meshes[i].dispose();
            i--;
        }
        initalizeGame();
    }

    function initalizeGame() {
        createBoard(8);
        populateBoard(pOneMaterial, pTwoMaterial);
        turn = true;
        lastSelection = null;
    }

    initalizeGame();

    return scene;
}
window.initFunction = async function () {

    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};
initFunction().then(() => {
    sceneToRender = scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
