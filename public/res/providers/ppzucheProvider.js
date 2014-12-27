define([
    "jquery",
    "underscore",
    "utils",
    "storage",
    "constants",
    "fileMgr",
    "settings",
    "fileSystem",
    "classes/Provider",
    "classes/AsyncTask",
    "eventMgr"
], function($, _, utils, storage, constants, fileMgr, settings, fileSystem, Provider, AsyncTask, eventMgr) {

    function getDomainFromUrl(url){
        var host;
        var regex = /.*\:\/\/([^\/]*)/;
        var match = url.match(regex);
        if( match && match.length ){
            host = match[0];
        }
        return host;
    }

    var PPZUCHE_CMS_LINK = "/cms/pull",
        PPZUCHE_CMS_SAVE_LINK = "/cms/save",
        CMS_DOMAIN = getDomainFromUrl(document.referrer) || "http://cp.p2pzc.com";

    var ppzucheProvider = new Provider('ppzc', "pp租车"),
        fileDesc,
        currentHTML;

    ppzucheProvider.importPublic = function ( id, callback ){
        var task = new AsyncTask(true);

        var content, url = CMS_DOMAIN + PPZUCHE_CMS_LINK + '?id=' + id;

        task.onRun(function() {
            $.getJSON(url + '&callback=?', function(result) {
                content = result;
                task.chain();
            }).fail(function() {
                task.error(new Error("Unable to access URL " + url));
            });
        });
        task.onSuccess(function() {
            callback(undefined, content);
        });
        task.onError(function(error) {
            callback(error);
        });
        task.enqueue();
    };

    ppzucheProvider.publishPreferencesInputIds = [
        "ppzc-username",
        "ppzc-password",
        "ppzc-path"
        // "ssh-username",
        // "ssh-password"
    ];

    ppzucheProvider.publish = function(publishAttributes, frontMatter, title, content, callback) {
        //sshHelper.upload(publishAttributes.host, publishAttributes.port, publishAttributes.username, publishAttributes.password, publishAttributes.path, title, content, callback);

        var data = {
            title:title,
            rc_src: fileDesc.content,
            rc_content: currentHTML.withoutComments.replace('<div class="se-section-delimiter"></div>', ''),
            username: publishAttributes.username,
            password: publishAttributes.password,
            path: publishAttributes.path
        };
        console.log(data);
        console.log(CMS_DOMAIN + PPZUCHE_CMS_LINK);

        var task = new AsyncTask();

        task.onRun(function() {
            $.ajax({
                url: CMS_DOMAIN + PPZUCHE_CMS_SAVE_LINK,
                type: "POST",
                crossDomain: true,
                data: data,
                dataType: "json",
                success:function(result){
                    //alert(JSON.stringify(result));
                    if(result.status && result.status.code === 0){
                        fileDesc.id = result.data.id;
                        fileDesc.path = publishAttributes.path,
                        fileDesc.history = JSON.stringify(result.data.history);

                        ppzucheProvider.refreshHistory();

                        task.chain();
                        callback();
                    }else{
                        var error  = new Error( result.status.message + "|stopPublish" );
                        task.error(error);
                        callback(error);
                    }
                },
                error:function(xhr,status,error){
                    //alert(status);
                    task.error(error);
                    callback(error);
                }
            });
        });

        task.enqueue();
    };

    ppzucheProvider.newPublishAttributes = function(event) {
        var publishAttributes = {};
        publishAttributes.username = utils.getInputTextValue("#input-publish-ppzc-username", event);
        publishAttributes.password = utils.getInputTextValue("#input-publish-ppzc-password", event);
        publishAttributes.path = utils.getInputTextValue("#input-publish-ppzc-path", event);
        // publishAttributes.username = utils.getInputTextValue("#input-publish-ssh-username", event);
        // publishAttributes.password = utils.getInputTextValue("#input-publish-ssh-password", event);
        // publishAttributes.path = utils.getInputTextValue("#input-publish-file-path", event);
        if(event.isPropagationStopped()) {
            return undefined;
        }
        return publishAttributes;
    };




    var initPublishButtonTmpl = [
        '<li>',
        '   <a href="#<%= id %>" title="<%= utime %>">',
        '       <i class="icon-file"></i> <%= utime.substr(0,10) %> (<%= username %>)',
        '   </a>',
        '</li>'
    ].join('');

    ppzucheProvider.refreshHistory = function (){
         //history

        if( window.viewerMode === false ) {
            // Add every provider in the panel menu
            var historyMenuElt = document.querySelector('.menu-panel .collapse-history-on .nav');
            var history = fileDesc.history && JSON.parse( fileDesc.history );

            history = history || [];

            var historyMenuHtml = _.reduce( history, function( result,  item) {
                return result + _.template(initPublishButtonTmpl, {
                    id: item.id || 'new',
                    utime: item.utime || '',
                    username: item.uuser || '匿名'
                });
            }, '');

            historyMenuElt.innerHTML = historyMenuHtml;
        }
    };

    eventMgr.addListener("onReady", function() {
        fileDesc = fileMgr.currentFile;

        function providerLoad(){
            var id = location.hash.replace('#', '');
            if(id == 'new'){
                fileDesc = fileMgr.createFile();
                fileMgr.selectFile(fileDesc);

                $('.menu-panel').collapse('hide');

            }else if( $.isNumeric(id) ) {
                ppzucheProvider.importPublic(id, function(error, content) {
                    if(error) {
                        return;
                    }
                    var data = content.data,
                        title = data.title,
                        src = data.src;

                    fileDesc = _.find(fileSystem, function(file) {
                        return file.title === title;
                    });

                    if(!fileDesc){
                        fileDesc = fileMgr.createFile(title, src);
                    }else{
                        fileDesc.content = src;
                    }

                    fileDesc.id = id;

                    fileDesc.history = JSON.stringify(data.history);
                    fileDesc.path = data.path;


                    fileMgr.selectFile(fileDesc);
                });

                $('.menu-panel').collapse('hide');
            }


        }

        providerLoad();
        //2014-12-23 fix the problem of back to list
        // function refreshHref(){
        //     var aBtn = $('#backToList');
        //     aBtn.attr({
        //         'href': CMS_DOMAIN + '/cms/list',
        //     });
        // }

        // refreshHref();

        $(window).on('hashchange', providerLoad);

    });

    // Get the html from the onPreviewFinished callback
    eventMgr.addListener("onPreviewFinished", function(htmlWithComments, htmlWithoutComments) {
        currentHTML = {
            withComments: htmlWithComments,
            withoutComments: htmlWithoutComments
        };
    });

    // Get the html from the onPreviewFinished callback
    eventMgr.addListener("onFileSelected", function() {
        fileDesc = fileMgr.currentFile;

        var publishPreferences = storage[ppzucheProvider.providerId + ".publishPreferences"];
        if( typeof publishPreferences === 'string' ){
            publishPreferences = JSON.parse(publishPreferences);
        }else{
            publishPreferences = {};
        }

        if(fileDesc.path){
            $("#input-publish-ppzc-path").attr('disabled',true);
            publishPreferences = $.extend(publishPreferences, {
                "ppzc-path": fileDesc.path
            });
        }else{
            $("#input-publish-ppzc-path").attr('disabled',false);
            publishPreferences = $.extend(publishPreferences, {
                "ppzc-path": ''
            });
        }
        storage[ppzucheProvider.providerId + ".publishPreferences"] = JSON.stringify( publishPreferences );

        if(publishPreferences) {
            _.each(ppzucheProvider.publishPreferencesInputIds, function(inputId) {
                var publishPreferenceValue = publishPreferences[inputId];
                if(_.isBoolean(publishPreferenceValue)) {
                    utils.setInputChecked("#input-publish-" + inputId, publishPreferenceValue);
                }
                else {
                    utils.setInputValue("#input-publish-" + inputId, publishPreferenceValue);
                }
            });
            utils.setInputRadio("radio-publish-format", publishPreferences.format);
            utils.setInputChecked("#checkbox-publish-custom-template", publishPreferences.customTmpl !== undefined);
            utils.setInputValue('#textarea-publish-custom-template', publishPreferences.customTmpl || settings.template);
        }

        ppzucheProvider.refreshHistory();
    });


    return ppzucheProvider;
});
