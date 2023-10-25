const jrapiAPISource = "https://" + JrapiEndpoint + "/api/prie/";
const entered = false;

let JRTKN = "";
let dlg = null;
let dlg2 = null;

$( document ).ready(function() {
    
});

function ReadySetGo(type){  
    InitJrapiRedirectJSWithDomainHint("68d5bdfc-55cf-fd9f-2300-6507db796471", "duvalschools.org",JrapiTokenReceived, JrapiTokenNotReceived, true)

    function JrapiTokenReceived(token) {
        JRTKN = token;

        console.log("winner winner chicken dinner!");         
        
        if (getParameterByName('action', false) === "NewDisputeNotification" || getParameterByName('action', false) === "DaysExceeded"){
            let id = getParameterByName('disputeId', false);

            $('#searchValConcern').val(id);
        }

        $('.menu .item').tab();

        BuildConcernTable(0, 10, null);
    }


    function JrapiTokenNotReceived() {
        alert("Could not get token...");
        return;
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function LoadSchools(step){
    $('#select2SchoolsStep' + step).empty();

    LoadSchoolsList(step);    
}

function LoadStudents(step){
    $('#select2StudentsStep' + step).empty();

    LoadStudentsList(step);
}

function LoadSchoolsList(step) {
    let theHTML = "";

    $("#select2SchoolsStep" + step).empty();

    CallJrapiPRIE("schools", null, null, null, null).done(function (data) {
        $.each(data, function (key, value) {
            theHTML = `<option value="` + value.Id + `">` + value.Name + `</option>`;
    
            if ($("#select2SchoolsStep" + step + " option[value='" + value.Id + "']").length === 0) {
                $("#select2SchoolsStep" + step).append(theHTML);
            }
    
            if (key === data.length - 1) {
                $('#select2SchoolsStep' + step).select2();
                LoadStudents(step);
            }
        });
    });    
}

function LoadStudentsList(step) {
    let theHTML = "";

    $("#select2StudentsStep" + step).empty();

    CallJrapiPRIE("mystudents", null, null, null, null).done(function (data) {
        if (data.length === 0){
            if (step === '1'){
                $('#StepOne').show();
            } else if (step === '2'){
                $('#StepTwo').show();
            }

            $('body').css('background-color', 'lightgrey');
        }

        $.each(data, function (key, value) {
            theHTML = `<option value="` + value.Id + `" data-schoolid="` + value.SchoolId + `">` + value.Name + `</option>`;
    
            if ($("#select2StudentsStep" + step + " option[value='" + value.Id + "']").length === 0) {
                $("#select2StudentsStep" + step).append(theHTML);
            }

            if (key === 0){
                $('#PGStudentIdStep' + step).val(value.Id);
                $("#select2SchoolsStep" + step).val(value.SchoolId).trigger('change');              
            }
    
            if (key === data.length - 1) {                
                $('#select2StudentsStep' + step).select2();
                $('body').css('background-color', 'lightgrey');

                if (step === '1'){
                    $('#StepOne').show();
                } else if (step === '2'){
                    $('#StepTwo').show();
                }
            }
        });
    });    
}

function SetSchool(step){
    let id = $('#select2StudentsStep' + step).val();
    
    $('#PGStudentIdStep' + step).val(id);

    id = $('option[value="' + id + '"]').attr('data-schoolid');

    $("#select2SchoolsStep" + step).val(id).trigger('change'); 
}

function LoadMyInfo(step) { 
    let theHTML = '';

    CallJrapiPRIE("myinfo", null, null, null, null).done(function (data) {
       $('#PGNameStep' + step).val(data.Name);
       $('#PGNameStep' + step).attr('data-id', data.Id);
        $('#PGEmailStep' + step).val(data.Email);
        $('#PGPhoneStep' + step).val(data.MobilePhone);
    });
}

function ExamplePromise(){
    CallJrapiPRIE("x", null, null, null, null).done(function (data) {
        
     }).promise().done(function(){
         CallJrapiPRIE("y", null, null, null, null).done(function (data2) {

         });
     });    
}

function GetDisputes(){
    let x = 0;

    CallJrapiPRIE("disputes", null, null, null, null).done(function (data) {
        if (data.Items.length > 1){
            $('#ModalStep1ListContent').empty();


            $.each(data.Items, function(key, value){
                theHTML = `<div class="row">                 
                            <div class="two wide column" style="text-align: right">
                                <img id="img` + x + value.StudentId + `" src="" alt="` + value.StudentId + ` " style="width: 36px; height: 48px; border-radius: 3%">                               
                            </div>                                 
                            <div class="four wide column" style="padding-top: 20px">
                                ` + value.StudentName + `
                            </div>                            
                            <div class="five wide column" style="padding-top: 20px">
                                ` + value.SchoolName + ` 
                            </div>
                            <div class="four wide column" style="text-align: center">
                                <a href="javascript:void(0)" onclick="LoadStep2('` + value.Id + `')">
                                <div class="ui positive right labeled icon button">
                                ` + value.Id + `
                                <i class="checkmark icon"></i>
                                </div>
                                </a>
                            </div>
                            <div class="one wide column">                                
                            </div>                            
                        </div>`;

                $('#ModalStep1ListContent').append(theHTML);
                
                GetStudentImage(value.StudentId, x);

                $('#ModalStep1List').modal('show');

                x += 1;

                if (key + 1 === data.Items.length){
                    
                    theHTML = `<div class="row">                 
                                    <div class="six wide column" style="text-align: center; font-weight: bold">
                                        Student
                                    </div>                            
                                    <div class="five wide column" style="text-align: center; font-weight: bold">
                                        School 
                                    </div>
                                    <div class="four wide column" style="text-align: center; font-weight: bold">
                                        Dispute Number
                                    </div>
                                    <div class="one wide column">                                
                                    </div>                            
                                </div>`;

                $('#ModalStep1ListContent').prepend(theHTML);
                }
            });
        }
    });
}

function GetStudentImage(id, x){
    CallJrapiPRIE("photo", id, null, null, null).done(function (data) {
        $('#img' + x + id).attr('src', 'data:image/jpg;base64,' + data.Data);
    });    
}

function LoadStep2(id){
    CallJrapiPRIE("getdispute", id, null, null, null).done(function (data) {
        
        $('#Step2IncidentDate').val(data.IncidentDate).prop('disabled', true);
        $('#select2StudentsStep2').val(data.StudentId).trigger('change').prop('disabled', true);
        $("#select2SchoolsStep2").val(data.SchoolId).trigger('change').prop('disabled', true);

        $('input[name="requirement"]').each(function(key, value){
            if ("chk" + data.RequirementsOption === $(value).attr('id')){
                $(value).prop('checked', true).prop('disabled', true);
            } else {
                $(value).prop('checked', false).prop('disabled', true);
            }
        })

        $('#DisputeDescription').val(data.DisputeDescription).prop('disabled', true);
        $('#ProposedSolution').val(data.ProposedSolution).prop('disabled', true);

        $('#ModalStep1List').modal('hide');
    });    
}

function LoadCharterInfo(){
    let theHTML = "";

    CallJrapiPRIE("charterinfo", null, null, null, null).done(function (data) {
        console.log(data);
        
        $.each(data['E - Elementary'], function (keyE, valueE) {
            if (keyE === 0){
                theHTML = `<div class="row">
                            <div  class="sixteen wide column">
                                <span style="font-size: 18px;">Elementary Schools</span>
                            </div>
                        </div> `;
            }

            theHTML += `<div class="row">
                            <div  class="sixteen wide column">
                                &nbsp;&nbsp;<span style="font-weight: bold; font-size: 14px;"><a href="` + valueE.Url + `">` + valueE.Name + `</a></span>
                            </div>
                        </div> `;


            if (keyE === data['E - Elementary'].length - 1) {
                theHTML += `<br/><hr style="width: 100%"><br/>`;

                $('#TheCharterSchoolInfoGrid').append(theHTML);
            }
        });

        $.each(data['M - Middle'], function (keyM, valueM) {
            if (keyM === 0){
                theHTML = `<div class="row">
                            <div  class="sixteen wide column">
                                <span style="font-size: 18px;">Middle Schools</span>
                            </div>
                        </div> `;
            }

            theHTML += `<div class="row">
                            <div  class="sixteen wide column">
                            &nbsp;&nbsp;<span style="font-weight: bold; font-size: 14px;"><a href="` + valueM.Url + `">` + valueM.Name + `</a></span>
                            </div>
                        </div> `;


            if (keyM === data['M - Middle'].length - 1) {
                theHTML += `<br/><hr style="width: 100%"><br/>`;
                
                $('#TheCharterSchoolInfoGrid').append(theHTML);
            }
        });

        $.each(data['H - High'], function (keyH, valueH) {
            if (keyH === 0){
                theHTML = `<div class="row">
                            <div  class="sixteen wide column">
                                <span style="font-size: 18px;">High Schools</span>
                            </div>
                        </div> `;
            }

            theHTML += `<div class="row">
                            <div  class="sixteen wide column">
                            &nbsp;&nbsp;<span style="font-weight: bold; font-size: 14px;"><a href="` + valueH.Url + `">` + valueH.Name + `</a></span>
                            </div>
                        </div> `;


            if (keyH === data['H - High'].length - 1) {
                theHTML += `<br/><hr style="width: 100%"><br/>`;
                
                $('#TheCharterSchoolInfoGrid').append(theHTML);
            }
        });

        $.each(data['C - Combined'], function (keyC, valueC) {
            if (keyC === 0){
                theHTML = `<div class="row">
                            <div  class="sixteen wide column">
                                <span style="font-size: 18px;">Combined Schools</span>
                            </div>
                        </div> `;
            }

            theHTML += `<div class="row">
                            <div  class="sixteen wide column">
                            &nbsp;&nbsp;<span style="font-weight: bold; font-size: 14px;"><a href="` + valueC.Url + `">` + valueC.Name + `</a></span>
                            </div>
                        </div> `;


            if (keyC === data['C - Combined'].length - 1) {
                theHTML += `<br/><hr style="width: 100%"><br/>`;
                
                $('#TheCharterSchoolInfoGrid').after(theHTML);
            }
        });
    });    
}

function VerifySubmit(){
    if ($('#chkAcknowledgement').is(':checked')){
        $('#theSubmit').removeClass('disabled');
    }else{
        $('#theSubmit').addClass('disabled');
    }
}

function VerifyRequirement(){
    $('input[name="requirement"]').each(function(key, value){
        if ($(obj).attr('id') === $(value).attr('id')){
            $('#theSubmit').removeClass('disabled');
        }            
    })
}

function IsolateCheckbox(obj){
    $('input[name="requirement"]').each(function(key, value){
        if ($(obj).attr('id') !== $(value).attr('id')){
            $(value).prop('checked', false);
        }            
    })
}

function BuildRequirements(){
    let theHTML = "";

    CallJrapiPRIE("requirements", null, null, null, null).done(function (data) {        
        $.each(data.Options, function(key, value){
            theHTML = `<div class="row" style="background-color: white">
                            <div class="sixteen wide column" style="text-align: left; padding: 20px">
                            <div class="ui checkbox">
                                <input id="chk` + key  + `" type="checkbox" name="requirement" onchange="IsolateCheckbox(this)">
                                <label id="lbl">` + value + `</label>
                            </div>
                            </div>
                        </div><br/>`

                $('#divRequirements').append(theHTML);
        })

        $('#lblAcknowledgement').append(data.Acknowledgement);
     }); 
}

function submitstep(step){   
    var postObject = {};
    
    let opt = "";

    $('input[name="requirement"]').each(function(key, value){            
        if ($(value).is(':checked')){
            opt = $(value).attr('id').substr(3);
        }                        
    })
    
    postObject.SchoolId = $('#select2SchoolsStep1').val();
    postObject.StudentId = $('#select2StudentsStep1').val();
    postObject.IncidentDate = $('#Step1IncidentDate').val();
    postObject.RequirementsOption = opt;
    postObject.DisputeDescription = $('#DisputeDescription').val();
    postObject.ProposedSolution = $('#ProposedSolution').val();

    console.log(postObject);
    
    SaveJrapiPRIE("POST", jrapiAPISource + "submitstep" + step + "/", postObject, onSuccess, onFail, true, true);

    function onSuccess(data) {
        if (!data.Success) {
            showErrorModal(data);
            return;
        } 
        
        showSuccessDialog("Success", "Your information has been saved!");
    }

    function onFail(error) {
        closeInProgressDialog();
        showErrorModal(error);
    }
}

function ValidateSubmit(step){
    let theMessage = "";
    let theUnresolvedDescription = "";

    if (step === "1"){

    } else if (step === "2"){        
        if (!$('#chkResolveAttemptYes').is(":checked") || !$('#chkResolveAttemptNo').is(":checked")){
            $('#validPGResoleAttempt').show();
            theMessage += `<div style='padding: 20px'><span style='color: red'>"As the parent or guardian, 
                    I have attempted to resolve the dispute with the School Principal."</span> - Please select 'Yes' or 'No'</div>`;
        }

        theUnresolvedDescription = $('#validUnresolvedDescription').val();

        if (theUnresolvedDescription.trim() === ""){
            $('#validUnresolvedDescription').show();
            theMessage += `<div style='padding: 20px'><span style='color: red'>"Describe what was not resolved:"</span> - Please enter a description</div>`;
        }

        if (!$('#theAcknowledgement').is(':checked')){
            $('#validStep2Acknowledgement').show();
            theMessage += `<div style='padding: 20px'><span style='color: red'>"I understand the school district, 
                    will attempt to resolve the concern within thirty (30) days of the notification."</span> - Please check this box</div>`;
        }
    }

    return theMessage;
}

function ResolveAttemptChange(val){
    if (val){
        $('#chkResolveAttemptYes').prop('checked', true);
        $('#chkResolveAttemptNo').prop('checked', false);
    } else {
        $('#chkResolveAttemptYes').prop('checked', false);
        $('#chkResolveAttemptNo').prop('checked', true);
    }
}

function submitcharter(step){
    showInProgressDialog("Please wait", "Submitting Information");

    var postObject = {};

    postObject.AssetId = $('#inpAssetId').val();
    postObject.dcpsId = $('#inpDCPSID').val();
    postObject.Region = $('#selRegion').val();
    postObject.SiteGroup = $('#selSiteGroup').val();
    postObject.Site = $('#selSite').val();

    if (postObject.Region == null || postObject.SiteGroup == null || postObject.Site == null) {
        closeInProgressDialog();
        alert("Location is Required");
        return;
    }

    SaveJrapiDAT("POST", jrapiAPISource + "assignasset/", postObject, onSuccess, onFail, true, true);

    function onSuccess(data) {
        if (!data.Success) {
            showErrorModal(data);
        } else {
            ResetAll();
        }
        showSuccessDialog("Success", "Your changes have been saved!");
    }

    function onFail(error) {
        closeInProgressDialog();
        showErrorModal(error);
    }
}

function Pivot(type) {
    switch (type) {
        case "admin":
            if (typeof $("#selPageSizeOpenIssues").attr('data-size') !== "undefined") {
                size = $("#selPageSizeOpenIssues").attr('data-size');
            }

            ActivateIssueNumber(false);

            LoadTableOpenIssues(0, size);
            
            
            $("#lblPivotStatus").text('Open Issues');
            $("#viewOpenIssues").show();
            break;
        case "regional":
            if (typeof $("#selPageSizeNewIssues").attr('data-size') !== "undefined") {
                size = $("#selPageSizeNewIssues").attr('data-size');
            }

            ActivateIssueNumber(false);
            LoadTableNewIssues(0, size);
            $("#lblPivotStatus").text('New Issues');
            $("#viewNewIssues").show();
            break;
        case "school":
            ActivateIssueNumber(true);
            $("#lblPivotStatus").text('Create New Issue');
            CreateAnIssue();
            break;        
    }
}

function LoadSchools(id) {
    let theHTML = "";

    $("#" + id).empty();

    CallJrapiPRIE("schools", null, null, null, null).done(function (data) {
        $.each(data, function (key, value) {
            theHTML = `<option value="` + value.Id + `">` + value.Name + `</option>`;
    
            if ($("#" + id + " option[value='" + value.Id + "']").length === 0) {
                $("#" + id).append(theHTML);
            }
    
            if (key === data.length - 1) {
                $('#' + id).select2();

                if (id === "select2Schools"){
                    BuildRoleTable("dataTableSchool", "school");
                }
            }
        });
    });    
}

function SaveResponse(id, Complete){
    showInProgressDialog("Please wait...", "Saving changes");
    var postObject = {};
        
    postObject.Id = id;

    if ($('#chkResolved' + id).is(':checked')){
        postObject.CompletionResponse = "Resolved";
    } else{
        postObject.CompletionResponse = "";
    }
    
    postObject.Complete = Complete;

    postObject.CompletionNotes = $('#theNotes' + id).val();

    SaveJrapiPRIEManager("POST", jrapiAPISource + "submitresponse/", postObject, onSuccess, onFail, true, true);

    function onSuccess(data) {
        //LoadAttachments(curId);

        //GetCompletionNotes(curId);

        //GetConcernInfo(curId);
        
        ReloadConcernTable(true, null, id);
        
        closeInProgressDialog();
        if (!data.Success) {
            showErrorModal(data);
            return;
        } 
        
        //showSuccessDialog("Success", "Your changes have been saved!");
    }

    function onFail(error) {
        closeInProgressDialog();
        showErrorModal(error);
    }
}

function Confirm(title, msg, $true, $false, $link, $Id1, $Id) { /*change*/
    let AddResponse = "";

    if ($link === "saveresponse"){
        AddResponse = ` <button class='button button-default doActionComplete'>Confirm and Complete</button> `;
    }

    var $content =  "<div id='ConfirmOverlay' class='dialog-ovelay center'>" +
                    "<div id='DialogCenter' class='dialog center'><header>" +
                        " <h3> " + title + " </h3> " +
                        "<i class='fa fa-close'></i>" +
                    "</header>" +
                    "<div class='dialog-msg' style='white-space: nowrap'>" +
                     " <p> " + msg + " </p> " + 
                    "</div>" +
                    "<footer>" +
                        "<div class='controls'>" + AddResponse + 
                            " <button class='button button-default doAction'>" + $true + "</button> " +
                            " <button class='button button-default cancelAction'>" + $false + "</button> " +                            
                        "</div>" +
                    "</footer>" +
                "</div>" +
            "</div>";

    $('body').prepend($content);    

    $(window).scrollTop(0);    

    $('.doAction').click(function () {
        if($link === "deleteattachment"){
            CallJrapiPRIE("deleteattachment", $Id1, $Id, null, null).done(function (data) {
                LoadAttachments($Id1); 
            });    
        } else if($link === "deleteaccount"){
            DeleteRole($Id, $Id1)
        } else if($link === "saveresponse"){
            SaveResponse($Id, false)
        }
        $(this).parents('.dialog-ovelay').fadeOut(500, function () {
          $(this).remove();
        });
      });

      $('.doActionComplete').click(function () {
        if($link === "saveresponse"){
            SaveResponse($Id, true)
        }
        $(this).parents('.dialog-ovelay').fadeOut(500, function () {
          $(this).remove();
        });
      });

    $('.cancelAction, .fa-close').click(function () {
        $(this).parents('.dialog-ovelay').fadeOut(500, function () {
          $(this).remove();
        });
      });
      
   };
   



