function ShowSettingsModal(){
    $("#ModalSettings").modal("show");   

    $('#SettingsTabAdmin').click();
}

function ShowSettings(type){
    $('#AdminEntry').hide();
    $('#SchoolEntry').hide();

    if (type === "admin"){
        $('#dataTableAdminWrapper').show();
        BuildRoleTable("dataTableAdmin", "admin");         
    }else if (type === "school"){
        LoadSchools("select2Schools");
    }
}

function SettingsAddRole(type){ 
    if (type === "admin"){
        $('#dataTableAdminWrapper').hide();
        ResetPeoplePicker($('#searchPeoplePickerAdmin'));
        GetSearchPeoplePicker('Admin', '0');
        $('#AdminEntry').show();
    } else if (type === "school"){
        $('#dataTableSchoolWrapper').hide();
        ResetPeoplePicker($('#searchPeoplePickerSchool'));
        GetSearchPeoplePicker('School','0');
        $('#SchoolEntry').show();
    } 
}

function BackSettingsModal(type, redraw){
    if (type === "admin"){
        $('#AdminEntry').hide();
        $('#dataTableAdminWrapper').show();
        if(redraw){
            $('#SettingsTabAdmin').click();
        } 
    } else if (type === "school"){
        $('#SchoolEntry').hide();
        $('#dataTableSchoolWrapper').show();
        if(redraw){
            $('#SettingsTabSchool').click();
        } 
    }
}

function ResetPeoplePicker(obj) {
    $(obj).search("set value", "");
    $(obj).search("query");
}

function GetSearchPeoplePicker(type, id) {
    $('#searchPeoplePicker' + type).search({
        apiSettings: {
            url: jrapiAPISource + "peoplepicker?search={query}&roleid=" + id,
            beforeXHR: function (xhr) {
                xhr.setRequestHeader("token", JRTKN);
                return xhr;
            },
            onResponse: function (theResponse) {
                var response = {
                    results: []
                };

                $.each(theResponse.Results, function (index, item) {
                    
                    response.results.push({
                        title: item.DisplayName,
                        item: item
                    });
                });

                return response;
            }
        },
        minCharacters: 3,
        onSelect: function (result, response) { 
            $('#searchPeoplePicker' + type).attr('data-id', result.item.AzureId);
            //Lookup(result.item.Id, true, result.item);
        },
        onResultClose: function () {
            console.log("closed");
        }
    });
}

function Lookup(id, add, theObject) {
    console.log(theObject);
}

function RemoveFromPeoplePicker(id, event) {
    event.stopPropagation();

    $("#removeUserModal").data('removeuserid', id);

    $("#removeUserModal").modal('show');
}

function ResetPeoplePicker(obj) {
    $(obj).search("set value", "");
    $(obj).search("query");
}

function SaveARole(type){
    showInProgressDialog("Please wait...", "Saving changes");
    let postObject = {};
      
    if (type === "admin"){   
        postObject.AzureId = $('#searchPeoplePickerAdmin').attr('data-id');
        
        postObject.SchoolId = "admin";

        if ($('#flexRadioAdmin').is(':checked')){
            postObject.Role = "Admin";
        } else if ($('#flexRadioChief').is(':checked')){
            postObject.Role = "Chief";
        }else if ($('#flexRadioCharterOffice').is(':checked')){
            postObject.Role = "CharterOffice";
        }
        
    } else if (type === "school"){        
        postObject.AzureId = $('#searchPeoplePickerSchool').attr('data-id');
       
        postObject.SchoolId = $('#select2Schools').val();

        if ($('#flexRadioPrincipal').is(':checked')){
            postObject.Role = "Principal";
        } else if ($('#flexRadioDelegate').is(':checked')){
            postObject.Role = "Delegate";
        }else if ($('#flexRadioManager').is(':checked')){
            postObject.Role = "Manager";
        }else if ($('#flexRadioRegional').is(':checked')){
            postObject.Role = "RegionalSuper";
        }
    }

console.log(postObject);


    SaveJrapiPRIEManager("POST", jrapiAPISource + "roles", postObject, onSuccess, onFail, true, true);

    function onSuccess(data) { 
        closeInProgressDialog();       
        BackSettingsModal(type, true);
    }

    function onFail(error) {
        closeInProgressDialog();
        showErrorModal(error);
    }
}

function DeleteRole(id, type){




    showInProgressDialog("Please wait...", "Removing Role");
    
    CallJrapiPRIE("deleterole", id, null, null, null, true).done(function (data) {        
        BackSettingsModal(type, true);
    });
}