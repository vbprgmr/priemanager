/artifacts POST

var ddupResponse = {
    hzone: null, // HTML upload zone
    hstat: null, // HTML upload status
    hform: null, // HTML upload form
    init: function () {
        ddupResponse.hzone = document.getElementById("upResponsezone");
        ddupResponse.hstat = document.getElementById("upResponsestat");
        ddupResponse.hform = document.getElementById("upform");

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            ddupResponse.hzone.addEventListener("dragenter", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddupResponse.hzone.classList.add('highlight');
            });
            ddupResponse.hzone.addEventListener("dragleave", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddupResponse.hzone.classList.remove('highlight');
            });

            ddupResponse.hzone.addEventListener("dragover", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddupResponse.hzone.classList.add('highlight');
            });
            ddupResponse.hzone.addEventListener("drop", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddupResponse.hzone.classList.remove('highlight');
                ddupResponse.queue(e.dataTransfer.files);
            });
        }

        else {
            ddupResponse.hzone.style.display = "none";
            ddupResponse.hform.style.display = "block";
        }
    },

    upqueue: [], // upload queue
    uplock: false, // currently uploading a file
    queue: function (files) {
        for (let f of files) {
            ddupResponse.hstat.innerHTML += `<div>${f.name} - Added to queue</div>`;
            ddupResponse.upqueue.push(f);
        }
        ddupResponse.go();
    },

    go: function () {
        if (!ddupResponse.uplock && ddupResponse.upqueue.length != 0) {
            ddupResponse.uplock = true;

            let thisfile = ddupResponse.upqueue[0];
            ddupResponse.upqueue.shift();

            ddupResponse.hstat.innerHTML += `<div>${thisfile.name} - Upload started</div>`;

            let data = new FormData();
            data.append(thisfile.name, thisfile);

            let xhr = new XMLHttpRequest();
            xhr.open("POST", jrapiAPISource + "artifacts/" + $('#upzoneContainer').attr('data-id'));
            xhr.setRequestHeader("Content-Type", "text/plain");
            xhr.setRequestHeader("token", JRTKN);
            xhr.onload = function () {
                ddupResponse.hstat.innerHTML += `<div>${thisfile.name} - ${this.response}</div>`;
                ddupResponse.uplock = false;
                ddupResponse.go();
            };
            xhr.onerror = function (evt) {
                ddupResponse.hstat.innerHTML += `<div>${thisfile.name} - AJAX ERROR</div>`;
                ddupResponse.uplock = false;
                ddupResponse.go();
            };
            xhr.onloadend = function (evt) {
                ddupResponse.hstat.innerHTML = ``;
                ddupResponse.uplock = false;
                ddupResponse.go();
                ShowResponseAttachments($('#upzoneContainer').attr('data-id'), 'response');
            };
            xhr.send(data);            
        }
    }
};

window.addEventListener("DOMContentLoaded", ddupResponse.init);


var ddup = {
    hzone: null, // HTML upload zone
    hstat: null, // HTML upload status
    hform: null, // HTML upload form
    init: function () {
        ddup.hzone = document.getElementById("upzone");
        ddup.hstat = document.getElementById("upstat");
        ddup.hform = document.getElementById("upform");

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            ddup.hzone.addEventListener("dragenter", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddup.hzone.classList.add('highlight');
            });
            ddup.hzone.addEventListener("dragleave", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddup.hzone.classList.remove('highlight');
            });

            ddup.hzone.addEventListener("dragover", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddup.hzone.classList.add('highlight');
            });
            ddup.hzone.addEventListener("drop", function (e) {
                e.preventDefault();
                e.stopPropagation();
                ddup.hzone.classList.remove('highlight');
                ddup.queue(e.dataTransfer.files);
            });
        }

        else {
            ddup.hzone.style.display = "none";
            ddup.hform.style.display = "block";
        }
    },

    upqueue: [], // upload queue
    uplock: false, // currently uploading a file
    queue: function (files) {
        for (let f of files) {
            ddup.hstat.innerHTML += `<div>${f.name} - Added to queue</div>`;
            ddup.upqueue.push(f);
        }
        ddup.go();
    },

    go: function () {
        if (!ddup.uplock && ddup.upqueue.length != 0) {
            ddup.uplock = true;

            let thisfile = ddup.upqueue[0];
            ddup.upqueue.shift();

            ddup.hstat.innerHTML += `<div>${thisfile.name} - Upload started</div>`;

            let data = new FormData();
            data.append(thisfile.name, thisfile);

            let xhr = new XMLHttpRequest();
            xhr.open("POST", jrapiAPISource + "artifacts/" + $('#lblIssueNumber').attr('data-id'));
            xhr.setRequestHeader("Content-Type", "text/plain");
            xhr.setRequestHeader("token", JRTKN);
            xhr.onload = function () {
                ddup.hstat.innerHTML += `<div>${thisfile.name} - ${this.response}</div>`;
                ddup.uplock = false;
                ddup.go();
            };
            xhr.onerror = function (evt) {
                ddup.hstat.innerHTML += `<div>${thisfile.name} - AJAX ERROR</div>`;
                ddup.uplock = false;
                ddup.go();
            };
            xhr.onloadend = function (evt) {
                ddup.hstat.innerHTML = ``;
                ddup.uplock = false;
                ddup.go();
                ShowAttachments($('#lblIssueNumber').attr('data-id'), 'new');
            };
            xhr.send(data);
        }
    }
};

window.addEventListener("DOMContentLoaded", ddup.init);
