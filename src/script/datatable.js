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

function dataTableConcernSort(obj, reload) {
    var thePlaceholder = "Search " + obj.text;
    var dataValue, datafField;

    if (obj.id === "chkId") {
        dataValue = "$.Object.Id";
        datafField = "$.Object.Id";
    } else if (obj.id === "chkDateSubmitted") {
        dataValue = "$.Object.CreatedEST";
        datafField = "$.Object.CreatedEST";
    } else if (obj.id === "chkSchool") {
        dataValue = "$.Object.School.Name";
        datafField = "$.Object.School.Name";
    } else if (obj.id === "chkStudentName") {
        dataValue = "$.Object.Student.Name";
        datafField = "$.Object.Student.Name";
    } else if (obj.id === "chkStudentId") {
        dataValue = "$.Object.Student.Id";
        datafField = "$.Object.Student.Id";
    } else if (obj.id === "chkStatus") {
        dataValue = "$.Object.Status";
        datafField = "$.Object.Status";
    } else if (obj.id === "chkDays") {
        dataValue = "$.Object.DaysRemaining";
        datafField = "$.Object.DaysRemaining";
    } 

    $('#searchValConcern').attr("placeholder", "");
    $('#SearchConcern').text(thePlaceholder);

    $('#' + obj.id).html(`<span style="color: red" data-value="` + dataValue + `" data-field="` + datafField + `">` + obj.text + `</span>`);

    $('#' + obj.id).parent().siblings().find('span').css("color", "#4183c4");

    if ($('#' + obj.id).attr("data-type") === "date") {
        $('#iSearchValue').hide();
        $('#searchValConcern').attr("type", "date");
        $('#iSearchValue').addClass("fa-sort-numeric-down-alt").removeClass("fa-sort-numeric-down").removeClass("fa-sort-alpha-down").removeClass("fa-sort-alpha-down-alt");
    } else if ($('#' + obj.id).attr("data-type") === "text") {
        $('#iSearchValue').show();
        $('#searchValConcern').attr("type", "search");
        $('#iSearchValue').addClass("fa-sort-alpha-down").removeClass("fa-sort-alpha-down-alt").removeClass("fa-sort-numeric-down").removeClass("fa-sort-numeric-down-alt");
    }else if ($('#' + obj.id).attr("data-type") === "none") {
        $('#iSearchValue').hide();
        $('#searchValConcern').attr("type", "none");
        $('#iSearchValue').addClass("fa-sort-numeric-down-alt").removeClass("fa-sort-numeric-down").removeClass("fa-sort-alpha-down").removeClass("fa-sort-alpha-down-alt");
    }

    if (reload){
        ReloadConcernTable(true);
    }    
}

function BuildConcernTable(pIndex, pSize, id) {
    var order;
    showInProgressDialog("Please wait...", "Loading Concern List");

    if ($("#SearchConcern").html() === "Search"){
        dataTableConcernSort(document.getElementById('chkId'), false);
    };

    if ($('#iSearchValue').hasClass("fa-sort-numeric-down") | $('#iSearchValue').hasClass("fa-sort-alpha-down")) {
        order = "asc";
    } else {
        order = "desc";
    }

    var searchVal = "";

    if ($.trim($("#searchValConcern").val()) === "") {
        searchVal = "";
    } else {
        searchVal = "!LookUp($.Object.Id -like '%" + $.trim($("#searchValConcern").val()) + "%')";
    }

    $("#btnConcernFirst").prop('disabled', true);
    $("#btnConcernPrevious").prop('disabled', true);
    $("#btnConcernNext").prop('disabled', true);
    $("#btnConcernLast").prop('disabled', true);
    $('#ConcernNavigation').hide();
    $('#underConcernTable').hide();

    var url = "";

    url = jrapiAPISource + "disputes" + "?Where=" + encodeURI(searchVal) + "&StartIndex=" + pIndex + "&PageSize=" + pSize;

    console.log(url);

    if ($.fn.dataTable.isDataTable('#dataTableConcern')) {
        ReloadConcernTable(false);        
    }

    table = $('#dataTableConcern').DataTable({
        "initComplete": function(settings, json) {
            if (getParameterByName('action', false) === "NewDisputeNotification"){
                let id = getParameterByName('disputeId', false);
    
                $('#' + id + ' td:first-child').click();
            }
        },
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
        "rowId": 'Id', 
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
                    let theStatus = "Pending";

                    if ("Response" in data){
                        if (data.Response === "WillNotResolve"){
                            theStatus = "Not Resolved";
                        } else {
                            theStatus = data.Response;
                        }
                    } else if (data.DaysRemaining < 1){
                        theStatus = "Not Resolved";                        
                    }
                    
                    return theStatus;
                }
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    let diffDays = "0";
                   
                    if("Response" in data){
                        diffDays = data.Status;
                    } else {
                        if (data.DaysRemaining > 0){
                            diffDays = data.DaysRemaining.toString();
                        } else {
                            diffDays = data.Status;
                        }  
                    }
                    
                    return diffDays;                    
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
        })
        .on('xhr.dt', function (e, settings, json, xhr) {
            closeInProgressDialog();

            $('#underConcernTable').show();

            RefreshButtonState("Concern");
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

            LoadAttachments(curId);

            GetCompletionNotes(curId);

            GetConcernInfo(curId);

            tr.addClass('shown');            
        }
    });

    function format(d) {
        let theHTML = "";

        let chkResolved = " ";
        
        //Response exists
        if ("Response" in d){
            if (d.Response.toLowerCase() === "willnotresolve"){
                chkResolved = " ";
            } else if (d.Response.toLowerCase() === "resolved"){
                chkResolved = " checked";
            }
        } 

        theHTML += `<div id="overConcernTable` + d.Id + `" class="ui grid" style="display: block;">
        <br/><br/>
                        <div class="ui label" style="margin: 10px">
                            <i class="mail icon"></i> Submitted Dispute/Concern
                        </div>
                        <div id="ConcernInfo` + d.Id + `" class="row">                            
                        </div>
                        <hr style="border-top: 1px dashed red">
                        <div class="ui label" style="margin: 10px">
                            <i class="mail icon"></i> DCPS Response 
                        </div>                            
                        <div class="row">
                            <br/>
                            <div class="sixteen wide column" style="text-align: center">
                                <div class="ui` + chkResolved + ` checkbox">
                                    <input id="chkResolved` + d.Id + `" type="checkbox" name="Resolve"`;
                    
                    if (d.DaysRemaining < 1 || d.Status.toLowerCase() === "completed"){
                        theHTML += ` disabled`;
                    }

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
                                        <textarea id="theNotes` + d.Id + `" rows="5" style="width: 97%"`;
                                        
                                        if (d.DaysRemaining < 1 || d.Status.toLowerCase() === "completed"){
                                            theHTML += ` disabled`;
                                        }

                                theHTML +=`></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="drop-area` + d.Id + `" class="droparea">
                            <form class="my-form">
                                <p>Upload multiple files with the 'Select Files' dialog or by dragging and dropping images onto the dashed region</p>
                                <div class="row">
                                    <div class="eight wide column" style="text-align: ">                                        
                                        <input type="file" id="fileElem` + d.Id + `" class="fileElem" multiple accept="image/*" onchange="handleFiles(this.files, '` + d.Id + `')">
                                        <label class="button" for="fileElem` + d.Id + `">Select Files</label>
                                    </div>
                                </div>
                            </form>
                            <progress id="progress-bar` + d.Id + `" max=100 value=0 style="width: 100%"></progress>
                            <div id="gallery` + d.Id + `" class="gallery" /></div>
                        </div>
                        <div class="row">
                            <div class="sixteen wide column" style="text-align: right">`;
                            
                            if (d.DaysRemaining > 0 & d.Status.toLowerCase() !== "completed"){  

                                theHTML += `<button class="ui primary button" onclick="Confirm('Save Changes?', 'Dispute/Concern ` + d.Id + `', 'Confirm', 'Cancel', 'saveresponse', 'school', '` + d.Id + `')">
                                                Save
                                            </button>&nbsp;`;
                            }

                            theHTML += `<button class="ui button" onclick="$(this).closest('tr').prev('tr').find('.details-control').click();">
                                    Cancel
                                </button>
                            </div>
                        </div>                                         
                    </div>`;

        return theHTML; 
    }
}

function ConcernPageClick(type, direction) {    
        if (direction === "First") {
            pageIndexConcern = 0;
        } else if (direction === "Previous") {
            pageIndexConcern = pageIndexConcern - pageSizeConcern;
        } else if (direction === "Next") {
            pageIndexConcern = pageIndexConcern + pageSizeConcern;
        } else if (direction === "Last") {
            pageIndexConcern = Math.ceil(totalItemsConcern / pageSizeConcern) * pageSizeConcern - pageSizeConcern;
        }
        ReloadConcernTable(false);    
}

function GetCompletionNotes(id){
    CallJrapiPRIE("CompletionNotes", id, null, null, null).done(function (data) {        
        $('#theNotes' + id).html(data.CompletionNotes);
     }); 
}

function GetConcernInfo(id){
    let theHTML = "";
    let attempted = false;

    $('#ConcernInfo' + id).empty();

    CallJrapiPRIE("concerninfo", id, null, null, null).done(function (data) {    
        
        attempted = data.HasGuardianFollowUp;

        theHTML = `<div class="ui grid">
        <div class="row" style="margin: 10px">
        <div class="eight wide column">
          <div>
            School
          </div>
          <div>
            <div class="ui input disabled" style="width: 100%">
                <input type="text" placeholder="" value="` + data.School.Name + `">
            </div>
          </div>                 
        </div>
        <div class="seven wide column">
          <div>
            Parent or Guardian
          </div>
          <div>
            <div class="ui input disabled" style="width: 100%">
              <input type="text" placeholder="" value="` + data.Guardian.Name + `">
            </div>
          </div>                 
        </div>
      </div>
      <div class="row" style="margin: 10px">
        <div class="eight wide column">
          <div>
            Parent or Guardian Email
          </div>
          <div>
            <div class="ui input disabled">
              <input type="text" placeholder="" value="` + data.Guardian.Email + `">
            </div>
          </div>                 
        </div>
        <div class="seven wide column">
          <div>
            Parent or Guardian Phone
          </div>
          <div>
            <div class="ui input disabled">
              <input type="text" placeholder="" value="` + data.Guardian.MobilePhone + `">
            </div>
          </div>                 
        </div>
      </div>
      <div class="row" style="margin: 10px">
        <div class="eight wide column">
          <div>
            Name of Student
          </div>
          <div>            
            <div class="ui input disabled" style="width: 100%">
                <input type="text" placeholder="" value="` + data.Student.Name + `">
            </div>        
          </div>                 
        </div>
        <div class="three wide column">
          <div>
            Student ID
          </div>
          <div>
            <div class="ui input disabled">
              <input type="text" placeholder="" value="` + data.Student.Id + `">
            </div>
          </div>                 
        </div>
        <div class="three wide column">
          <div>
            Date of Incident
          </div>
          <div>
            <div class="ui input disabled">
                <input type="text" placeholder="" value="` + data.IncidentDate + `">
            </div>
          </div>                 
        </div>
      </div>
      <div class="row" style="margin: 10px">
        <div class="sixteen wide column">
          <div>
            Classify the nature of your dispute:
          </div>
          <div>
            <div class="ui form">
              <div class="field disabled">
                <div id="DisputeNature" rows="5" style="width: 95%"></div>
              </div>
            </div>
          </div>                 
        </div>
      </div>
      <div class="row" style="margin: 10px">
        <div class="sixteen wide column">
          <div>
            Describe the dispute:
          </div>
          <div>
            <div class="ui form">
              <div class="field disabled">
                <textarea id="DisputeDescription" rows="5" style="width: 95%">` + data.DisputeDescription + `</textarea>
              </div>
            </div>
          </div>                 
        </div>
      </div>
      <div class="row" style="margin: 10px">
        <div class="sixteen wide column">
          <div>
            Describe your proposed resolution:
          </div>
          <div>
            <div class="ui form">
              <div class="field disabled">
                <textarea id="ProposedSolution" rows="5" style="width: 95%">` + data.ProposedSolution + `</textarea>
              </div>
            </div>
          </div>                 
        </div>
      </div>`;

    if (data.HasGuardianFollowUp){
      theHTML += `<div class="row" style="margin: 10px">
      <div class="sixteen wide column">
        <div>
          Describe what was not resolved:
        </div>
        <div>
          <div class="ui form">
            <div class="field disabled">
              As the parent or guardian, I have attempted to resolve the dispute with the School Principal. ` + attempted  + `
            </div>
          </div>
        </div>                 
      </div>
    </div>
    <div class="row" style="margin: 10px">
        <div class="sixteen wide column">
          <div>
            Describe what was not resolved:
          </div>
          <div>
            <div class="ui form">
              <div class="field disabled">
                <textarea id="UnresolvedDescription" rows="5" style="width: 95%">` + data.GuardianFollowUpNotes + `</textarea>
              </div>
            </div>
          </div>                 
        </div>
      </div>`;
    }

      theHTML += `</div>`;

      $('#ConcernInfo' + id).append(theHTML);

      LoadNature(data.RequirementsVersion,data.RequirementsOption);
     }); 

     
}
function LoadNature(version, option){
    let optionVal = option.toString();

    CallJrapiPRIE("options", version, null, null, null).done(function (data) {    
        $('#DisputeNature').text(data.Options[optionVal]);
    });
}

function LoadAttachments(id){
    let theHTML = "";
    
    $('#progress-bar' + id).val('0');
    $('#gallery' + id).empty();
    
    CallJrapiPRIE("filelist", id, null, null, null).done(function (data) {        
        $.each(data, function(key, value){
            theHTML = `<a href="javascript:void(0)" onclick="Confirm('Delete attachment', 'Click confirm to delete &quot;` + value.Name + `&quot;?', 'Confirm', 'Cancel', 'deleteattachment', '` + value.DisputeId + `', '` + value.Id + `')"><i class="fas fa-trash-alt"></i>&nbsp;</a>&nbsp;<a href="` + jrapiAPISource + `artifacts/` + id + `?id=` + value.Id + `&action=download" target="_blank"><i class="fas fa-download"></i>&nbsp;` + value.Name + `</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;

            //if (key + 1 === data.length){
                $('#gallery' + id).append(theHTML);
            //}    
        })        
     }); 
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

function ReloadConcernTable(reset, flip, id) {
    var order;    

    if ($('#iSearchValue').hasClass("fa-sort-numeric-down") || $('#iSearchValue').hasClass("fa-sort-alpha-down")) {
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

    var fields = GetRedFields(flip);    

    if (reset === true) {
        pageSizeConcern = Number($('#selConcernPageSize').val());
        pageIndexConcern = 0;
    }

    showInProgressDialog("Please wait...", "Loading Concern List");

    var url = jrapiAPISource + "disputes" + "?Where=" + encodeURI(searchVal) + "&Sort=" + encodeURI(fields) + " " + order + "&StartIndex=" + pageIndexConcern + "&PageSize=" + pageSizeConcern;

    //$('#overConcernTable').hide();
    $('#ConcernNavigation').hide();
    $('#underConcernTable').hide();

    console.log(url);
    if (id !=="undefined"){
        $('#dataTableConcern').DataTable().ajax.url(url).load(function( settings, json ) {
            $('#' + id + ' td').click();
          });  
    } else {
        $('#dataTableConcern').DataTable().ajax.url(url).load();  
    }      
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
                    var theHTML = `<a href="javascript:void(0)" onclick="Confirm('Delete account', 'Click confirm to delete &quot;` + data.DisplayName + `&quot;?', 'Confirm', 'Cancel', 'deleteaccount', '` + type1 + `', '` + data.Id + `')"><img src="../image/trash.png" style="height: 20px; width: 20px"/></a>`;

                    return theHTML;
                }
            },
            {
                "data": "DisplayName",
                "orderable": false,
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    var theRole = "Admin";

                    if (data.Role === "Chief"){
                        theRole = "Chief of Schools (DCPS)";
                    }else if (data.Role === "CharterOffice"){
                        theRole = "Charter School Office";
                    }
                    
                    return theRole;
                }
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


function KeyupSearch(key) {
    if (key === 13) {
        ReloadConcernTable(true);
    }
}

