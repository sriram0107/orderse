(async () => {
  let leftchannel = [];
  let rightchannel = [];
  let recording = false;
  let recordingLength = 0;
  let audioInput = null;
  let sampleRate = null;
  let AudioContext = window.AudioContext || window.webkitAudioContext;
  let context = null;
  let analyser = null;
  let micSelect = document.querySelector("#micSelect");
  let stream = null;
  let tested = false;
  let recordingInProgress = false

  let storeLanguage = ""
  let customerLanguage = ""
  let currentLanguage = ""
  let targetLanguage = ""

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

  function start() {
    recording = true
    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = 0;
    recordingLength = 0;
    console.log("context: ", !!context);
    if (!context) setUpRecording();
  }

  async function stop() {
    recording = false

    // we flat the left and right channels down
    let leftBuffer = mergeBuffers(leftchannel, recordingLength);
    let rightBuffer = mergeBuffers(rightchannel, recordingLength);
    // we interleave both channels together
    let interleaved = interleave(leftBuffer, rightBuffer);
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

    // UI changes
    var textArea = document.querySelector(".translated");
    var loading = document.createElement("i");
    loading.className = "fa-solid fa-ellipsis fa-beat"
    
    // create message ui
    var messageContainer = document.createElement("div");  
    if (currentLanguage == customerLanguage) {
      messageContainer.className = "message-container-left"
    } else {
      messageContainer.className = "message-container-right"
    }

    var message = document.createElement("div");
    message.className = "message"
    message.appendChild(loading)

    messageContainer.appendChild(message)
    textArea.appendChild(messageContainer)

    fetch(`/convert/${currentLanguage}/${targetLanguage}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        const text = res?.text || ""
        message.innerHTML = `<p>${text}</p>`

        // create the dish UI
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
        message.appendChild(dishes);
      })
      .catch(
        (err) =>
          (document.querySelector(".translated").textContent = JSON.stringify(
            err
          ))
      );
  }

  micSelect.onchange = async (e) => {
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

  const swapLanguages = () => {
    var lang1 = document.querySelector("#l1").value;
    var lang2 = document.querySelector("#l2").value;
    document.querySelector("#l1").value = lang2
    document.querySelector("#l2").value = lang1
    currentLanguage = lang2
    targetLanguage = lang1
  }

  document.querySelector(".controls").onclick = (e) => {
    if (recordingInProgress) {
      recordingInProgress = false
      document.querySelector("#microphone-start").style.visibility = "visible"
      document.querySelector("#microphone-stop").style.visibility = "hidden"
      stop()
      swapLanguages()
    } else {
      recordingInProgress = true
      document.querySelector("#microphone-start").style.visibility = "hidden"
      document.querySelector("#microphone-stop").style.visibility = "visible"
      start()
    }
  }

  document.querySelector(".createsession").onclick = (e) => {
    var lang1 = document.querySelector("#l1").value;
    var lang2 = document.querySelector("#l2").value;
    if (lang1 !== "" && lang2 !== "") {
      document.querySelector(".endsession").disabled = false;
      document.querySelector(".createsession").disabled = true;

      document.querySelector('#swapLanguages').style.visibility = "visible"

      // set up languages, useful for aliging messages
      storeLanguage = lang1
      customerLanguage = lang2
      currentLanguage = lang1
      targetLanguage = lang2
      document.querySelector(".controls").style.visibility = "visible"
      document.querySelector("#microphone-start").style.visibility = "visible"
    } else {
      alert("Please select the languages before starting the session");
    }
  };
  document.querySelector(".endsession").onclick = (e) => {
    var textArea = document.querySelector(".translated");
    textArea.innerHTML = "";
    document.querySelector(".endsession").disabled = true;
    document.querySelector(".createsession").disabled = false;
    document.querySelector('#swapLanguages').style.visibility = "hidden"
    document.querySelector(".controls").style.visibility = "hidden"
    document.querySelector("#microphone-start").style.visibility = "hidden"
    document.querySelector("#microphone-stop").style.visibility = "hidden"
  };

  document.querySelector('#swapLanguages').onclick = (e) => {
    swapLanguages()
  }
})();
