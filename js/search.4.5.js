function httpAjax(url, parm, mFunction) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            mFunction(JSON.parse(this.responseText));
        }
    };
    var str = "";
    if (parm != null) {
        for (var key in parm) {
            if (str != "") {
                str += "&";
            }
            str += key + "=" + encodeURIComponent(parm[key]).trim();
        }
    }
    xhttp.open("GET", url + str, true);
    xhttp.send();

}

function autocomplete(inp) {
    var currentFocus;
    var myVar;
    inp.addEventListener("input", function(e) {
        clearTimeout(myVar);
        myVar = setTimeout(function() {
            if (inp.value.trim().length <= 2) {
                return false;
            }
            httpAjax(siteURL + "/ajax.php?do=localsearch&keyword=" + inp.value.toLowerCase(), null, function(res) {
                appendResult(inp, res);
            });
        }, 500);
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    function appendResult(inp, res) {

        var arr = res;
        var a, b, i, val = inp.value;
        if (!val) {
            return false;
        }
        currentFocus = -1;
        a = document.getElementById("resultcontiner");
        a.innerHTML = "";



        for (i = 0; i < arr.length; i++) {
            var iOf = arr[i].alies.toUpperCase().indexOf(val.toUpperCase());
            b = document.createElement("DIV");
            b.setAttribute("class", "w3-bar w3-padding w3-show w3-border-bottom");
            b.innerHTML += '<span class="w3-bar-item fa fa-map-marker w3-xlarge"></span> ';
            b.innerHTML += "<input type='hidden' value='" + JSON.stringify(arr[i]) + "'>";
            b.innerHTML += '<div class="w3-bar-item"><span class="w3-large">' + arr[i].alies + '</span></div>';
            b.addEventListener("click", function(e) {
                //alert(this.getElementsByTagName("input")[0].value)
                var selectedVal = JSON.parse(this.getElementsByTagName("input")[0].value)
                inp.value = selectedVal.alies;
                closeAllLists();
                //var fullURL = baseUrl+extrLang+'/'+selectedVal.countrynameenglish+'/'+selectedVal.ci_url;
                var fullURL = selectedVal.ci_url;
                //console.log(baseUrl+'/'+selectedVal.countrynameenglish+'/'+selectedVal.ci_url);
                window.location.href = fullURL;
            });
            a.appendChild(b);
        }
    }

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}
autocomplete(document.getElementById("autocomplete"));




var resultSearch = document.getElementById("resultLocation");
var urlforseach = "";
var trytimes = 0;
angular.module('myApp', []).controller('myCtrl', function($scope, $http) {



    function searchArrayOfObjects(nameKey, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].types[0] === nameKey) {
                return myArray[i];
            }
        }
        return false;
    }

    function handleResult(response) {
        var myStringArray = response.address_components;
        var countryDetails = searchArrayOfObjects("country", myStringArray);
        var resultObject = false;
        if (!countryDetails) {
            resultSearch.innerHTML = "عفواً لم يتم ايجاد العنوان";
        } else {
            resultObject = searchArrayOfObjects("locality", myStringArray);
            if (!resultObject) {
                resultObject = searchArrayOfObjects("administrative_area_level_3", myStringArray);
                if (!resultObject) {
                    resultObject = searchArrayOfObjects("administrative_area_level_2", myStringArray);
                    if (!resultObject) {
                        resultObject = searchArrayOfObjects("administrative_area_level_1", myStringArray);
                    }
                }
            }

        }

        if (!resultObject) {
            resultSearch.innerHTML = "يجب ان تكتب اسم المدينة ايضاً وليس فقط اسم الدولة , فأوقات الصلاة تختلف من مدينة لمدينة داخل الدولة نفسها .";
        } else {

            var dataObj = {
                lat: response.geometry.location.lat(),
                lng: response.geometry.location.lng(),
                long_name: encodeURI(resultObject.long_name),
                short_name: encodeURI(resultObject.short_name),
                formatted_address: encodeURI(response.formatted_address),
                country_long_name: encodeURI(countryDetails.long_name),
                country_short_name: encodeURI(countryDetails.short_name),
                full_result: encodeURI(JSON.stringify(response.address_components))
            };

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var resultAjax = JSON.parse(this.responseText);
                    //alert(myArr.msg);
                    if (resultAjax.status == 1) {
                        resultSearch.innerHTML = resultAjax.msg;
                        window.location.href = resultAjax.url;
                    } else {
                        resultSearch.innerHTML = resultAjax.msg;
                    }
                }
            };

            var str = "";
            for (var key in dataObj) {
                if (str != "") {
                    str += "&";
                }
                str += key + "=" + encodeURIComponent(dataObj[key]).trim();
            }

            xhttp.open("GET", siteURL + "/ajax.php?do=search&" + str, true);
            xhttp.send();



        }

    }

    function httpAjax(url, parm, mFunction) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                mFunction(JSON.parse(this.responseText));
            }
        };
        var str = "";
        if (parm != null) {
            for (var key in parm) {
                if (str != "") {
                    str += "&";
                }
                str += key + "=" + encodeURIComponent(parm[key]).trim();
            }
        }
        xhttp.open("GET", url + str, true);
        xhttp.send();

    }
    $scope.myLocation = function() {
        resultSearch.innerHTML = '<i class="fa fa-spinner w3-spin" aria-hidden="true"></i> جارٍ تحديد موقعك , الرجاء الإنتظار قليلاً ...';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var localReqParm = {
                    do: 'searchlocation',
                    lat: parseFloat(position.coords.latitude),
                    lng: parseFloat(position.coords.longitude)
                };
                httpAjax(siteURL + "/ajax.php?", localReqParm, function(res) {
                    if (res.status == 1) {
                        resultSearch.innerHTML = res.msg;
                        window.location.href = res.url;
                    } else {
                        var latlng = {
                            lat: parseFloat(position.coords.latitude),
                            lng: parseFloat(position.coords.longitude)
                        };
                        var geocoder = new google.maps.Geocoder;
                        geocoder.geocode({
                            'location': latlng
                        }, function(results, status) {
                            if (status === 'OK') {
                                if (results[0]) {
                                    //console.log(results[0]);
                                    handleResult(results[0]);
                                } else {
                                    resultSearch.innerHTML = 'No results found';
                                }
                            } else {
                                resultSearch.innerHTML = 'Geocoder failed due to: ' + status;
                            }
                        });

                    }
                });


                //trytimes = 0;
                //urlforseach = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+ position.coords.latitude +","+ position.coords.longitude +"&sensor=false&language=ar&key=AIzaSyC9IneXdwfkqK4UbkZ_OZ_S0gDtfj9Ux0w";
                //doSearch();

            }, function(error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        resultSearch.innerHTML = "الرجاء الموافقة على السماح بايجاد موقعك حالياً .";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        resultSearch.innerHTML = "عفواً البيانات غير متوفرة حالياً";
                        break;
                    case error.TIMEOUT:
                        resultSearch.innerHTML = "العملية اخذت وقت طويل الرجاء المحاولة مرة اخرى";
                        break;
                    case error.UNKNOWN_ERROR:
                        resultSearch.innerHTML = "عفواً حدث خطاء غير معروف الرجاء المحاولة مرة اخرى .";
                        break;
                }
            });
        } else {
            resultSearch.innerHTML = "عفواً متصفحك لايدعم هذه الخاصية.";
        }

    };




    $scope.searchLocation = function() {
        if ($scope.locationSearch && $scope.locationSearch.trim().length > 0) {
            resultSearch.innerHTML = "جارٍ البحث ,الرجاء الانتظار ...";
            var searchword = $scope.locationSearch.trim();
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({
                'address': searchword
            }, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        //console.log(results[0]);
                        handleResult(results[0]);
                    } else {
                        resultSearch.innerHTML = 'No results found';
                    }
                } else {
                    resultSearch.innerHTML = 'Geocoder failed due to: ' + status;
                }
            });
        } else {
            resultSearch.innerHTML = "عفواً يجب عليك كتابة اسم المدينة او العنوان ...";
        }
    };




});