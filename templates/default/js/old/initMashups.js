var qlik;
var curApp;

var rootPath=window.location.hostname;
var portUrl="80";
if(window.location.port==""){
    if("https:" == window.location.protocol)
        portUrl="443";
    else{
        portUrl="80";
    }
}
else
    portUrl=window.location.port;
var pathRoot="//localhost:4848/extensions/";
if(portUrl!="4848")
    pathRoot="//"+rootPath+":"+portUrl+"/resources/";

var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: "https:" === window.location.protocol
};
require.config( {
    waitSeconds:0,
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + ( config.port ? ":" + config.port : "" ) + config.prefix + "resources",
    paths: {
        jquery: pathRoot +'mdemo/templates/admin/js/libs/jquery-2.1.1.min',
        "edit":pathRoot +'mdemo/templates/carousel/js/editable',
        "boot"  : pathRoot +"mdemo/templates/carousel/js/bootstrap.min"
    },
    shim: {
        'edit': {
            deps: ['jquery'],
            exports: 'appl'
        },
        'boot': {
            deps: ['jquery'],
            exports: 'boot'
        }
    }
} )( ["js/qlik","jquery","edit","boot"], function ( qlikview,$ ){

    qlik=qlikview;
    var app;
    if(getURLParameter('app')!='undefined'){
        console.log("app in : " +getURLParameter('app'));
        app = qlikview.openApp(decodeURI(getURLParameter('app')), config);
        curApp=app;
        qlikview.setOnError( function ( error ) {
            alert( error.message );
        } );
    }
    restoreObj(app);
});



function makeDroppy() {
    $(".qvplaceholder").on('dragover', function (event) {
        event.preventDefault();
        $(this).addClass("drop-hover");
    }).on('dragleave', function (event) {
        event.preventDefault();
        $(this).removeClass("drop-hover");
    }).on('drop', function (event) {
        var app = qlik.openApp(decodeURI(getURLParameter('app')), config);
        $(this).removeClass("drop-hover");
        event.preventDefault();
        $(this).empty();
        var id = event.originalEvent.dataTransfer.getData('text').split("#")[1];
        var type = event.originalEvent.dataTransfer.getData('text').split("#")[0];
        $(this).removeClass('qv');
        $(this).removeClass('qvtarget');
        if (type != 'snapshot') {
            qlik.openApp(app.id).getObject($('#CurrentSelections'), 'CurrentSelections');
            localStorage.setItem(this.id + '#' + app.id, id);
            qlik.openApp(app.id).getObject(this, id).then(function (o) {
            });
        }
        else {
            localStorage.setItem(this.id + '#' + app.id, id + '#snap');
            qlik.openApp(app.id).getSnapshot(this, id).then(function () {
            });
        }
    })
}

function restoreObj(){
    setTimeout(function(){
        makeDroppy();
        excludeBS();
        makeEdit();
        if(qlik && getURLParameter('app')!='undefined') {
            var appId = decodeURI(getURLParameter('app'));
            $('#CurrentSelections').empty();
            curApp.getObject($('#CurrentSelections'), 'CurrentSelections');
            $('.qvplaceholder').each(function (index) {
                if (appId && localStorage.getItem(this.id + '#' + appId) && localStorage.getItem(this.id + '#' + appId).split('#').length == 1) {
                    $(this).empty();
                    $(this).removeClass('qv');
                    $(this).removeClass('qvtarget');
                    curApp.getObject(this, localStorage.getItem(this.id + '#' + appId));
                } else if (appId && localStorage.getItem(this.id + '#' + appId) && localStorage.getItem(this.id + '#' + appId).split('#').length > 1) {

                    $(this).empty();
                    $(this).removeClass('qv');
                    $(this).removeClass('qvtarget');
                    curApp.getSnapshot(this, localStorage.getItem(this.id + '#' + appId).split('#')[0]);
                }
                else {
                    $(this).empty();
                    $(this).addClass('qv');
                    $(this).addClass('qvtarget');
                }
            })
        }
    },100);
}

function getURLParameter(a) {
    return (RegExp(a + "=(.+?)(&|$)").exec(location.search) || [null, null])[1]
}

function excludeBS(){
    $("#main").find('*').each(function(){
        if(!$(this).hasClass('qvobject'))
            $(this).addClass('qv');
    });
}
