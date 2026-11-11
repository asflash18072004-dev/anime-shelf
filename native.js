(function(){
  var C=window.Capacitor;
  if(!C||!C.Plugins||!C.Plugins.App)return;
  C.Plugins.App.addListener('backButton',function(e){
    if(e.canGoBack)history.back();
    else C.Plugins.App.exitApp();
  });
})();
