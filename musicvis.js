/// Global Data that user can select from
/// edit these fields if adding more assets
var gBGChoices = [
    ['galaxy_nude100_comp0.jpg',
    'galaxy_nude75_comp25.jpg',
    'galaxy_nude50_comp50.jpg',
    'galaxy_nude25_comp75.jpg',
    'galaxy_nude0_comp100.jpg'],        //Choice 0
    ['water3_starry100_scream0.jpg',
    'water3_starry75_scream25.jpg',
    'water3_starry50_scream50.jpg',
    'water3_starry25_scream75.jpg',
    'water3_starry0_scream100.jpg'],    //Choice 1
    ['test_blob_d2.jpg',
    'test_blob_d1.jpg',
    'test_blob.jpg',
    'test_blob_b1.jpg',
    'test_blob_b2.jpg']                 //Choice 2
];

var gDimensionChoices = [
    [512, 341],
    [512, 342],
    [256, 256]
];

var gFieldChoices = [
    'galaxy_nude50_comp50',
    'water3_starry50_scream50',
    'test_blob'
];

var gSongChoices = [
    'ReadyerrNot',
    'IntroNomen',
    'sinestep'
];

/// Global vars that app uses
var gRenderer;
var gStage;
var gContainer;
var gDisplaceFilter;

var gWidth;
var gHeight;
var gSongName;
var gFieldName;

var gBGImages = [];
var gBGWeights = [];
var gBGLayers = [];

var gParticleTextures = [];
var gParticleTints = [];
var gParticleTintVary = 32;
var gParticleLst = [];
var gParticleTimeoutLow = 300;
var gParticleTimeoutHigh = 50;
var gParticleTimerLow = 0;
var gParticleTimerHigh = 0;
var gFieldX = [];
var gFieldY = [];

var gPPS;
var gMusicData;

var gTimestamp;
var gCurrentTime;
var gDT;
var gInitCounter = 0;
var gLoaded = false;
var gPaused = false;

var gFreqCut = 550;
var gFreqMinMul = Math.log10(50 / gFreqCut);
var gFreqMaxMul = Math.log10(10000 / gFreqCut);
var gStrengthCutLow = 4000;
var gStrengthCutHigh = 1500;
var gGaussianStdev = 0.3;
var gSmoothMul = 0.004;

function initBGImages() {
    var elt = document.getElementById('music-selectbg');
    var bgchoice = parseInt(elt.value, 10);
    gBGImages = gBGChoices[bgchoice];
    gFieldName = gFieldChoices[bgchoice];
    gBGWeights = [0.0, 0.0, 0.0, 0.0, 0.0];
    gWidth = gDimensionChoices[bgchoice][0];
    gHeight = gDimensionChoices[bgchoice][1];

    gRenderer = PIXI.autoDetectRenderer(gWidth, gHeight);
    gRenderer.view.style.width = gWidth+'px';
    gRenderer.view.style.height = gHeight+'px';
    elt = document.getElementById('music-visualizer-div');
    while (elt.firstChild) {
        elt.removeChild(elt.firstChild);
    }
    elt.appendChild(gRenderer.view);

    gStage = new PIXI.Stage(0x000000, true);
    gContainer = new PIXI.DisplayObjectContainer();
    gStage.addChild(gContainer);

    gBGLayers = [];
    for (var j = 0; j < 5; j++) {
        var layer = PIXI.Sprite.fromImage('img/'+gBGImages[j]);
        layer.alpha = 0.0;
        gContainer.addChild(layer);
        gBGLayers.push(layer);
    }
    gParticleLst = [];
    gParticleTextures = ['img/crossw_transparent.png', 'img/spotw_transparent.png'];
    gParticleTints = [0x0000DD, 0xDD0000];

    var displaceTexture = PIXI.Texture.fromImage('img/displacement_map.png');
    gDisplaceFilter = new PIXI.DisplacementFilter(displaceTexture);
    gDisplaceFilter.scale.x = 10;
    gDisplaceFilter.scale.y = 10;
    gContainer.filters = [gDisplaceFilter];

    // if running PHP on server, use this call
    //makeAJAXCall('./webservice.php?field='+gFieldName, readVectorFieldCallback);
    // otherwise use this call to load text resource on client side
    readTextFile('data/'+gFieldName+'_field.csv', parseFieldText, transferVectorField);
}

function initSong() {
    var elt = document.getElementById('music-selectsong');
    gSongName = gSongChoices[parseInt(elt.value, 10)];
    // if running PHP on server, use this call
    //makeAJAXCall('./webservice.php?song='+gSongName, readMusicDataCallback);
    // otherwise use this call to load text resource on client side
    readTextFile('data/'+gSongName+'.csv', parseFreqText, transferMusicData);
    gCurrentTime = 0.0;
}

function updateCallbackCounter() {
    gInitCounter += 1;
    if (gInitCounter >= 2) {
        //initialize timers
        gLoaded = true;
        gTimestamp = Date.now();
        //start music
        var elt = document.getElementById('music-player');
        elt.src = 'music/' + gSongName + '.wav';
        elt.load();
        elt.play();
        document.getElementById('music-playpause').innerHTML = 'Pause';
        //start animation
        requestAnimFrame(animate);
    }
}

function playButtonHandler() {
    if (!gLoaded) {
        initBGImages();
        initSong();
    } else {
        var elt = document.getElementById('music-player');
        var elt1 = document.getElementById('music-playpause');
        if (!gPaused) {
            elt.pause();
            elt1.innerHTML = 'Resume';
        } else {
            elt.play();
            elt1.innerHTML = 'Pause';
            gTimestamp = Date.now();
        }
        gPaused = !gPaused;
    }
}

function sliderFreqHandler() {
    gFreqCut = this.value;
    gFreqMinMul = Math.log10(50 / gFreqCut);
    gFreqMaxMul = Math.log10(10000 / gFreqCut);
    var elt = document.getElementById('music-freqdisplay');
    elt.innerHTML = this.value + ' Hz';
}
function sliderBlendHandler() {
    gGaussianStdev = this.value;
}
function sliderSmoothHandler() {
    gSmoothMul = this.value;
}
function sliderLowCutHandler() {
    gStrengthCutLow = this.value;
}
function sliderHighCutHandler() {
    gStrengthCutHigh = this.value;
}

function audioEndedHandler() {
    document.getElementById('music-playpause').innerHTML = 'Play';
    gLoaded = false;
    gInitCounter = 0;
}

function readMusicDataCallback() {
    if (this.readyState === 4 && this.status === 200) {
        var obj = JSON.parse(this.responseText);
        transferMusicData(obj);
    }
}
function transferMusicData(obj) {
    gPPS = obj.pps;
    gMusicData = obj.data;
    updateCallbackCounter();
}

function readVectorFieldCallback() {
    if (this.readyState === 4 && this.status === 200) {
        var obj = JSON.parse(this.responseText);
        transferVectorField(obj);
    }
}
function transferVectorField(obj) {
    gFieldX = obj.dx;
    gFieldY = obj.dy;
    updateCallbackCounter();
}

function makeAJAXCall(url, callback) {
    var xmlReq = new XMLHttpRequest();
    xmlReq.addEventListener("load", callback);
    xmlReq.open("GET", url);
    xmlReq.send();
}

function getCurrentDatum() {
    var ind0 = Math.floor(gCurrentTime / (1000 * (1.0 / gPPS)));
    if (ind0 >= gMusicData.length) {
        return gMusicData[gMusicData.length - 1];
    }
    //console.log(ind0);
    return gMusicData[ind0];
}

function getWeights() {
    var datum = getCurrentDatum();
    var freq = datum[0];
    var strength = datum[1];
    var ind1 = Math.log10(freq / gFreqCut);
    if (ind1 < 0) {
        ind1 = (ind1 / gFreqMinMul) * -2;
    } else {
        ind1 = (ind1 / gFreqMaxMul) * 2;
    }
    ind1 += 2;
    ind1 = Math.max(Math.min(ind1, 4), 0);

    var weights = [0.0, 0.0, 0.0, 0.0, 0.0];
    var sumweights = 0.0;
    for (var i = 0; i < 5; i += 1) {
        weights[i] = 1.0 / (gGaussianStdev * Math.sqrt(2*Math.PI)) *
            Math.exp(-((i - ind1) * (i - ind1)) / (2*gGaussianStdev*gGaussianStdev));
        sumweights += weights[i];
    }
    for (i = 0; i < 5; i += 1) {
        weights[i] /= sumweights;
    }
    return weights;
}

function blendImages(weights) {
    //smooth transition of weights
    var sumweights = 0.0;
    for (j = 4; j >= 0; j--) {
        var delta = weights[j] - gBGWeights[j];
        var lerp = gBGWeights[j] + delta * gDT * gSmoothMul;
        if ((delta > 0 && lerp > weights[j]) || (delta < 0 && lerp < weights[j])) {
            gBGWeights[j] = weights[j];
        } else {
            gBGWeights[j] = lerp;
        }
        sumweights += gBGWeights[j];
    }

    //re-normalize if sum not quite equal to one
    if (sumweights > 0.95) {
        for (j = 4; j >= 0; j--) {
            gBGWeights[j] /= sumweights;
        }
    }

    //calculate alphas as integral of weights
    var targetAlphas = [0.0, 0.0, 0.0, 0.0, 0.0];
    var marginal = 0.0;
    for (var j = 4; j >= 0; j--) {
        marginal += gBGWeights[j];
        if (gBGWeights[j] > 0.05) {
            targetAlphas[j] = marginal;
        } else {
            targetAlphas[j] = 0.0;
        }
    }

    //apply changes
    for (j = 4; j >= 0; j--) {
        gBGLayers[j].alpha = targetAlphas[j];
    }
}

function particleBurst(x, y, num, color) {
    for (var i = 0; i < num; i++) {
        var imgname = gParticleTextures[Math.floor(Math.random()*gParticleTextures.length)];
        particle = PIXI.Sprite.fromImage(imgname);
        particle.anchor.x = particle.anchor.y = 0.5;
        particle.scale.x = particle.scale.y = 0.3;
        particle.position.x = x;
        particle.position.y = y;
        particle.speedx = Math.floor(Math.random() * 40 - 20);
        particle.speedy = Math.floor(Math.random() * 40 - 20);
        particle.tint = color;
        particle.alpha = 0.6;
        particle.lifetime = 5000;
        particle.birthtime = gCurrentTime;
        gContainer.addChild(particle);
        gParticleLst.push(particle);
    }
}

function randParticleBurst(basetint, strength, strengthcut) {
    var x = Math.floor(Math.random() * gWidth);
    var y = Math.floor(Math.random() * gHeight);
    var dr = Math.floor(Math.random() * gParticleTintVary);
    var dg = Math.floor(Math.random() * gParticleTintVary);
    var db = Math.floor(Math.random() * gParticleTintVary);
    var dtint = (dr << 4) + (dg << 2) + db;
    var num = Math.floor((strength - strengthcut) / strengthcut);
    num = num*num / 2;
    particleBurst(x, y, num, basetint+dtint);
}

function updateParticles() {
    //add particles
    gParticleTimerLow += gDT;
    gParticleTimerHigh += gDT;
    var datum = getCurrentDatum();
    if (gParticleTimerLow > gParticleTimeoutLow) {
        if (datum[3] > gStrengthCutLow && datum[2] < gFreqCut) {
            randParticleBurst(gParticleTints[0], datum[3], gStrengthCutLow);
            gParticleTimerLow = 0;
        }
    }
    if (gParticleTimerHigh > gParticleTimeoutHigh) {
        if (datum[5] > gStrengthCutHigh && datum[4] > gFreqCut) {
            randParticleBurst(gParticleTints[1], datum[5], gStrengthCutHigh);
            gParticleTimerHigh = 0;
        }
    }

    //update particles
    for (var i = gParticleLst.length - 1; i >= 0; i--) {
        var particle = gParticleLst[i];
        //update speed
        if (gFieldX.length > 0 && gFieldY.length > 0) {
            var posx = Math.min(Math.max(Math.round(particle.position.x), 0), gWidth - 1);
            var posy = Math.min(Math.max(Math.round(particle.position.y), 0), gHeight - 1);
            particle.speedx += gFieldX[posy][posx] / 2.5;
            particle.speedy += gFieldY[posy][posx] / 2.5;
        }
        //update position
        particle.position.x += particle.speedx * gDT / 1000.0;
        particle.position.y += particle.speedy * gDT / 1000.0;
        //kill particle if conditions met
        if (gCurrentTime - particle.birthtime > particle.lifetime) {
            particle.alpha -= 0.01;
            if (particle.alpha < 0.0) {
                particle.alpha = 0.0;
            }
        }
        if (particle.alpha <= 0.0 ||
            particle.position.x < -10 || particle.position.x > gWidth + 10 ||
            particle.position.y < -10 || particle.position.y > gHeight + 10) {
            gContainer.removeChild(particle);
            gParticleLst.splice(i, 1);
        }
    }
}

function updateFilters() {
    //apply displace filter
    gDisplaceFilter.offset.x = gCurrentTime*0.05;
    gDisplaceFilter.offset.y = gCurrentTime*0.05;
}

function animate() {
    if (!gPaused) {
        //update timestamps
        var now = Date.now();
        gDT = now - gTimestamp;
        gCurrentTime += gDT;
        gTimestamp = now;

        var weights = getWeights();
        blendImages(weights);
        updateFilters();
        updateParticles();
    }
    gRenderer.render(gStage);
    requestAnimFrame(animate);
}

(function() {
    var elt;
    elt = document.getElementById('music-playpause');
    elt.onclick = playButtonHandler;
    elt = document.getElementById('music-selectfreq');
    elt.onchange = sliderFreqHandler;
    elt = document.getElementById('music-selectblend');
    elt.onchange = sliderBlendHandler;
    elt = document.getElementById('music-selectsmooth');
    elt.onchange = sliderSmoothHandler;
    elt = document.getElementById('music-selectlowpart');
    elt.onchange = sliderLowCutHandler;
    elt = document.getElementById('music-selecthighpart');
    elt.onchange = sliderHighCutHandler;
    elt = document.getElementById('music-player');
    elt.onended = audioEndedHandler;
})();
