'use strict';
/* Controllers */

var laurasLarderControllers = angular.module('laurasLarderControllers', []);
laurasLarderControllers.controller('introLLCtrl', ['$scope', '$modal', '$location', 'LL_items',
    function($scope, $modal, $location, LL_items) {
        $scope.steps = ['welcome', 'how_the_application_works', 'step_three'];
        $scope.step = 0;
        $scope.storage = localStorage;
        $scope.dietToOpen = {};
        /**  Reset storage  **/
        /* 
         angular.forEach($scope.storage,function(object,index){
         $scope.storage.removeItem(index);
         });
         console.log($scope.storage);
         */

        $scope.isCurrentStepIntroduction = function(step) {
            return $scope.step === step;
        };
        $scope.setCurrentStepIntroduction = function(step) {
            $scope.step = step;
        };
        $scope.getCurrentStepIntroduction = function() {
            return $scope.steps[$scope.step];
        };
        $scope.isFirstStepIntroduction = function() {
            return $scope.step === 0;
        };
        $scope.isLastStepIntroduction = function() {
            return $scope.step === ($scope.steps.length - 1);
        };
        $scope.handlePreviousIntroduction = function() {
            $scope.step -= 1;
        };
        $scope.handleNextIntroduction = function() {
            $scope.step += 1;
        };
        $scope.openDiet = function() {
            $scope.saveOpenStep = 'open';
            $scope.modalInstance_SaveOpenDiet = $modal.open({
                templateUrl: 'partials/modalSaveOpenDiet.html',
                windowClass: 'modalSaveOpenDiet',
                scope: $scope
            });
        };
        $scope.loadDiet = function() {
            $scope.modalInstance_SaveOpenDiet.close();
            console.log($scope.dietToOpen.name);
            var dietToLoad = JSON.parse($scope.storage.getItem($scope.dietToOpen.name));
            //we use the service to share the following objects with the results page controller
            LL_items.setCompleted_meals(dietToLoad.completed_meals);
            LL_items.setUserInfo(dietToLoad.userInfo);
            LL_items.setWeeklyMeals(dietToLoad.weeklyMeals);
            LL_items.setProducts_list(dietToLoad.products_list);
            LL_items.setProductIndex(dietToLoad.productIndex);
            LL_items.setLoadingDiet(true);
            switch (dietToLoad.controller) {
                case 'input_data':
                    $location.path('/LL-input-data');
                    break;
                case 'results':
                    $location.path('/LL-results');
                    break;
            }
            console.log(dietToLoad);
            //$location.path('/LL-results');
        };
    }]);
laurasLarderControllers.controller('inputDataLLCtrl', ['$scope', 'ProductsRepository', '$modal', 'LL_items', 'RNIsRepository', '$location',
    function($scope, ProductsRepository, $modal, LL_items, RNIsRepository, $location) {
        // Control and functions of the input wizard
        $scope.steps = ['user_info', 'add_product_to_meal', 'show_subcategories_and_products']; //I AM NOT SURE IF THIS VAR IS IN USE
        $scope.helper_step = null; // will be used to tell the helper what to say
        $scope.filling_up_first_day = true; //I AM NOT SURE IF THIS VAR IS IN USE, when we come from the intro we force the user to input data for all the meals on monday, after they have done it 'filling up first day' will be false and they will be able to choose if they go to results or which meal the fill up
        //initialitation, 
        $scope.meal = 'breakfast';
        $scope.day = 'monday';
        $scope.step = 'user_info';
        $scope.larder_to_show = 'breakfast';
        $scope.hide_show_larder_help_div = false;
        $scope.controller = 'input_data';
        $scope.dietToSave = {};
        $scope.storage = localStorage;
        //fin ini

        /** Load Diet - If we ahve clicked on "Open Diet" in the Introduction we need to load the relevant objects and siplay the weekly_table **/
        if (LL_items.getLoadingDiet === true) {
            $scope.step = display_weekly_table;
            $scope.userInfo = LL_items.getUserInfo();
            $scope.weeklyMeals = LL_items.getWeeklyMeals();
            $scope.completed_meals = LL_items.getCompleted_meals();
            $scope.products_list = LL_items.getProducts_list();
            var productIndex = LL_items.getProductIndex();
        }
        /** End Load Diet  **/

        $scope.handleNextInputWindow = function(args) {
            console.log($scope.weeklyMeals);
            console.log($scope);
            switch ($scope.step) {
                case 'user_info': //current step
                    //updateUserRNI();
                    $scope.meal = 'breakfast'; //we come from the "introduction" so we come to monday breakfast straight away
                    $scope.day = 'monday';
                    $scope.larder_to_show = 'breakfast';
                    $scope.step = 'show_larder'; // next step
                    $scope.hide_show_larder_help_div = false;
                    break;
                case 'show_larder':
                    switch (args.reason) {
                        case 'category_selected':
                            $scope.category = args.category;
                            $scope.step_in_products_and_subcategories = 'choose_product_or_subcategory';
                            $scope.modalInstance_ProductsAndSubcategories = $modal.open({
                                templateUrl: 'partials/modalProductsAndSubcategories.html',
                                windowClass: 'modalProductsAndSubcategories',
                                scope: $scope
                            });
                            break;
                        case 'subcategory_selected':
                            $scope.category = args.subcategory;
                            $scope.step_in_products_and_subcategories = 'choose_product_or_subcategory';
                            break;
                        case 'product_selected':
                            $scope.product = angular.copy(args.product);
                            $scope.step_in_products_and_subcategories = 'choose_size_and_origin';
                            break;
                        case 'size_and_origin_selected':
                            add_product_to_meal($scope.meal, $scope.day, $scope.product);
                            $scope.modalInstance_ProductsAndSubcategories.close();
                            break;
                        case 'remove_product':
                            $scope.index_of_product_to_remove = args.product_index;
                            $scope.modalInstance_RemoveProduct = $modal.open({
                                templateUrl: 'partials/modalRemoveProductConfirmation.html',
                                windowClass: 'modalRemoveProductConfirmation',
                                scope: $scope
                            });
                            break;
                        case 'remove_product_confirmed':
                            removeProduct($scope.index_of_product_to_remove, $scope.meal, $scope.day);
                            //$scope.updateUserDiet();
                            $scope.modalInstance_RemoveProduct.close();
                            break;
                        case 'product_selected_form_search':
                            $scope.product = angular.copy(args.product);
                            $scope.step_in_products_and_subcategories = 'choose_size_and_origin';
                            $scope.search_word = '';
                            console.log($scope.search_word.length);
                            $scope.modalInstance_ProductsAndSubcategories = $modal.open({
                                templateUrl: 'partials/modalProductsAndSubcategories.html',
                                windowClass: 'modalProductsAndSubcategories',
                                scope: $scope
                            });
                            break;
                        case 'meal_completed':
                            $scope.completed_meals[$scope.day][$scope.meal] = true;
                            //We prepare for the shorcut to add the same meal to different days
                            var not_all_meals_completed = false;
                            angular.forEach($scope.completed_meals, function(day_in_foreach, day_key) { // we check that this meal is not complted for all the other days, it is pointless to show the shortcut if the user cannot add the meal to any other day
                                if (day_in_foreach[$scope.meal] === false) {
                                    not_all_meals_completed = true;
                                }
                            });
                            //Beginning of shortcut: we check if there are other days that have not got thtis meal completed, if this is teh case we dsiplay the modal
                            if (not_all_meals_completed) {
                                angular.forEach($scope.copy_to_day, function(day_for_each, key) { //reset the object
                                    $scope.copy_to_day[key] = false;
                                });
                                $scope.meal_for_shortcut = $scope.meal; //we do this because $scope.meal is updated  out of the modal window, and this makes the meal to be the wrong one in the modal window
                                var modalInstance_CopyMealToOtherDaysShortcut = $modal.open({
                                    templateUrl: 'partials/modalCopyMealToOtherDaysShortcut.html',
                                    windowClass: 'modalCopyMealToOtherDaysShortcut',
                                    scope: $scope
                                });
                                modalInstance_CopyMealToOtherDaysShortcut.result.then(
                                        function() {//callback when modal closed
                                            angular.forEach($scope.copy_to_day, function(day_to_copy_to, key) {
                                                if (day_to_copy_to === true) {
                                                    $scope.weeklyMeals[key][$scope.meal_for_shortcut] = angular.copy($scope.weeklyMeals[$scope.day][$scope.meal_for_shortcut]);
                                                    $scope.completed_meals[key][$scope.meal_for_shortcut] = true;
                                                }
                                            });
                                            completeMeal();
                                            /*if ($scope.filling_up_first_day === true) {
                                             $scope.meal = $scope.nextMeal($scope.meal);
                                             if ($scope.meal === 'snacks_and_drinks') {//if we are in snacks and drinks we are finishing with the first day
                                             $scope.filling_up_first_day = false;
                                             $scope.helper_step = "finishing_first_day";
                                             }
                                             else {
                                             // we do nothing in this else but i put it here for the comments
                                             //we are filling up the first day and we have jumped into the next meal
                                             }
                                             }
                                             else {//if we are not filling up the first day
                                             var nextMealToComplete = $scope.nextMealNotCompleted();
                                             $scope.day = nextMealToComplete.day;
                                             $scope.meal = nextMealToComplete.meal;
                                             $scope.helper_step = "??";
                                             $scope.step = 'display_weekly_table';
                                             }*/

                                        },
                                        function() {
                                            //do nothing
                                        });
                            }
                            //End of shortcut shortcut,
                            else {
                                /*if ($scope.filling_up_first_day === true) {
                                 $scope.meal = $scope.nextMeal($scope.meal);
                                 if ($scope.meal === 'snacks_and_drinks') {//if we are in snacks and drinks we are finishing with the first day
                                 $scope.filling_up_first_day = false;
                                 $scope.helper_step = "finishing_first_day";
                                 }
                                 else {
                                 // we do nothing in this else but i put it here for the comments
                                 //we are filling up the first day and we have jumped into the next meal
                                 }
                                 }
                                 else {//if we are not filling up the first day
                                 var nextMealToComplete = $scope.nextMealNotCompleted();
                                 $scope.day = nextMealToComplete.day;
                                 $scope.meal = nextMealToComplete.meal;
                                 $scope.helper_step = "??";
                                 $scope.step = 'display_weekly_table';
                                 }*/
                                completeMeal();
                            }
                    }
                    break;
                case 'display_weekly_table':
                    switch (args.reason) {
                        case 'continue_filling_out_the_table':
                            var nextMealToComplete = $scope.nextMealNotCompleted();
                            $scope.day = nextMealToComplete.day;
                            $scope.meal = nextMealToComplete.meal;
                            $scope.larder_to_show = nextMealToComplete.meal;
                            $scope.step = 'show_larder';
                            $scope.hide_show_larder_help_div = false;
                            break;
                        case 'skip_to_results':
                            //we use the service to share the following objects with the results page controller
                            LL_items.setCompleted_meals($scope.completed_meals);
                            LL_items.setUserInfo($scope.userInfo);
                            LL_items.setWeeklyMeals($scope.weeklyMeals);
                            LL_items.setProducts_list($scope.products_list);
                            LL_items.setProductIndex(productIndex);
                            //Go to results
                            $location.path('/LL-results');
                            break;
                        case 'save':
                            /* var content = 'file content';
                             var blob = new Blob([content], {type: 'text/plain'});
                             $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
                             LL_OpenSave.saveDiet($scope);
                             **/
                            /** Fetch what we want to save and make JSON string  **/
                            var objectToSave = {};
                            objectToSave.userInfo = $scope.userInfo;
                            objectToSave.weeklyMeals = $scope.weeklyMeals;
                            objectToSave.completed_meals = $scope.completed_meals;
                            objectToSave.products_list = $scope.products_list;
                            objectToSave.productIndex = $scope.product_index;
                            objectToSave.controller = $scope.controller;
                            $scope.dietToSave.jsonString = JSON.stringify(objectToSave, null, '\t');
                            $scope.dietToSave.name = '';
                            // End fetching what we want to save and make JSON string  **/

                            /** Open modal, its mission is to get hte name of the diet to save, the actual saving happens when they click "Save" in the modal window **/
                            $scope.saveOpenStep = 'save';
                            $scope.modalInstance_SaveOpenDiet = $modal.open({
                                templateUrl: 'partials/modalSaveOpenDiet.html',
                                windowClass: 'modalSaveOpenDiet',
                                scope: $scope
                            });
                            break;
                        case 'dietToSaveSelected':
                            console.log($scope.storage);
                            $scope.modalInstance_SaveOpenDiet.close();
                            $scope.storage.setItem($scope.dietToSave.name, $scope.dietToSave.jsonString);
                            console.log($scope.storage);
                            break;
                    }
                    break;
            }
        };
        $scope.setLarderToShow = function(larder) {
            $scope.larder_to_show = larder;
        };
        $scope.isLarderToShow = function(larder) {
            return $scope.larder_to_show === larder;
        };
        $scope.getLarder = function(larder_name) {
            switch (larder_name) {
                case 'breakfast':
                    return $scope.larders.a;
                    break;
                case 'lunch':
                    return $scope.larders.b;
                    break;
                case 'dinner':
                    return $scope.larders.c;
                    break;
                case 'snacks_and_drinks':
                    return $scope.larders.d;
                    break;
            }
        };
        $scope.nextMeal = function(current_meal) {
            switch (current_meal) {
                case 'breakfast':
                    return 'lunch';
                    break;
                case 'lunch':
                    return 'dinner';
                    break;
                case 'dinner':
                    return 'snacks_and_drinks';
                    break;
                case 'snacks_and_drinks':
                    return null;
                    break;
            }
        };
        $scope.nextMealNotCompleted = function() {
            if ($scope.completed_meals.monday.breakfast === false)
                return {day: 'monday', meal: 'breakfast'};
            else if ($scope.completed_meals.monday.lunch === false)
                return {day: 'monday', meal: 'lunch'};
            else if ($scope.completed_meals.monday.dinner === false)
                return {day: 'monday', meal: 'dinner'};
            else if ($scope.completed_meals.monday.snacks_and_drinks === false)
                return {day: 'monday', meal: 'snacks_and_drinks'};
            else if ($scope.completed_meals.tuesday.breakfast === false)
                return {day: 'tuesday', meal: 'breakfast'};
            else if ($scope.completed_meals.tuesday.lunch === false)
                return {day: 'tuesday', meal: 'lunch'};
            else if ($scope.completed_meals.tuesday.dinner === false)
                return {day: 'tuesday', meal: 'dinner'};
            else if ($scope.completed_meals.tuesday.snacks_and_drinks === false)
                return {day: 'tuesday', meal: 'snacks_and_drinks'};
            else if ($scope.completed_meals.wednesday.breakfast === false)
                return {day: 'wednesday', meal: 'breakfast'};
            else if ($scope.completed_meals.wednesday.lunch === false)
                return {day: 'wednesday', meal: 'lunch'};
            else if ($scope.completed_meals.wednesday.dinner === false)
                return {day: 'wednesday', meal: 'dinner'};
            else if ($scope.completed_meals.wednesday.snacks_and_drinks === false)
                return {day: 'wednesday', meal: 'snacks_and_drinks'};
            else if ($scope.completed_meals.thursday.breakfast === false)
                return {day: 'thursday', meal: 'breakfast'};
            else if ($scope.completed_meals.thursday.lunch === false)
                return {day: 'thursday', meal: 'lunch'};
            else if ($scope.completed_meals.thursday.dinner === false)
                return {day: 'thursday', meal: 'dinner'};
            else if ($scope.completed_meals.thursday.snacks_and_drinks === false)
                return {day: 'thursday', meal: 'snacks_and_drinks'};
            else if ($scope.completed_meals.friday.breakfast === false)
                return {day: 'friday', meal: 'breakfast'};
            else if ($scope.completed_meals.friday.lunch === false)
                return {day: 'friday', meal: 'lunch'};
            else if ($scope.completed_meals.friday.dinner === false)
                return {day: 'friday', meal: 'dinner'};
            else if ($scope.completed_meals.friday.snacks_and_drinks === false)
                return {day: 'friday', meal: 'snacks_and_drinks'};
            else if ($scope.completed_meals.saturday.breakfast === false)
                return {day: 'saturday', meal: 'breakfast'};
            else if ($scope.completed_meals.saturday.lunch === false)
                return {day: 'saturday', meal: 'lunch'};
            else if ($scope.completed_meals.saturday.dinner === false)
                return {day: 'saturday', meal: 'dinner'};
            else if ($scope.completed_meals.saturday.snacks_and_drinks === false)
                return {day: 'saturday', meal: 'snacks_and_drinks'};
            else if ($scope.completed_meals.sunday.breakfast === false)
                return {day: 'sunday', meal: 'breakfast'};
            else if ($scope.completed_meals.sunday.lunch === false)
                return {day: 'sunday', meal: 'lunch'};
            else if ($scope.completed_meals.sunday.dinner === false)
                return {day: 'sunday', meal: 'dinner'};
            else if ($scope.completed_meals.sunday.snacks_and_drinks === false)
                return {day: 'sunday', meal: 'snacks_and_drinks'};
            else
                return false;
        };
        var completeMeal = function() {
            if ($scope.allMealsCompleted() === true) {
                console.log("here");
                $scope.helper_step = "all_meals_completed";
                $scope.step = 'display_weekly_table';
            }
            else if ($scope.day === 'monday') {
                if ($scope.meal === 'snacks_and_drinks') {// we are finishing the first day so we display the table
                    $scope.filling_up_first_day = false;
                    $scope.helper_step = "finishing_first_day";
                    $scope.step = 'display_weekly_table';
                }
                else {// when we are filling up the first day we allways move to next meal when we complete a meal (except for 'snacks and drinks', see if statement above)
                    var nextMealToComplete = $scope.nextMealNotCompleted();
                    $scope.day = 'monday';
                    $scope.meal = nextMealToComplete.meal;
                    $scope.larder_to_show = nextMealToComplete.meal;
                }
            }
            else {//we are not in the first day and not all meals are completed
                $scope.helper_step = "another_meal_completed";
                $scope.step = 'display_weekly_table';
            }
            //we see which is the next meal and day to be completed
            var nextMealToComplete = $scope.nextMealNotCompleted();
            $scope.day = nextMealToComplete.day;
            $scope.meal = nextMealToComplete.meal;
            $scope.larder_to_show = nextMealToComplete.meal;
            /*if ($scope.filling_up_first_day === true) {
             $scope.meal = $scope.nextMeal($scope.meal);
             if ($scope.meal === 'snacks_and_drinks') {//if we are in snacks and drinks we are finishing with the first day
             $scope.filling_up_first_day = false;
             $scope.helper_step = "finishing_first_day";
             }
             else {
             // we do nothing in this else but i put it here for the comments
             //we are filling up the first day and we have jumped into the next meal
             }
             }
             else {//if we are not filling up the first day
             var nextMealToComplete = $scope.nextMealNotCompleted();
             $scope.day = nextMealToComplete.day;
             $scope.meal = nextMealToComplete.meal;
             $scope.helper_step = "??";
             $scope.step = 'display_weekly_table';
             }*/
        };
        $scope.allMealsCompleted = function() {
            var all_meals_completed = true;
            angular.forEach($scope.completed_meals, function(day_in_foreach, day_key) {
                angular.forEach(day_in_foreach, function(meal_in_foreach, meal_key) {
                    if (meal_in_foreach === false) {
                        all_meals_completed = false;
                    }
                });
            });
            return all_meals_completed; // we have gone through every meal and didn´t find any not completed one, so we return true
            //return true;
        };
        /*** I don think we are using ini_magnifiying  **/
        $scope.ini_magnifiyng = function(classSuffix) {

            var native_width = 0;
            var native_height = 0;
            $(".large_" + classSuffix).css({"background": "url('" + $(".small_" + classSuffix).attr("src") + "') no-repeat"});
            //Now the mousemove function
            $(".magnify_" + classSuffix).mousemove(function(e) {
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
                    image_object.src = $(".small_" + classSuffix).attr("src");
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
                        $(".large_" + classSuffix).fadeIn(50);
                    }
                    else
                    {
                        $(".large_" + classSuffix).fadeOut(50);
                    }
                    if ($(".large_" + classSuffix).is(":visible"))
                    {
//The background position of .large will be changed according to the position
//of the mouse over the .small image. So we will get the ratio of the pixel
//under the mouse pointer with respect to the image and use that to position the 
//large image inside the magnifying glass
                        var rx = Math.round(mx / $(".small_" + classSuffix).width() * native_width - $(".large_" + classSuffix).width() / 2) * -1;
                        var ry = Math.round(my / $(".small_" + classSuffix).height() * native_height - $(".large_" + classSuffix).height() / 2) * -1;
                        var bgp = rx + "px " + ry + "px";
                        //Time to move the magnifying glass with the mouse
                        var px = mx - $(".large_" + classSuffix).width() / 2;
                        var py = my - $(".large_" + classSuffix).height() / 2;
                        //Now the glass moves with the mouse
                        //The logic is to deduct half of the glass's width and height from the 
                        //mouse coordinates to place it with its center at the mouse coordinates

                        //If you hover on the image now, you should see the magnifying glass in action
                        $(".large_" + classSuffix).css({left: px, top: py, backgroundPosition: bgp});
                    }
                }
            });
        }

        // End of control of the wizard


        $scope.list_of_category_graphics = {}; //this just to make a list and give it to John so he can give the graphcs the appropiate names
        $scope.list_of_portions_graphics = {}; //this just to make a list and give it to John so he can give the graphcs the appropiate names
        //larders constants,
        var BREAKFAST = 'a', LUNCH = 'b', DINNER = 'c', DRINKS_AND_SNACKS = 'd';
        //index for assigning an id to each product we add to the weeklyMeals table
        var productIndex = 0;
        //information about the user
        $scope.userInfo = {
            gender: 'female',
            age_group: '19-50'
        };
        //weeklyMeals object
        $scope.weeklyMeals = {monday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []},
            tuesday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []}, wednesday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []},
            thursday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []},
            friday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []},
            saturday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []},
            sunday: {breakfast: [], lunch: [], dinner: [], snacks_and_drinks: []}
        };
        //completed_meals object
        $scope.completed_meals = {monday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false},
            tuesday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false}, wednesday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false},
            thursday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false},
            friday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false},
            saturday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false},
            sunday: {breakfast: false, lunch: false, dinner: false, snacks_and_drinks: false}
        };
        // larders object, each larder is an array with categories, each category is an array with products         
        $scope.larders = {
            a: new Object, //breakfast
            b: new Object, //lunch
            c: new Object, //dinner
            d: new Object  //snacks_and_drinks
        };
        //products_list array is used for the search functionality
        $scope.products_list = [];
        $scope.search_word = '';
        //object we use for the "CopyMealToOtherDaysShorCut"
        $scope.copy_to_day = {monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false};
        //object to use in the "results" page for nutrition
        $scope.NutritionalAdvisor = {
            RNIs: new Object, //this will have all the RNIs per gender and age group
            userRNI: new Object//this will have the user RNIaccording according to its age_group and gender
        };
        //language         $scope.language = "english";         //functions
        var add_product_to_meal = function(meal, day, product) {
            product.indexInTable = productIndex;
            productIndex++;
            $scope.weeklyMeals[day][meal].push(product);
        };
        var removeProduct = function(index, meal, day) {
            $scope.weeklyMeals[day][meal].splice(index, 1);
        };
        /**** Kind of initialitation proccess ****/
        //Load larders
        ProductsRepository.populateLarders($scope.larders, $scope.list_of_category_graphics, $scope.products_list);
        /**** End initialitation ****/

        //Open modals
        //$scope.openModal_ModifyDietTable = function(meal, day) {
        $scope.openModal_ModifyDietTable = function(meal, day) {
            var modalInstance_ModifyDietTable = $modal.open({
                templateUrl: 'partials/modalModifyDietTable.html',
                windowClass: 'modalModifyDietTable',
                controller: ModalModifyDietTableCtrl,
                scope: $scope,
                resolve: {
                    meal: function() {
                        return meal;
                    },
                    day: function() {
                        return day;
                    }
                }
            });
            modalInstance_ModifyDietTable.result.then(
                    function(product) {
                        var modalInstance_ChooseMoreDaysShortcut = $modal.open({
                            templateUrl: 'partials/modalChooseMoreDaysShortcut.html',
                            windowClass: 'modalChooseMoreDaysShortcut',
                            controller: ModalChooseMoreDaysShortcutCtrl,
                            scope: $scope,
                            resolve: {
                                product: function() {
                                    return product;
                                },
                                meal: function() {
                                    return meal;
                                },
                                day: function() {
                                    return day;
                                }
                            }
                        });
                        modalInstance_ChooseMoreDaysShortcut.result.then(
                                function(days) {
                                    angular.forEach(days, function(value, day_from_shortcut) {
                                        if (value === true) {
                                            addProductToWeeklyMeals(meal, day_from_shortcut, angular.copy(product));
                                        }
                                    });
                                    $scope.updateUserDiet();
                                },
                                function() {
                                });
                    },
                    function() {
                    });
        };
        $scope.openModal_IntroduceUserInfo = function() {
            var modalInstance_IntroduceUserInfo = $modal.open({
//templateUrl: 'partials/modalIntroduceUserInfo.html',
                template: '<div class="modal-header"><h3>User information</h3></div><div class="modal-body"><ng-inputuserinfo ng-user="userInfo"/></div><div class="modal-footer"><button ng-click="ok()">OK</button><button ng-click="cancel()">Cancel</button></div>',
                windowClass: 'modalIntroduceUserInfo',
                controller: ModalIntroduceUserInfoCtrl,
                scope: $scope
            });
            modalInstance_IntroduceUserInfo.result.then(
                    function() {
                    },
                    function() {
                    });
        };
        $scope.openModal_ModifyTopFiveEmitters = function() {
            var modalInstance_ModifyTopFiveEmitters = $modal.open({
                templateUrl: 'partials/modalModifyTopFiveEmitters.html',
                windowClass: 'modalModifyTopFiveEmitters',
                controller: ModalModifyTopFiveEmittersInfoCtrl,
                scope: $scope
            });
            modalInstance_ModifyTopFiveEmitters.result.then(
                    function() {
                    },
                    function() {
                    });
        };
        $scope.openModal_Wizard = function() {
            var modalInstance_Wizard = $modal.open({
                templateUrl: 'partials/modalWizard.html',
                windowClass: 'modalWizard',
                controller: ModalWizardCtrl,
                scope: $scope
            });
            modalInstance_Wizard.result.then(
                    function() {
                    },
                    function() {
                    });
        };
        /*-------------------------------------------------*/
        /***  Controller ModalIntroduceUserInfoCtrl          */
        /*-------------------------------------------------*/

        var ModalIntroduceUserInfoCtrl = function($scope, $modalInstance) {
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
            $scope.ok = function() {
                //updateUserRNI();
                $modalInstance.close();
            };
        };
        /*-------------------------------------------------*/
        /***  Controller ModalModifyDietTableCtrl          */
        /*-------------------------------------------------*/

        var ModalModifyDietTableCtrl = function($scope, $modalInstance, meal, day/*, larders, weeklyMeals*/) {
            $scope.meal = meal;
            $scope.day = day;
            /*$scope.larder = larders;
             $scope.weeklyMeals = weeklyMeals;*/
            switch (meal) {
                case 'breakfast':
                    $scope.modifyDietTable_larder = $scope.larders.a;
                    break;
                case 'lunch':
                    $scope.modifyDietTable_larder = $scope.larders.b;
                    break;
                case 'dinner':
                    $scope.modifyDietTable_larder = $scope.larders.c;
                    break;
                case 'snacks_and_drinks':
                    $scope.modifyDietTable_larder = $scope.larders.d;
                    break;
            }
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
            $scope.removeProduct = function(index) {
                $scope.weeklyMeals[day][meal].splice(index, 1);
                //$scope.updateUserDiet();
                $modalInstance.dismiss();
            };
            $scope.openModal_ShowProductsAndSubcategories = function(category) {
                var modalInstance_ShowProductsAndSubcategories = $modal.open({
                    templateUrl: 'partials/modalShowProductsAndSubcategories.html',
                    windowClass: 'modalShowProductsAndSubcategories',
                    controller: ModalShowProductsAndSubcategoriesCtrl,
                    scope: $scope,
                    resolve: {
                        category: function() {
                            return category;
                        }
                    }
                });
                modalInstance_ShowProductsAndSubcategories.result.then(
                        function(product) {
                            //$modalInstance.close(product); // the product has been chosen in a ModalShowProductsAndSubcategories window taht returned the product, we return the product again back to the main controller "laurasLarderCtrl"
                            $modalInstance.close(product);
                        },
                        function() {
                        });
            };
        };
        /*--------------------------------------------------*/
        /* Controller ModalShowProductsAndSubcategoriesCtrl */
        /*--------------------------------------------------*/
        var ModalShowProductsAndSubcategoriesCtrl = function($scope, $modalInstance, category) {
            $scope.category = category;
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
            $scope.openModal_ShowProductsFromSubcategory = function(subcategory) {
                var modalInstance_ShowProductsFromSubcategory = $modal.open({
                    templateUrl: 'partials/modalShowProductsAndSubcategories.html',
                    controller: ModalShowProductsAndSubcategoriesCtrl,
                    windowClass: 'modalShowProductsFromSubcategory',
                    scope: $scope,
                    resolve: {
                        category: function() {
                            return subcategory;
                        }
                    }
                });
                modalInstance_ShowProductsFromSubcategory.result.then(
                        function(product) {
                            $modalInstance.close(product);
                        },
                        function() {
                        });
            };
            $scope.openModal_AskForPortionsAndOrigin = function(product) {
                var modalInstance_AskForPortionsAndOrigin = $modal.open({
                    templateUrl: 'partials/modalAskForPortionsAndOrigin.html',
                    windowClass: 'modalAskForPortionsAndOrigin',
                    controller: ModalAskForPortionsAndOriginCtrl,
                    scope: $scope,
                    resolve: {
                        product: function() {
                            return angular.copy(product); // we create a new object that we be added to the weeklyMeals, otherwise we´ll be adding the same object that is in the larder
                        }
                    }
                });
                modalInstance_AskForPortionsAndOrigin.result.then(
                        function(product) {
                            //$modalInstance.close(product); // the product has been chosen in a ModalShowProductsAndSubcategories window taht returned the product, we return the product again back to the main controller "laurasLarderCtrl"
                            $modalInstance.close(product); // this will close the ShowProductsAndSubcategories modal window
                        },
                        function() {
                        });
            };
        };
        /*--------------------------------------------------*/
        /* Controller ModalAskForPortionsAndOriginCtrl */
        /*--------------------------------------------------*/         var ModalAskForPortionsAndOriginCtrl = function($scope, $modalInstance, product) {
            $scope.product = product;
            $scope.product.portion_size_choice = {index: null, proportion: 1}; //we do it as an object in order to be able to modify its value in child scopes, 'index' is ralted to the the 'Portion_size' array and proportion defines home much of the 'Portion_size', we have it in order to be able to modify the top five emitters
            $scope.product.origin_choice = {value: null}; //we do it as an object in order to be able to modify its value in child scopes
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
            $scope.ok = function() {
                $modalInstance.close($scope.product);
            };
        };
        /*-------------------------------------------------*/
        /***  Controller ModalModifyTopFiveEmittersInfoCtrl          
         *  NOT IN USE                                     */
        /*-------------------------------------------------*/

        var ModalModifyTopFiveEmittersInfoCtrl = function($scope, $modalInstance) {
            $scope.localCopy_topFiveEmitters = angular.copy($scope.userDiet.topFiveEmitters);
            $scope.update = function() {
                $scope.updateUserDiet();
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
            $scope.ok = function() {
                $modalInstance.close();
            };
        };
        /*-------------------------------------------------*/
        /***  Controller ModalChooseMoreDaysShortcutCtrl          
         /*-------------------------------------------------*/

        var ModalChooseMoreDaysShortcutCtrl = function($scope, $modalInstance, product, meal, day) {
            $scope.product = product;
            $scope.meal = meal;
            $scope.day = day;
            $scope.days = {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            };
            $scope.days[day] = true;
            $scope.ok = function() {
                $modalInstance.close($scope.days);
            };
        };
        /*-------------------------------------------------*/
        /***  Controller ModalWelcomePageCtrl          
         /*-------------------------------------------------*/
        var ModalWelcomePageCtrl = function($scope, $modalInstance) {
            $scope.what_to_do_now = 'start_a_diet';
            $scope.continue = function() {
                $modalInstance.close($scope.what_to_do_now);
            };
        };
        /*-------------------------------------------------*/
        /***  Controller ModalWizardeCtrl          
         /*-------------------------------------------------*/
        var ModalWizardCtrl = function($scope, $modalInstance) {
            $scope.steps_descriptions = ['Input user info'];
            $scope.step = 0; // the wizard starts asking for some info about the user

        };
        /**********************************************************/
        /**  When everything is loaded we launch the Welcome page **/
        /**********************************************************/


        /*
         var modalInstance_WelcomePage = $modal.open({
         templateUrl: 'partials/modalWelcomePage.html',
         windowClass: 'modalWelcomePage',
         backdrop: 'static',
         controller: ModalWelcomePageCtrl,
         scope: $scope
         });
         modalInstance_WelcomePage.result.then(
         function(what_to_do_now) {
         console.log("Modal WelcomePage resolved");
         if (what_to_do_now === 'load_a_diet') {
         $scope.loadDiet();
         }
         else {
         $scope.openModal_Wizard();
         }
         },
         function() {
         console.log('Modal WelcomePage dismissed');
         }
         );
         
         /************************************************/

        /*    $scope.product_test = {};
         setTimeout(function() {
         /*$scope.product_test = $scope.larders.a.Sausage.Products[0];
         $scope.product_test.origin_choice = {value: "EU"};
         $scope.product_test.portion_size_choice = {index: 0, proportion: 1};
         addProductToWeeklyMeals('lunch', 'monday', $scope.product_test);
         $scope.product_test = $scope.larders.a.Apples.Products[0];
         $scope.product_test.origin_choice = {value: "EU"};
         $scope.product_test.portion_size_choice = {index: 0, proportion: 1};
         addProductToWeeklyMeals('lunch', 'tuesday', $scope.product_test);
         $scope.updateUserDiet();*/
        /*         updateUserRNI();
         }, 1500);
         
         
         
         /*** end controller**/
        //for testing
        //$scope.step = 'display_weekly_table';
        //$scope.hide_show_larder_help_div = false;
        //$scope.helper_step = 'finishing_first_day';
        console.log($scope.larders);
    }]);
laurasLarderControllers.controller('resultsLLCtrl', ['$scope', 'RNIsRepository', 'LL_items', '$filter', '$modal', 'LL_OpenSave',
    function($scope, RNIsRepository, LL_items, $filter, $modal, LL_OpenSave, $localStorage) {
        /** Objects that are shared with the "inputDataLLCtrl" **/
        $scope.userInfo = LL_items.getUserInfo();
        $scope.weeklyMeals = LL_items.getWeeklyMeals();
        $scope.completed_meals = LL_items.getCompleted_meals();
        $scope.products_list = LL_items.getProducts_list();
        var productIndex = LL_items.getProductIndex();
        $scope.product_index = 0;
        //for testing
        //$scope.userInfo = {gender: 'female', age_group: '19-50'};
        //$scope.weeklyMeals = {"monday": {"breakfast": [{"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Apples", "subcategory": "0", "product": "Apples ", "key": "APPLES_", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_", "$$hashKey": "01V"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE", "$$hashKey": "01W"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 47, "PROT": 0.4, "TOTSUG": 11.8, "ENGFIB": 1.8, "SATFOD": 0, "NA": 3}, "Vitamins": {"THIA": 0.03, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.06, "VITB12": 0, "FOLT": 1, "VITC": 6, "VITA": 0}, "Minerals": {"CA": 4, "P": 738, "MG": 5, "K": 120, "FE": 0.1, "ZN": 0.1, "CU": 0.02, "SE": 0, "I": 0}}, "indexInTable": 0}], "lunch": [{"food_group": "Fruit", "shelf_fridge": 11, "larder": "a,d", "category": "Apricots, nectarines and peaches", "subcategory": "0", "product": "Peaches - canned in syrup", "key": "PEACHES_-_CANNED_IN_SYRUP", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_", "$$hashKey": "02Z"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE", "$$hashKey": "030"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 55, "PROT": 0.5, "TOTSUG": 14, "ENGFIB": 0.9, "SATFOD": 0, "NA": 4}, "Vitamins": {"THIA": 0.01, "RIBO": 0.01, "NIAC": 0.6, "VITB6": 0.02, "VITB12": 0, "FOLT": 7, "VITC": 5, "VITA": 0}, "Minerals": {"CA": 3, "P": 748, "MG": 5, "K": 110, "FE": 0.2, "ZN": 0, "CU": 0, "SE": 0, "I": 0.1}}, "indexInTable": 1}, {"food_group": "High_protein_meat_alternatives", "shelf_fridge": 3, "larder": "a,b,c", "category": "Beans", "subcategory": "Beans (A-C)", "product": "Baked beans - canned in tomato sauce", "key": "BAKED_BEANS_-_CANNED_IN_TOMATO_SAUCE", "options": {"origin": {"UK": 0, "EU": 0, "OutEU": 0, "Single_value": 1.09}, "quantity": {}, "portion_size": [{"raw": 42, "eaten": 40, "key": "1/2_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_1.png", "$$hashKey": "03F"}, {"raw": 84, "eaten": 80, "key": "1_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_2.png", "$$hashKey": "03G"}], "user_choice": {"origin": "Single_value", "quantity": null, "portion_size": 1}}, "nutritional_data": {"Macronutrients": {"ENERGY": 81, "PROT": 4.8, "TOTSUG": 5.8, "ENGFIB": 3.5, "SATFOD": 0.1, "NA": 550}, "Vitamins": {"THIA": 0.08, "RIBO": 0.06, "NIAC": 0.5, "VITB6": 0.12, "VITB12": 0, "FOLT": 33, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 48, "P": 943, "MG": 31, "K": 300, "FE": 1.4, "ZN": 0.5, "CU": 0.04, "SE": 2, "I": 3}}, "indexInTable": 2}], "dinner": [{"food_group": "Meat", "shelf_fridge": 6, "larder": "a,b,c", "category": "Bacon and ham", "subcategory": "0", "product": "Streaky bacon rashers - grilled", "key": "STREAKY_BACON_RASHERS_-_GRILLED", "options": {"origin": {"UK": 7.95, "EU": 8.14, "OutEU": 0, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 50.54, "eaten": 38, "key": "STANDARD", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_1.png", "$$hashKey": "04K"}, {"raw": 65.702, "eaten": 49.4, "key": "LARGE", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_2.png", "$$hashKey": "04L"}], "user_choice": {"origin": "UK", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 337, "PROT": 23.8, "TOTSUG": 0, "ENGFIB": 0, "SATFOD": 9.8, "NA": 1680}, "Vitamins": {"THIA": 0.7, "RIBO": 0.17, "NIAC": 6.3, "VITB6": 0.4, "VITB12": 1, "FOLT": 3, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 9, "P": 494, "MG": 20, "K": 330, "FE": 0.8, "ZN": 2.5, "CU": 0.15, "SE": 11, "I": 6}}, "indexInTable": 3}, {"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Cherries", "subcategory": "0", "product": "Cherries - stewed without sugar", "key": "CHERRIES_-_STEWED_WITHOUT_SUGAR", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {"key": "NUMBER_OF_LEVEL_TABLESPOONS", "raw": 100.05, "eaten": 15}, "portion_size": [], "user_choice": {"origin": "OutEU", "quantity": 2, "portion_size": null}}, "nutritional_data": {"Macronutrients": {"ENERGY": 42, "PROT": 0.8, "TOTSUG": 10.1, "ENGFIB": 0.8, "SATFOD": 0, "NA": 0}, "Vitamins": {"THIA": 0.02, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.04, "VITB12": 0, "FOLT": 0, "VITC": 7, "VITA": 0}, "Minerals": {"CA": 11, "P": 775, "MG": 8, "K": 180, "FE": 0.2, "ZN": 0.1, "CU": 0.06, "SE": 1, "I": 0}}, "indexInTable": 4}], "snacks_and_drinks": [{"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Cherries", "subcategory": "0", "product": "Cherries - stewed without sugar", "key": "CHERRIES_-_STEWED_WITHOUT_SUGAR", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {"key": "NUMBER_OF_LEVEL_TABLESPOONS", "raw": 100.05, "eaten": 15}, "portion_size": [], "user_choice": {"origin": "OutEU", "quantity": 2, "portion_size": null}}, "nutritional_data": {"Macronutrients": {"ENERGY": 42, "PROT": 0.8, "TOTSUG": 10.1, "ENGFIB": 0.8, "SATFOD": 0, "NA": 0}, "Vitamins": {"THIA": 0.02, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.04, "VITB12": 0, "FOLT": 0, "VITC": 7, "VITA": 0}, "Minerals": {"CA": 11, "P": 775, "MG": 8, "K": 180, "FE": 0.2, "ZN": 0.1, "CU": 0.06, "SE": 1, "I": 0}}, "indexInTable": 5}, {"food_group": "Meat", "shelf_fridge": 6, "larder": "a,b,c", "category": "Bacon and ham", "subcategory": "0", "product": "Tendersweet back bacon rashers - grilled", "key": "TENDERSWEET_BACK_BACON_RASHERS_-_GRILLED", "options": {"origin": {"UK": 7.95, "EU": 8.14, "OutEU": 0, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 125, "eaten": 101.6260162602, "key": "1/2_CEREAL_BOWL", "graphic": "tendersweet_back_bacon_rashers_-_grilled-portion_size_1.png", "$$hashKey": "06C"}, {"raw": 166.6666666667, "eaten": 135.5013550136, "key": "1_CEREAL_BOWL", "graphic": "tendersweet_back_bacon_rashers_-_grilled-portion_size_2.png", "$$hashKey": "06D"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 1}}, "nutritional_data": {"Macronutrients": {"ENERGY": 213, "PROT": 26.4, "TOTSUG": 0, "ENGFIB": 0, "SATFOD": 4.5, "NA": 1990}, "Vitamins": {"THIA": 1.01, "RIBO": 0.18, "NIAC": 7.9, "VITB6": 0.51, "VITB12": 1, "FOLT": 3, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 8, "P": 496, "MG": 24, "K": 370, "FE": 0.8, "ZN": 2.4, "CU": 0.09, "SE": 12, "I": 7}}, "indexInTable": 6}]}, "tuesday": {"breakfast": [{"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Apples", "subcategory": "0", "product": "Apples ", "key": "APPLES_", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 47, "PROT": 0.4, "TOTSUG": 11.8, "ENGFIB": 1.8, "SATFOD": 0, "NA": 3}, "Vitamins": {"THIA": 0.03, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.06, "VITB12": 0, "FOLT": 1, "VITC": 6, "VITA": 0}, "Minerals": {"CA": 4, "P": 738, "MG": 5, "K": 120, "FE": 0.1, "ZN": 0.1, "CU": 0.02, "SE": 0, "I": 0}}, "indexInTable": 0}], "lunch": [], "dinner": [], "snacks_and_drinks": []}, "wednesday": {"breakfast": [{"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Apples", "subcategory": "0", "product": "Apples ", "key": "APPLES_", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 47, "PROT": 0.4, "TOTSUG": 11.8, "ENGFIB": 1.8, "SATFOD": 0, "NA": 3}, "Vitamins": {"THIA": 0.03, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.06, "VITB12": 0, "FOLT": 1, "VITC": 6, "VITA": 0}, "Minerals": {"CA": 4, "P": 738, "MG": 5, "K": 120, "FE": 0.1, "ZN": 0.1, "CU": 0.02, "SE": 0, "I": 0}}, "indexInTable": 0}], "lunch": [{"food_group": "Fruit", "shelf_fridge": 11, "larder": "a,d", "category": "Apricots, nectarines and peaches", "subcategory": "0", "product": "Peaches - canned in syrup", "key": "PEACHES_-_CANNED_IN_SYRUP", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 55, "PROT": 0.5, "TOTSUG": 14, "ENGFIB": 0.9, "SATFOD": 0, "NA": 4}, "Vitamins": {"THIA": 0.01, "RIBO": 0.01, "NIAC": 0.6, "VITB6": 0.02, "VITB12": 0, "FOLT": 7, "VITC": 5, "VITA": 0}, "Minerals": {"CA": 3, "P": 748, "MG": 5, "K": 110, "FE": 0.2, "ZN": 0, "CU": 0, "SE": 0, "I": 0.1}}, "indexInTable": 1}, {"food_group": "High_protein_meat_alternatives", "shelf_fridge": 3, "larder": "a,b,c", "category": "Beans", "subcategory": "Beans (A-C)", "product": "Baked beans - canned in tomato sauce", "key": "BAKED_BEANS_-_CANNED_IN_TOMATO_SAUCE", "options": {"origin": {"UK": 0, "EU": 0, "OutEU": 0, "Single_value": 1.09}, "quantity": {}, "portion_size": [{"raw": 42, "eaten": 40, "key": "1/2_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_1.png"}, {"raw": 84, "eaten": 80, "key": "1_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_2.png"}], "user_choice": {"origin": "Single_value", "quantity": null, "portion_size": 1}}, "nutritional_data": {"Macronutrients": {"ENERGY": 81, "PROT": 4.8, "TOTSUG": 5.8, "ENGFIB": 3.5, "SATFOD": 0.1, "NA": 550}, "Vitamins": {"THIA": 0.08, "RIBO": 0.06, "NIAC": 0.5, "VITB6": 0.12, "VITB12": 0, "FOLT": 33, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 48, "P": 943, "MG": 31, "K": 300, "FE": 1.4, "ZN": 0.5, "CU": 0.04, "SE": 2, "I": 3}}, "indexInTable": 2}], "dinner": [{"food_group": "Meat", "shelf_fridge": 6, "larder": "a,b,c", "category": "Bacon and ham", "subcategory": "0", "product": "Streaky bacon rashers - grilled", "key": "STREAKY_BACON_RASHERS_-_GRILLED", "options": {"origin": {"UK": 7.95, "EU": 8.14, "OutEU": 0, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 50.54, "eaten": 38, "key": "STANDARD", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_1.png"}, {"raw": 65.702, "eaten": 49.4, "key": "LARGE", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_2.png"}], "user_choice": {"origin": "UK", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 337, "PROT": 23.8, "TOTSUG": 0, "ENGFIB": 0, "SATFOD": 9.8, "NA": 1680}, "Vitamins": {"THIA": 0.7, "RIBO": 0.17, "NIAC": 6.3, "VITB6": 0.4, "VITB12": 1, "FOLT": 3, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 9, "P": 494, "MG": 20, "K": 330, "FE": 0.8, "ZN": 2.5, "CU": 0.15, "SE": 11, "I": 6}}, "indexInTable": 3}, {"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Cherries", "subcategory": "0", "product": "Cherries - stewed without sugar", "key": "CHERRIES_-_STEWED_WITHOUT_SUGAR", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {"key": "NUMBER_OF_LEVEL_TABLESPOONS", "raw": 100.05, "eaten": 15}, "portion_size": [], "user_choice": {"origin": "OutEU", "quantity": 2, "portion_size": null}}, "nutritional_data": {"Macronutrients": {"ENERGY": 42, "PROT": 0.8, "TOTSUG": 10.1, "ENGFIB": 0.8, "SATFOD": 0, "NA": 0}, "Vitamins": {"THIA": 0.02, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.04, "VITB12": 0, "FOLT": 0, "VITC": 7, "VITA": 0}, "Minerals": {"CA": 11, "P": 775, "MG": 8, "K": 180, "FE": 0.2, "ZN": 0.1, "CU": 0.06, "SE": 1, "I": 0}}, "indexInTable": 4}], "snacks_and_drinks": []}, "thursday": {"breakfast": [], "lunch": [{"food_group": "Fruit", "shelf_fridge": 11, "larder": "a,d", "category": "Apricots, nectarines and peaches", "subcategory": "0", "product": "Peaches - canned in syrup", "key": "PEACHES_-_CANNED_IN_SYRUP", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 55, "PROT": 0.5, "TOTSUG": 14, "ENGFIB": 0.9, "SATFOD": 0, "NA": 4}, "Vitamins": {"THIA": 0.01, "RIBO": 0.01, "NIAC": 0.6, "VITB6": 0.02, "VITB12": 0, "FOLT": 7, "VITC": 5, "VITA": 0}, "Minerals": {"CA": 3, "P": 748, "MG": 5, "K": 110, "FE": 0.2, "ZN": 0, "CU": 0, "SE": 0, "I": 0.1}}, "indexInTable": 1}, {"food_group": "High_protein_meat_alternatives", "shelf_fridge": 3, "larder": "a,b,c", "category": "Beans", "subcategory": "Beans (A-C)", "product": "Baked beans - canned in tomato sauce", "key": "BAKED_BEANS_-_CANNED_IN_TOMATO_SAUCE", "options": {"origin": {"UK": 0, "EU": 0, "OutEU": 0, "Single_value": 1.09}, "quantity": {}, "portion_size": [{"raw": 42, "eaten": 40, "key": "1/2_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_1.png"}, {"raw": 84, "eaten": 80, "key": "1_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_2.png"}], "user_choice": {"origin": "Single_value", "quantity": null, "portion_size": 1}}, "nutritional_data": {"Macronutrients": {"ENERGY": 81, "PROT": 4.8, "TOTSUG": 5.8, "ENGFIB": 3.5, "SATFOD": 0.1, "NA": 550}, "Vitamins": {"THIA": 0.08, "RIBO": 0.06, "NIAC": 0.5, "VITB6": 0.12, "VITB12": 0, "FOLT": 33, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 48, "P": 943, "MG": 31, "K": 300, "FE": 1.4, "ZN": 0.5, "CU": 0.04, "SE": 2, "I": 3}}, "indexInTable": 2}], "dinner": [{"food_group": "Meat", "shelf_fridge": 6, "larder": "a,b,c", "category": "Bacon and ham", "subcategory": "0", "product": "Streaky bacon rashers - grilled", "key": "STREAKY_BACON_RASHERS_-_GRILLED", "options": {"origin": {"UK": 7.95, "EU": 8.14, "OutEU": 0, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 50.54, "eaten": 38, "key": "STANDARD", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_1.png"}, {"raw": 65.702, "eaten": 49.4, "key": "LARGE", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_2.png"}], "user_choice": {"origin": "UK", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 337, "PROT": 23.8, "TOTSUG": 0, "ENGFIB": 0, "SATFOD": 9.8, "NA": 1680}, "Vitamins": {"THIA": 0.7, "RIBO": 0.17, "NIAC": 6.3, "VITB6": 0.4, "VITB12": 1, "FOLT": 3, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 9, "P": 494, "MG": 20, "K": 330, "FE": 0.8, "ZN": 2.5, "CU": 0.15, "SE": 11, "I": 6}}, "indexInTable": 3}, {"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Cherries", "subcategory": "0", "product": "Cherries - stewed without sugar", "key": "CHERRIES_-_STEWED_WITHOUT_SUGAR", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {"key": "NUMBER_OF_LEVEL_TABLESPOONS", "raw": 100.05, "eaten": 15}, "portion_size": [], "user_choice": {"origin": "OutEU", "quantity": 2, "portion_size": null}}, "nutritional_data": {"Macronutrients": {"ENERGY": 42, "PROT": 0.8, "TOTSUG": 10.1, "ENGFIB": 0.8, "SATFOD": 0, "NA": 0}, "Vitamins": {"THIA": 0.02, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.04, "VITB12": 0, "FOLT": 0, "VITC": 7, "VITA": 0}, "Minerals": {"CA": 11, "P": 775, "MG": 8, "K": 180, "FE": 0.2, "ZN": 0.1, "CU": 0.06, "SE": 1, "I": 0}}, "indexInTable": 4}], "snacks_and_drinks": []}, "friday": {"breakfast": [], "lunch": [{"food_group": "Fruit", "shelf_fridge": 11, "larder": "a,d", "category": "Apricots, nectarines and peaches", "subcategory": "0", "product": "Peaches - canned in syrup", "key": "PEACHES_-_CANNED_IN_SYRUP", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 6, "eaten": 6, "key": "MEDIUM_SLICE_"}, {"raw": 13, "eaten": 13, "key": "THICK_SLICE"}], "user_choice": {"origin": "EU", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 55, "PROT": 0.5, "TOTSUG": 14, "ENGFIB": 0.9, "SATFOD": 0, "NA": 4}, "Vitamins": {"THIA": 0.01, "RIBO": 0.01, "NIAC": 0.6, "VITB6": 0.02, "VITB12": 0, "FOLT": 7, "VITC": 5, "VITA": 0}, "Minerals": {"CA": 3, "P": 748, "MG": 5, "K": 110, "FE": 0.2, "ZN": 0, "CU": 0, "SE": 0, "I": 0.1}}, "indexInTable": 1}, {"food_group": "High_protein_meat_alternatives", "shelf_fridge": 3, "larder": "a,b,c", "category": "Beans", "subcategory": "Beans (A-C)", "product": "Baked beans - canned in tomato sauce", "key": "BAKED_BEANS_-_CANNED_IN_TOMATO_SAUCE", "options": {"origin": {"UK": 0, "EU": 0, "OutEU": 0, "Single_value": 1.09}, "quantity": {}, "portion_size": [{"raw": 42, "eaten": 40, "key": "1/2_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_1.png"}, {"raw": 84, "eaten": 80, "key": "1_CEREAL_BOWL", "graphic": "baked_beans_-_canned_in_tomato_sauce-portion_size_2.png"}], "user_choice": {"origin": "Single_value", "quantity": null, "portion_size": 1}}, "nutritional_data": {"Macronutrients": {"ENERGY": 81, "PROT": 4.8, "TOTSUG": 5.8, "ENGFIB": 3.5, "SATFOD": 0.1, "NA": 550}, "Vitamins": {"THIA": 0.08, "RIBO": 0.06, "NIAC": 0.5, "VITB6": 0.12, "VITB12": 0, "FOLT": 33, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 48, "P": 943, "MG": 31, "K": 300, "FE": 1.4, "ZN": 0.5, "CU": 0.04, "SE": 2, "I": 3}}, "indexInTable": 2}], "dinner": [{"food_group": "Meat", "shelf_fridge": 6, "larder": "a,b,c", "category": "Bacon and ham", "subcategory": "0", "product": "Streaky bacon rashers - grilled", "key": "STREAKY_BACON_RASHERS_-_GRILLED", "options": {"origin": {"UK": 7.95, "EU": 8.14, "OutEU": 0, "Single_value": 0}, "quantity": {}, "portion_size": [{"raw": 50.54, "eaten": 38, "key": "STANDARD", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_1.png"}, {"raw": 65.702, "eaten": 49.4, "key": "LARGE", "graphic": "streaky_bacon_rashers_-_grilled-portion_size_2.png"}], "user_choice": {"origin": "UK", "quantity": null, "portion_size": 0}}, "nutritional_data": {"Macronutrients": {"ENERGY": 337, "PROT": 23.8, "TOTSUG": 0, "ENGFIB": 0, "SATFOD": 9.8, "NA": 1680}, "Vitamins": {"THIA": 0.7, "RIBO": 0.17, "NIAC": 6.3, "VITB6": 0.4, "VITB12": 1, "FOLT": 3, "VITC": 0, "VITA": 0}, "Minerals": {"CA": 9, "P": 494, "MG": 20, "K": 330, "FE": 0.8, "ZN": 2.5, "CU": 0.15, "SE": 11, "I": 6}}, "indexInTable": 3}, {"food_group": "Fruit", "shelf_fridge": 10, "larder": "a,d", "category": "Cherries", "subcategory": "0", "product": "Cherries - stewed without sugar", "key": "CHERRIES_-_STEWED_WITHOUT_SUGAR", "options": {"origin": {"UK": 0.57, "EU": 0.77, "OutEU": 1.57, "Single_value": 0}, "quantity": {"key": "NUMBER_OF_LEVEL_TABLESPOONS", "raw": 100.05, "eaten": 15}, "portion_size": [], "user_choice": {"origin": "OutEU", "quantity": 2, "portion_size": null}}, "nutritional_data": {"Macronutrients": {"ENERGY": 42, "PROT": 0.8, "TOTSUG": 10.1, "ENGFIB": 0.8, "SATFOD": 0, "NA": 0}, "Vitamins": {"THIA": 0.02, "RIBO": 0.02, "NIAC": 0.1, "VITB6": 0.04, "VITB12": 0, "FOLT": 0, "VITC": 7, "VITA": 0}, "Minerals": {"CA": 11, "P": 775, "MG": 8, "K": 180, "FE": 0.2, "ZN": 0.1, "CU": 0.06, "SE": 1, "I": 0}}, "indexInTable": 4}], "snacks_and_drinks": []}, "saturday": {"breakfast": [], "lunch": [], "dinner": [], "snacks_and_drinks": []}, "sunday": {"breakfast": [], "lunch": [], "dinner": [], "snacks_and_drinks": []}};
        //$scope.completed_meals = {"monday": {"breakfast": true, "lunch": true, "dinner": true, "snacks_and_drinks": true}, "tuesday": {"breakfast": true, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "wednesday": {"breakfast": true, "lunch": true, "dinner": true, "snacks_and_drinks": false}, "thursday": {"breakfast": false, "lunch": true, "dinner": true, "snacks_and_drinks": false}, "friday": {"breakfast": false, "lunch": true, "dinner": true, "snacks_and_drinks": false}, "saturday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "sunday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}};
        // only monday $scope.completed_meals = {"monday": {"breakfast": true, "lunch": true, "dinner": true, "snacks_and_drinks": true}, "tuesday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "wednesday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "thursday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "friday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "saturday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}, "sunday": {"breakfast": false, "lunch": false, "dinner": false, "snacks_and_drinks": false}};

        //end for testing

        /** Other objects in the scope**/
        $scope.step = '';
        $scope.index_of_product_to_remove = '';
        $scope.remove_product_check_box = false;
        $scope.search_word = '';
        $scope.controller = 'results';
        $scope.step_in_products_and_subcategories = '';
        $scope.storage = localStorage;
        $scope.dietToSave = {};
        //Nutrtional advisor
        $scope.NutritionalAdvisor = {
            RNIs: new Object, //this will have all the RNIs per gender and age group
            userRNI: new Object//this will have the user RNIaccording according to its age_group and gender
        };
        RNIsRepository.getRNIs($scope.NutritionalAdvisor.RNIs);
        //user diet object        
        $scope.userDiet = {
            ghgTotalPerDay: 0,
            ghgFoodGroupsPerDay: {Drinks: 0, Starchy_foods: 0, 'Foods_high_in_fat,_sugar,_salt': 0, Eggs: 0, Meat: 0, Seafood: 0, Fruit: 0, Dairy: 0, High_protein_meat_alternatives: 0, Vegetables: 0, 'Condiments,_soups_and_sauces': 0},
            energyFoodGroupsPerDay: {Drinks: 0, Starchy_foods: 0, 'Foods_high_in_fat,_sugar,_salt': 0, Eggs: 0, Meat: 0, Seafood: 0, Fruit: 0, Dairy: 0, High_protein_meat_alternatives: 0, Vegetables: 0, 'Condiments,_soups_and_sauces': 0},
            topFiveEmitters: [],
            nutritionalDataPerDay: {Macronutrients: {ENERGY: 0, PROT: 0, TOTSUG: 0, ENGFIB: 0, SATFOD: 0, NA: 0, SALT: 0}, // i haved added SALT, it is not in the dataset but its value is calculated from NA, see below
                Vitamins: {THIA: 0, RIBO: 0, NIAC: 0, VITB6: 0, VITB12: 0, FOLT: 3, VITC: 0, VITA: 0},
                Minerals: {CA: 0, P: 0, MG: 0, K: 0, FE: 0, ZN: 0, CU: 0, SE: 0, I: 0}
            }
        };
        $scope.dataForBarGraph = [];
        /** End objects in the scope **/

        /** Functions in the scope **/
        $scope.handleNextResults = function(args) {
            switch ($scope.step) {
                case 'main_results':
                    switch (args.reason) {
                        case 'next':
                            $scope.step = 'top_five_emitters';
                            console.log("weeklyMeals");
                            console.log($scope.weeklyMeals);
                            console.log("completed_meals");
                            console.log($scope.completed_meals);
                            console.log("userDiet");
                            console.log($scope.userDiet);
                            console.log("NutritionalAdvisor");
                            console.log($scope.NutritionalAdvisor);
                            updateUserRNI();
                            break;
                    }
                    break;
                case 'top_five_emitters':
                    switch (args.reason) {
                        case 'next':
                            $scope.step = 'lowering_your_emissions';
                            break;
                        case 'back':
                            $scope.step = 'main_results';
                            break;
                    }
                    break;
                case 'general_health_and_disease_risk_1':
                    switch (args.reason) {
                        case 'macronutrient_clicked':
                            $scope.step = 'GHADR_macronutrient';
                            $scope.GHADR_step = args.macronutrient;
                            break;
                        case 'next':
                            //$scope.step = 'VitMin';
                            $scope.step = 'general_health_and_disease_risk_2';
                            break;
                        case 'back':
                            $scope.step = 'lowering_your_emissions';
                            break;
                    }
                    break;
                case 'general_health_and_disease_risk_2':
                    switch (args.reason) {
                        case 'macronutrient_clicked':
                            $scope.step = 'GHADR_macronutrient';
                            $scope.GHADR_step = args.macronutrient;
                            break;
                        case 'next':
                            $scope.step = 'VitMin';
                            break;
                        case 'back':
                            $scope.step = 'general_health_and_disease_risk_1';
                            break;
                    }
                    break;
                case 'lowering_your_emissions':
                    switch (args.reason) {
                        case 'next':
                            $scope.step = 'general_health_and_disease_risk_1';
                            break;
                        case 'back':
                            $scope.step = 'top_five_emitters';
                            break;
                    }
                    break;
                case 'GHADR_macronutrient':
                    $scope.step = 'general_health_and_disease_risk_1';
                    $scope.GHADR_step = '';
                    break;
                case 'VitMin':
                    switch (args.reason) {
                        case 'vitamin_clicked':
                        case 'mineral_clicked':
                            $scope.step = 'vitmin_info';
                            $scope.vitmin_info_step = args.vitmin;
                            $scope.emissions_level_step = 'LOW_EMISSIONS';
                            break;
                        case 'next':
                            $scope.step = 'summary';
                            break;
                        case 'back':
                            $scope.step = 'general_health_and_disease_risk_2';
                            break;
                    }
                    break;
                case 'vitmin_info':
                    switch (args.reason) {
                        case 'vit_min_clicked':
                            $scope.emissions_level_step = 'LOW_EMISSIONS';
                            $scope.vitmin_info_step = args.vitmin;
                            break;
                        case 'emissions_level_clicked':
                            $scope.emissions_level_step = args.emissions_level;
                            break;
                    }
                    break;
                case 'summary':
                    switch (args.reason) {
                        case 'next':
                            $scope.step = 'general_health_and_disease_risk_2';
                            break;
                        case 'back':
                            $scope.step = 'VitMin';
                            break;
                        case 'show_product_information':
                            $scope.product = args.product;
                            $scope.product_index = args.product_index;
                            $scope.day = args.day;
                            $scope.meal = args.meal;
                            $scope.modalInstance_ShowProductInformation = $modal.open({
                                templateUrl: 'partials/modalShowProductInformation.html',
                                windowClass: 'modalShowProductInformation',
                                scope: $scope
                            });
                            break;
                        case 'remove_product':
                            removeProduct($scope.product_index);
                            updateUserDiet();
                            iniBarGraph();
                            $scope.modalInstance_ShowProductInformation.close();
                            break;
                        case 'add_product':
                            $scope.day = args.day;
                            $scope.meal = args.meal;
                            $scope.modalInstance_AddProduct = $modal.open({
                                templateUrl: 'partials/modalAddProduct.html',
                                windowClass: 'modalAddProduct',
                                scope: $scope
                            });
                            break;
                        case 'save':
                            /* var content = 'file content';
                             var blob = new Blob([content], {type: 'text/plain'});
                             $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
                             LL_OpenSave.saveDiet($scope);
                             **/
                            /** Fetch what we want to save and make JSON string  **/
                            var objectToSave = {};
                            objectToSave.userInfo = $scope.userInfo;
                            objectToSave.weeklyMeals = $scope.weeklyMeals;
                            objectToSave.completed_meals = $scope.completed_meals;
                            objectToSave.products_list = $scope.products_list;
                            objectToSave.productIndex = $scope.product_index;
                            objectToSave.controller = $scope.controller;
                            $scope.dietToSave.jsonString = JSON.stringify(objectToSave, null, '\t');
                            $scope.dietToSave.name = '';
                            // End fetching what we want to save and make JSON string  **/

                            /** Open modal, its mission is to get hte name of the diet to save, the actual saving happens when they click "Save" in the modal window **/
                            $scope.saveOpenStep = 'save';
                            $scope.modalInstance_SaveOpenDiet = $modal.open({
                                templateUrl: 'partials/modalSaveOpenDiet.html',
                                windowClass: 'modalSaveOpenDiet',
                                scope: $scope
                            });
                            break;
                        case 'dietToSaveSelected':
                            console.log($scope.storage);
                            $scope.modalInstance_SaveOpenDiet.close();
                            $scope.storage.setItem($scope.dietToSave.name, $scope.dietToSave.jsonString);
                            console.log($scope.storage);
                            break;
                        case 'product_selected_form_search':
                            $scope.modalInstance_AddProduct.close();
                            $scope.product = args.product;
                            $scope.step_in_products_and_subcategories = 'choose_size_and_origin';
                            $scope.modalInstance_ProductsAndSubcategories = $modal.open({
                                templateUrl: 'partials/modalProductsAndSubcategories.html',
                                windowClass: 'modalProductsAndSubcategories',
                                scope: $scope
                            });
                            break;
                        case 'size_and_origin_selected':
                            $scope.modalInstance_ProductsAndSubcategories.close();
                            add_product_to_meal($scope.meal, $scope.day, $scope.product);
                            $scope.completed_meals[$scope.day][$scope.meal] = true;
                            updateUserDiet();
                            iniBarGraph();
                            break;
                    }
                    break;
            }
            ;
        };
        $scope.nutrientInRecommendedLevels = function(nutrient, nutrient_group) {
            var recommended_intake = 0;
            var user_intake_mass = $scope.userDiet.nutritionalDataPerDay[nutrient_group][nutrient]; // units: "g/day" or "mg/day"
            var user_energy_intake = $scope.userDiet.nutritionalDataPerDay.Macronutrients.ENERGY;
            var user_intake_per_energy = 0; // units: % percent of energy intake
            switch (nutrient) {
                case 'SATFOD':
                    user_intake_per_energy = 100 * 9 * user_intake_mass / user_energy_intake; // % of "energy" intake, 1 gram of FAT = 9 kCal
                    recommended_intake = 11; //11%
                    break;
                case 'SUGAR':
                    user_intake_per_energy = 100 * 3.75 * user_intake_mass / user_energy_intake; // % of "energy" intake, 1 gram of SUGAR = 3.75 kCal
                    recommended_intake = 11; //11%
                    break;
                default: //all the other nutrients are checked in the same way
                    user_intake_mass = $scope.userDiet.nutritionalDataPerDay[nutrient_group][nutrient]; // units: g/day or mg/day or in case of 'ENERGY' kCal/day
                    recommended_intake = $scope.NutritionalAdvisor.userRNI[nutrient_group][nutrient]; // units: g/day or mg/day
                    break;
            }
            if (nutrient === 'SATFOD' || nutrient === 'SUGAR') {
                if (user_intake_per_energy <= recommended_intake) //The recommended intake is the maximum recommended intake
                    return true;
                else
                    return false;
            }
            if (nutrient === 'ENERGY') {
                if (user_intake_mass >= 0.9 * recommended_intake && user_intake_mass <= 1.1 * recommended_intake) //The 'ENERGY' intake is in recommended level when it is in the 10% of the RNI
                    return true;
                else
                    return false;
            }
            else {
                if (user_intake_mass >= recommended_intake)//The recommended intake is the minimum recommended intake
                    return true;
                else
                    return false;
            }
        };

        /**********************************************************************/
        /*  Commented the 3d pie chart, we were going to use it but finally we
         * are not. In order to make it work uncomment in LL-results.html and 
         * laurasLarderApp.js
         * 
         *  
         
         
         
         var data = [];
         var colors = {'Condiments,_soups_and_sauces': "#80a37a", Dairy: "#112f7a", Drinks: "#22f67a", Eggs: "#333f7a", Foods_high_in_fat_sugar_salt: "#44f47a", Fruit: "#5bff7a", High_protein_meat_alternatives: "#b6ff7a", Meat: "#8cff7a", Seafood: "#c7ff7a", Starchy_foods: "#99ffca", Vegetables: "#aaf17a"};
         angular.forEach($scope.userDiet[data_source], function(food_group_value, food_group_key) {
         data.push({food_group: food_group_key, value: food_group_value.toFixed(2), color: colors[food_group_key]});
         });
         $scope.ini_graph = function(data_source) {
         var data = [];
         var pie3Chart = new dhtmlXChart({
         view: "pie3D",
         container: "container_" + data_source,
         value: "#value#",
         color: "#color#",
         label: "#food_group#",
         pieInnerText: "<b>#value#</b>"
         });
         pie3Chart.parse(data, "json");
         
         };
         
         End 3D pie chart
         * /
         /** End Functions in the scope **/

        /**************************/
        /*   Local functions      */
        /**************************/
        var removeProduct = function(index) {
            $scope.weeklyMeals[$scope.day][$scope.meal].splice(index, 1);
            //$scope.updateUserDiet();
            //$modalInstance.dismiss();
        };
        var add_product_to_meal = function(meal, day, product) {
            product.indexInTable = productIndex;
            productIndex++;
            $scope.weeklyMeals[day][meal].push(product);
        };
        var updateUserRNI = function() {
            $scope.NutritionalAdvisor.userRNI = $scope.NutritionalAdvisor.RNIs[$scope.userInfo.gender][$scope.userInfo.age_group];
        };
        var updateUserDiet = function() {
            var listOfProducts = []; //we put all the products in this array, then we sort it in order to get the top 5 emitters
            //reset totals to 0
            $scope.userDiet.ghgTotalPerDay = 0;
            angular.forEach($scope.userDiet.ghgFoodGroupsPerDay, function(food_group_ghg, food_group_key) {
                $scope.userDiet.ghgFoodGroupsPerDay[food_group_key] = 0;
                $scope.userDiet.energyFoodGroupsPerDay[food_group_key] = 0;
            });
            angular.forEach($scope.userDiet.nutritionalDataPerDay, function(nutrient_group, nutrient_group_key) {
                angular.forEach(nutrient_group, function(nutrient_value, nutrient_key) {
                    $scope.userDiet.nutritionalDataPerDay[nutrient_group_key][nutrient_key] = 0;
                });
            });
            //End reset

            //  What we are going to do:
            //  It is possible that we are displaying results but not all the meals are complete, 
            //  so we calculate the average of each meal and then we do the calculation with that day. I mean we take all the completed breakfast and calculate the average berakfast, we do the same for the other meals and finally we do the per day calculations with that day

            //  We iterate each meal
            angular.forEach(['breakfast', 'lunch', 'dinner', 'snacks_and_drinks'], function(meal, index) {
                var completed_meals_counter = 0;
                var products_in_meal = [];
                //we fetch all the products in this meal
                angular.forEach($scope.weeklyMeals, function(meals_obj, day) {
                    if ($scope.completed_meals[day][meal] === true) {
                        completed_meals_counter++;
                        angular.forEach(meals_obj[meal], function(product_obj, product_index) {
                            products_in_meal.push(product_obj);
                        });
                    }
                    ;
                });
                //   end fetch

                //  calculate totals for the meal
                var ghg_total_this_meal = 0;
                var ghg_total_per_food_group_this_meal = {Drinks: 0, Starchy_foods: 0, 'Foods_high_in_fat,_sugar,_salt': 0, Eggs: 0, Meat: 0, Seafood: 0, Fruit: 0, Dairy: 0, High_protein_meat_alternatives: 0, Vegetables: 0, 'Condiments,_soups_and_sauces': 0};
                var energy_total_per_food_group_this_meal = {Drinks: 0, Starchy_foods: 0, 'Foods_high_in_fat,_sugar,_salt': 0, Eggs: 0, Meat: 0, Seafood: 0, Fruit: 0, Dairy: 0, High_protein_meat_alternatives: 0, Vegetables: 0, 'Condiments,_soups_and_sauces': 0};
                var nutritional_data_total_this_meal = {Macronutrients: {ENERGY: 0, PROT: 0, TOTSUG: 0, ENGFIB: 0, SATFOD: 0, NA: 0, SALT: 0}, // i haved added SALT, it is not in the dataset but its value is calculated from NA, see below
                    Vitamins: {THIA: 0, RIBO: 0, NIAC: 0, VITB6: 0, VITB12: 0, FOLT: 0, VITC: 0, VITA: 0},
                    Minerals: {CA: 0, P: 0, MG: 0, K: 0, FE: 0, ZN: 0, CU: 0, SE: 0, I: 0}
                };
                angular.forEach(products_in_meal, function(product, product_index) {
                    var grams_eaten = calculateGrams(product, 'eaten');
                    var grams_raw = calculateGrams(product, 'raw');
                    var product_ghg = calculateGhg(product, grams_raw); //returns: kg CO2e
                    product.ghg = product_ghg; //we keep product_ghg value for sorting the top 5 emitters later
                    listOfProducts.push(product); //we use this array for calculating top 5 emitters
                    ghg_total_this_meal += product_ghg;
                    ghg_total_per_food_group_this_meal[product.food_group] += product_ghg;
                    energy_total_per_food_group_this_meal[product.food_group] += product.nutritional_data.Macronutrients.ENERGY * grams_eaten;
                    angular.forEach(product.nutritional_data, function(nutrient_group, nutrient_group_key) {
                        angular.forEach(nutrient_group, function(nutrient_value, nutrient_key) {
                            if (nutrient_key !== 'TOTSUG') {// All the nutrient except TOTSUG are calculated in the same way, we calculate TOTSUG in the 'else' statemnet
                                nutritional_data_total_this_meal[nutrient_group_key][nutrient_key] += nutrient_value * grams_eaten / 100;
                            }
                            else {
                                if (product.food_group !== 'Fruit' && product.food_group !== 'Dairy' && product.food_group !== 'Vegetables') {// this is special instruction from laura, sugar from this foodgroups is not counted for the nutritional advice
                                    nutritional_data_total_this_meal.Macronutrients.TOTSUG += nutrient_value * grams_eaten / 100;
                                }
                            }
                        });
                    });
                    nutritional_data_total_this_meal.Macronutrients.SALT = .5 * nutritional_data_total_this_meal.Macronutrients.NA;//special instruction from Laura, this is how you calculate the SALT
                });
                // End calculating totals

                //  Calculate average for the meal
                var ghg_average_this_meal = 0;
                var ghg_average_per_food_group_this_meal = {Drinks: 0, Starchy_foods: 0, 'Foods_high_in_fat,_sugar,_salt': 0, Eggs: 0, Meat: 0, Seafood: 0, Fruit: 0, Dairy: 0, High_protein_meat_alternatives: 0, Vegetables: 0, 'Condiments,_soups_and_sauces': 0};
                var energy_average_per_food_group_this_meal = {Drinks: 0, Starchy_foods: 0, 'Foods_high_in_fat,_sugar,_salt': 0, Eggs: 0, Meat: 0, Seafood: 0, Fruit: 0, Dairy: 0, High_protein_meat_alternatives: 0, Vegetables: 0, 'Condiments,_soups_and_sauces': 0};
                var nutritional_data_average_this_meal = {Macronutrients: {ENERGY: 0, PROT: 0, TOTSUG: 0, ENGFIB: 0, SATFOD: 0, NA: 0, SALT: 0}, // i haved added SALT, it is not in the dataset but its value is calculated from NA, see below},
                    Vitamins: {THIA: 0, RIBO: 0, NIAC: 0, VITB6: 0, VITB12: 0, FOLT: 0, VITC: 0, VITA: 0},
                    Minerals: {CA: 0, P: 0, MG: 0, K: 0, FE: 0, ZN: 0, CU: 0, SE: 0, I: 0}
                };
                ghg_average_this_meal = ghg_total_this_meal / completed_meals_counter;
                angular.forEach(ghg_total_per_food_group_this_meal, function(food_group_ghg, food_group_key) {
                    if (ghg_average_per_food_group_this_meal.hasOwnProperty(food_group_key) === false) {
                        console.error("Food group not recognized " + food_group_key);
                    }
                    ghg_average_per_food_group_this_meal[food_group_key] += ghg_total_per_food_group_this_meal[food_group_key] / completed_meals_counter;
                    energy_average_per_food_group_this_meal[food_group_key] += energy_total_per_food_group_this_meal[food_group_key] / completed_meals_counter;
                });
                angular.forEach(nutritional_data_total_this_meal, function(nutrient_group, nutrient_group_key) {
                    angular.forEach(nutrient_group, function(nutrient_value, nutrient_key) {
                        nutritional_data_average_this_meal[nutrient_group_key][nutrient_key] += nutrient_value / completed_meals_counter;
                    });
                });
                // End calculating average

                //Sort list of products accordding to their emissions, we do this for the top five emitters
                listOfProducts.sort(function(a, b) {
                    if (a.ghg > b.ghg)
                        return -1;
                    if (a.ghg < b.ghg)
                        return 1;
                    else
                        return 0;
                });
                //  End sorting top 5 emitters


                // Add everything to the userDietObject
                $scope.userDiet.ghgTotalPerDay += ghg_average_this_meal;
                angular.forEach(ghg_average_per_food_group_this_meal, function(food_group_ghg, food_group_key) {
                    $scope.userDiet.ghgFoodGroupsPerDay[food_group_key] += ghg_average_per_food_group_this_meal[food_group_key];
                    $scope.userDiet.energyFoodGroupsPerDay[food_group_key] += energy_average_per_food_group_this_meal[food_group_key];
                });
                angular.forEach(nutritional_data_average_this_meal, function(nutrient_group, nutrient_group_key) {
                    angular.forEach(nutrient_group, function(nutrient_value, nutrient_key) {
                        //$scope.userDiet.nutritionalDataPerDay[nutrient_group_key][nutrient_key] += nutrient_value / completed_meals_counter;
                        $scope.userDiet.nutritionalDataPerDay[nutrient_group_key][nutrient_key] += nutrient_value;
                        if (!$scope.userDiet.nutritionalDataPerDay.hasOwnProperty(nutrient_group_key) || !$scope.userDiet.nutritionalDataPerDay[nutrient_group_key].hasOwnProperty(nutrient_key)) {
                            console.error("One nutrient or nutrient group in a product does not match with the userDiet.nutritionalDataPerDay. ");
                            console.error($scope.userDiet);
                            console.error(nutritional_data_average_this_meal);
                        }
                    });
                });
                $scope.userDiet.topFiveEmitters = listOfProducts.slice(0, 5); //we get the top 5 emitter
            });
        };
        //End updateUserDiet()

        var iniBarGraph = function() {
            var data = {ticks: new Array, data_values: new Array};
            var index = 0;
            //Ini --  $scope.dataForBarGraphPerFoodGroup
            angular.forEach($scope.userDiet.ghgFoodGroupsPerDay, function(emissions, food_group) {
                data.ticks.push([index, $filter('translate')(angular.uppercase(food_group))]);
                data.data_values.push({
                    data: [[index, emissions]],
                    color: '#00b9d7', //#00b9d7
                    bars: {show: true, barWidth: 0.6, fillColor: 'red', order: index + 1, align: "center"}
                });
                index++;
            });
            $scope.dataForBarGraphPerFoodGroup = angular.copy(data);
            //Ini $scope.dataForBarGraphTotalEmissions
            data.ticks = [[0, $filter('translate')('CURRENT_AVERAGE')], [1, $filter('translate')('YOUR_DIET')], [2, $filter('translate')('VEGAN')]];
            data.data_values = [
                {data: [[0, 8]], color: '#00b9d7', bars: {show: true, barWidth: 0.5, fillColor: 'red', order: index + 1, align: "center"}
                },
                {data: [[1, $scope.userDiet.ghgTotalPerDay]], color: '#00b9d7', bars: {show: true, barWidth: 0.5, fillColor: 'red', order: index + 1, align: "center"}
                },
                {data: [[2, 4]], color: '#00b9d7', bars: {show: true, barWidth: 0.5, fillColor: 'red', order: index + 1, align: "center"}
                }
            ];
            $scope.dataForBarGraphTotalEmissions = angular.copy(data);
        };
        var calculateGrams = function(product, type) {
            var grams = 0;
            var choice = null;
            if (product.options.portion_size.length > 0) {
                choice = product.options.user_choice.portion_size;
                grams = product.options.portion_size[choice][type];
            }
            else if (product.options.quantity.key) {//if there is 'key' it means that this was the option
                choice = product.options.user_choice.quantity;
                grams = choice * product.options.quantity[type];
            }
            return grams;
        };
        var calculateGhg = function(product, grams_raw) {
            var choice = product.options.user_choice.origin;
            var emissions = grams_raw * product.options.origin[choice] / 1000; //results in grams
            return emissions;
        };
        /** End local functions  **/

        /*****************************************/
        /**** Kind of initialitation proccess ****/
        /*****************************************/

        //calculate results
        updateUserDiet();
        iniBarGraph();
        //$scope.dataForBarGraph = iniBarGraph($scope.userDiet.ghgFoodGroupsPerDay);
        /** We start displaying the main results page **/
        $scope.step = 'main_results';
        //$scope.step = 'summary'; //testing
        //$scope.GHADR_step = 'ENERGY';
        /**** End initialitation ****/
        console.log($scope);
    }
]);
/** End resultsLLCtrl **/
