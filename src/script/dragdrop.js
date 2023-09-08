// // ************************ Drag and drop ***************** //
let dropArea = document.getElementById("drop-area")
let uploadProgress = []
let progressBar = document.getElementById('progress-bar')


// // Prevent default drag behaviors
// ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
//   dropArea.addEventListener(eventName, preventDefaults, false)   
//   document.body.addEventListener(eventName, preventDefaults, false)
// })

// // Highlight drop area when item is dragged over it
// ;['dragenter', 'dragover'].forEach(eventName => {
//   dropArea.addEventListener(eventName, highlight, false)
// })

// ;['dragleave', 'drop'].forEach(eventName => {
//   dropArea.addEventListener(eventName, unhighlight, false)
// })

// // Handle dropped files
// dropArea.addEventListener('drop', handleDrop, false)

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function highlight(e) {
  dropArea.classList.add('highlight')
}

function unhighlight(e) {
  dropArea.classList.remove('active')
}

function handleDrop(e) {
  var dt = e.dataTransfer
  var files = dt.files

  handleFiles(files, e.toElement.getElementsByTagName("input")[0].id.substring(8))
}



function initializeProgress(numFiles) {
  progressBar.value = 0;

  uploadProgress = [];

  for(let i = numFiles; i > 0; i--) {
    uploadProgress.push(0)
  }
}

function updateProgress(fileNumber, percent) {
  uploadProgress[fileNumber] = percent;

  let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length;
  
  progressBar.value = total;
}

function handleFiles(files, id) {
    files = [...files];

    initializeProgress(files.length);

    curId = id;

    files.forEach(uploadFile);

    //files.forEach(previewFile);
}

function previewFile(file, id) {
    let reader = new FileReader()

    reader.readAsDataURL(file);

    reader.onloadend = function() {
        
        let img = document.createElement('img');
        img.src = reader.result;
        document.getElementById('gallery' + id).appendChild(img);
    }
}

function uploadFile(file, i) {
    let z = curId;

    var url = jrapiAPISource + "artifacts/" + z;

    var xhr = new XMLHttpRequest();

    var formData = new FormData();
    
    xhr.open('POST', url, true);

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.setRequestHeader("token", JRTKN);


    // Update progress (can be used to show progress indicator)
    xhr.upload.addEventListener("progress", function(e) {
        updateProgress(i, (e.loaded * 100.0 / e.total) || 100);
    })

    xhr.addEventListener('readystatechange', function(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            updateProgress(i, 100) // <- Add this
        }
        else if (xhr.readyState == 4 && xhr.status != 200) {
            // Error. Inform the user
        }
    })

    xhr.addEventListener('loadend', function(e) { 
      LoadAttachments(z);
    })

  formData.append('upload_preset', 'ujpu6gyk');
  formData.append('file', file);

  xhr.send(formData);
}

