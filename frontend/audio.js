(async () => {
  let leftchannel = [];
  let rightchannel = [];
  let recorder = null;
  let recording = false;
  let recordingLength = 0;
  let volume = null;
  let audioInput = null;
  let sampleRate = null;
  let AudioContext = window.AudioContext || window.webkitAudioContext;
  let context = null;
  let analyser = null;
  let canvas = document.querySelector("canvas");
  let micSelect = document.querySelector("#micSelect");
  let stream = null;
  let tested = false;
  var audioControls = document.querySelectorAll(".audio-controls");
  document.querySelector("#msg_cust").style.visible = "visibility";
  document.querySelector("#msg_staff").style.visible = "visibility";

  try {
    window.stream = stream = await getStream();
    console.log("Got stream");
  } catch (err) {
    alert("Issue getting mic", err);
  }

  const deviceInfos = await navigator.mediaDevices.enumerateDevices();

  var mics = [];
  for (let i = 0; i !== deviceInfos.length; ++i) {
    let deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === "audioinput") {
      mics.push(deviceInfo);
      let label = deviceInfo.label || "Microphone " + mics.length;
      console.log("Mic ", label + " " + deviceInfo.deviceId);
      const option = document.createElement("option");
      option.value = deviceInfo.deviceId;
      option.text = label;
      micSelect.appendChild(option);
    }
  }

  function getStream(constraints) {
    if (!constraints) {
      constraints = { audio: true, video: false };
    }
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  setUpRecording();

  function setUpRecording() {
    context = new AudioContext();
    sampleRate = context.sampleRate;

    // creates a gain node
    volume = context.createGain();

    // creates an audio node from teh microphone incoming stream
    audioInput = context.createMediaStreamSource(stream);

    // Create analyser
    analyser = context.createAnalyser();

    // connect audio input to the analyser
    audioInput.connect(analyser);

    // connect analyser to the volume control
    // analyser.connect(volume);

    let bufferSize = 2048;
    let recorder = context.createScriptProcessor(bufferSize, 2, 2);

    // we connect the volume control to the processor
    // volume.connect(recorder);

    analyser.connect(recorder);

    // finally connect the processor to the output
    recorder.connect(context.destination);

    recorder.onaudioprocess = function (e) {
      // Check
      if (!recording) return;
      // Do something with the data, i.e Convert this to WAV
      console.log("recording");
      let left = e.inputBuffer.getChannelData(0);
      let right = e.inputBuffer.getChannelData(1);
      if (!tested) {
        tested = true;
        // if this reduces to 0 we are not getting any sound
        if (!left.reduce((a, b) => a + b)) {
          alert("There seems to be an issue with your Mic");
          // clean up;
          stop();
          stream.getTracks().forEach(function (track) {
            track.stop();
          });
          context.close();
        }
      }
      // we clone the samples
      leftchannel.push(new Float32Array(left));
      rightchannel.push(new Float32Array(right));
      recordingLength += bufferSize;
    };
  }

  function mergeBuffers(channelBuffer, recordingLength) {
    let result = new Float32Array(recordingLength);
    let offset = 0;
    let lng = channelBuffer.length;
    for (let i = 0; i < lng; i++) {
      let buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  function interleave(leftChannel, rightChannel) {
    let length = leftChannel.length + rightChannel.length;
    let result = new Float32Array(length);

    let inputIndex = 0;

    for (let index = 0; index < length; ) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }

  function writeUTFBytes(view, offset, string) {
    let lng = string.length;
    for (let i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function start(person) {
    recording = true;
    person === "cust"
      ? (document.querySelector("#msg_cust").style.visibility = "visible")
      : (document.querySelector("#msg_staff").style.visibility = "visible");
    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = 0;
    recordingLength = 0;
    console.log("context: ", !!context);
    if (!context) setUpRecording();
  }

  async function stop(person, lang) {
    console.log("Stop");
    recording = false;
    person === "cust"
      ? (document.querySelector("#msg_cust").style.visibility = "hidden")
      : (document.querySelector("#msg_staff").style.visibility = "hidden");
    // we flat the left and right channels down
    let leftBuffer = mergeBuffers(leftchannel, recordingLength);
    let rightBuffer = mergeBuffers(rightchannel, recordingLength);
    // we interleave both channels together
    let interleaved = interleave(leftBuffer, rightBuffer);

    ///////////// WAV Encode /////////////////
    // from http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/
    //

    // we create our wav file
    let buffer = new ArrayBuffer(44 + interleaved.length * 2);
    let view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, "WAVE");
    // FMT sub-chunk
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    let lng = interleaved.length;
    let index = 44;
    let volume = 1;
    for (let i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
      index += 2;
    }
    const blob = new Blob([view], { type: "audio/wav" });
    var formData = new FormData();
    formData.append("avatar", blob);
    var convert =
      person === "cust"
        ? document.querySelector("#l1").value
        : document.querySelector("#l2").value;
    console.log("params -->", lang, convert);
    var textArea = document.querySelector(".translated");
    textArea.innerHTML = "";
    var loading = document.createElement("img");
    loading.className = "loading-icon";
    loading.src = "load.gif";
    textArea.appendChild(loading);
    fetch(`http://localhost:5000/convert/${lang}/${convert}/${person}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Response received");

        textArea.innerHTML = "";
        var text = document.createElement("p");
        text.className = "convo";
        text.textContent = res.text;
        if (res.text === "Could not recognize your voice") {
          text.style.color = "red";
        }
        textArea.appendChild(text);
        var dishes = document.createElement("div");
        dishes.className = "card-container";
        res.dishes.forEach((dish) => {
          var dishCard = document.createElement("div");
          dishCard.className = "card";
          var image = document.createElement("img");
          image.className = "card-img";
          image.src = dish.picture;
          var dishName = document.createElement("p");
          dishName.textContent = dish.name;
          var cost = document.createElement("i");
          cost.textContent = dish.cost;
          dishCard.appendChild(image);
          dishCard.appendChild(dishName);
          dishCard.appendChild(cost);
          dishes.appendChild(dishCard);
        });
        textArea.appendChild(dishes);
      })
      .catch(
        (err) =>
          (document.querySelector(".translated").textContent =
            JSON.stringify(err))
      );
  }
  micSelect.onchange = async (e) => {
    console.log("now use device ", micSelect.value);
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
    context.close();

    stream = await getStream({
      audio: {
        deviceId: { exact: micSelect.value },
      },
      video: false,
    });
    setUpRecording();
  };

  function pause() {
    recording = false;
    context.suspend();
  }

  function resume() {
    recording = true;
    context.resume();
  }

  document.querySelector("#record_cust").onclick = (e) => {
    console.log("Start recording");
    audioControls[0].style.visibility = "hidden";
    document.querySelector("#record_cust").style.display = "none";
    document.querySelector("#stop_cust").style.display = "inline";
    start("cust");
  };

  document.querySelector("#stop_cust").onclick = (e) => {
    var lang = document.querySelector("#l2").value;
    stop("cust", lang);
    audioControls[0].style.visibility = "visible";
    document.querySelector("#stop_cust").style.display = "none";
    document.querySelector("#record_cust").style.display = "inline";
  };

  document.querySelector("#record_staff").onclick = (e) => {
    console.log("Start recording");
    audioControls[1].style.visibility = "hidden";
    document.querySelector("#record_staff").style.display = "none";
    document.querySelector("#stop_staff").style.display = "inline";
    start("staff");
  };

  document.querySelector("#stop_staff").onclick = (e) => {
    var lang = document.querySelector("#l1").value;
    stop("staff", lang);
    audioControls[1].style.visibility = "visible";
    document.querySelector("#stop_staff").style.display = "none";
    document.querySelector("#record_staff").style.display = "inline";
  };

  document.querySelector(".createsession").onclick = (e) => {
    var lang1 = document.querySelector("#l1").value;
    var lang2 = document.querySelector("#l2").value;
    if (lang1 !== "" && lang2 !== "") {
      audioControls[0].style.visibility = "visible";
      audioControls[1].style.visibility = "visible";
      document.querySelector("#record_staff").style.display = "inline";
      document.querySelector("#record_cust").style.display = "inline";
      document.querySelector(".endsession").disabled = false;
      document.querySelector(".createsession").disabled = true;
    } else {
      alert("Please select the languages before starting the session");
    }
  };
  document.querySelector(".endsession").onclick = (e) => {
    var textArea = document.querySelector(".translated");
    textArea.innerHTML = "";
    document.querySelector(".endsession").disabled = true;
    document.querySelector(".createsession").disabled = false;
    audioControls[0].style.visibility = "hidden";
    audioControls[1].style.visibility = "hidden";
  };
})();
