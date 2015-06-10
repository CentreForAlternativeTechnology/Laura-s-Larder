'use strict';
/* Services */
var laurasLarderServices = angular.module('laurasLarderServices', ['ngResource']);
laurasLarderServices.factory('DataSet', ['$resource',
    function($resource) {
        //return $resource('dataset/LaurasLarder-DataSet-v02.json',{},{
        return $resource('data/:file_name', {}, {
            open: {method: 'GET', isArray: false}
        });
    }]);
laurasLarderServices.factory('RNIsRepository', ['$resource',
    function($resource) {
        return{
            getRNIs: function(RNIs) {
                var RNIs_resource = $resource('data/RNIs.json');
                var RNIs_local = RNIs_resource.query(
                        function() {//callback function for "success" getting the RNIs file
                            Object.defineProperty(RNIs, "female", {value: new Object, writable: true, enumerable: true, configurable: true});
                            Object.defineProperty(RNIs, "male", {value: new Object, writable: true, enumerable: true, configurable: true});
                            angular.forEach(RNIs_local[0], function(age_groups, gender_key) {
                                angular.forEach(age_groups, function(nutrients, age_group_key) {
                                    Object.defineProperty(RNIs[gender_key], age_group_key, {value: new Object, writable: true, enumerable: true, configurable: true});
                                    Object.defineProperties(RNIs[gender_key][age_group_key], {
                                        "Macronutrients": {value: new Object, writable: true, enumerable: true, configurable: true},
                                        "Minerals": {value: new Object, writable: true, enumerable: true, configurable: true},
                                        "Vitamins": {value: new Object, writable: true, enumerable: true, configurable: true}
                                    });
                                    RNIs[gender_key][age_group_key].Macronutrients.ENERGY = nutrients.KCALS;
                                    RNIs[gender_key][age_group_key].Macronutrients.ENGFIB = nutrients.ENGFIB;
                                    RNIs[gender_key][age_group_key].Macronutrients.NA = nutrients.NA;
                                    RNIs[gender_key][age_group_key].Macronutrients.PROT = nutrients.PROT;
                                    RNIs[gender_key][age_group_key].Macronutrients.SATFOD = 0; //this needs to be calculated later on as % of energy intake
                                    RNIs[gender_key][age_group_key].Macronutrients.TOTSUG = 0; //this needs to be calculated later on as % of energy intake
                                    RNIs[gender_key][age_group_key].Macronutrients.SALT = 2.5 * nutrients.NA;
                                    RNIs[gender_key][age_group_key].Minerals.CA = nutrients.CA;
                                    RNIs[gender_key][age_group_key].Minerals.CU = nutrients.CU;
                                    RNIs[gender_key][age_group_key].Minerals.FE = nutrients.FE;
                                    RNIs[gender_key][age_group_key].Minerals.I = nutrients.I;
                                    RNIs[gender_key][age_group_key].Minerals.K = nutrients.K;
                                    RNIs[gender_key][age_group_key].Minerals.MG = nutrients.MG;
                                    RNIs[gender_key][age_group_key].Minerals.P = nutrients.P;
                                    RNIs[gender_key][age_group_key].Minerals.SE = nutrients.SE;
                                    RNIs[gender_key][age_group_key].Minerals.ZN = nutrients.ZN;
                                    RNIs[gender_key][age_group_key].Vitamins.FOLT = nutrients.FOLT;
                                    RNIs[gender_key][age_group_key].Vitamins.NIAC = nutrients.NIAC;
                                    RNIs[gender_key][age_group_key].Vitamins.RIBO = nutrients.RIBO;
                                    RNIs[gender_key][age_group_key].Vitamins.THIA = nutrients.THIA;
                                    RNIs[gender_key][age_group_key].Vitamins.VITB6 = nutrients.VITB6;
                                    RNIs[gender_key][age_group_key].Vitamins.VITB12 = nutrients.VITB12;
                                    RNIs[gender_key][age_group_key].Vitamins.VITC = nutrients.VITC;
                                });
                            });
                        },
                        function() { //callback function for "error" getting the RNIs file

                        }
                );
            }
        };
    }
]);
laurasLarderServices.factory('LL_items', function() {// used to share the scope between controllers
    var userInfo = {};
    var weeklyMeals = {};
    var completed_meals = {};
    var NutritionalAdvisor = {};
    var LL_itemsService = {};
    var products_list = [];
    var productIndex = 0;
    var loadingDiet = false;
    var languaje = '';
    /** GETs  **/
    LL_itemsService.getUserInfo = function() {
        return userInfo;
    };
    LL_itemsService.getWeeklyMeals = function() {
        return weeklyMeals;
    };
    LL_itemsService.getCompleted_meals = function() {
        return completed_meals;
    };
    LL_itemsService.getNutritionalAdvisor = function() {
        return NutritionalAdvisor;
    };
    LL_itemsService.getProducts_list = function() {
        return products_list;
    };
    LL_itemsService.getProductIndex = function() {
        return productIndex;
    };
    LL_itemsService.getLoadingDiet = function() {
        return loadingDiet;
    };
    LL_itemsService.getLanguaje = function() {
        return languaje;
    };
    /** SETs  **/
    LL_itemsService.setUserInfo = function(object) {
        userInfo = object;
    };
    LL_itemsService.setWeeklyMeals = function(object) {
        weeklyMeals = object;
    };
    LL_itemsService.setCompleted_meals = function(object) {
        completed_meals = object;
    };
    LL_itemsService.setNutritionalAdvisor = function(object) {
        NutritionalAdvisor = object;
    };
    LL_itemsService.setProducts_list = function(object) {
        products_list = object;
    };
    LL_itemsService.setProductIndex = function(object) {
        productIndex = object;
    };
    LL_itemsService.setLoadingDiet = function(object) {
        loadingDiet = object;
    };
    LL_itemsService.setLanguaje = function(object) {
        languaje = object;
    };
    //return the service object
    return LL_itemsService;
});
laurasLarderServices.factory('ProductsRepository', ['$resource',
    function($resource) {
        var replaceAll = function(text, busca, reemplaza) {
            while (text.toString().indexOf(busca) != - 1)
                text = text.toString().replace(busca, reemplaza);
            return text;
        };
        return{
            populateLarders: function(larders, list_of_category_graphics, products_list) {
                var products_resource = $resource('data/productsDataSet.json');
                var products_from_json = products_resource.query(
                        function() { //callback function for "success" getting the products file
                            for (var i = 0; i < products_from_json.length; i++) {
                                /*     we prepare and object for the product. We define its properties and fill
                                 *      them with data from the product from the json string. We do this mainly 
                                 *      to sort out the "options"
                                 */
                                var product = {};
                                Object.defineProperties(product, {
                                    "food_group": {value: products_from_json[i].food_group, writable: true, enumerable: true, configurable: true},
                                    "shelf_fridge": {value: products_from_json[i].shelf_fridge, writable: true, enumerable: true, configurable: true},
                                    "larder": {value: products_from_json[i].larder, writable: true, enumerable: true, configurable: true},
                                    "category": {value: products_from_json[i].category, writable: true, enumerable: true, configurable: true},
                                    "subcategory": {value: products_from_json[i].subcategory, writable: true, enumerable: true, configurable: true},
                                    "product": {value: products_from_json[i].product, writable: true, enumerable: true, configurable: true}, //we keep this one in case we want to use it, but normally we will use the "key"
                                    "key": {value: products_from_json[i].key, writable: true, enumerable: true, configurable: true},
                                    "options": {value: new Object, writable: true, enumerable: true, configurable: true},
                                    "nutritional_data": {value: products_from_json[i].nutrional_data, writable: true, enumerable: true, configurable: true},
                                    "graphic": {value: replaceAll(products_from_json[i].category.toLowerCase(), " ", "_") + '-category.png', writable: true, enumerable: true, configurable: true}
                                });
                                Object.defineProperties(product.options, {
                                    "origin": {value: products_from_json[i].emissions, writable: true, enumerable: true, configurable: true}, //i have made the json string with the emissions object already prepared, this is the reason to assing (copy) it here
                                    "quantity": {value: new Object, writable: true, enumerable: true, configurable: true}, // will be an object when "option_type" is "number_of"
                                    "portion_size": {value: new Array, writable: true, enumerable: true, configurable: true}, // will be an array when "option_type" is "portion_size"
                                    "user_choice": {value: {origin: null, quantity: null, portion_size: null}, writable: true, enumerable: true, configurable: true}// will store the user´s input
                                });
                                switch (products_from_json[i].option_type) {
                                    case "0":
                                        //do nothing
                                        break;
                                    case "number_of":
                                        var number_of_key;
                                        if (products_from_json[i].option_1 === "Number of") {
                                            //number_of_key = "NUMBER_OF_" + products_from_json[i].key;
                                            number_of_key = "HOW_MANY";
                                        } else {
                                            number_of_key = replaceAll(products_from_json[i].option_1.toUpperCase(), " ", "_");
                                        }
                                        product.options.quantity = {
                                            key: number_of_key,
                                            raw: products_from_json[i].raw_weight_1,
                                            eaten: products_from_json[i].eaten_weight_1
                                        };
                                        break;
                                    case "two_options_with_image": // "two_options" and"two_options_with_image" are the same except for the image
                                        /** i don´t know how but i did the mistake that some "two options" are in the datset as "two options with image", the good thing is that the graphic is "0", so in order to fix the problem the ones that have "0" as the graphic are converted to "two options" **/
                                        if (products_from_json[i].portion_size_images === "0") {
                                            product.options.portion_size = [
                                                {//index 0 of the array
                                                    raw: products_from_json[i].raw_weight_1,
                                                    eaten: products_from_json[i].eaten_weight_1,
                                                    key: replaceAll(products_from_json[i].option_1.toUpperCase(), " ", "_")
                                                },
                                                {//index 1 of the array
                                                    raw: products_from_json[i].raw_weight_2,
                                                    eaten: products_from_json[i].eaten_weight_2,
                                                    key: replaceAll(products_from_json[i].option_2.toUpperCase(), " ", "_")
                                                }
                                            ];
                                            break;
                                        }
                                        /** end fixing the mess with the graphics" **/
                                        product.options.portion_size = [
                                            {//index 0 of the array
                                                raw: products_from_json[i].raw_weight_1,
                                                eaten: products_from_json[i].eaten_weight_1,
                                                key: replaceAll(products_from_json[i].option_1.toUpperCase(), " ", "_"),
                                                graphic: products_from_json[i].portion_size_images.slice(0, 1) + 'a-portion_size.png'
                                            },
                                            {//index 1 of the array
                                                raw: products_from_json[i].raw_weight_2,
                                                eaten: products_from_json[i].eaten_weight_2,
                                                key: replaceAll(products_from_json[i].option_2.toUpperCase(), " ", "_"),
                                                graphic: products_from_json[i].portion_size_images.slice(0, 1) + 'b-portion_size.png'
                                            }
                                        ];
                                        break;
                                    case "two_options":
                                        product.options.portion_size = [
                                            {//index 0 of the array
                                                raw: products_from_json[i].raw_weight_1,
                                                eaten: products_from_json[i].eaten_weight_1,
                                                key: replaceAll(products_from_json[i].option_1.toUpperCase(), " ", "_")
                                            },
                                            {//index 1 of the array
                                                raw: products_from_json[i].raw_weight_2,
                                                eaten: products_from_json[i].eaten_weight_2,
                                                key: replaceAll(products_from_json[i].option_2.toUpperCase(), " ", "_")
                                            }
                                        ];
                                        break;
                                    default:
                                        console.error("A product is missing a 'Portion_size' or 'quantity' option, it needs to have at least one");
                                        console.error(products_from_json[i]);
                                        break;
                                }

                                /*** add product to products_list **/
                                products_list.push(angular.copy(product));
                                /* now we add the product to the larders:
                                 *    - first we get the larders a product belongs to
                                 *    - then we check if the larder has the category of the product, if not we add the category 
                                 *    to the larder (and do some other things about the cateogry)
                                 *    - then follow comments
                                 *                                             */

                                var product_sublarders = product.larder.split(','); //the same product can be in different sublarders
                                for (var j = 0; j < product_sublarders.length; j++) {
                                    var sublarder = product_sublarders[j];
                                    if (larders[sublarder].hasOwnProperty(product.category) === false) {//if the sublarder hasn´t got the category

                                        Object.defineProperty(larders[sublarder], product.category, {// we add the category to the larder
                                            value: new Object, writable: true, enumerable: true, configurable: true
                                        });
                                        var category_key = replaceAll(product.category.toUpperCase(), " ", "_");
                                        Object.defineProperty(larders[sublarder][product.category], 'key', {// we add the key for the category, useful for translation
                                            value: category_key, writable: true, enumerable: true, configurable: true
                                        });
                                        Object.defineProperty(larders[sublarder][product.category], 'graphic', {// we make the name of the grapic and add it to the category: 'categoryKey_graphic.png'
                                            value: replaceAll(category_key.toLowerCase(), ",", "") + '-category.png', writable: true, enumerable: true, configurable: true
                                        });
                                        //list_of_category_graphics[product.category] = replaceAll(category_key.toLowerCase(), ",", "") + '-category.png';//this just to make a list and give it to John so he can give the graphcs the appropiate names
                                        list_of_category_graphics[product.category] = {};
                                        list_of_category_graphics[product.category].key = category_key;
                                        list_of_category_graphics[product.category].name = product.category;
                                        Object.defineProperty(larders[sublarder][product.category], 'subcategories', {
                                            value: new Object, writable: true, enumerable: true, configurable: true
                                        });
                                        Object.defineProperty(larders[sublarder][product.category], 'products', {
                                            value: new Array, writable: true, enumerable: true, configurable: true
                                        });
                                        Object.defineProperty(larders[sublarder][product.category], 'shelf', {
                                            value: product.shelf_fridge, writable: true, enumerable: true, configurable: true
                                        });
                                        Object.defineProperty(larders[sublarder][product.category], 'name', {
                                            value: product.category, writable: true, enumerable: true, configurable: true
                                        });
                                    }
                                    if (product.subcategory === "0") {//if the product does not  belong to a subcategory
                                        larders[sublarder][product.category].products.push(angular.copy(product)); //add it to the category
                                    }
                                    else {  //if product has subcategory
                                        if (larders[sublarder][product.category].subcategories.hasOwnProperty(product.subcategory) === false) {//if the subcategory is not already in the category
                                            Object.defineProperty(larders[sublarder][product.category].subcategories, product.subcategory, {
                                                value: new Object, writable: true, enumerable: true, configurable: true //add the subcategory
                                            });
                                            Object.defineProperty(larders[sublarder][product.category].subcategories[product.subcategory], 'key', {
                                                value: replaceAll(product.subcategory.toUpperCase(), " ", "_"), writable: true, enumerable: true, configurable: true //add the subcategorie Key - ToDo: i am adding the name of the subcategory because we haven´t got a key in the dataset yet
                                            });
                                            Object.defineProperty(larders[sublarder][product.category].subcategories[product.subcategory], 'products', {
                                                value: new Array, writable: true, enumerable: true, configurable: true //add the array of products to the subcategory
                                            });
                                        }
                                        larders[sublarder][product.category].subcategories[product.subcategory].products.push(angular.copy(product)); //add the product to the subcategory
                                    }
                                }
                            }
                        },
                        function() {//callback function for "error" getting the products file
                            console.error("Error getting the products file");
                        });
            }
        };
    }
]);
laurasLarderServices.factory('LL_OpenSave', ['fileDialog', '$modal', 'LL_items', '$location', '$resource',
    function(fileDialog, $modal, LL_items, $location, $resource) {
        //return $resource('dataset/LaurasLarder-DataSet-v02.json',{},{
        return {
            openDiet: function(scope) {
                /**  Local functions   */
                var SaveOpenDiet_Controller = function() {
                    scope.openFromFile = function(element) {
                        var dietFile = element.files[0];
                        var dietFileReader = new FileReader();
                        dietFileReader.onload = function(e) {
                            scope.$apply(function() {
                                try {
                                    var dietToLoad = JSON.parse(e.target.result);
                                } catch (e) {
                                    window.alert('There was a problem openning the file - ' + e);
                                }
                                console.log(dietToLoad);
                                //console.log(diet);
                                scope.modalInstance_SaveOpenDiet.dismiss();
                                setItems(dietToLoad);
                                setLocation(dietToLoad);
                            });
                        };
                        dietFileReader.readAsText(dietFile);
                    };

                };

                var setItems = function(dietToLoad) {
                    //we use the service LL_items to share the following objects with the results page controller
                    console.log(dietToLoad);
                    LL_items.setCompleted_meals(dietToLoad.completed_meals);
                    LL_items.setUserInfo(dietToLoad.userInfo);
                    LL_items.setWeeklyMeals(dietToLoad.weeklyMeals);
                    LL_items.setProducts_list(dietToLoad.products_list);
                    LL_items.setProductIndex(dietToLoad.productIndex);
                    LL_items.setLoadingDiet(true);
                    LL_items.setLanguaje(dietToLoad.languaje);
                };
                var setLocation = function(dietToLoad) {
                    switch (dietToLoad.controller) {
                        case 'input_data':
                            $location.path('/LL-input-data');
                            break;
                        case 'results':
                            $location.path('/LL-results');
                            break;
                    }
                };
                /**  End local functions  **/

                /**  scope functions  **/
                scope.reset = function() {
                    scope.storage.clear();
                };
                /**  End scope functions  **/

                /** Open a modal window , if the diet to open is in the storage 
                 * we load it in the "result" promise, if the diet to open is 
                 * from a file we open it in the Contoller: scope.openFromFile()
                 *  **/
                scope.modalInstance_SaveOpenDiet = $modal.open({
                    templateUrl: 'partials/modalSaveOpenDiet.html',
                    windowClass: 'modalSaveOpenDiet',
                    scope: scope,
                    controller: SaveOpenDiet_Controller
                });
                scope.modalInstance_SaveOpenDiet.result.then(
                        function() {
                            console.log(scope.storage.getItem(scope.dietToOpen.name));
                            var dietToLoad = JSON.parse(scope.storage.getItem(scope.dietToOpen.name));
                            setItems(dietToLoad);
                            setLocation(dietToLoad);
                        },
                        function() {
                        });
            },
            /** End openDiet  **/
            saveDiet: function(scope) {
                /** Fetch what we want to save and make JSON string  **/
                var objectToSave = {
                };
                objectToSave.userInfo = scope.userInfo;
                objectToSave.weeklyMeals = scope.weeklyMeals;
                objectToSave.completed_meals = scope.completed_meals;
                objectToSave.products_list = scope.products_list;
                objectToSave.productIndex = scope.product_index;
                objectToSave.controller = scope.controller;
                objectToSave.languaje = scope.languaje;
                scope.dietToSave.jsonString = JSON.stringify(objectToSave);

                //We make a blob in case the user wnats to download the diet
                var blob = new Blob([scope.dietToSave.jsonString], {type: 'text/json'});
                scope.dietToSave.url = (window.URL || window.webkitURL).createObjectURL(blob);
                console.log(scope);
                // End fetching what we want to save and make JSON string  **/
                /**  scope functions  **/
                scope.reset = function() {
                    scope.storage.clear();
                };
                /**  End scope functions  **/
                /** Open modal, its mission is to get hte name of the diet to save, the actual saving happens when they click "Save" in the modal window **/
                scope.saveOpenStep = 'save';
                scope.modalInstance_SaveOpenDiet = $modal.open({
                    templateUrl: 'partials/modalSaveOpenDiet.html',
                    windowClass: 'modalSaveOpenDiet',
                    scope: scope
                });
                scope.modalInstance_SaveOpenDiet.result.then(
                        function() {
                            console.log(scope.storage);
                            scope.storage.setItem(scope.dietToSave.name, scope.dietToSave.jsonString);
                            console.log(scope.storage);
                        },
                        function() {
                        });
            }
            /*return $resource('data/:file_name', {}, {
             open: {method: 'GET', isArray: false}
             });
             */
        };
    }
]);