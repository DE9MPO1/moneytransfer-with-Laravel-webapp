'use strict';

Stripe.setPublishableKey('pk_test_aWyIUltAAS04f7KyYnp1PmG8');

var app = angular.module('MoneyTransferApp', ['ngRoute',
                                              'ngAnimate',
                                              'angularSpinner',
                                              'ngMessages',
                                              'angularPayments', 
                                              'ui.bootstrap',
                                              'Authenticatecontrollers',
                                              'Blogcontrollers',
                                              'services'], 
                                              ['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.post['X-CSRF-TOKEN'] = $('meta[name=csrf-token]').attr('content');
}]);

app.run(["userService", function(userService) {
  var user = userService.GetCurrentUser();
  if (user) {
    userService.SetCurrentUser(user);
  }
}]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);


 
 // configure our routes
	app.config(function($routeProvider, $locationProvider) {
		$routeProvider
		.when('/', {
				templateUrl : 'views/partials/home.html',
				controller  : 'mainController'
			})
        .when('/login', {
                templateUrl : 'views/partials/login.html',
                controller  : 'loginController'
            })
        .when('/signup', {
                templateUrl : 'views/partials/signup.html',
                controller  : 'signupController'
            })
        .when('/editprofile', {
                templateUrl : 'views/partials/edit_profile.html',
                controller  : 'editProfileController'
            })
        .when('/changepwd', {
                templateUrl : 'views/partials/changepwd.html',
                controller  : 'changepwdController'
            })
        .when('/logout', {
                templateUrl : 'views/partials/login.html',
                controller  : 'logoutController'
            })
		.when('/howitworks', {
				templateUrl : 'views/partials/howitworks.html',
				controller  : 'howitworksController'
			})

		.when('/aboutus', {
				templateUrl : 'views/partials/aboutus.html',
				controller  : 'aboutusController'
			})

		.when('/helpsupport', {
				templateUrl : 'views/partials/helpsupport.html',
				controller  : 'helpsupportController'
			})

		.when('/blog', {
				templateUrl : 'views/partials/blog.html',
				controller  : 'blogController'
			})
		.when('/getpost/:id', {
				templateUrl : 'views/partials/post.html',
				controller  : 'getPostController'
			})
        .when('/sendmoney/:id', {
                templateUrl : 'views/partials/home_sendmoney.html',
                controller  : 'sendMoneyHomeController'
            })
        .when('/adminhome/:id', {
                templateUrl : 'views/partials/home_admin.html',
                controller  : 'adminHomeController'
            })
        .when('/transfermoney', {
                templateUrl : 'views/partials/transfermoney.html',
                controller  : 'transferMoneyController'
            })	
		
		.otherwise({
                redirectTo:'/'
            });
	});

    
	app.controller('mainController', function($scope, $http,$location) {
       
    });

    app.controller('adminHomeController', function($scope, $http,$location,CustomerInfo) {
        $scope.getTimezone = function(timestamp) {
           var today = new Date(timestamp);
           var offset = today.getTimezoneOffset(); 
           var hours = Math.floor((Math.abs(offset)) / 60);
           if(offset < 0 )
            {
                today.setHours(today.getHours() + hours );
            }
            else
            {
                today.setHours(today.getHours() - hours );
            }
        
            return today;
        }

        $scope.showMenu = function(menuname) {
           if (menuname === 1) {
                $scope.TransactionsTable = true;
                $scope.CustomerForm = false;
                $scope.TransferMoneyForm = false;
                $scope.PhoneBookForm = false;
                $scope.getPendingCustomers(1);
           }
           if (menuname === 2) {$scope.getTimezone = function(timestamp) {
           var today = new Date(timestamp);
           var offset = today.getTimezoneOffset(); 
           var hours = Math.floor((Math.abs(offset)) / 60);
           if(offset < 0 )
            {
                today.setHours(today.getHours() + hours );
            }
            else
            {
                today.setHours(today.getHours() - hours );
            }
        
            return today;
        }

                $scope.TransactionsTable = false;
                $scope.CustomerForm = false;
                $scope.TransferMoneyForm = true;
                $scope.PhoneBookForm = false;
           }
           if (menuname === 3) {
                $scope.TransactionsTable = false;
                $scope.CustomerForm = false;
                $scope.TransferMoneyForm = false;
                $scope.PhoneBookForm = true;
           }
        }

        //Get the transactions 
        $scope.getPendingCustomers = function(pageNumber){
            if(pageNumber===undefined){
                pageNumber = '1';
            }
            $scope.userinfo = angular.fromJson(sessionStorage.user);
            CustomerInfo.getPendingCust(pageNumber).then(function(d) { //2. so you can use .then()
                $scope.pendingcustomers = d.data;
                $scope.currentPage = d.current_page;
                $scope.totalPages   = d.last_page;
                // Pagination Range
                    var pages = [];

                    for(var i=1;i<=d.last_page;i++) {          
                        pages.push(i);
                    }
                    $scope.range = pages; 
            });


        }

        $scope.nextPage = function() {
                if ($scope.currentPage < $scope.totalPages) {
                    $scope.currentPage++;
                    $scope.getTnx($scope.currentPage);
                }
            };
        $scope.prevPage = function() {
                if ($scope.currentPage > 1) {
                    $scope.currentPage--;
                    $scope.getTnx($scope.currentPage);
                }
            };
        $scope.getPendingCustomers(1);


       
    });

    app.controller('howitworksController', function($scope, $http) {

    });
    
    app.controller('aboutusController', function($scope, $http) {

    });

    app.controller('helpsupportController', function($scope, $http) {

    });

    app.controller('editProfileController', function($scope, $http) {
        $scope.onSubmit = function () {
            $scope.processing = true;
        };

        $scope.hideAlerts = function () {
            $scope.stripeError = null;
            $scope.stripeToken = null;
        };

        $scope.userinfo = angular.fromJson(sessionStorage.user);
        $http.get('/api/customer/' + $scope.userinfo.id)
            .then(function onSuccess(response) {
                $scope.customerinfo = response.data;
        });

        $scope.save = function(id) {
        var url = '/api/customer/'+ id;
        $http({
            method: 'PUT',
            url: url,
            data: $.param($scope.customerinfo),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function onSuccess(response) {
            $scope.processing = false;
            $scope.stripeToken = response.data.message;
        }).catch(function onError(response) {
            console.log(response);
            alert('An error has occured. Please check the log for details');
        });
    }

        

    });

    app.controller('changepwdController', function($scope, $http) {
        $scope.onSubmit = function () {
            $scope.processing = true;
        };

        $scope.hideAlerts = function () {
            $scope.stripeError = null;
            $scope.stripeToken = null;
        };
        $scope.userinfo = angular.fromJson(sessionStorage.user);
        $scope.save = function() {
        var url ='/api/resetpassword/'+ $scope.userinfo.id;
        $http({
            method: 'POST',
            url: url,
            data: $.param($scope.pwd),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function onSuccess(response) {
            $scope.processing = false;
            $scope.stripeToken = response.data.message;
        }).catch(function onError(response) {
            console.log(response);
            alert('An error has occured. Please check the log for details');
        });
    }
        

    });

    app.controller('sendMoneyHomeController', function($scope, $routeParams,CustomerInfo,CheckStatusService,TransactionService){
        $scope.param = $routeParams.id;
        var id = $scope.param;
        $scope.userid = $scope.param;
        CheckStatusService.getStatus(id).then(function(d) { //2. so you can use .then()
            console.log(d);
            if(d.custo_status == 0)
                {
                    $scope.TransactionsTable = false;
                    $scope.CustomerForm = false;
                    $scope.usable = false;
                    $scope.PendingCustomer = true;
                }
                else if (d.custo_status == 1)
                {
                    $scope.TransactionsTable = true;
                    $scope.CustomerForm = false;
                    $scope.usable = true;
                    $scope.PendingCustomer = false;
                }
                else
                {
                    $scope.TransactionsTable = false;
                    $scope.CustomerForm = true;
                    $scope.usable = false;
                    $scope.PendingCustomer = false;
                }
            
        });

        $scope.years =[];
        $scope.months =[];
        $scope.days =[];
        
        var year_current = new Date().getFullYear();             
        for(var i=1900; i<=year_current; i++) {
            $scope.years.push({
                    yvrb: i
                });
        }

        for(var i=1; i<=12; i++) {
            $scope.months.push({
                    mvrb: i
                });
        }

        for(var i=1; i<=31; i++) {
            $scope.days.push({
                    dvrb: i
                });
        }

        $scope.getTimezone = function(timestamp) {
           var today = new Date(timestamp);
           var offset = today.getTimezoneOffset(); 
           var hours = Math.floor((Math.abs(offset)) / 60);
           if(offset < 0 )
            {
                today.setHours(today.getHours() + hours );
            }
            else
            {
                today.setHours(today.getHours() - hours );
            }
        
            return today;
        }

        //Get the transactions 
        $scope.getTnx = function(pageNumber){
            if(pageNumber===undefined){
                pageNumber = '1';
            }
            $scope.userinfo = angular.fromJson(sessionStorage.user);
            TransactionService.getTransactions($scope.userinfo.id,pageNumber).then(function(d) { //2. so you can use .then()
                $scope.transactions = d.data;
                $scope.currentPage = d.current_page;
                $scope.totalPages   = d.last_page;
                // Pagination Range
                    var pages = [];

                    for(var i=1;i<=d.last_page;i++) {          
                        pages.push(i);
                    }
                    $scope.range = pages; 
            });


        }

        $scope.nextPage = function() {
                if ($scope.currentPage < $scope.totalPages) {
                    $scope.currentPage++;
                    $scope.getTnx($scope.currentPage);
                }
            };
        $scope.prevPage = function() {
                if ($scope.currentPage > 1) {
                    $scope.currentPage--;
                    $scope.getTnx($scope.currentPage);
                }
            };
        $scope.getTnx(1);

        $scope.showMenu = function(menuname) {
           if (menuname === 1) {
                $scope.TransactionsTable = true;
                $scope.CustomerForm = false;
                $scope.TransferMoneyForm = false;
                $scope.PhoneBookForm = false;
                $scope.getTnx(1);
           }
           if (menuname === 2) {
                $scope.TransactionsTable = false;
                $scope.CustomerForm = false;
                $scope.TransferMoneyForm = true;
                $scope.PhoneBookForm = false;
           }
           if (menuname === 3) {
                $scope.TransactionsTable = false;
                $scope.CustomerForm = false;
                $scope.TransferMoneyForm = false;
                $scope.PhoneBookForm = true;
           }
        }

        $scope.saveCustomer = function(){
            var file = $scope.record.image_file;
            CustomerInfo.save($scope.record,file).then(function(d) { //2. so you can use .then()
                console.log(d);
                if(d.custo_status == 0)
                {
                    $scope.TransactionsTable = false;
                    $scope.CustomerForm = false;
                    $scope.usable = false;
                    $scope.PendingCustomer = true;
                }
                else if (d.custo_status == 1)
                {
                    $scope.TransactionsTable = true;
                    $scope.CustomerForm = false;
                    $scope.usable = true;
                    $scope.PendingCustomer = false;
                }
                else
                {
                    $scope.TransactionsTable = false;
                    $scope.CustomerForm = true;
                    $scope.usable = false;
                    $scope.PendingCustomer = false;
                }
            });

            //CustomerInfo.save($scope.record,file);
        };
    
    });

     app.controller('customerController', function($scope) {
        
    });

    app.controller('transferMoneyController', function($scope, $http,CurrencyService,TransactionService) {

         $scope.onSubmit = function () {
            $scope.processing = true;
        };

        $scope.stripeCallback = function (code, result) {
            $scope.processing = false;
            $scope.userinfo = angular.fromJson(sessionStorage.user);
            $scope.hideAlerts();
            if (result.error) {
                $scope.stripeError = result.error.message;
            } else {
                var $payInfo = {
                    'token' : result.id,
                    'user_id' : $scope.userinfo.id,
                    'user_email' : $scope.userinfo.email,
                    'total':$scope.pay_amount,
                    'countrycode':$scope.countrycode,
                    'phonenumber':$scope.phonenumber
                };
                var url = '/api/pay';
                $http({
                    method: 'POST',
                    url: url,
                    data: $.param($payInfo),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).then(function onSuccess(response) {
                    if(response.data.status)
                    {
                        $scope.paid= true;
                        $scope.stripeToken = response.data.message;                    
                    }
                    else
                    {
                        $scope.paid= false;
                        $scope.stripeError = response.data.message;
                    }
                }).catch(function onError(error){
                    console.log(error);
                    alert(error);
                });
                
            }
        };

        $scope.hideAlerts = function () {
            $scope.stripeError = null;
            $scope.stripeToken = null;
        };

        CurrencyService.getCurrency().then(function(d) { //2. so you can use .then()
            $scope.currencies = d;
        });
       

        $scope.status = {
            isFirstOpen: true,
            isFirstOpen2: true,
        };
        $scope.rates = {};
        $http.get('/api/currency')
            .then(function(res) {
                $scope.rates = res.data;
                $scope.forExConvert();
            });
        $scope.forExConvert = function() {
            angular.forEach($scope.rates, function(value, key) {
                    if(value.phonecode == $scope.countrycode){
                        $scope.pay_amount = $scope.amount / value.exchange_rate;
                        $scope.pay_amount = Math.round($scope.pay_amount);
                    }   
                });
        };


        $scope.saveTransfer = function() {
            $scope.userinfo = angular.fromJson(sessionStorage.user);
            var $payInfo = {
                'user_id' : $scope.userinfo.id,
                'total':$scope.pay_amount,
                'countrycode':$scope.countrycode,
                'phonenumber':$scope.phonenumber
            };
            var url = '/api/paymobile';
            $http({
                method: 'POST',
                url: url,
                data: $.param($payInfo),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function onSuccess(response) {
                $scope.processing = false;
                $scope.stripeToken = response.data.message;           
            }).catch(function onError(error) {
                console.log(error);
                alert('An error has occured. Please check the log for details');
            });
           
        }
    });