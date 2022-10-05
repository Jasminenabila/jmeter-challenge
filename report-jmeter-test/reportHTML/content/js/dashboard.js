/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 90.9090909090909, "KoPercent": 9.090909090909092};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8409090909090909, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.25, 2000, 4000, "Get Buyer Product Request"], "isController": false}, {"data": [1.0, 2000, 4000, "Get Buyer Product Request By ID"], "isController": false}, {"data": [1.0, 2000, 4000, "Get Seller Request By ID"], "isController": false}, {"data": [1.0, 2000, 4000, "Delete Seller Request By ID"], "isController": false}, {"data": [1.0, 2000, 4000, "Get Buyer Order Request By ID"], "isController": false}, {"data": [1.0, 2000, 4000, "Put Buyer Order Request"], "isController": false}, {"data": [0.0, 2000, 4000, "Post Buyer Order Request"], "isController": false}, {"data": [1.0, 2000, 4000, "Get Buyer Order Request"], "isController": false}, {"data": [1.0, 2000, 4000, "Login Request"], "isController": false}, {"data": [1.0, 2000, 4000, "Add Seller Product"], "isController": false}, {"data": [1.0, 2000, 4000, "Get Seller Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 22, 2, 9.090909090909092, 906.9545454545454, 277, 5580, 346.0, 2930.1999999999985, 5273.699999999995, 5580.0, 1.4007385712466573, 621.7342421884948, 23.811001269419332], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Buyer Product Request", 2, 0, 0.0, 4559.0, 3538, 5580, 4559.0, 5580.0, 5580.0, 5580.0, 0.20389438270975635, 992.9931217504334, 0.06929223162401876], "isController": false}, {"data": ["Get Buyer Product Request By ID", 2, 0, 0.0, 300.0, 298, 302, 300.0, 302.0, 302.0, 302.0, 0.30229746070133007, 0.2488640228234583, 0.10361953975211609], "isController": false}, {"data": ["Get Seller Request By ID", 2, 0, 0.0, 305.0, 283, 327, 305.0, 327.0, 327.0, 327.0, 0.44622936189201245, 0.32312409359660865, 0.15469865573404729], "isController": false}, {"data": ["Delete Seller Request By ID", 2, 0, 0.0, 377.5, 363, 392, 377.5, 392.0, 392.0, 392.0, 0.4355400696864111, 0.13695693597560976, 0.16035020143728224], "isController": false}, {"data": ["Get Buyer Order Request By ID", 2, 0, 0.0, 577.0, 308, 846, 577.0, 846.0, 846.0, 846.0, 0.30152268958239103, 0.34009639303482586, 0.10364842454394693], "isController": false}, {"data": ["Put Buyer Order Request", 2, 0, 0.0, 326.0, 300, 352, 326.0, 352.0, 352.0, 352.0, 0.32573289902280134, 0.21058122964169382, 0.12660321661237786], "isController": false}, {"data": ["Post Buyer Order Request", 2, 2, 100.0, 328.0, 277, 379, 328.0, 379.0, 379.0, 379.0, 0.30234315948601664, 0.10186366213151928, 0.121645880574452], "isController": false}, {"data": ["Get Buyer Order Request", 2, 0, 0.0, 297.0, 287, 307, 297.0, 307.0, 307.0, 307.0, 0.30184123151222453, 1.8131107568668878, 0.10198932236643525], "isController": false}, {"data": ["Login Request", 2, 0, 0.0, 1392.5, 1273, 1512, 1392.5, 1512.0, 1512.0, 1512.0, 0.3233629749393695, 0.16641824979789815, 0.08557750606305578], "isController": false}, {"data": ["Add Seller Product", 2, 0, 0.0, 1195.0, 1167, 1223, 1195.0, 1223.0, 1223.0, 1223.0, 0.37230081906180196, 0.2510485503536858, 68.32174498557335], "isController": false}, {"data": ["Get Seller Request", 2, 0, 0.0, 319.5, 299, 340, 319.5, 340.0, 340.0, 340.0, 0.44543429844098, 0.5235157989977728, 0.15181305679287305], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 100.0, 9.090909090909092], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 22, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Post Buyer Order Request", 2, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
