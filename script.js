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
var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);

    // camera (in this case, free camera)
    var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(8, -8, -16), scene);
    camera.setTarget(new BABYLON.Vector3(0, -8, 0));
    camera.attachControl(canvas, true);
    camera.minZ = 0.45;

    // materials
    var greenMat = new BABYLON.StandardMaterial("greenMat", scene);
    greenMat.diffuseColor = new BABYLON.Color3.FromHexString("#F5FFFA");

    var randomMat = new BABYLON.StandardMaterial("randomMat", scene);
    randomMat.diffuseColor = BABYLON.Color3.Random();

    // ground
    var ground = BABYLON.Mesh.CreatePlane("ground", 10.0, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ground.position = new BABYLON.Vector3(5, -10, -15);
    ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

    // sphere
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3 }, scene);
    sphere.position = new BABYLON.Vector3(5, -8, -10);

    // enable collisions
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;

    // setting the ellipsoid around the player
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    // check for collisions on these items
    ground.checkCollisions = true;
    sphere.checkCollisions = true;

    // click detection
    var selected = false;
    scene.onPointerObservable.add(function (evt) {
        // switching from base to random on each click
        if (selected) {
            evt.pickInfo.pickedMesh.material = greenMat;
            selected = false;
        } else if (evt.pickInfo.hit && evt.event.button === 0) {
            randomMat.diffuseColor = BABYLON.Color3.Random();
            evt.pickInfo.pickedMesh.material = randomMat;
            selected = true;
        }
    }, BABYLON.PointerEventTypes.POINTERUP);

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