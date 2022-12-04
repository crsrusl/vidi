/**
 * Config
 */
// Create list of video assets

let config = {
    videos: [],
    patternList: [],
    patternPosition: 0,
    patternLength: 4,
    patternMode: false,
    speed: 1,
    loop: false,
    currentVideo: null,
    midiInputs: [],
    selectedMidiInput: null,
    selectedMidiChannel: 1,
    choke: 0,
    chokePosition: 0,
    clockMode: false,
    clockPPQN: 25,
    clockPosition: 0,
    clockDivision: 1
}

/**
 * Interface stuff
 */
const body = document.getElementById('body');
const vidiSetup = document.getElementById('vidiSetup');
const midiInputDevicesSelect = document.getElementById("midiInputDevices");
const midiInputChannelSelect = document.getElementById("midiInputChannel");
const chokeInput = document.getElementById("choke");
const clockDivisionInput = document.getElementById("clockDivision");
const fileDirectoryInput = document.getElementById("fileDirectory");
const midiClockInput = document.getElementById("midiClockMode");
const chokeSettingsGroup = document.getElementById("chokeSettingsGroup");
const clockSettingsGroup = document.getElementById("clockSettingGroup");
const patternModeSetting = document.getElementById("patternModeSetting");
const patternSettingGroup = document.getElementById("patternSettingGroup");
const patternLengthSetting = document.getElementById('patternLengthSetting');

patternModeSetting.addEventListener('change', patternModeSettingChange);

function patternModeSettingChange() {
    if (config.patternMode === false) {
        config.patternMode = true;
        patternModeSetting.value = 'true';
        createPattern();
    } else {
        config.patternMode = false;
        patternModeSetting.value = 'false';
    }

    updatePatternModeComponent();
}

patternLengthSetting.addEventListener("change", function () {
    config.patternLength = patternLengthSetting.value;
    createPattern();
});

function patternLengthSettingChange(num) {
    let newPatternLength = config.patternLength + num;

    if (newPatternLength <= 0 || newPatternLength > 16) return;

    config.patternLength = newPatternLength;
    patternLengthSetting.value = newPatternLength;

    createPattern();
}

function updatePatternModeComponent() {
    const patternSettingGroupClassList = patternSettingGroup.classList;

    if (config.patternMode === true) {
        patternSettingGroupClassList.remove('hidden');
    } else {
        patternSettingGroupClassList.add('hidden');
    }
}

function createPattern() {
    config.patternList = [];
    const patternLength = config.patternLength;

    for (let i = 0; i < patternLength; i++) {
        config.patternList.push(getRandomVideo());
    }
}

midiClockInput.addEventListener("change", function (el) {
    const clockSettingsGroupClassList = clockSettingsGroup.classList;
    const chokeSettingsGroupClassList = chokeSettingsGroup.classList;

    if (el.target.value === "true") {
        config.clockMode = true;

        clockSettingsGroupClassList.contains('hidden') ? clockSettingsGroupClassList.remove('hidden') : null;
        chokeSettingsGroupClassList.add('hidden');
    } else {
        config.clockMode = false;

        chokeSettingsGroupClassList.contains('hidden') ? chokeSettingsGroupClassList.remove('hidden') : null;
        clockSettingsGroupClassList.add('hidden');
    }
});

clockDivisionInput.addEventListener('change', function (el) {
    config.clockDivision = el.target.value;
});

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
        config.videos.push(value.path);
    });

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
        // increase choke
        case '>': {
            changeChoke(1);
            break
        }
        // decrease choke
        case '<': {
            changeChoke(-1);
            break;
        }
        case 't': {
            resetClockPosition();
            break;
        }
        case 'g': {
            patternModeSettingChange();
            break;
        }
        // increase pattern
        case ']': {
            patternLengthSettingChange(1)
            break;
        }
        // decrease pattern
        case '[': {
            patternLengthSettingChange(-1)
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

function resetClockPosition() {
    config.clockPosition = 0;
}

function changeChoke(num) {
    let newChoke = config.choke + num;
    if (newChoke >= 17 || newChoke <= -1) return;

    config.choke = config.choke + num;
    updateChokeComponent();
}

function loadNewVideo() {
    if (config.patternMode === true) {
        if (config.patternPosition >= config.patternList.length) {
            config.patternPosition = 0;

            config.currentVideo = config.patternList[config.patternPosition];
            config.patternPosition++;
        } else {
            config.currentVideo = config.patternList[config.patternPosition];
            config.patternPosition++;
        }

        source.setAttribute('src', config.currentVideo);
        source.setAttribute('type', 'video/mp4');
        video.load();
        return;
    }

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
    return config.videos[Math.floor(Math.random() * config.videos.length)];
}

/**
 * MIDI stuff
 */

function midiHandler(packet) {
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

function midiHandlerClockMode(packet) {
    if (packet.cmd !== 15) return;

    if (config.clockPosition === 0) {
        config.clockPosition++;
        loadNewVideo();
    } else if (config.clockPosition >= (config.clockPPQN * config.clockDivision)) {
        config.clockPosition = 0;
    } else {
        config.clockPosition++;
    }
}

function generatePacket(msg) {
    if (msg.currentTarget.id !== config.selectedMidiInput) return;

    let packet = {
        cmd: msg.data[0] >> 4,
        channel: msg.data[0] & 0xf,
        noteNumber: msg.data[1],
        velocity: msg.data[2]
    };

    if (config.clockMode === true) {
        midiHandlerClockMode(packet)
    } else {
        midiHandler(packet);
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

// convert string bool to real bool
function realBool(string) {
    if (string === 'true') {
        return true
    }
    return false;
}