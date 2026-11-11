(function(){
  var C=window.Capacitor;
  /* safe-area insets (status bar / gesture bar heights) come from the Android side */
  function applyInsets(){
    try{
      var v=String(window.AnimeInsets.get()).split(',');
      var s=document.documentElement.style;
      s.setProperty('--sa-top',v[0]+'px');
      s.setProperty('--sa-bottom',v[1]+'px');
    }catch(e){}
  }
  applyInsets();
  setTimeout(applyInsets,300);setTimeout(applyInsets,1200);
  addEventListener('resize',applyInsets);
  addEventListener('orientationchange',function(){setTimeout(applyInsets,300)});

  /* small toast, used only if the app's own toast() is not reachable */
  function say(msg){
    try{ if(typeof toast==='function'){toast(msg);return} }catch(e){}
    try{
      var d=document.createElement('div');
      d.textContent=msg;
      d.style.cssText='position:fixed;left:50%;bottom:calc(90px + var(--sa-bottom,0px));transform:translateX(-50%);background:#000c;color:#fff;padding:10px 16px;border-radius:99px;font-size:14px;z-index:2147483000;pointer-events:none';
      document.body.appendChild(d);
      setTimeout(function(){d.remove()},1800);
    }catch(e){}
  }

  /* back button:
     - on Home with nothing open: 1st back warns, 2nd back (within 2s) exits the app,
       no matter which page you came from
     - anywhere else: normal layered back (player -> detail -> tab -> Home) */
  var armed=false,armT=0;
  if(C&&C.Plugins&&C.Plugins.App){
    C.Plugins.App.addListener('backButton',function(e){
      var st=history.state||{};
      var atHome=st.t==='home'&&!st.o&&!st.h&&!st.p&&!st.w&&!st.gp;
      if(atHome||st.root||!e.canGoBack){
        if(armed){C.Plugins.App.exitApp();return}
        armed=true;
        say('Press back again to exit');
        clearTimeout(armT);
        armT=setTimeout(function(){armed=false},2000);
        return;
      }
      armed=false;
      history.back();
    });
  }
})();
