//js for LMT interactive variable mapping 
//
//
//
//

var table;
var cannotMerge=0;
var precommitData={};

var preCommit = 0;

var fileJson;

$(document).ready(function() {
     //initial the multiselct box
     //

     $('.info-list').select2MultiCheckboxes({
         placeholder: 'Select an option',
         theme: "classic",
         dropdownCssClass: "selectFont",
         containerCssClass:"selectFont",
         templateSelection: function(data) {
         return 'Hide columns';},
     });
     $('.info-list').val(null).trigger('change');

     $('.info-list').on("select2:select", function (e) {
          console.log('inselec');
          //this returns all the selected item
          var items= $(this).val();
          console.log(items);

          //Gets the last selected item
          var lastSelectedItem = e.params.data.id;
          console.log(lastSelectedItem);

          table.hideColumn(lastSelectedItem) ////toggle the visibility of the "name" column
     });

     $('.info-list').on("select2:unselect", function (e) {

          //this returns all the selected item
          var items= $(this).val();
          console.log(items);

          //Gets the last selected item
          var lastSelectedItem = e.params.data.id;
          console.log(lastSelectedItem);

          table.showColumn(lastSelectedItem) ////toggle the visibility of the "name" column
     });


     $('#download-json').click(function(){
         //table.download(fileFormatter, "test.txt");
         var e = document.getElementById("mipTypes");
         var mip = e.options[e.selectedIndex].value;
         
         var e = document.getElementById("modelTypes");
         var mod = e.options[e.selectedIndex].value;
         
         var e = document.getElementById("mipTable");
         var tab = e.options[e.selectedIndex].value;
         console.log('download trigger');
         fileJson = mip.concat("_", tab, "_", mod, ".json");
         table.download("json", fileJson, {}, "all");
     });


     $('#modelVarlst').change(function() {
         var e = document.getElementById("modelVarlst");
         var mvlst = e.options[e.selectedIndex].value;
         var wdw = window.open("./models/e3sm_new.html?modjson="+mvlst);

     });


     //$(document).ajaxSend(function(){
     //    $('.git-commit').fadeIn(250);
     //});
     //$(document).ajaxComplete(function(){
     //    $('.git-commit').fadeOut(250);
     //});

})

var tabOptions = {
       //data loading
       ajaxURL:myurl,
       ajaxContentType:"json", // send parameters to the server as a JSON encoded string
       ajaxResponse:function(url, params, response){
          //url - the URL of the request
          //params - the parameters passed with the request
          //response - the JSON object returned in the body of the response.
          jsnData = response;
          tabData = response.variables;
          return response.variables; //return the tableData property of a response json object
       },

       height:800,
       layout:"fitColumns",
       reactiveData:true, //enable reactive data
       //layout:"fitData",

       //autoColumns:true,
       //placeholder:"Awaiting Data, Please Load File",
       //footerElement:"<button id='download-json' class='tabulator-footer'>Download JSON</button>",
       //data:data,
       dataTree:false,
       //dataTreeStartExpanded:false,
       dataTreeStartExpanded:function(row, level){
          return row.getData().confidence; //expand rows where the "driver" data field is true;
       },
       //pagination:"local",
       //paginationSize:20,
       groupBy:"miptable",
       groupToggleElement:"header", //toggle group on click anywhere in the group header

       groupHeader:function(value, count, data, group){
           //value - the value all members of this group share
           //count - the number of rows in this group
           //data - an array of all the row data objects in this group
           //group - the group component for the group

           //console.log(data, 'ingroup');
           //console.log(value, 'ingroup');
           return data[0].attributes.miptable + "<span style='color:#d00; margin-left:10px;'>(" + count + " item)</span>";
       },
       downloadConfig:{
           columnGroups:false, //include column groups in column headers for download
           rowGroups:false, //do not include row groups in download
           columnCalcs:false, //do not include column calculation rows in download
       },
      columns:[],
};

// select

var e = document.getElementById("mipTypes");
var mip = e.options[e.selectedIndex].value;

var e = document.getElementById("modelTypes");
var mod = e.options[e.selectedIndex].value;

var e = document.getElementById("mipTable");
var tab = e.options[e.selectedIndex].value;


$.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        options.url = 'http://localhost:8080/' + options.url;
    }
});


document.title = ("Interactive Variable  Mapping System For ".concat(mip));
document.getElementById("myh1").innerHTML = "Interactive Variable Mapping System For ".concat(mip);

const baseurl = "./cmorjson/";
//const baseurl = "https://comclieco.github.io/cmorjson/";
// using proxy to solve cors
// let rquest do everytime refresh
var curTimeStamp = Math.floor(Date.now() / 1000);

if (tab.includes('fx')){
   fileJson = 'CMIP'.concat("_", tab, "_", mod, ".json");
}
else{
   fileJson = mip.concat("_", tab, "_", mod, ".json");
}

var myurl=baseurl + "jsonfiles/cmor/" + fileJson + "?t=".concat(curTimeStamp);
//var myurl="https://comclieco.github.io/cmorjson/".concat(mip, "_", tab, "_", mod, ".json?t=",curTimeStamp);

console.log('myurl', myurl);

var tabData;
var jsnData;
var tabCols = [];
var modVars = [];


const mapfile = {'Amon':'atmos', 'Lmon':'land'};
var jsonFiles=[];
$.ajax({
	url: "./cmorjson/jsonfiles/".concat(mod.toLowerCase()),
    headers: {'X-Requested-With':'XMLHttpRequest'},
    success: function (data) {
       $(data).find("a:contains(.json)").each(function(){
        var jsonfile = $(this).attr("title");
        jsonFiles.push(jsonfile);
        //if (tab == 'Amon' || tab == 'Lmon') {
        //   if (jsonfile.includes(mapfile[tab])){
        //      jsonFiles.push(jsonfile);
        //   }
        //}
       });

       document.getElementById('modelVarlst').options[0].text = 'E3SM variable list';
       //document.getElementsByClassName('dropbtn')[0].innerText  = 'E3SM variable list';
       add_options(jsonFiles,  'modelVarlst');

       findmodVars("./cmorjson/jsonfiles/", jsonFiles, mod, 'Lmon');
    },
});


function tabAutocomplete(hintVars){
       //for (xdict of tabCols){
       //     if (xdict['title'] == 'relationship'){
       //         xdict['editorParams'] = {freetext: true, values: hintVars};
       //     }
       //}
       //tabOptions.columns = tabCols;
       //
       table.updateColumnDefinition("relationship", {"editorParams":{freetext: true, values: hintVars}})

       //table.setColumns(tabCols);

       //table = new Tabulator("#example-table", tabOptions);
       console.log(tabOptions);
}


function findmodVars(jsnUrl, jsnFiles, modName, tabName){
       //generate autocompletion item
       var mVars = [];

       if (sessionStorage.getItem(modName+"::"+tabName) && sessionStorage.getItem(modName+"::"+tabName).length> 0){
           console.log('use session', modName);
           mVars = JSON.parse(sessionStorage.getItem(modName+"::"+tabName));
           console.log(mVars);
           tabAutocomplete(mVars);
           return;
       }

       for (jsnfile of jsnFiles){

              console.log(jsnfile, 'json', jsnfile.includes(mapfile[tabName]));
           
          if ((Object.keys(mapfile).includes(tabName)) && (jsnfile.includes(mapfile[tabName]))) {

              $.getJSON(jsnUrl + modName.toLowerCase() + "/" + jsnfile, function( data ){
                 var temp = Object.keys(data.variables);
                 mVars = [...mVars, ...temp];

                 //$(document).ajaxComplete(function(){
                      mVars = [...new Set(mVars)];
                      console.log(mVars, 'mvars');

                      tabAutocomplete(mVars);
                      //use session storage
                      sessionStorage.setItem(modName+"::"+tabName, JSON.stringify(mVars)); //});
              })
              .fail(function(jqXHR, textStatus, errorThrown) {
                 console.log("Cannot read the model json file:" + jsnfile + textStatus);
              });
          }
       }
}


tabOptions.ajaxURL=myurl;
console.log('before', tabOptions.ajaxURL);
table = new Tabulator("#example-table", tabOptions);


//set the tabData and JsnData using tabulator response function
table.setData(myurl)
.then (function() {

   console.log('in setdata', myurl);

   //generate hide options
   add_options(Object.keys(tabData[0]).filter(item => item !== 'attributes' && item !== 'dimensions' && item !== '_children'), 'mlist');
   add_options(Object.keys(tabData[0].attributes), 'mlist', 'attributes.');
   add_options(Object.keys(tabData[0].dimensions), 'mlist', 'dimensions.');

   //generate miptable select options
   //var mipTabList=[];
   //for (t of tabData){
   //   mipTabList.push(t.attributes.miptable.trim());
   //}
   //var mipTabItem = [...new Set(mipTabList)];
   //add_options(mipTabItem, 'mipTable');

   var col = {};

   modVars = [...new Set(modVars)];

   const defaultAttributes = ["priority", "miptable", "longname", "units"];
   const defaultColumns=[
          {title:"id",           field:"id"                  , formatter:"textarea", width: 80},
          {title:"priority",     field:"attributes.priority" , formatter:"textarea", width:120},
          {title:"long name",    field:"attributes.longname" , formatter:"textarea", width:360}, 
          {title:"varname",      field:"cmvar",                                      width:120},
          {title:"units",        field:"attributes.units"    , formatter:"textarea", width:160},
          {title:"relationship", field:"relationship"        , formatter:"textarea", width:600, editor:"autocomplete", editorParams:{freetext:true,values:modVars}},
          {title:"confidence",   field:"confidence"          , formatter:"textarea", width:120, editor:"input", formatter:highlight},
          {title:"mipTable",     field:"attributes.miptable" , formatter:"textarea", width:120}, 
   ];


   tabCols = defaultColumns;


   var hideCols=[];
   for (att of Object.keys(tabData[0].attributes)){
       if ( ! defaultAttributes.includes(att) ) {
           col["title"] = "attributes.".concat(att);
           col["field"] = "attributes.".concat(att); 
           col["visible"] = false; 
           col["download"] = true; 
           col["headerContextMenu"] = headerContextMenu;
           tabCols.push(Object.assign({}, col));
           hideCols.push("attributes.".concat(att));
       }
   } 

   for (att of Object.keys(tabData[0].dimensions)){
       if ( ! defaultAttributes.includes(att) ) {
           col["title"] = "dimensions.".concat(att);
           col["field"] = "dimensions.".concat(att); 
           col["visible"] = false; 
           col["download"] = true; 
           col["headerContextMenu"] = headerContextMenu;
           tabCols.push(Object.assign({}, col));

           hideCols.push("dimensions.".concat(att));
       }
   } 
   $('#mlist').val(hideCols);
   $('#mlist').trigger('change');
   

   //default loading
   //tabOptions.columns = tabCols;
   //tabOptions.data = tabData;
   //table = new Tabulator("#example-table", tabOptions);
   table.setColumns(tabCols);
});


function highlight(cell, formatterParams){
   var cellValue= cell.getValue();
   if (cellValue >= 90){
      //cell.getRow().getTreeParent().getElement().style.backgroundColor = "#90EE90";
      cell.getRow().getElement().style.backgroundColor = "#90EE90";
      cell.getRow().getElement().style.opacity = "0.6";
      return cellValue;
   }
   else if (cellValue <= -90){
      //cell.getRow().getElement().style.backgroundColor = "#800000";
      //cell.getRow().getElement().style.opacity = "0.6";
      cell.getRow().getElement().style.fontWeight = 800;
      cell.getRow().getElement().style.fontStyle = "italic";
      cell.getRow().getElement().style.color = "#FF0000";
      //console.log(Object.keys(cell.getRow().getElement().style), 'in cellsetting');
      //console.log(Object.keys(cell.getElement().style), 'in cellsetting');
      return cellValue;
   }
   else{
      //cell.getRow().getElement().style.backgroundColor = "#ADD8E6";
      //cell.getRow().getTreeParent().getElement().style.backgroundColor = "#ADD8E6";
      cell.getRow().getElement().style.backgroundColor = "#FFFFFF";
      return cellValue;
   }
}



// choosing list for amon, lmon etc.
//Trigger setFilter function with correct parameters
function updateFilter(){

   if($("#mipTable").val() == "function" ){
      table.clearFilter();

   }else{
      table.setFilter("attributes.miptable","=",$("#mipTable").val());
   }
}

$("#mipTable").change(updateFilter);




function add_options(optionList, selectID, preFix=''){

    var sel = document.getElementById(selectID);

    //for (var i = sel.options.length-1; i >= 0; i--) {
    //    sel.remove(i);
    //}
    for (x of optionList){
        var opt = document.createElement('option');
        opt.value = preFix.concat(x);
        opt.text = preFix.concat(x);
        sel.add(opt);
    }
}




//searching function
var input = document.getElementById("filter");
input.addEventListener("keyup", function(){
    var filters = [];
    var columns = table.getColumns();
    var search = input.value;

    columns.forEach(function(column){
        filters.push({
            field:column.getField(),
            type:"like",
            value:search,
        });
    });

    table.setFilter([filters]);
});



$("#expand").click(function(){
  var rows = table.getRows();
  
  table.getRows().treeExpand();
  //for (myrow in rows){
  //  myrow.treeToggle();
  //};
});

//trigger AJAX load on "Load Data via AJAX" button click
$("#file-load-trigger").click(function(){
      table.setData(myurl);
      //location.reload();
});

//trigger AJAX load page without using the browser cache
$('.mySelect').change(function () {
     var e = document.getElementById("mipTypes");
     var mip = e.options[e.selectedIndex].value;
     
     var e = document.getElementById("modelTypes");
     var mod = e.options[e.selectedIndex].value;
     
     var e = document.getElementById("mipTable");
     var tab = e.options[e.selectedIndex].value;

     console.log('xxx', mip, mod, tab)
     if (tab.includes('fx')){
        fileJson = 'CMIP'.concat("_", tab, "_", mod, ".json");
     }
     else{
        fileJson = mip.concat("_", tab, "_", mod, ".json");
     }


     var myurl=baseurl + "jsonfiles/cmor/" + fileJson + "?t=".concat(curTimeStamp);
     console.log('in change', tab, myurl);
     table.setData(myurl);
      //location.reload();
     document.title = ("Interactive Variable  Mapping System For ".concat(mip));
     document.getElementById("myh1").innerHTML = "Interactive Variable Mapping System For ".concat(mip);
});


$('#mipTable').change(function () {

     var e = document.getElementById("mipTypes");
     var mip = e.options[e.selectedIndex].value;
     
     var e = document.getElementById("modelTypes");
     var mod = e.options[e.selectedIndex].value;

     var e = document.getElementById("mipTable");
     var tab = e.options[e.selectedIndex].value;

     if (tab.includes('fx')){
        fileJson = 'CMIP'.concat("_", tab, "_", mod, ".json");
     }
     else{
        fileJson = mip.concat("_", tab, "_", mod, ".json");
     }

     var myurl=baseurl + "jsonfiles/cmor/" + fileJson + "?t=".concat(curTimeStamp);
     console.log('in change mip', myurl);

     console.log('miptab;e', mod, tab, jsonFiles);
     findmodVars("./cmorjson/jsonfiles/", jsonFiles, mod, tab);
     table.setData(myurl);

});


//custom file formatter
var fileFormatter = function(columns, data, options, setFileContents){
    //columns - column definition array for table (with columns in current visible order);
    //data - currently displayed table data
    //options - the options object passed from the download function
    //setFileContents - function to call to pass the formatted data to the downloader

    //create a list of all name fields
    var names = [];

    data.forEach(function(row){
        names.push(row.name);
    });

    //trigger file download, passing the formatted data and mime type
    setFileContents(names.join(", "), "text/plain");
}



var headerContextMenu = [
    {   
        label:"Hide Column",
        action:function(e, column){
            column.hide();
            var columnField = column.getField();
            console.log(columnField);
            $('#hlist').val(columnField);
            $('#hlist').trigger('change');
        }
    },
];



       //rowFormatter:function(row){
       //     if(row.getData().priority >= 1){
       //        row.getElement().addClass("bg-success"); //mark rows with age greater than or equal to 18 as successful;
       //     }
       //},

       //rowFormatter:function(row){
       //   var rowdata = row.getData();
       //   if(rowdata.id >= 10){
       //      row.getElement().style.backgroundColor = "#ffbe33";
       //   }
       //},



       //initialSort:[
       //   {column:"miptable", dir:"asc"}, //sort by this first
       //],
       //rowClick:function(e, row){
       //    //e - the click event object
       //    //row - row component

       //    row.treeToggle(); //collapse the rows children
       //    //row.treeExpand();

       //    row.reformatter();

       //    var removerows = false;
       //    var children=row.getTreeChildren();
       //    children.forEach(function(crow, cidx, crows){
       //        console.log(crow.getData().confidence);
       //        //crow.getElement().style.backgroundColor = "#ADD8E6";
       //        if( crow.getData().confidence >= 90){
       //           removerows = true;
       //        };
       //    });


       //    console.log(removerows);
       //    children.forEach(function(crow, cidx, crows){
       //        if( crow.getData().confidence < 90 && removerows ){
       //            console.log('xxx');
       //            console.log(crow.getData().cmvar);
       //            console.dir(crow);
       //            crow.delete();
       //        };
       //    });
       //},
   //});

   //table.setFilter([
   //    {field:"confidence", type:">", value:8}, //filter by age greater than 52
   //]);

   //table.setGroupStartOpen(false);


