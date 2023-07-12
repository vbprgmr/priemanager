var table;

let pageIndexConcern = 0;
let pageSizeConcern = 10;
let totalItemsConcern = 0;
let searchValConcern = "";

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

    url = jrapiAPISource + "/disputes";// + "?Search=" + searchVal + "&StartIndex=" + pIndex + "&PageSize=" + pSize;
    
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
                    return "Not Resolved";
                }
            },
            {
                "data": null,
                "orderable": false,
                "render": function (data, type, row, meta) {
                    var dateCreated = new Date(data.CreatedEST);
                    var dateSevenDays = new Date(data.SchoolDueEST);
                    var dateThirtyDays = new Date(data.DistrictDueEST);
                    
                    let diffTime = Math.abs(dateSevenDays - dateCreated);
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    
                    if (diffDays > 7){
                        diffTime = Math.abs(dateThirtyDays - dateCreated);
                        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays > 30){
                            diffDays = 0;
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
            console.log("A");
        })
        .on('xhr.dt', function (e, settings, json, xhr) {
            closeInProgressDialog();

            $('#underConcernTable').show();

            RefreshButtonState("Concern");
            console.log("B");
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
                        
            tr.addClass('shown');
        }
    });

    function format(d) {
        let theHTML = "";
        let theInsertHTML = "";
        

        
        theHTML += `<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px; width: 100%">
                    <tr>
                        <td style="width: 15%; text-align: right; font-weight: bold">Resolve</td>
                        <td style="width: 35%;text-align: left">
                            <div name="gridStaticValue" data-id=""></div>
                        </td>
                        <td style="width: 15%; text-align: right; font-weight: bold"></td>
                        <td style="width: 35%;text-align: left"></td>            
                    </tr>` + theInsertHTML + `
                    <tr>`;

                             
                            
        theHTML += `</td>          
                    </tr>
                    </table>`;

        return theHTML;
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

    //var url = jrapiAPISource + "cases?Search=" + searchVal + "&Fields=" + fields + "&Sort=" + fields + "&Order=" + order + "&StartIndex=" + pageIndexConcern + "&PageSize=" + pageSizeConcern + "&schoolyear=" + $("#selYear").val();
    var url = jrapiAPISource + "/Concernforms" + "?Where=" + encodeURI(searchVal) + "&Sort=" + encodeURI(fields) + " " + order + "&StartIndex=" + pageIndexConcern + "&PageSize=" + pageSizeConcern;

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


