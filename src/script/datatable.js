var table;

let pageIndexConcern = 0;
let pageSizeConcern = 10;
let totalItemsConcern = 0;
let searchValConcern = "";

let curId = "";

function SimpleDate(tmpStr) {
    var isoDateString = new Date(tmpStr).toISOString().split('T')[0];
       
    return isoDateString.split('-')[1] + "/" + isoDateString.split('-')[2] + "/" + isoDateString.split('-')[0];
}

function showInProgressDialog(message, subMessage) {   
    $('#LoaderMessage').text(message);
    $('#LoaderTitle').text(subMessage);
    window.dialog.show();
}

function closeInProgressDialog(){
    window.dialog.close();
}

function RefreshButtonState(type) {
    var first = false;
    var previous = false;
    var next = false;
    var last = false;

    if (type === "Concern") {
        if (pageIndexConcern + pageSizeConcern < totalItemsConcern) {
            next = false;
            last = false;
        }

        if (pageIndexConcern + pageSizeConcern >= totalItemsConcern) {
            next = true;
            last = true;
        }

        if (pageIndexConcern !== 0) {
            first = false;
            previous = false;
        }

        if (pageIndexConcern === 0) {
            first = true;
            previous = true;
        }
    }

    SetButtonState(type, first, previous, next, last);
}

function SetButtonState(type, first, previous, next, last, paging) {
    if (type === "Concern") {
        $("#btnConcernFirst").prop("disabled", first);
        $("#btnConcernPrevious").prop("disabled", previous);
        $("#btnConcernNext").prop("disabled", next);
        $("#btnConcernLast").prop("disabled", last);

        $("#selConcernPageSize").prop('disabled', paging);
    }
}

function BuildConcernTable(search, pIndex, pSize, id) {
    var order;

    if ($('#iSearchValue').hasClass("fa-sort-numeric-down") | $('#iSearchValue').hasClass("fa-sort-alpha-down")) {
        order = "asc";
    } else {
        order = "desc";
    }

    var searchVal = $.trim($("#SearchValue").val());

    $("#btnConcernFirst").prop('disabled', true);
    $("#btnConcernPrevious").prop('disabled', true);
    $("#btnConcernNext").prop('disabled', true);
    $("#btnConcernLast").prop('disabled', true);

    //$('#overConcernTable').hide();
    $('#ConcernNavigation').hide();
    $('#underConcernTable').hide();

    var url = "";

    url = jrapiAPISource + "disputes";// + "?Search=" + searchVal + "&StartIndex=" + pIndex + "&PageSize=" + pSize;
    
    console.log(url)

    if ($.fn.dataTable.isDataTable('#dataTableConcern')) {
        ReloadConcernTable(false);        
    }

    table = $('#dataTableConcern').DataTable({
        dom: '',
        paging: false,
        ordering: false,
        "ajax": {
            "url": url,
            "type": "GET",
            "headers":
            {
                "Accept": "application/json;odata=verbose",
                "token": JRTKN
            },
            "dataSrc": "Items"
        }, 
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {
                "data": "Id",
                "orderable": false
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    var date = new Date(data.Created);

                    var tmpStr = SimpleDate(date.toISOString());

                    return tmpStr;// ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
                }
            },
            {
                "data": "SchoolName",
                "orderable": false
            },
            {
                "data": "StudentName",
                "orderable": false
            },
            {
                "data": "StudentId",
                "orderable": false
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    let theStatus = "";

                    //if (data.Status =)


                    if (!data.IsCompleted){
                        theStatus = "Not Resolved";
                    } else if (data.IsCompleted){
                        theStatus = "Resolved";
                    } 
                    
                    if ("Response" in data){
                        if (data.Response === "WillNotResolve"){
                            theStatus = "Not Resolved";
                        }
                    }
                    
                    return theStatus;
                }
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    let theResponse = "";
                    
                    if ("Response" in data){
                        theResponse = data.Response;
                    }

                    if (data.IsCompleted && theResponse !== "WillNotResolve"){
                        return "completed";
                    }else{
                        
                        var dateToday = new Date();
                        var dateCreated = new Date(data.CreatedEST);
                        var dateSevenDays = new Date(data.SchoolDueEST);
                        var dateThirtyDays = new Date(data.DistrictDueEST);
                        
                        //console.log(data);
                        //console.log(dateSevenDays);
                        //console.log(dateThirtyDays);

                        let diffTime = Math.abs(dateToday - dateCreated);
                        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                        if (diffDays > 7){
                            //diffTime = Math.abs(dateThirtyDays - dateCreated);
                            //diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
                            

                            if (diffDays > 30){
                                diffDays = "expired";
                            }
                        }

                        if ("Response" in data){
                            //console.log(data.Response);
                            if (data.Response === "WillNotResolve"){
                                //diffTime = Math.abs(dateThirtyDays - dateCreated);
                                //diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
                        }

                        return diffDays;
                    }
                }
            }
        ]
    })
        .on('xhr', function (e, settings, json) {
            var x = json.StartIndex + 1;
            var y = json.StartIndex + json.Items.length;
            var z = json.TotalItems;
            totalItemsConcern = z;

            if (z > 10) {
                $('#ConcernNavigation').show();
                $('#overConcernTable').show();
            }
            $('#ConcernCount').text('Showing ' + x + ' thru ' + y + ' items');

            $("#ConcernTotalItems").text("Total: " + z);
            //console.log("A");
        })
        .on('xhr.dt', function (e, settings, json, xhr) {
            closeInProgressDialog();

            $('#underConcernTable').show();

            RefreshButtonState("Concern");
            //console.log("B");
        });

    $('#dataTableConcern tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);
        
        if (row.child.isShown()) {
            var id = $(this).closest('tr').find('div').attr('data-id');
            
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(format(row.data())).show();
                
            curId = $(this).next().text();

            SetupEventListenersForDragDrop(curId);

            console.log(curId);
            LoadAttachments(curId);

            tr.addClass('shown');            
        }
    });

    function format(d) {
        var dateCreated = new Date();
        var dateSevenDays = new Date(d.SchoolDueEST);
        var dateThirtyDays = new Date(d.DistrictDueEST);
        
        let diffTime = Math.abs(dateSevenDays - dateCreated);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays > 7){
            diffTime = Math.abs(dateThirtyDays - dateCreated);
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 30){
                diffDays = 0;
                console.log(diffDays);
            }
        }

        console.log(diffDays);

        let theHTML = "";
        let theInsertHTML = "";

        let chkPending = " ";
        let chkResolved = " ";
        

        if ("Response" in d){
            if (d.Response.toLowerCase() === "willnotresolve"){
                chkResolved = " ";
            } else if (d.Response.toLowerCase() === "resolved"){
                chkResolved = " checked";
            }
        }        

        theHTML += `<div id="overConcernTable` + d.Id + `" class="ui grid" style="display: block;">
                        <div class="row">
                            <br/>
                            <div class="sixteen wide column" style="text-align: center">                                
                            <div class="ui` + chkPending + ` checkbox">
                            <input id="chkPending` + d.Id + `" type="checkbox" name="Resolve"`;
            
                    if (chkResolved === " checked") {
                        theHTML += ` checked=""`;
                    } 
                    
                    theHTML += ` onchange="ResolutionChange('` + d.Id + `', 'p')">
                                    <label>Pending</label>
                                </div>&nbsp;&nbsp;&nbsp;&nbsp;
                                <div class="ui` + chkResolved + ` checkbox">
                                    <input id="chkResolved` + d.Id + `" type="checkbox" name="Resolve"`;
                    
                    if (chkResolved === " checked") {
                        theHTML += ` checked=""`;
                    } 
                    
                    theHTML += ` onchange="ResolutionChange('` + d.Id + `', 'r')">
                                    <label>Resolved</label>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="sixteen wide column" style="text-align: center">
                                <div class="ui form">
                                    <div style="text-align: left">
                                        <label>Notes</label>
                                    </div>
                                    <div class="field">
                                        <textarea id="theNotes` + d.Id + `" rows="5" style="width: 97%"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="drop-area` + d.Id + `" class="droparea">
                            <form class="my-form">
                                <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
                                <div class="row">
                                    <div class="eight wide column" style="text-align: ">                                        
                                        <input type="file" id="fileElem` + d.Id + `" class="fileElem" multiple accept="image/*" onchange="handleFiles(this.files, '` + d.Id + `')">
                                        <label class="button" for="fileElem` + d.Id + `">Select files</label>
                                    </div>
                                </div>
                            </form>
                            <progress id="progress-bar` + d.Id + `" max=100 value=0 style="width: 100%"></progress>
                            <div id="gallery` + d.Id + `" class="gallery" /></div>
                        </div>
                        <div class="row">
                            <div class="sixteen wide column" style="text-align: right">                                
                                <button class="ui primary button" onclick="SaveResolution('` + d.Id + `')">
                                    Save
                                </button>&nbsp;
                                <button class="ui button" onclick="$(this).closest('tr').prev('tr').find('.details-control').click();">
                                    Cancel
                                </button>
                            </div>
                        </div>                                         
                    </div>`;

        return theHTML;        
    }
}

function LoadAttachments(id){
    let theHTML = "";
    
    CallJrapiPRIE("filelist", id, null, null, null).done(function (data) {        
        $.each(data, function(key, value){
            theHTML = `<a href="` + jrapiAPISource + `artifacts/` + id + `?id=` + value.Id + `" target="_blank"><i class="fas fa-download"></i>&nbsp;` + value.Name + `</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;

            //if (key + 1 === data.length){
                $('#gallery' + id).append(theHTML);
            //}    
        })        
     }); 
}

function getFile(attachmentId, concernId){

}

function SetupEventListenersForDragDrop(id){
    // ************************ Drag and drop ***************** //
    dropArea = document.getElementById("drop-area" + id)
    uploadProgress = []
    progressBar = document.getElementById('progress-bar' + id)

    // Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)   
    document.body.addEventListener(eventName, preventDefaults, false)
    })

    // Highlight drop area when item is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    })

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    
}

function ResolutionChange(id, type){
    if (type === "p"){
        if ($('#chkPending' + id).is(':checked')){
            $('#chkResolved' + id).prop('checked', false);
        }else if ($('#chkUnresolved' + id).is(':checked')){
            $('#chkResolved' + id).prop('checked', false);
        }else if ($('#chkResolved' + id).is(':checked')){
            $('#AttachmentDiv' + id).hide();
        }
    }
    if (type === "r"){
        if ($('#chkResolved' + id).is(':checked')){
            console.log($('#chkResolved' + id).is(':checked'));
            $('#AttachmentDiv' + id).hide();
        }else if ($('#chkUnresolved' + id).is(':checked')){
            console.log($('#chkUnresolved' + id).is(':checked'));
            $('#chkResolved' + id).prop('checked', false);
            $('#AttachmentDiv' + id).show();
        }
    }
}


function ReloadConcernTable(reset) {
    var order;
    

    if ($('#iSearchValue').hasClass("fa-sort-numeric-down") | $('#iSearchValue').hasClass("fa-sort-alpha-down")) {
        order = "-asc";
    } else {
        order = "-desc";
    }

    var fields = "";
    var sField = "";

    $("#heads th a span").each(function (i) {
        if (this.style.color === "red") {
            fields = this.getAttribute("data-value");
            sField = this.getAttribute("data-field");
        }
    });

    if (fields === "") {
        order = "";
    }

    var searchVal = "";

    if ($.trim($("#searchValConcern").val()) === "") {
        searchVal = "";
    } else {
        searchVal = "!LookUp(" + sField + " -like '%" + $.trim($("#searchValConcern").val()) + "%')";
    }
    

    if (reset === true) {
        pageSizeConcern = Number($('#selConcernPageSize').val());
        pageIndexConcern = 0;
    }

    showInProgressDialog("Please wait...", "Loading Concern Requests");

    var url = jrapiAPISource + "disputes" + "?Where=" + encodeURI(searchVal) + "&Sort=" + encodeURI(fields) + " " + order + "&StartIndex=" + pageIndexConcern + "&PageSize=" + pageSizeConcern;

    //$('#overConcernTable').hide();
    $('#ConcernNavigation').hide();
    $('#underConcernTable').hide();

    console.log(url);

    $('#dataTableConcern').DataTable().ajax.url(url).load();
    //}
}

function GetRedFields(flip) {
    var redFields = [];

    $("#heads th a span").each(function (i) {
        if (this.style.color === "red") {
            if (flip) {
                if (this.getAttribute("data-value") === "GradeLevel,JobTitle") {
                    this.setAttribute("data-value", "JobTitle,GradeLevel");
                } else if (this.getAttribute("data-value") === "JobTitle,GradeLevel") {
                    this.setAttribute("data-value", "GradeLevel,JobTitle");
                }
            }
            redFields.push(this.getAttribute("data-value"));
        }
    });

    return (redFields.join(", "));
}

function dataTableConcernSort(obj) {
    var thePlaceholder = "Search " + obj.text;
    var dataValue, datafField;

    if (obj.id === "chkRequestDate") {
        dataValue = "$[Form]_.SubmittedTime";
        datafField = "$[Form]_.SubmittedTime";
    } else if (obj.id === "chkLocation") {
        dataValue = "$[Form]_.Student.SchoolName";
        datafField = "$[Form]_.Student.SchoolName";
    } else if (obj.id === "chkGradeLevel") {
        dataValue = "$[Form]_.Student.GradeLevel";
        datafField = "$[Form]_.Student.GradeLevel";
    } else if (obj.id === "chkStudentId") {
        dataValue = "$[Form]_.Student.Id";
        datafField = "$[Form]_.Student.Id";
    } else if (obj.id === "chkStatus") {
        dataValue = `!is_null($[Status]_.State, 'Pending')`;
        datafField = `$[Status]_.State`;
    } 

    //dataValue = "!LookUp($[Form]_.Student.Id -like '%%')";
    //dataValue = "$[Status]_.State -eq 'Pending' -or $[Status]_.State -is null";

    $('#searchValConcern').attr("placeholder", "");
    $('#SearchConcern').text(thePlaceholder);

    $('#' + obj.id).html(`<span style="color: red" data-value="` + dataValue + `" data-field="` + datafField + `">` + obj.text + `</span>`);

    $('#' + obj.id).parent().siblings().find('span').css("color", "black");

    //console.log($('#' + obj.id).attr("data-type"));

    if ($('#' + obj.id).attr("data-type") === "date") {
        $('#iSearchValue').hide();
        $('#searchValConcern').attr("type", "date");
        $('#iSearchValue').addClass("fa-sort-numeric-down-alt").removeClass("fa-sort-numeric-down").removeClass("fa-sort-alpha-down").removeClass("fa-sort-alpha-down-alt");
    } else if ($('#' + obj.id).attr("data-type") === "text") {
        $('#iSearchValue').show();
        $('#searchValConcern').attr("type", "search");
        $('#iSearchValue').addClass("fa-sort-alpha-down").removeClass("fa-sort-alpha-down-alt").removeClass("fa-sort-numeric-down").removeClass("fa-sort-numeric-down-alt");
    }

    ReloadConcernTable(true);
}

function AdjustConcernSort() {
    //clear searchfield between date and text types
    //CODE GOES HERE

    if ($('#iSearchValue').hasClass("fa-sort-numeric-down-alt")) {
        $('#iSearchValue').removeClass("fa-sort-numeric-down-alt").addClass("fa-sort-numeric-down");
    } else if ($('#iSearchValue').hasClass("fa-sort-numeric-down")) {
        $('#iSearchValue').removeClass("fa-sort-numeric-down").addClass("fa-sort-numeric-down-alt");
    } else if ($('#iSearchValue').hasClass("fa-sort-alpha-down-alt")) {
        $('#iSearchValue').removeClass("fa-sort-alpha-down-alt").addClass("fa-sort-alpha-down");
    } else if ($('#iSearchValue').hasClass("fa-sort-alpha-down")) {
        $('#iSearchValue').removeClass("fa-sort-alpha-down").addClass("fa-sort-alpha-down-alt");
    }

    ReloadConcernTable(true, true);
}

function ResetConcernDevice(type, formId, studentId) {
    CallJrapiDAT("resetConcern", studentId, null, null, null).done(function (data) {
        ReloadConcernTable(true);
    });
}

function DenyConcernDevice(type, formId, studentId) {
    var postObject = {};

    postObject.Id = formId;
    postObject.Action = "decline";

    SaveJrapiDAT("POST", jrapiAPISource + "Concernforms/", postObject, onSuccess, onFail, true, true);

    function onSuccess(data) {        
        showSuccessDialog("Success", "Your changes have been saved!");
        ReloadConcernTable(true);
    }

    function onFail(error) {
        closeInProgressDialog();
        showErrorModal(error);
    }    
}

function SaveResolution(id){
    showInProgressDialog("Please wait...", "Saving changes");
    let postObject = {};
    let theResponse = 'WillNotResolve';

    if ($('#chkResolved' + id).is(':checked')){
        theResponse = 'Resolved';
    }
    
    postObject.Id = id;
    postObject.Response = theResponse;
    postObject.CompletionNotes = $('#theNotes' + id).val();

    SaveJrapiPRIEManager("POST", jrapiAPISource + "submitResponse", postObject, onSuccess, onFail, true, true);

    function onSuccess(data) {
        ReloadConcernTable(false);


    //     if (!data.Success) {
    //         showErrorModal(data);
    //         return;
    //     } 
        

    //     showSuccessDialog("Success", "Your information has been saved!");
    }

    function onFail(error) {
        closeInProgressDialog();
        showErrorModal(error);
    }
}

function BuildRoleTable(tableId, type1) {
    showInProgressDialog("Please wait...", "Loading Data");
    
    var url = "";
    
    if (type1 === "admin"){
        url = jrapiAPISource + "roles?schoolid=admin";
    }else if (type1 === "school"){
        url = jrapiAPISource + "roles?schoolid=" + $('#select2Schools').val();
    }    

    console.log(url);
    console.log(tableId);

    if ($.fn.dataTable.isDataTable('#' + tableId)) {
        $('#' + tableId).DataTable().clear().draw();

        $('#' + tableId).DataTable().ajax.url(url).load();

        return;
    }

    var table = $('#' + tableId).DataTable({
        "dom": 'frtip',
        ajax: {
            "url": url,
            "type": "GET",
            "headers":
            {
                "Accept": "application/json;odata=verbose",
                "token": JRTKN
            },
            "dataSrc": ""
        },
        "columns": [
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {

                    var theHTML = `<a href="javascript:void(0)" onclick="DeleteRole('` + data.Id + `', '` + type1 + `')"><img src="../image/trash.png" style="height: 20px; width: 20px"/></a>`;

                    return theHTML;
                }
            },
            {
                "data": "DisplayName",
                "orderable": false,
            },
            {
                "data": "Role",
                "orderable": false,
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {

                    return "";
                }
            }
        ]
    })
    .on('xhr', function (e, settings, json) {
        if (json.aaData == null){
            //SettingsAddRole('admin');
        }
    })
    .on('xhr.dt', function (e, settings, json, xhr) {
        closeInProgressDialog();
    });    
}

function ReloadBookTable() {
    table.clear();

    table.rows.add(StudentData).draw();

    GetStudentImage($('#select2Students').val());
}


