

        function get_range_val() {
            var slider = document.getElementById("myRange");
            var output = document.getElementById("range_val");
            output.innerHTML = slider.value;
        };






        function get_solr_url() {
            var fq = "";
            var snippet = ""
            var stc_label_length = "";
            var include_abstract = $("#include_abstract").is(":checked");
            var include_abstract_url = "";
            var url = "";

           
            if (document.getElementById("MaxWordsPerLabel").value != "") {
                stc_label_length = "&STCClusteringAlgorithm.maxDescPhraseLength=" + document.getElementById(
                    "MaxWordsPerLabel").value;

            }

            if (include_abstract == true) {
                include_abstract_url = "&carrot.snippet=abstract_html_strip";
            }

/*
            if (document.getElementById("pat_ids").value != "") {
                fq = fq + "&fq=pat_id:(" + document.getElementById("pat_ids").value.replace(/,/g, ' OR ') + ")";
            }

            if (document.getElementById("portfolio_ids").value != "") {

                fq = fq + "&fq=portfolio_ids:(" + document.getElementById("portfolio_ids").value.replace(/,/g, ' OR ') +
                    ")";
            }*/
            host = "prod-solr-node1:8080";
            collection = "pat_cluster";
            query = document.getElementById("query").value;
            //        snippet=document.getElementById("snippet").value;
            algorithm = document.getElementById("algorithm").value;
            cluster_size = document.getElementById("myRange").value;
            raw = document.getElementById("raw").value;

            if (document.getElementById("algorithm").value == "stc") {

                url = "http://" + host + "/solr/" + collection + "/clustering?q=" + query + fq + snippet +
                    "&clustering.engine=stc&STCClusteringAlgorithm.maxClusters=" + cluster_size + "&rows=" + raw +
                    "&echoParams=all&wt=json&STCClusteringAlgorithm.ignoreWordIfInHigherDocsPercent=0.1&STCClusteringAlgorithm.maxPhraseOverlap=0.60" +
                    stc_label_length + include_abstract_url;
            } else if (document.getElementById("algorithm").value == "lingo") {
                url = "http://" + host + "/solr/" + collection + "/clustering?q=" + query + fq + snippet +
                    "&clustering.engine=lingo" + "&LingoClusteringAlgorithm.desiredClusterCountBase=" + cluster_size +
                    "&rows=" + raw +
                    "&echoParams=all&wt=json&MinLengthLabelFilter.enabled=true&StopWordLabelFilter.enabled=true&NumericLabelFilter.enabled=true&QueryLabelFilter.enabled=true&GenitiveLabelFilter.enabled=true&CompleteLabelFilter.enabled=true&CaseNormalizer.dfThreshold=3" +
                    include_abstract_url;

            } else if (document.getElementById("algorithm").value == "kmeans") {
                url = "http://" + host + "/solr/" + collection + "/clustering?q=" + query + fq + snippet +
                    "&clustering.engine=kmeans" + "&BisectingKMeansClusteringAlgorithm.clusterCount=" + cluster_size +
                    "&rows=" + raw +
                    "&echoParams=all&wt=json&BisectingKMeansClusteringAlgorithm.maxIterations=25&TermDocumentMatrixBuilder.titleWordsBoost=2.0&CaseNormalizer.dfThreshold=3&BisectingKMeansClusteringAlgorithm.labelCount=1" +
                    include_abstract_url;
            }

            return url;
        };


        function check_algo(that) {
            if (that.value == "stc") {
                document.getElementById("MaxWordsPerLabel").style.display = "inline";
                document.getElementById("l1").style.display = "inline";
            } else if (that.value == "lingo" || that.value == "kmeans") {
                document.getElementById("MaxWordsPerLabel").style.display = "none";
                document.getElementById("l1").style.display = "none";
            }

        }





        function CreateTableFromJSON(data) {

            uniq_data = uniq(data);

            $('#t1').DataTable({
                data: uniq_data,
                destroy: true,
                columns: [

                    {   title:"patnum",
                        data: "id",
                        render: function (uniq_data, type, row, meta) {

                            uniq_data =
                                '<a target="_blank" href="http://st-analyst.rpxcorp.com/#/search/patent/' +
                                uniq_data + '">' + uniq_data + '</a>';


                            return uniq_data;
                        }
                    },
                    {   title:"title",
                        data: "title"
                    }
                ],
                scrollY: '70vh'
            });
        };

        function uniq(a) {
            return Array.from(new Set(a));
        };


        function get_sorted_array(pat_data, group_ids) {
            var s_array = [];
            for (var i = 0; i < pat_data.length; i++) {
                for (var j = 0; j < group_ids.length; j++) {
                    if (group_ids[j] == pat_data[i].id) {
                        s_array.push({
                            id: pat_data[i].patnum,
                            title: pat_data[i].title
                        });
                    }
                }

            }

            return s_array;
        }

        var generate = (function () {
            var number = 0;


            return function (levels, url, patents, cluster) {
                if (levels == 0) {
                    return undefined;
                }

                if (patents !== null) {

                    var pats_list = '\"' + patents.split(',').join('\" OR \"') + '\"';
                    var patents_fq = '&fq=id:(' + pats_list + ')';
                    //console.log(patents_fq)
                    url = url + patents_fq;
                }

                var result = [];
                var pat_record = [];
                $.ajax({
                    url: url,
                    async: false,
                    type: "GET",
                    dataType: "json",

                    success: function (data) {
                        pat_data = data.response.docs;



                        cluster_data = data.clusters;


                        var arrayLength = cluster_data.length;

                        /*   for (var i = 0; i < arrayLength; i++) {
                               //console.log(data.clusters[i]);
                               data_row["name"] = cluster_data[i].labels[0];
                               data_row["weight"] = cluster_data[i].score;
                               data_row["docs"] = cluster_data[i].docs;
                               cluster.push(data_row);
                               data_row = {};
                               //Do something
                           }*/




                        for (var i = 0; i < arrayLength; i++) {


                            var expandable = cluster_data[i].docs.length > 10;
                            var sub_group = cluster_data[i].labels[0];
                            result.push({
                                label: sub_group + "(" + cluster_data[i].docs.length +
                                    ")",
                                docs: cluster_data[i].docs,
                                expandable: expandable,
                                weight: (expandable ? arrayLength : 1) * cluster_data[i]
                                    .score,
                                groups: generate(levels - 1, url, cluster_data[i].docs.toString())
                            });

                        }


                        for (var j = 0; j < pat_data.length; j++) {

                            pat_record.push({
                                id: pat_data[j].patnum,
                                title: pat_data[j].title
                            });
                        }


                    }
                });


                return [result, pat_record];

            }
        })();





        $(document).ready(function () {
            var label = "";
            var slider = document.getElementById("myRange");
            var output = document.getElementById("range_val");
            output.innerHTML = slider.value;

            $(document).ajaxStart(function () {
                $('.img-fluid').show();
                $('#main_c').css("opacity", 0.4);
            });

            $(document).ajaxComplete(function () {
                $('.img-fluid').hide();
                $('#main_c').css("opacity", 1);
            });




            var url = get_solr_url();
fq="";
            if (document.getElementById("pat_ids").value != "") {
                fq = fq + "&fq=pat_id:(" + document.getElementById("pat_ids").value.replace(/,/g, ' OR ') + ")";
            }

            if (document.getElementById("portfolio_ids").value != "") {

                fq = fq + "&fq=portfolio_ids:(" + document.getElementById("portfolio_ids").value.replace(/,/g, ' OR ') +
                    ")";
            }


            url=url+fq;
            levels = 1;


            var tooltip = (function () {
                var tip = new Tooltip("Test", {
                    auto: true
                });
                var shown = false;
                var timeout;
                var lastShownPageX, lastShownPageY;
                var pageX, pageY;
                var currentGroup;

                function hide() {
                    tip.hide();
                    shown = false;
                    window.clearTimeout(timeout);
                }

                function show() {
                    if (currentGroup && currentGroup.label) {
                        var k = [];

                        for (var x = 0; x < currentGroup.docs.length; x++) {
                            k.push(/:(.+)/.exec(currentGroup.docs[x])[1]);
                        }
                        // k=uniq(k);



                        // Set some example content on the tooltip.
                        tip.content("<b>" + currentGroup.tooltip_label + "</b>");
                        tip.position(pageX, pageY);
                        tip.show();
                        lastShownPageX = pageX;
                        lastShownPageY = pageY;
                        shown = true;
                    }
                }

                function group(g) {
                    currentGroup = g;

                }


                document.body.addEventListener("mousemove", function (e) {
                    pageX = e.pageX;
                    pageY = e.pageY;

                    // Hide if the mouse pointer gets farther than 10px from the last tooltip location
                    if (shown && Math.sqrt(Math.pow(pageX - lastShownPageX, 2) + Math.pow(pageY -
                            lastShownPageY, 2)) > 10) {
                        hide();
                    }

                    // Show the tooltip after the pointer stops for some time
                    window.clearTimeout(timeout);
                    timeout = window.setTimeout(show, 500)
                });
                return {
                    group: group,
                    hide: hide
                };
            })();






            var result = [];
            var pat_record = [];

            $.ajax({
                url: url,
                async: true,
                type: "GET",
                dataType: "json",

                success: function (data) {
                    pat_data = data.response.docs;
                    all_pat_data = pat_data;
                    cluster_data = data.clusters;
                    var arrayLength = cluster_data.length;
                    for (var i = 0; i < arrayLength; i++) {
                        var expandable = cluster_data[i].docs.length > 10 && get_sorted_array(
                            all_pat_data, pat_data).length != cluster_data[i].docs.length;
                        var sub_group = cluster_data[i].labels[0];
                        var group_label = sub_group + "(" + cluster_data[i].docs.length + ")";
                        var tooltip_label = group_label;
                        result.push({
                            label: group_label,
                            tooltip_label: tooltip_label,
                            docs: cluster_data[i].docs,
                            expandable: expandable,
                            weight: (expandable ? arrayLength : 1) * cluster_data[i]
                                .score,
                            groups: generate(levels - 1, url, cluster_data[i].docs.toString())
                        });

                    }


                    for (var j = 0; j < pat_data.length; j++) {

                        pat_record.push({
                            id: pat_data[j].patnum,
                            title: pat_data[j].title
                        });
                    }
                    CreateTableFromJSON(pat_record);
                    var foamtree = new CarrotSearchFoamTree({
                        // Identifier of the HTML element defined above
                        id: "visualization",

                        // Remove restriction on the minimum group diameter, so that
                        // we can render as many diagram levels as possible.
                        groupMinDiameter: 0,

                        // Lower the minimum label font size a bit to show more labels.
                        groupLabelMinFontSize: 3,

                        // Disable rounded corners, deeply-nested groups
                        // will look much better and render faster.
                        groupBorderRadius: 0,

                        // Lower the parent group opacity, so that lower-level groups show through.
                        parentFillOpacity: 0.5,

                        // Lower the border radius a bit to fit more groups.
                        groupBorderWidth: 2,
                        groupInsetWidth: 3,
                        groupSelectionOutlineWidth: 1,
                        groupBorderWidthScaling: 0.25,

                        // Generate some initial data
                        dataObject: {
                            groups: result
                        },

                        // Use a simple fading animation
                        rolloutDuration: 0,
                        pullbackDuration: 0,

                        // When the user holds the mouse button over a group,
                        // load the data if needed.
                        onGroupHold: function (e) {
                            if (!e.secondary && e.group.expandable && !e.group.groups) {
                                loader.load(e.group);

                            } else {
                                this.open({
                                    groups: e.group,
                                    open: !e.secondary
                                });
                            }
                        },
                        onGroupHover: function (event) {
                            // Tell the tooltip which group is currently hovered on
                            tooltip.group(event.group);

                        },

                        onGroupMouseWheel: tooltip.hide,
                        onGroupExposureChanging: tooltip.hide,
                        onGroupOpenOrCloseChanging: tooltip.hide,
                        maxLabelSizeForTitleBar: 0,

                        // Dynamic loading of groups does not play very well with expose.
                        // Therefore, when the user double-clicks a group, initiate data loading
                        // if needed and zoom in to the group.
                        onGroupDoubleClick: function (e) {
                            e.preventDefault();
                            var group = e.secondary ? e.bottommostOpenGroup : e.topmostClosedGroup;
                            var toZoom;
                            if (group) {

                                //CreateTableFromJSON(generate(1, url, group.docs.toString())[1]);

                                CreateTableFromJSON(get_sorted_array(all_pat_data,
                                    group.docs));
                                // Open on left-click, close on right-click
                                if (!e.secondary && group.expandable && !e.group.groups) {
                                    loader.load(group);
                                } else {
                                    this.open({
                                        groups: group,
                                        open: !e.secondary
                                    });
                                }

                                toZoom = e.secondary ? group.parent : group;
                            } else {
                                toZoom = this.get("dataObject");
                            }
                            this.zoom(toZoom);
                        },

                        // Display a "+" if a group can be expanded
                        groupLabelDecorator: function (opts, params, vars) {
                            if (params.group.expandable && !params.group.groups) {
                                vars.labelText += "\u00a0\u00bb";
                            }
                            if (params.group.groups && params.browseable === false) {
                                vars.labelText += "\u00a0\u00bb\u00bb";
                            }
                        }
                    });

                    // Resize FoamTree on orientation change
                    window.addEventListener("orientationchange", foamtree.resize);

                    // Resize on window size changes
                    window.addEventListener("resize", (function () {
                        var timeout;
                        return function () {
                            window.clearTimeout(timeout);
                            timeout = window.setTimeout(foamtree.resize, 300);
                        }
                    })());

                    $("button[name = 'visualize']").click(function () {
                        url = get_solr_url();
                        var pat_record = [];
                        var result = [];

                       


            pats_list=""
            port_folio_list="";
            if (document.getElementById("pat_ids").value != "") {
                pats_list="(" + document.getElementById("pat_ids").value.replace(/,/g, ' OR ') + ")";
            }

            if (document.getElementById("portfolio_ids").value != "") {

               port_folio_list="(" + document.getElementById("portfolio_ids").value.replace(/,/g, ' OR ') + ")";
            }
            data_json_all="{}";
            data_json_pat="";
            data_json_port="";
            if (pats_list!=""){
                pats_list=JSON.stringify(pats_list);        
                pats_list=pats_list.replace (/(^")|("$)/g, '')
                data_json_pat="filter:\"pat_id:"+pats_list+"\"";
            }
            
                if (port_folio_list!="") {
                    port_folio_list=JSON.stringify(port_folio_list);        
                    port_folio_list=port_folio_list.replace (/(^")|("$)/g, '')
                    data_json_port="filter:\"portfolio_ids:"+port_folio_list+"\"";
                  //  data_json_all.push({data_json_port})
                }
                if (data_json_pat!="" && data_json_port !=""){
                    data_json_all="{"+data_json_pat+","+data_json_port+"}";
                }
                else if (data_json_pat=="" && data_json_port !=""){
                    data_json_all="{"+data_json_port+"}";
                }
                else if (data_json_pat!="" && data_json_port ==""){
                    data_json_all="{"+data_json_pat+"}";
                }
                debugger
            //port_folio_list=JSON.stringify(port_folio_list);
            //pats_list=pats_list.replace (/(^")|("$)/g, '')
            //port_folio_list=port_folio_list.replace (/(^")|("$)/g, '')
            
          //  data_json="{filter:\"pat_ids:("+pats_list+")\",filter:\"portfolio_ids:("+port_folio_list+")\"}"


            



                        $.ajax({
                            url: url,
                            async: true,
                            type: "POST",
                            dataType: "json",
                            headers:{'Content-type': 'text/json'},
                            data:data_json_all,

                            success: function (data) {
                                pat_data = data.response.docs;
                                all_pat_data = pat_data;
                                cluster_data = data.clusters;
                                var arrayLength = cluster_data.length;
                                for (var i = 0; i < arrayLength; i++) {
                                    var expandable = cluster_data[i].docs.length >
                                        10;
                                    var sub_group = cluster_data[i].labels[0];
                                    var group_label = sub_group + "(" +
                                        cluster_data[i].docs.length + ")";
                                    var tooltip_label = group_label;
                                    result.push({
                                        label: group_label,
                                        tooltip_label: tooltip_label,
                                        docs: cluster_data[i].docs,
                                        expandable: expandable,
                                        weight: (expandable ?
                                                arrayLength : 1) *
                                            cluster_data[i]
                                            .score,
                                        groups: generate(levels - 1,
                                            url, cluster_data[i].docs
                                            .toString())
                                    });

                                }


                                for (var j = 0; j < pat_data.length; j++) {

                                    pat_record.push({
                                        id: pat_data[j].patnum,
                                        title: pat_data[j].title
                                    });
                                }


                                //var [clusters_data, patents_data] = generate(1, url, null);
                                //foamtree.reset();
                                foamtree.set({
                                    dataObject: {
                                        groups: result
                                    }
                                });
                                CreateTableFromJSON(pat_record);
                            }
                        });
                    });



                    //
                    // A simple utility for simulating the Ajax loading of data
                    // and updating FoamTree with the newly loaded data.
                    //
                    var loader = (function (foamtree) {
                        return {
                            load: function (group) {
                                if (!group.groups && !group.loading) {
                                    spinner.start(group);

                                    // Simulate loading from the server by a timeout
                                    window.setTimeout(function () {
                                        if (group.docs.toString() !== null) {

                                            var pats_list = '\"' + group.docs.toString()
                                                .split(',').join('\" OR \"') +
                                                '\"';
                                            //var patents_fq = '&fq=id:(' +
                                              //  pats_list + ')';
                                            //console.log(patents_fq)
                                            url = get_solr_url();
                                            //url = url + patents_fq;
                                            pats_list=JSON.stringify(pats_list);
                                            pats_list=pats_list.replace (/(^")|("$)/g, '')
                                            data_json="{filter:\"id:("+pats_list+")\"}"
                                          //  data_json=JSON.stringify(k)


                                        }
                                        


                                        debugger
                                        var tooltip_label = group.tooltip_label;
                                        tooltip_label = tooltip_label;
                                        var result2 = [];
                                        var pat_record2 = [];

                                        $.ajax({
                                            url: url,
                                            async: true,
                                            headers:{'Content-type': 'text/json'},
                                            type: "POST",
                                            dataType: "json",
                                            data:data_json,
                                            crossDomain: true,
                                            failure: function(err) {
                  
                },

                                            success: function (data) {
                                                

                                                pat_data2 = data.response
                                                    .docs;
                                                cluster_data2 =
                                                    data.clusters;

                                                var arrayLength2 =
                                                    cluster_data2.length;
                                                for (var i = 0; i <
                                                    arrayLength2; i++
                                                ) {


                                                    var expandable =
                                                        cluster_data2[
                                                            i].docs
                                                        .length >
                                                        10 &&
                                                        get_sorted_array(
                                                            all_pat_data,
                                                            group.docs
                                                        ).length !=
                                                        cluster_data2[
                                                            i].docs
                                                        .length;
                                                    var sub_group =
                                                        cluster_data2[
                                                            i].labels[
                                                            0];
                                                    result2.push({
                                                        label: sub_group +
                                                            "(" +
                                                            cluster_data2[
                                                                i
                                                            ]
                                                            .docs
                                                            .length +
                                                            ")",
                                                        tooltip_label: tooltip_label +
                                                            "&nbsp;&nbsp;-->&nbsp;&nbsp;" +
                                                            sub_group +
                                                            "(" +
                                                            cluster_data2[
                                                                i
                                                            ]
                                                            .docs
                                                            .length +
                                                            ")",
                                                        docs: cluster_data2[
                                                                i
                                                            ]
                                                            .docs,
                                                        expandable: expandable,
                                                        weight: (
                                                                expandable ?
                                                                arrayLength2 :
                                                                1
                                                            ) *
                                                            cluster_data2[
                                                                i
                                                            ]
                                                            .score,
                                                        groups: generate(
                                                            levels -
                                                            1,
                                                            url,
                                                            cluster_data2[
                                                                i
                                                            ]
                                                            .docs
                                                            .toString()
                                                        )
                                                    });

                                                }


                                                for (var j = 0; j <
                                                    pat_data2.length; j++
                                                ) {

                                                    pat_record2.push({
                                                        id: pat_data2[
                                                                j
                                                            ]
                                                            .patnum,
                                                        title: pat_data2[
                                                                j
                                                            ]
                                                            .title
                                                    });
                                                }


                                                group.groups =
                                                    result2;
                                                //foamtree.redraw(true, group.groups);   

                                                CreateTableFromJSON
                                                    (pat_record2);



                                                // We need to open the group for FoamTree to update its model
                                                foamtree.open({
                                                    groups: group,
                                                    open: true
                                                }).then(
                                                    function () {
                                                        spinner
                                                            .stop(
                                                                group
                                                            );
                                                    });
                                            }
                                        });
                                    }, 500 + 1500 * Math.random());
                                }
                            }
                        };
                    })(foamtree);

                    //
                    // A simple utility for starting and stopping spinner animations
                    // inside groups to show that some content is loading.
                    //
                    var spinner = (function (foamtree) {
                        // Set up a groupContentDecorator that draws the loading spinner
                        foamtree.set("wireframeContentDecorationDrawing", "always");
                        foamtree.set("groupContentDecoratorTriggering", "onSurfaceDirty");
                        foamtree.set("groupContentDecorator", function (opts, props, vars) {
                            var group = props.group;
                            if (!group.loading) {
                                return;
                            }

                            // Draw the spinner animation

                            // The center of the polygon
                            var cx = props.polygonCenterX;
                            var cy = props.polygonCenterY;

                            // Drawing context
                            var ctx = props.context;

                            // We'll advance the animation based on the current time
                            var now = Date.now();

                            // Some simple fade-in of the spinner
                            var baseAlpha = 0.3;
                            if (now - group.loadingStartTime < 500) {
                                baseAlpha *= Math.pow((now - group.loadingStartTime) /
                                    500, 2);
                            }

                            // If polygon changed, recompute the radius of the spinner
                            if (props.shapeDirty || group.spinnerRadius ==
                                undefined) {
                                // If group's polygon changed, recompute the radius of the inscribed polygon.
                                group.spinnerRadius = CarrotSearchFoamTree.geometry
                                    .circleInPolygon(props.polygon, cx,
                                        cy) * 0.4;
                            }

                            // Draw the spinner
                            var angle = 2 * Math.PI * (now % 1000) / 1000;
                            ctx.globalAlpha = baseAlpha;
                            ctx.beginPath();
                            ctx.arc(cx, cy, group.spinnerRadius, angle, angle +
                                Math.PI / 5, true);
                            ctx.strokeStyle = "black";
                            ctx.lineWidth = group.spinnerRadius * 0.3;
                            ctx.stroke();

                            // Schedule the group for redrawing
                            foamtree.redraw(true, group);
                        });

                        return {
                            start: function (group) {
                                group.loading = true;
                                group.loadingStartTime = Date.now();

                                // Initiate the spinner animation
                                foamtree.redraw(true, group);
                            },

                            stop: function (group) {
                                group.loading = false;
                            }
                        };
                    })(foamtree);


                }
            });




        });