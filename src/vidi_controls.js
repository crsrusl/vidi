/**
 * Config
 */
// Create list of video assets
let i = 1;
let numVids = 0
let videos = [];

let config = {
    speed: 1,
    loop: false,
    currentVideo: getRandomVideo(),
    midiInputs: [],
    selectedMidiInput: null,
    selectedMidiChannel: 1,
    choke: 0,
    chokePosition: 0,
}

/**
 * Interface stuff
 */
const body = document.getElementById('body');
const vidiSetup = document.getElementById('vidiSetup');
const midiInputDevicesSelect = document.getElementById("midiInputDevices");
const midiInputChannelSelect = document.getElementById("midiInputChannel");
const chokeInput = document.getElementById("choke");
const fileDirectoryInput = document.getElementById("fileDirectory");

function showHideSetupModal() {
    if (vidiSetup.classList.contains('visible')) {
        vidiSetup.classList.remove('visible');
    } else {
        vidiSetup.classList.add('visible');
    }
}

fileDirectoryInput.addEventListener("change", function (el) {
    const files = el.target.files;

    Object.entries(files).forEach(([key, value]) => {
        if (value.type !== 'video/mp4') return;
        videos.push(value.path);
    });

    numVids = video.length;

    loadNewVideo();
});

midiInputDevicesSelect.addEventListener("change", function (el) {
    config.selectedMidiInput = el.target.value;
});

midiInputChannelSelect.addEventListener("change", function (el) {
    config.selectedMidiChannel = parseInt(el.target.value);
});

chokeInput.addEventListener("change", function (el) {
    config.choke = parseInt(el.target.value);
    config.chokePosition = 0;
});

function updateChokeComponent() {
    chokeInput.value = config.choke;
}

body.addEventListener('keyup', function (e) {
    if (!isNaN(e.key)) {
        config.speed = e.key;
        setupVideo();
        return;
    }

    switch (e.key) {
        case 's': {
            showHideSetupModal();
            break;
        }
        case 'p': {
            playPause();
            break;
        }
        case 'l': {
            config.loop = config.loop !== true;
            setupVideo();
            break;
        }
        case 'n': {
            loadNewVideo();
            break;
        }
        case '>': {
            changeChoke(1)
            break
        }
        case '<': {
            changeChoke(-1)
            break;
        }
    }
});


/**
 * Video stuff
 */
const video = document.getElementById('player');
const source = document.getElementById('source');

function playPause() {
    video.playing ? video.pause() : video.play();
}

function changeChoke(num) {
    let newChoke = config.choke + num;
    if (newChoke >= 17 || newChoke <= -1) return;

    config.choke = config.choke + num;
    updateChokeComponent();
}

function loadNewVideo() {
    if (config.loop === true) return;

    let newVideo = getRandomVideo();

    if (newVideo === config.currentVideo) {
        loadNewVideo();
    } else {
        config.currentVideo = newVideo;
        source.setAttribute('src', config.currentVideo);
        source.setAttribute('type', 'video/mp4');
        video.load();
    }
}

function setupVideo() {
    video.pause();
    video.playbackRate = config.speed;
    config.loop === true ? video.setAttribute("loop", '') : video.removeAttribute("loop");
    video.play();
}

video.addEventListener('loadstart', function () {
    this.playbackRate = config.speed;
});

video.addEventListener('ended', function () {
    loadNewVideo();
});

function getRandomVideo() {
    return videos[Math.floor(Math.random() * videos.length)];
}

/**
 * MIDI stuff
 */

function generatePacket(msg) {
    if (msg.currentTarget.id !== config.selectedMidiInput) return;

    let packet = {
        cmd: msg.data[0] >> 4,
        channel: msg.data[0] & 0xf,
        noteNumber: msg.data[1],
        velocity: msg.data[2]
    };

    // ignore midi clock
    if (packet.cmd === 15) return;
    // ignore note off
    if (packet.cmd === 8) return;
    // ignore wrong channel

    if (!isNaN(packet.channel)) packet.channel++;
    if (packet.channel !== config.selectedMidiChannel) return;

    if (config.choke === 0) {
        loadNewVideo();
        return;
    }

    // new video on note
    if (config.chokePosition <= 0) {
        config.chokePosition++;
        loadNewVideo();
    } else {
        config.chokePosition++;
        if (config.chokePosition >= config.choke) config.chokePosition = 0;
    }

}

navigator.requestMIDIAccess().then(function (access) {
    access.inputs.forEach(function (input) {
        config.midiInputs.push(input);

        input.onmidimessage = generatePacket;
    });


    for (let i = 0; i < config.midiInputs.length; i++) {
        let option = document.createElement("option");
        option.innerText = config.midiInputs[i].name;
        option.value = config.midiInputs[i].id;
        midiInputDevicesSelect.appendChild(option);
    }
});


/**
 * Helpers
 */
Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function () {
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
})