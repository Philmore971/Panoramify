$(document).ready(function() {
    "use strict";
    
    
    var duration="500",
    easing="swing",
    win = $(window),
    hash = location.hash || null,
    badIE = $("html").prop("class").match(/ie(6|7|8)/)|| false;
    
    
    //IE 8 and lower doesn't like the smooth pagescroll
    if(!badIE){
        window.scroll(0,0);

        $("a[href^=#]").bind("click touchstart",function(){
            hash = $(this).attr("href");
            goTo(hash);
            return false;
        });

        //if a hash is set => go to it
        if(hash){
            setTimeout(function(){
                goTo(hash);
            },500);
        }
    }
    
    //the function is called when the hash changes
    function hashchange(){
        goTo(location.hash, false);
    }
    
    //scroll to a section and set the hash
    function goTo(hash, changehash){
        win.unbind("hashchange", hashchange);
        hash = hash.replace(/!\//,'');
        win.stop().scrollTo(hash,duration,{
            easing:easing,
            axis:'y'
        });
        if(changehash !== false){
            var l = location;
            location.href = (l.protocol+'//'+l.host+l.pathname+'#!/'+hash.substr(1));
        }
        win.bind("hashchange", hashchange);
    }
    
    
    
    $("#slide-menu-toggle").bigSlide({
        menu:"#slide-menu",
        menuWidth:"300px",
    });
     
     
    $("[data-background]").each(function () {
        var href = $(this).data("background");
        if (href) {
            $(this).css("background-image", "url(" + href + ")");
        }
    });
    
    
    $("a.fancyimg").fancybox({
        "hideOnContentClick" : true
    });
});