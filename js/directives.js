'use strict';
/* Directives */
var laurasLarderDirectives = angular.module('laurasLarderDirectives', []);



laurasLarderDirectives.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $("#spinner").show(); // we show the spinner until the image is loaded

            element.find('img').bind('load', function() {
                angular.forEach($('.input_show_larder img'), function(key, image) {
                    if (image.complete === false)
                        console.log('false');
                });
                $("#spinner").hide();
            });
            /*element.find('img').bind('load', function() {
             console.log("hidden");
             console.log(document.readyState);
             $("#spinner").hide();
             });
             element.find('img').bind('error', function() {
             $("#spinner").hide();
             console.log(document.readyState);
             console.log("hidden");
             });
             */
        }
    };
});

laurasLarderDirectives.directive('checkEveryday', function() {
    return{
        restrict: 'A',
        link: function(scope, element) {
            element.click(function(e) {
                if ($("#checkbox-monday")[0].checked === false)
                    $("#checkbox-monday")[0].click();
                if ($("#checkbox-tuesday")[0].checked === false)
                    $("#checkbox-tuesday")[0].click();
                if ($("#checkbox-wednesday")[0].checked === false)
                    $("#checkbox-wednesday")[0].click();
                if ($("#checkbox-thursday")[0].checked === false)
                    $("#checkbox-thursday")[0].click();
                if ($("#checkbox-friday")[0].checked === false)
                    $("#checkbox-friday")[0].click();
                if ($("#checkbox-saturday")[0].checked === false)
                    $("#checkbox-saturday")[0].click();
                if ($("#checkbox-sunday")[0].checked === false)
                    $("#checkbox-sunday")[0].click();
            });
        }
    };
});

laurasLarderDirectives.directive('checkEveryweekday', function() {
    return{
        restrict: 'A',
        link: function(scope, element) {
            element.click(function(e) {
                if ($("#checkbox-monday")[0].checked === false)
                    $("#checkbox-monday")[0].click();
                if ($("#checkbox-tuesday")[0].checked === false)
                    $("#checkbox-tuesday")[0].click();
                if ($("#checkbox-wednesday")[0].checked === false)
                    $("#checkbox-wednesday")[0].click();
                if ($("#checkbox-thursday")[0].checked === false)
                    $("#checkbox-thursday")[0].click();
                if ($("#checkbox-friday")[0].checked === false)
                    $("#checkbox-friday")[0].click();
            });
        }
    };
});

laurasLarderDirectives.directive('ngInputuserinfo', function() {
    return{
        restrict: 'E',
        //scope: {ngUser: '='},
        templateUrl: 'partials/templateInputUserInfo.html'
                //replace:true
    };
});

laurasLarderDirectives.directive('checkboxtodownload', function() {
    return{
        scope: {
            fileUrl: '=',
            label: '@',
            fileName: '='
        },
        restrict: 'E',
        replace: true,
        template: '<div>' +
                '<input ng-show="fileName != null" id="{{input_id}}" type="checkbox" />' +
                '<label ng-show="fileName != null" for="{{input_id}}">{{label}}</label>' +
                '<a id="{{link_id}}" href="{{fileUrl}}" style="display:none">download diet</a>' +
                '</div>',
        link: function(scope, element) {
            scope.link_id = 'download_diet' + '-' + String(Math.random()).slice(2, 8);
            scope.input_id = 'checkBoxToDownload' + '-' + String(Math.random()).slice(2, 8);
            element.find('input').change(function(e) {
                if (element.find('input')[0].checked === true) {
                    element.find('a').attr('download', scope.fileName + '.json');
                    $("#" + scope.link_id)[0].click();
                }
            });

        }
    };
});

/*
 laurasLarderDirectives.directive('downloaddietonclick', function() {
 return{
 scope: {diettosave: '='},
 restrict: 'A',
 link: function(scope, element) {
 element.bind('click', function(e) {
 console.log(scope.diettosave.name);
 var file_name = scope.diettosave.name + '.json';
 $('#downloadDietLink').attr('download', file_name);
 $('#downloadDietLink').click();
 });
 
 }
 };
 });
 */
laurasLarderDirectives.directive('resetSearchbox', function() {
    return{
        restrict: 'A',
        link: function(scope, element) {
            element.bind('click', function(e) {
                $('.search_box input[type=search]').val('');
                $('.search_results').addClass('ng-hide');
            });
        }
    };
});

laurasLarderDirectives.directive('dhtmlxPie', function() {//made from: http://docs.dhtmlx.com/doku.php?id=dhtmlxchart:3dpieexample
    return{
        restrict: 'E',
        scope: {
            id: "="
        },
        replace: true,
        template: '<div style="width:450px;height:300px;;border:1px solid #A4BED4;"></div>',
        link: function(scope) {
            scope.data = [
                {sales: "4.3", year: "2001", color: "#80ff7a"},
                {sales: "9.9", year: "2002", color: "#bdff33"},
                {sales: "7.4", year: "2003", color: "#ff9e2a"},
                {sales: "9.0", year: "2004", color: "#ff561b"},
                {sales: "7.3", year: "2005", color: "#ff71be"},
                {sales: "6.8", year: "2006", color: "#ffea69"}
            ];
            window.onload = function() {
                scope.pie3Chart = new dhtmlXChart({
                    view: "pie3D",
                    container: "chart_container",
                    value: "#sales#",
                    color: "#color#",
                    label: "#year#",
                    legend: {
                        values: [{text: "Pie 3D", color: "#ffffff"}],
                        valign: "top",
                        align: "middle"
                    },
                    pieInnerText: "<b>#sales#</b>"
                });
                scope.pie3Chart.parse(scope.data, "json");
            };
        }
    };
});
/*laurasLarderDirectives.directive('ngWeeklymealstable', function() {
 return{
 restrict: 'E',
 // we are not isoating the scope which in this case means that we are using the rootscope
 scope:{
 ngWeeklymeals: '=',
 },
 templateUrl: 'partials/templateWeeklyMealsTable.html',
 //replace:true
 };
 });
 */

laurasLarderDirectives.directive('ngNodisplayifsinglevalue', function() {// the reason why we make this as a directive instad of using the ngIf directive is because we need to set the value of "options.user_choice.origin" to "single_value" when we don´t display
    return{
        restrict: 'A',
        scope: {ngProduct: '='},
        link: function(scope, element) {
            if (scope.ngProduct.options.origin.Single_value !== 0) {
                angular.element(element.css('display', 'none'));
                scope.ngProduct.options.user_choice.origin = "Single_value";
                //scope.ngProduct.origin_choice.value = "Single_value";
            }
        }
    };
});


//this chart directive has been copied but modified from http://bit.ly/1e0Mv7n
laurasLarderDirectives.directive('chart', function() {
    return{
        restrict: 'E',
        link: function(scope, elem, attrs) {
            var data = scope[attrs.ngModel];
            var chart = null;
            var options = {
                xaxis: {
                    ticks: data.ticks
                },
                grid: {
                    labelMargin: 10,
                    backgroundColor: '#e2e6e9',
                    color: '#ffffff',
                    borderColor: null
                }
            };

            // If the data changes somehow, update it in the chart
            scope.$watch(attrs.ngModel, function(v) {
                if (!chart) {
                    chart = $.plot(elem, v.data_values, options);
                    elem.show();
                } else {
                    chart.setData(v.data_values);
                    chart.setupGrid();
                    chart.draw();
                }
            });
        }
    };
});


laurasLarderDirectives.directive('pictToradio', function() {
    return{
        restrict: 'A',
        replace: true,
        scope: {
            name: '@',
            pictSrc: '@',
            model: '=',
            value: '=',
            textTodisplay: '@'
        },
        template: '<span><input type="radio" name="{{name}}" id="{{id}}" ng-model="model" ng-value="value"> </input><label for="{{id}}" class="origin_label cursor_points"><img src="{{pictSrc}}" /><img src="img/checked.png" class="input-checked" ng-if="model === value" /><p>{{textTodisplay}}</p></label></span>',
        link: function(scope, element, iAttrs, ctrl) {
            scope.class_name = scope.name + '-' + String(Math.random()).slice(2, 8);
            scope.id = scope.class_name;
            element.find('input').css({"display": "none"});
            //element.find('label').css({"background-color":"red"});
        }
    };
});
//for the magnifying glass effect we are making a directive from http://thecodeplayer.com/walkthrough/magnifying-glass-for-images-using-jquery-and-css3
laurasLarderDirectives.directive('ngMagnifiable', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            src: '@src', //we use the src, classSuffix and tip from the DOM element
            onclickevent: '&',
            tip: '@'
                    //categoryToopen: '@'
        },
        template: '<div class="magnify magnify_{{classSuffix}}"><div class="large_{{classSuffix}} tooltip2" tip="{{tip}}" ><img class="magnifying_glass" ng-click="onclickevent()"  src="img/magnifying_glass.png" /></div><img class="small_{{classSuffix}}" ng-src="{{src}}" /></div>',
        link: function(scope, iElement, iAttrs, ctrl) {
            scope.classSuffix = String(Math.random()).slice(2, 8);
            $(document).ready(function() {
//$(window).load(function() {
                var native_width = 0;
                var native_height = 0;
                //Now the mousemove function
                iElement.bind('mousemove', function(e) {
//When the user hovers on the image, the script will first calculate
//the native dimensions if they don't exist. Only after the native dimensions
//are available, the script will show the zoomed version.
                    if (!native_width && !native_height)
                    {
//This will create a new image object with the same image as that in .small
//We cannot directly get the dimensions from .small because of the 
//width specified to 200px in the html. To get the actual dimensions we have
//created this image object.
                        var image_object = new Image();
                        image_object.src = $(".small_" + scope.classSuffix).attr("src");
                        //This code is wrapped in the .load function which is important.
                        //width and height of the object would return 0 if accessed before 
                        //the image gets loaded.
                        native_width = image_object.width;
                        native_height = image_object.height;
                    }
                    else
                    {
//x/y coordinates of the mouse
//This is the position of .magnify with respect to the document.
                        var magnify_offset = $(this).offset();
                        //We will deduct the positions of .magnify from the mouse positions with
                        //respect to the document to get the mouse positions with respect to the 
                        //container(.magnify)
                        var mx = e.pageX - magnify_offset.left;
                        var my = e.pageY - magnify_offset.top;
                        //Finally the code to fade out the glass if the mouse is outside the container
                        if (mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0)
                        {
//                            $(".large_" + scope.classSuffix).fadeIn(50);
                            $(".large_" + scope.classSuffix).fadeIn(100);
                        }
                        else
                        {
                            $(".large_" + scope.classSuffix).fadeOut(50);
                        }
                        if ($(".large_" + scope.classSuffix).is(":visible"))
                        {
//The background position of .large will be changed according to the position
//of the mouse over the .small image. So we will get the ratio of the pixel
//under the mouse pointer with respect to the image and use that to position the 
//large image inside the magnifying glass
//var rx = Math.round(mx / $(".small_" + scope.classSuffix).width() * native_width - $(".large_" + scope.classSuffix).width() / 2) * -1;
//var ry = Math.round(my / $(".small_" + scope.classSuffix).height() * native_height - $(".large_" + scope.classSuffix).height() / 2) * -1;
                            var rx = Math.round(mx / $(".small_" + scope.classSuffix).width() * native_width - $(".large_" + scope.classSuffix).width() / 1) * -1;
                            var ry = Math.round(my / $(".small_" + scope.classSuffix).height() * native_height - $(".large_" + scope.classSuffix).height() / 1) * -1;
                            var bgp = rx + "px " + ry + "px";
                            //Time to move the magnifying glass with the mouse
                            var px = mx - $(".large_" + scope.classSuffix).width() / 2;
                            var py = my - $(".large_" + scope.classSuffix).height() / 2;
                            //Now the glass moves with the mouse
                            //The logic is to deduct half of the glass's width and height from the 
                            //mouse coordinates to place it with its center at the mouse coordinates

                            //If you hover on the image now, you should see the magnifying glass in action
                            $(".large_" + scope.classSuffix).css({"background": "url('" + $(".small_" + scope.classSuffix).attr("src") + "') no-repeat"});
                            $(".large_" + scope.classSuffix).css({"background-size": "225px"});
                            $(".large_" + scope.classSuffix).css({left: px, top: py, backgroundPosition: bgp});
                        }
                    }
                });
            });
        }
    };
});

