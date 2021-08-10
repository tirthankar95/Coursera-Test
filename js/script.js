$(function () { // Same as document.addEventListener("DOMContentLoaded"...
  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
  // In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  // Refer to issue #28 in the repo.
  // Solution: force focus on the element that the click event fired on
  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});
(function (global) {
var dc = {};
var homeHtml = "snippets/home-snippet.html";
var allCategoriesUrl ="https://davids-restaurant.herokuapp.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";
// var menuItemsUrl ="https://davids-restaurant.herokuapp.com/menu_items.json?category=";
// var menuItemsTitleHtml = "snippets/menu-items-title.html";
// var menuItemHtml = "snippets/menu-item.html";
// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};
// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};
//Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty=function(string,propName,propValue){
  var toReplace="{{"+propName+"}}"
  string = string.replace(new RegExp(toReplace,"g"),propValue);
  return string;
}
var oldTxt=undefined;
//Removes particular highlights.
var removeHighlight=function(string){
    var STR=document.querySelector('#nav-list').innerHTML;
    if(oldTxt===undefined)oldTxt=STR;
    STR=oldTxt;var removeTxt;
    if(string==="removeMenu")removeTxt='id="cutlery-active"';
    else if(string=="removeHome")removeTxt='id="home-active"';
    STR = STR.replace(new RegExp(removeTxt,"g"),"");
    console.log(STR);
    document.querySelector('#nav-list').innerHTML=STR;
};
// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {
// On first load, show home view
showLoading("#main-content");
removeHighlight("removeMenu");
$ajaxUtils.sendGetRequest(homeHtml,
  function (responseText) {
    document.querySelector("#main-content").innerHTML = responseText;
  },
  false);
});
dc.loadhome=function(){
  showLoading("#main-content");
  removeHighlight("removeMenu");
  $ajaxUtils.sendGetRequest(homeHtml,
  function (responseText) {
    document.querySelector("#main-content").innerHTML = responseText;
  },
  false);
};
dc.loadMenuCategories=function(){
  showLoading("#main-content");
  removeHighlight("removeHome");
  $ajaxUtils.sendGetRequest(allCategoriesUrl,buildAndShowCategoriesHTML,true);
};
// Builds HTML for the categories page based on data from the server.
function buildAndShowCategoriesHTML(_categories_){
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function(_categoriesTitleHtml_){
       $ajaxUtils.sendGetRequest(
          categoryHtml,
          function(_categoryHtml_){
              var categoriesViewHTML=buildCategoriesViewHTML(_categories_,_categoriesTitleHtml_,_categoryHtml_);
              insertHtml("#main-content",categoriesViewHTML);
          },
          false);
    },
    false);
}
function buildCategoriesViewHTML(categories,categoriesTitleHtml,categoryHtml){
  var finalHtml=categoriesTitleHtml;
  finalHtml+="<div class='row'>";
  for(var i=0;i<categories.length;i++){
    var html=categoryHtml;
    html=insertProperty(html,'short_name',categories[i].short_name);
    html=insertProperty(html,'name',categories[i].name);
    finalHtml+=html;
  }
  finalHtml += "</div>";
  return finalHtml;
}
// Load the menu items view
// 'categoryShort' is a short_name for a category
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  removeHighlight("removeHome");
  $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort,buildAndShowMenuItemsHTML,true);
};
// Builds HTML for the single category page based on the data
// from the server
function buildAndShowMenuItemsHTML (categoryMenuItems) {
  // Load title snippet of menu items page
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      // Retrieve single menu item snippet
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          var menuItemsViewHtml =
            buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleHtml,
                                   menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
        false);
    },
    false);
}
// Using category and menu items data and snippets html
// build menu items view HTML to be inserted into page
function buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml) {
  menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,"name",categoryMenuItems.category.name);
  menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,"special_instructions",categoryMenuItems.category.special_instructions);
  var finalHtml = menuItemsTitleHtml;
  finalHtml += "<div class='row'>";
  // Loop over menu items
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    // Insert menu item values
    var html = menuItemHtml;
    html = insertProperty(html, "short_name", menuItems[i].short_name);
    html = insertProperty(html, "catShortName",catShortName);
    html = insertItemPrice(html,"price_small",menuItems[i].price_small);
    html = insertItemPortionName(html,"small_portion_name",menuItems[i].small_portion_name);
    html = insertItemPrice(html,"price_large",menuItems[i].price_large);
    html = insertItemPortionName(html,"large_portion_name",menuItems[i].large_portion_name);
    html = insertProperty(html,"name",menuItems[i].name);
    html = insertProperty(html,"description",menuItems[i].description);
    // Add clearfix after every second menu item
    if (i % 2 != 0) {
      html +=
        "<div class='clearfix visible-lg-block visible-md-block'></div>";
    }
    finalHtml += html;
  }
  finalHtml += "</div>";
  return finalHtml;
}
// Appends price with '$' if price exists
function insertItemPrice(html,pricePropName,priceValue) {
  // If not specified, replace with empty string
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }
  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}


// Appends portion name in parens if it exists
function insertItemPortionName(html,portionPropName,portionValue) {
  // If not specified, return original string
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }
  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}
global.$dc = dc;})(window);