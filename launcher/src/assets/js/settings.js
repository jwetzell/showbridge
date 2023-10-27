/* eslint-disable no-undef */
const httpAddressSelect = document.getElementById('http-address-select');
const tcpAddressSelect = document.getElementById('tcp-address-select');
const udpAddressSelect = document.getElementById('udp-address-select');

const httpPortInput = document.getElementById('http-port-input');
const tcpPortInput = document.getElementById('tcp-port-input');
const udpPortInput = document.getElementById('udp-port-input');

const midiInputNameInput = document.getElementById('midi-input-name-input');
const midiOutputNameInput = document.getElementById('midi-output-name-input');

const cloudURLInput = document.getElementById('cloud-url-input');

const mqttBrokerURLInput = document.getElementById('mqtt-broker-url-input');
const mqttBrokerUsernameInput = document.getElementById('mqtt-broker-username-input');
const mqttBrokerPasswordInput = document.getElementById('mqtt-broker-password-input');

const saveButton = document.getElementById('save-settings');

let currentConfig;

electron.invoke('getIPAddresses').then((addresses) => {
  addresses.forEach((address) => {
    if (address.family === 'IPv4') {
      httpAddressSelect.add(new Option(address.address, address.address));
      tcpAddressSelect.add(new Option(address.address, address.address));
      udpAddressSelect.add(new Option(address.address, address.address));
    }
  });

  electron.invoke('getCurrentConfig').then((config) => {
    currentConfig = config;

    // Load HTTP config
    if (currentConfig.http.params.address && currentConfig.http.params.address !== '0.0.0.0') {
      httpAddressSelect.value = currentConfig.http.params.address;
    } else {
      httpAddressSelect.value = undefined;
    }
    httpPortInput.value = currentConfig.http.params.port;

    // Load TCP config
    if (currentConfig.tcp.params.address && currentConfig.tcp.params.address !== '0.0.0.0') {
      tcpAddressSelect.value = currentConfig.tcp.params.address;
    } else {
      tcpAddressSelect.value = undefined;
    }
    tcpPortInput.value = currentConfig.tcp.params.port;

    // Load UDP config
    if (currentConfig.udp.params.address && currentConfig.udp.params.address !== '0.0.0.0') {
      udpAddressSelect.value = currentConfig.udp.params.address;
    } else {
      udpAddressSelect.value = undefined;
    }
    udpPortInput.value = currentConfig.udp.params.port;

    // Load MIDI settings
    if (currentConfig.midi.params.virtualInputName) {
      midiInputNameInput.value = currentConfig.midi.params.virtualInputName;
    }

    if (currentConfig.midi.params.virtualOutputName) {
      midiOutputNameInput.value = currentConfig.midi.params.virtualOutputName;
    }

    // Load Cloud settings
    cloudURLInput.value = currentConfig.cloud.params.url;

    // Load MQTT settings
    mqttBrokerURLInput.value = currentConfig.mqtt.params.broker;
    if (currentConfig.mqtt.params.broker === undefined || currentConfig.mqtt.params.broker === '') {
      mqttBrokerUsernameInput.disabled = true;
      mqttBrokerPasswordInput.disabled = true;
    }

    mqttBrokerUsernameInput.value = currentConfig.mqtt.params.username ? currentConfig.mqtt.params.username : '';
    mqttBrokerPasswordInput.value = currentConfig.mqtt.params.password ? currentConfig.mqtt.params.password : '';
  });
});

// setup current address info
httpAddressSelect.onchange = (event) => {
  currentConfig.http.params.address = event.target.value;
};

tcpAddressSelect.onchange = (event) => {
  currentConfig.tcp.params.address = event.target.value;
};

udpAddressSelect.onchange = (event) => {
  currentConfig.udp.params.address = event.target.value;
};

// setup current port info
httpPortInput.onchange = (event) => {
  currentConfig.http.params.port = parseInt(event.target.value, 10);
};

tcpPortInput.onchange = (event) => {
  currentConfig.tcp.params.port = parseInt(event.target.value, 10);
};

udpPortInput.onchange = (event) => {
  currentConfig.udp.params.port = parseInt(event.target.value, 10);
};

midiInputNameInput.onchange = (event) => {
  currentConfig.midi.params.virtualInputName = event.target.value;
};

midiOutputNameInput.onchange = (event) => {
  currentConfig.midi.params.virtualOutputName = event.target.value;
};

cloudURLInput.onchange = (event) => {
  currentConfig.cloud.params.url = event.target.value;
};

mqttBrokerURLInput.onkeyup = (event) => {
  if (event.target.value && event.target.value !== '') {
    mqttBrokerUsernameInput.disabled = false;
    mqttBrokerPasswordInput.disabled = false;
  } else {
    mqttBrokerUsernameInput.disabled = true;
    mqttBrokerPasswordInput.disabled = true;
  }
  currentConfig.mqtt.params.broker = event.target.value;
};

mqttBrokerUsernameInput.onchange = (event) => {
  currentConfig.mqtt.params.username = event.target.value;
};

mqttBrokerPasswordInput.onchange = (event) => {
  currentConfig.mqtt.params.password = event.target.value;
};

// TODO(jwetzell): bad config checking
saveButton.onclick = () => {
  electron.send('loadConfigFromObject', currentConfig);
};