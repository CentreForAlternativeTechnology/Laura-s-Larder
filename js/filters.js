'use strict';

/* Filters */
var laurasLarderFilters = angular.module('laurasLarderFilters', []);
laurasLarderFilters.filter('originExists', function() {
    return function(origin_object) {
        var result = {};
        angular.forEach(origin_object, function(emissions, origin) {
            if (emissions !== 0) {
                result[origin] = emissions;
            }
        });
        return result;
    };
});


laurasLarderFilters.filter('firstLetterToLowerCase', function() {
    return function(input) {
        console.log("here");
        console.log(input);
        if (input !== null)
            return input.substring(0, 1).toLowerCase() + input.substring(1);
    };
});


laurasLarderFilters.filter('categoryInShelf', function() {
    return function(larder, shelf_in_larder) {
        var result = {};
        angular.forEach(larder, function(category_object, category_key) {
            if (category_object.shelf === shelf_in_larder) {
                result[category_key] = category_object;
            }
        });
        return result;
    };
});

laurasLarderFilters.filter('findProduct', function() {
    return function(product_list, search_word) {
        var result = [];
        angular.forEach(product_list, function(product_object, array_index) {
            if (angular.lowercase(product_object.product).indexOf(angular.lowercase(search_word)) >= 0) {
                result.push(product_object);
            }
        });
        return result;
    };
});