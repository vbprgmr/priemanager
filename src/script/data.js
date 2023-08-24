function CallJrapiPRIE(endPoint, id1, id2, id3, id4, id5) {
    var url = "";
    var verb = "GET";

    if (endPoint === "peoplepicker") {
        url = jrapiAPISource + 'peoplepicker?Search=' + id1;
    } else if (endPoint === "filelist") {
        url = jrapiAPISource + 'artifacts/' + id1;
    } else if (endPoint === "schools") {
        url = jrapiAPISource + 'schools';
    } else if (endPoint === "deleterole") {
        verb = "DELETE";
        url = jrapiAPISource + 'roles?id=' + id1;
    } 

    //atifacts/'id1?id='+ Id

    console.log(verb + "   " + url);

    return $.ajax({
        url: url,
        type: verb,
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "token": JRTKN

        },
        success: function (data) {
            closeInProgressDialog();
            return data;
        },
        error: function (data) {
            closeInProgressDialog();
            showErrorModal(data);
        }
    });
}

function showErrorModal(error) {
    dlg2 = document.getElementById('windowErrorModal');
    var objResponse = error;
    var theMessage = "";

    $('#windowErrorModal').css('display', 'block');

    if (objResponse.title !== undefined) {
        $('#windowErrorModalHeading').text(objResponse.title);
    }

    if (objResponse.ExceptionMessage !== undefined && objResponse.ExceptionMessage !== "") {

        theMessage += `<span style='font-weight: bold'>ExceptionMessage:</span> <span style='color: red'>` + objResponse.ExceptionMessage + `</span><br>`;
    }
    if (objResponse.ExceptionType !== undefined) {
        theMessage += `<span style='font-weight: bold'>ExceptionType:</span> <span style='color: red'>` + objResponse.ExceptionType + `</span><br>`;
    }
    if (objResponse.StackTrace !== undefined) {
        theMessage += `<span style='font-weight: bold'>StackTrace:</span> <span style='color: red'>` + objResponse.StackTrace + `</span><br>`;
    }
    if (objResponse.InnerException !== undefined) {
        theMessage += `<span style='font-weight: bold'>InnerException:</span><br>`;
        theMessage += `&nbsp;&nbsp;&nbsp;&nbsp;ExceptionMessage: ` + objResponse.InnerException.ExceptionMessage + `<br>`;
        theMessage += `&nbsp;&nbsp;&nbsp;&nbsp;ExceptionType: ` + objResponse.InnerException.ExceptionType + `<br>`;
        theMessage += `&nbsp;&nbsp;&nbsp;&nbsp;Message: ` + objResponse.InnerException.Message + `<br>`;
        theMessage += `&nbsp;&nbsp;&nbsp;&nbsp;StackTrace: ` + objResponse.InnerException.StackTrace + `<br>`;
    }

    theMessage = theMessage.replace(/line/g, "<span style='color: crimson; font-weight: bold'><br/> cs:line<br/></span>");

    if (error.status == undefined) {
        $('#windowErrorModalHeading').text(objResponse.Message);
    } else {
        $('#windowErrorModalHeading').text("Failed to load resource: the server responded with a status of " + error.status);
    }

    $('#windowErrorTextArea').html(theMessage);

    try {
        dlg2.showModal();
    }
    catch {

    }
}

// function closeInProgressDialog(launchModal) {
//     if (dlg !== null) {

//         if (launchModal) {
//             $('#' + launchModal).modal('toggle');
//         }

//         dlg.close();
//         dlg = null;
//     }
// }


function SaveJrapiPRIEManager(action, uri, data, onResponse, onError, close, noDialog) {
    if (!noDialog) {
       // showInProgressDialog("Please wait...", "updating changes");
    }    

    if (!RegExp(action, "g").test("POST PATCH PUT GET DELETE")) { // Expected action verbs.
        throw new Error("Sdk.request: action parameter must be one of the following: POST, PATCH, PUT, GET, or DELETE.");
    }
    if (RegExp(action, "g").test("POST PATCH PUT") && (data === null || data === undefined)) {
        throw new Error("Sdk.request: data parameter must not be null for operations that create or modify data.");
    }

    var request = new XMLHttpRequest();

    request.open(action, encodeURI(uri), true);
    request.setRequestHeader("Accept", "application/json;odata=verbose");
    request.setRequestHeader("Content-Type", "application/json;odata=verbose");
    request.setRequestHeader("X-RequestDigest", $("#__REQUESTDIGEST").val());
    request.setRequestHeader("token", JRTKN);

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            request.onreadystatechange = null;
            switch (this.status) {
                case 200: // Success with content returned in response body.
                    if (close) {
                        closeInProgressDialog();
                    }
                case 204: // Success with no content returned in response body.
                    if (close) {
                        closeInProgressDialog();
                    }
                case 201:
                    if (close) {
                        closeInProgressDialog();
                    }
                    if (request.response.length > 0) {
                        onResponse(JSON.parse(request.response));
                    } else {
                        onResponse("Success");
                    }
                    break;
                default: // All other statuses are unexpected so are treated like errors.
                    if (close) {
                        closeInProgressDialog();
                    }
                    var error;

                    try {
                        error = JSON.parse(request.response);
                    } catch (e) {
                        error = new Error("Unexpected Error with response");
                    }

                    //console.log(error);
                    closeInProgressDialog();
                    showErrorModal(error);
                    break;
            }
        }
    };

    if (data === null) {
        request.send(null);
    } else {
        request.send(JSON.stringify(data));
    }
}