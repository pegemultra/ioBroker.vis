/**
 * Copyright (c) 2014 Steffen Schorling http://github.com/smiling-Jack
 * Lizenz: [CC BY-NC 3.0](http://creativecommons.org/licenses/by-nc/3.0/de/)
 */

var fmScriptEls =    document.getElementsByTagName('script');
var fmThisScriptEl = fmScriptEls[fmScriptEls.length - 1];
var fmFolder =       fmThisScriptEl.src.substr(0, fmThisScriptEl.src.lastIndexOf('/') + 1);

//$("head").append('<script type="text/javascript" src="../lib/js/dropzone.js"></script>');
$("head").append('<link rel="stylesheet" href="' + fmFolder + 'fileManager.css"/>');


(function ($) {
    "use strict";

    $.fm = function (options, callback) {
        var fmConn;
        if (typeof SGI != 'undefined') {
            // TO DO wraper must be created. Direct using of socket is not convenient.
            fmConn = SGI.socket;
        } else if (options.conn) {
            fmConn = options.conn;
        }

        jQuery.event.props.push('dataTransfer');

        var o = {
            lang:         options.lang || 'en',                              // de, en , ru
            // File position by socket connection
            root:         options.root || '',                                // zb. 'www/'
            path:         options.path || '/',                               // zb. 'www/dashui/'
            uploadDir:    options.uploadDir || '',
            fileFilter:   options.fileFilter || [],
            folderFilter: options.folderFilter || false,
            view:         options.view || 'table',                           // table , list
            mode:         options.mode || 'show',                            // open , save ,show
            data:         '1',
            audio:        ['mp3', 'wav', 'ogg'],
            img:          ['gif','png', 'bmp', 'jpg', 'jpeg', 'tif', 'svg'],
            icons:        ['zip', 'prg', 'js', 'css', 'mp3', 'wav'],
            userArg:      options.userArg,
            zindex:       null
//            save_data : options.save_data,
//            save_mime : options.save_mime
        };

        var uploadArray = [];
        var selFile = '';
        var selType = '';
        //Analyse path, if it is a file name
        if (o.path && o.path[o.path.length - 1] != '/') {
            var parts = o.path.split('/');
            o.currentFile = parts.pop();
            o.path = parts.join('/') + '/';
        }

        var fmWord = {
            'sort this column'                  : {'de': 'Spalte sortieren',               'en': 'sort this column',            'ru': 'Сортировать'},
            'File manager'                      : {'de': 'Datei Manager',                  'en': 'File manager',                'ru': 'Проводник'},
            'Back'                              : {'de': 'Zurück',                         'en': 'Back',                        'ru': 'Назад'},
            'Refresh'                           : {'de': 'Aktualisieren',                  'en': 'Refresh',                     'ru': 'Обновить'},
            'New folder'                        : {'de': 'Neuer Ordner',                   'en': 'New folder',                  'ru': 'Новая папка'},
            'Upload'                            : {'de': 'Upload',                         'en': 'Upload',                      'ru': 'Загрузить'},
            'Download'                          : {'de': 'Download',                       'en': 'Download',                    'ru': 'Скачать'},
            'Rename'                            : {'de': 'Umbenennen',                     'en': 'Rename',                      'ru': 'Переименовать'},
            'Delete'                            : {'de': 'Löschen',                        'en': 'Delete',                      'ru': 'Удалить'},
            'List view'                         : {'de': 'Listen Ansicht',                 'en': 'List view',                   'ru': 'Список'},
            'Preview'                           : {'de': 'Vorschau',                       'en': 'Preview',                     'ru': 'Предпросмотр'},
            'Play'                              : {'de': 'Play',                           'en': 'Play',                        'ru': 'Воспроизвести'},
            'Stop'                              : {'de': 'Stop',                           'en': 'Stop',                        'ru': 'Стоп'},
            'Show all files'                    : {'de': 'Alle Datein anzeigen',           'en': 'Show all files',              'ru': 'Показать все'},
            'File name:'                        : {'de': 'Datei Name:',                    'en': 'File name:',                  'ru': 'Имя файла: '},
            'Path:'                             : {'de': 'Pfad:',                          'en': 'Path:',                       'ru': 'Путь к файлу: '},
            'Save'                              : {'de': 'Speichern',                      'en': 'Save',                        'ru': 'Сохранить'},
            'Open'                              : {'de': 'Auswählen',                      'en': 'Select',                      'ru': 'Выбрать'},
            'Cancel'                            : {'de': 'Abbrechen',                      'en': 'Cancel',                      'ru': 'Отмена'},
            'Upload to'                         : {'de': 'Upload nach',                    'en': 'Upload to',                   'ru': 'Загрузить в'},
            'Dropbox'                           : {'de': 'Dropbox',                        'en': 'Dropbox',                     'ru': 'Dropbox'},
            'Drop the files here'               : {'de': 'Hier Datein reinziehen',         'en': 'Drop the files here',         'ru': 'Перетяните файлы сюда'},
            'Close'                             : {'de': 'Schliesen',                      'en': 'Close',                       'ru': 'Закрыть'},
            'OK'                                : {'de': 'OK',                             'en': 'OK',                          'ru': 'Ok'},
            'Cannot create folder'              : {'de': 'Ordner erstellen nicht möglich', 'en': 'Failed to create folder',     'ru': 'Невозможно создать папку'},
            'New name'                          : {'de': 'Neuer Name',                     'en': 'New name',                    'ru': 'Новое имя'},
            'Cannot rename'                     : {'de': 'Rename nicht möglich',           'en': 'Rename failed',               'ru': 'Невозможно переименовать'},
            'Delete failed'                     : {'de': 'Löschen nicht möglich',          'en': 'Delete failed',               'ru': 'Невозможно удалить'},
            'no_con'                            : {'de': 'Keine Verbindung zu Server',     'en': 'Cannot connect to server',    'ru': 'Нет соединения с сервером'},
            'Name'                              : {'de': 'Name',                           'en': 'Name',                        'ru': 'Имя'},
            'Type'                              : {'de': 'Typ',                            'en': 'Type',                        'ru': 'Тип'},
            'Size'                              : {'de': 'Größe',                          'en': 'Size',                        'ru': 'Размер'},
            'Date'                              : {'de': 'Datum',                          'en': 'Date',                        'ru': 'Дата'},
            'Upload possible only to '          : {'de': 'Kann laden nur in ',             'en': 'Upload possible only to ',    'ru': 'Загрузка возможна только в '}

        };

        function fmTranslate(text) {

            if (fmWord[text]) {
                if (fmWord[text][o.lang]) {
                    return fmWord[text][o.lang];

                } else if (fmWord[text].en)
                    console.warn(text);
                return fmWord[text].en;
            } else {
                console.warn(text);
                return text;
            }
        }

        function load(path) {
            try {
                fmConn.readDir(path, function (err, data) {
                    o.data = data;
                    var p = path.replace(o.root, '');
                    $('.fm_path').text(fmTranslate('Path:') + ' ' + p);
                    build(o);
                });
            } catch (err) {
                alert(fmTranslate('No connection to server'));
            }
        }

        function read(o, files, uploadArray) {

            var reader = new FileReader();
            reader.onload = function () {
                uploadArray.push({name: files[0].name, value: reader.result});


                var type = files[0].name.split(".").pop();
                var icon = "undef";
                var class_name = files[0].name.split(".")[0].replace(" ", "_");

                if (o.img.indexOf(type) > -1) {


                    $("#fm_add_dropzone").append(
                        '<div class="fm_prev_container ' + class_name + '" data-file="' + files[0].name + '">' +
                        '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + reader.result + '"/></div>' +
                        '<div class="fm_prev_name">' + files[0].name + '</div>' +
                        '<div class="fm_prev_overlay"></div>' +
                        '</div>');

                } else {
                    if (o.icons.indexOf(type) > -1) {
                        icon = type;
                    }

                    $("#fm_add_dropzone").append(
                        '<div class="fm_prev_container ' + class_name + '" data-file="' + files[0].name + '">' +
                        '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + fmFolder + 'icon/mine/128/' + icon + '.png"/></div>' +
                        '<div class="fm_prev_name">' + files[0].name + '</div>' +
                        '<div class="fm_prev_overlay"></div>' +
                        '</div>');
                }
                files.shift();
                if (files.length > 0) {
                    read(o, files, uploadArray);
                } else {
                    $('.dialog_fm_add > *').css({cursor: "default"});
                }
            };
            reader.readAsDataURL(files[0]);
        }

        function build(o) {

            $(".fm_files").empty();
            $("#fm_table_head").remove();
            $("#fm_bar_play, #fm_bar_stop, #fm_bar_down, #fm_bar_del").button('disable');

            if (o.data !== undefined && o.view == "table") {

                $('<div id="fm_table_head">' +
                    ' <button id="fm_table_head_name" >'  + fmTranslate('Name') + '</button>' +
                    ' <button id="fm_table_head_type" >'  + fmTranslate('Type') + '</button>' +
                    ' <button id="fm_table_head_size" >'  + fmTranslate('Size') + '</button>' +
                    ' <button id="fm_table_head_datum" >' + fmTranslate('Date') + '</button>' +
                    '</div>').insertAfter(".fm_path");

                $("#fm_table_head_name").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_name").trigger("click");
                });
                $("#fm_table_head_type").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_type").trigger("click");
                });
                $("#fm_table_head_size").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_size_roh").trigger("click");
                });
                $("#fm_table_head_datum").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_datum").trigger("click");
                });

                $(".fm_files").append(
                        '<table id="fm_table"  width="560px">' +
                        ' <tbody width="560px" class="fm_file_table">' +
                        '  <tr id="fm_tr_head" class="ui-state-default ui-corner-top">' +
                        '   <th id="fm_th_icon"  class="fm_th" width="24px"></td>' +
                        '   <th id="fm_th_name" class="fm_th" >' + fmTranslate("Name") + '</td>' +
                        '   <th id="fm_th_type" class="fm_th" class="fm_td_hide">' + fmTranslate("Type") + '</td>' +
                        '   <th id="fm_th_size_roh" class="fm_th" class="fm_td_hide">Size_roh</td>' +
                        '   <th id="fm_th_size" class="fm_th"  style="text-align:right" width="70px">' + fmTranslate("Size") + '</td>' +
                        '   <th id="fm_th_datum" class="fm_th" style="text-align:right" width="220px">' + fmTranslate("Datum") + '</td>' +
                        '   <th class="fm_th" width="10px"></td>' +
                        '  </tr>' +
                        ' </tbody>' +
                        '</table>');

                $.each(o.data, function () {

                    function formatBytes(bytes) {
                        if (bytes < 1024) {
                            return bytes + " B";
                        }
                        else if (bytes < 1048576) {
                            return(bytes / 1024).toFixed(0) + ' kb';
                        }
                        else if (bytes < 1073741824) {
                            return(bytes / 1048576).toFixed(0) + ' Mb';
                        }
                        else {
                            return(bytes / 1073741824).toFixed(0) + ' Gb';
                        }
                    }
                    var date;
                    var time;
                    var type;
                    var filter;

                    if (this.stats.nlink > 1 || this.isDir) {
                        date = this.stats.ctime.split('T')[0];
                        time = this.stats.ctime.split('T')[1].split(".")[0];
                        type = this.file.split(".")[1] || "";
                        filter = "fm_folderFilter";

                        $(".fm_file_table").append(
                            '<tr class="fm_tr_folder ' + filter + ' fm_tr ui-state-default no_background">' +
                            '<td width="24px"><img src="' + fmFolder + 'icon/mine/24/folder-brown.png"/></td>' +
                            '<td>' + this.file + '</td>' +
                            '<td class="fm_td_hide">' + type + '</td>' +
                            '<td class="fm_td_hide">' + 0 + '</td>' +
                            '<td style="text-align:right" width="100px"></td>' +
                            '<td style="text-align:right ;margin-right: 20px" width="220px">' + date + ' ' + time + '</td>' +
                            '<th class="fm_th" width="10px"></td>' +
                            '</tr>');
                    } else {
                        var icons = ['zip', 'prg', 'js', 'png', 'svg', 'jpg', 'gif', 'bmp', 'css', 'mp3', 'wav'];
                        var icon = 'undef';
                        date = this.stats.ctime.split('T')[0];
                        time = this.stats.ctime.split('T')[1].split(".")[0];
                        type = this.file.split(".").pop() || "";
                        filter = '';

                        if (icons.indexOf(type) > -1) {
                            icon = type;
                        }
                        if (o.fileFilter.indexOf(type) == -1) {
                            filter = 'fm_fileFilter';
                        }

                        $('.fm_file_table').append(
                            '<tr class="fm_tr_file ' + filter + ' fm_tr ui-state-default no_background">' +
                            '<td width="24px"><img src="' + fmFolder + 'icon/mine/24/' + icon + '.png"/></td>' +
                            '<td>' + this.file + '</td>' +
                            '<td class="fm_td_hide">' + type + '</td>' +
                            '<td class="fm_td_hide">' + this.stats.size + '</td>' +
                            '<td style="text-align:right" width="100px">' + formatBytes(this.stats.size) + '</td>' +
                            '<td style="text-align:right ;margin-right: 20px" width="220px">' + date + ' ' + time + '</td>' +
                            '<th class="fm_th" width="10px"></td>' +
                            '</tr>');
                    }
                });

                $('#fm_th_name, #fm_th_type, #fm_th_size, #fm_th_datum')
                    .mouseenter(function () {
                        $(this).addClass("ui-state-focus");
                    })
                    .mouseleave(function () {
                        $(this).removeClass("ui-state-focus");
                    })
                    .click(function () {
                        $(this).effect("highlight");
                    });

                // sort Table _____________________________________________________
                var table = $('#fm_table');
                $('#fm_th_name, #fm_th_type, #fm_th_size_roh, #fm_th_datum')
                    .wrapInner('<span title="' + fmTranslate("sort this column") + '"/>')
                    .each(function () {
                        var th = $(this),
                            thIndex = th.index(),
                            inverse = false;
                        th.click(function () {
                            table.find('td').filter(function () {
                                return $(this).index() === thIndex;
                            }).sortElements(function (a, b) {

                                if (parseInt($(a).text())) {
                                    return parseInt($.text([a])) > parseInt($.text([b])) ?
                                        inverse ? -1 : 1
                                        : inverse ? 1 : -1;
                                } else {

                                    return $.text([a]).toLowerCase() > $.text([b]).toLowerCase() ?
                                        inverse ? -1 : 1
                                        : inverse ? 1 : -1;
                                }

                            }, function () {
                                return this.parentNode;
                            });
                            inverse = !inverse;
                        });
                    });
                $("#fm_th_name").trigger("click");
                $("#fm_th_type").trigger("click");

                // sort Table----------------------------------------------------------

                $(".fm_tr > *").click(function (e) {

                    $(".fm_table_selected").addClass("ui-state-default no_background");
                    $(".fm_table_selected").removeClass("fm_table_selected ui-state-highlight");
                    if ($(e.target).hasClass("fm_tr")) {
                        $(this).addClass("fm_table_selected ui-state-highlightt");
                        $(this).removeClass("ui-state-default no_background");
                    } else {
                        $(this).parent(".fm_tr").addClass("fm_table_selected ui-state-highlight");
                        $(this).parent(".fm_tr").removeClass("ui-state-default no_background");
                    }

                    var type = $($(".fm_table_selected").children().toArray()[2]).text();
                    var name = $($(".fm_table_selected").children().toArray()[1]).text();

                    if (!type) {
                        selType = "folder";
                        selFile = name;
                        $("#fm_bar_down").button('disable');
                        $("#fm_bar_del").button('enable');

                    } else {
                        selType = "file";
                        selFile = name;
                        $("#fm_inp_save").val(selFile.split(".")[0]);
                        $("#fm_bar_down").button('enable');
                        $("#fm_bar_del").button('enable');
                    }

                    if (o.audio.indexOf(type) > -1) {
                        $("#fm_bar_play , #fm_bar_stop").button('enable');
                    } else {
                        $("#fm_bar_play, #fm_bar_stop").button('disable');
                    }
                });

                $(".fm_tr_folder").dblclick(function () {
                    o.path += $((this).children[1]).text() + "/";
                    load(o.path);
                });

                if (document.getElementById("script_scrollbar")) {
                    $(".fm_files").css({
                        height: "auto",
                        overflow: "visible"
                    });
                    $('#fm_scroll_pane').css({
                        height: "calc(100% - 187px) ",
                        scrollTop: 0
                    });
                    $('#fm_scroll_pane').scrollTop(0);
                    $('#fm_scroll_pane').perfectScrollbar('update');

                } else {
                    $(".fm_files").css({
                        height: "calc(100% - 188px) "
                    });
                }
            }

            if (o.data !== undefined && o.view == 'prev') {
                var path = o.root ? o.path.split(o.root)[1] : o.path;

                if (o.uploadDir) {
                    if (path.substring(0, o.uploadDir.length) == o.uploadDir) {
                        $('#fm_bar_add').button('enable');
                    } else {
                        $('#fm_bar_add').button('disable').attr('title', fmTranslate('Upload possible only to ') + o.uploadDir);
                    }
                }

                $.each(o.data, function () {

                    if (this.stats.nlink > 1 || this.isDir) {
                        var type = "_";
                        $(".fm_files").append(
                                '<div class="fm_prev_container fm_folderFilter" data-sort="' + type + '">' +
                                '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + fmFolder + 'icon/mine/128/folder-brown.png"/></div>' +
                                '<div class="fm_prev_name">' + this.file + '</div>' +
                                '<div class="fm_prev_overlay"></div>' +
                                '</div>');

                    } else {
                        var name = this.file.split(".")[0];
                        var _type = this.file.split(".")[1] || "";
                        var icon = "undef";
                        var filter = "";
                        if (o.fileFilter.indexOf(_type) == -1) {
                            filter = "fm_fileFilter";
                        }

                        if (name.length > 0) {
                            // if image
                            if (o.img.indexOf(_type) > -1) {

                                $(".fm_files").append(
                                    '<div class="fm_prev_container ' + filter + '" data-sort="' + _type + '">' +
                                    '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + path + this.file + '"/></div>' +
                                    '<div class="fm_prev_name">' + this.file + '</div>' +
                                    '<div class="fm_prev_overlay"></div>' +
                                    '</div>');

                            } else {
                                if (o.icons.indexOf(_type) > -1) {
                                    icon = _type;
                                }

                                $(".fm_files").append(
                                        '<div class="fm_prev_container ' + filter + '" data-sort="' + _type + '">' +
                                        '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + fmFolder + 'icon/mine/128/' + icon + '.png"/></div>' +
                                        '<div class="fm_prev_name">' + this.file + '</div>' +
                                        '<div class="fm_prev_overlay"></div>' +
                                        '</div>');
                            }
                        }
                    }
                });

                var div = $('.fm_files');
                var listitems = div.children('.fm_prev_container').get();
                listitems.sort(function (a, b) {

                    return ($(a).attr('data-sort') < $(b).attr('data-sort')) ?
                        -1 : ($(a).attr('data-sort') > $(b).attr('data-sort')) ?
                        1 : 0;
                });

                $.each(listitems, function (idx, itm) {
                    div.append(itm);
                });

                if (document.getElementById("script_scrollbar")) {

                    $(".fm_files").css({
                        height: "auto",
                        overflow: "visible"
                    });
                    $('#fm_scroll_pane').css({
                        height: "calc(100% - 150px) ",
                        scrollTop: 0
                    });
                    $('#fm_scroll_pane').scrollTop(0);
                    $('#fm_scroll_pane').perfectScrollbar('update');

                } else {
                    $(".fm_files").css({
                        height: "calc(100% - 151px)"
                    });
                }

                $(".fm_prev_overlay").click(function () {
                    var type = $(this).parent().data("sort");

                    $(".fm_prev_selected").removeClass("fm_prev_selected");
                    $(this).addClass("fm_prev_selected");

                    if (type == "_") {
                        selType = "folder";
                        selFile = $(this).prev().text();

                        $("#fm_bar_down").button('disable');
                        $("#fm_bar_del").button('enable');

                    } else {
                        selType = "file";
                        selFile = $(this).prev().text();
                        $("#fm_inp_save").val(selFile.split(".")[0]);
                        $("#fm_bar_down").button('enable');
                        $("#fm_bar_del").button('enable');
                    }

                    if (o.audio.indexOf(type) > -1) {
                        $("#fm_bar_play , #fm_bar_stop").button('enable');
                    } else {
                        $("#fm_bar_play, #fm_bar_stop").button('disable');
                    }
                });

                $(".fm_prev_overlay").dblclick(function () {
                    var type = $(this).parent().data("sort");

                    if (type == "_") {
                        o.path += $(this).prev().text() + "/";
                        load(o.path);
                    } else {
                        // Select immediately this image
                        $('#fm_btn_open').trigger('click');
                    }
                });
            }

            if ($("#fm_bar_all").hasClass("ui-state-error")) {
                $(".fm_folderFilter").show();
                $(".fm_fileFilter").show();
            } else {
                $(".fm_fileFilter").hide();
                if (o.folderFilter) {
                    $(".fm_folderFilter").hide();
                }
            }

            if (o.view == "prev" && $("#fm_bar_all").hasClass("ui-state-error")) {
                $(".fm_fileFilter").css({display: "inline-table"});
            }

            if (o.path == o.root) {

                $("#fm_bar_back").trigger("mouseleave");
                $("#fm_bar_back").button("option", "disabled", true);
            } else {
                $("#fm_bar_back").button("option", "disabled", false);
            }

            if (o.currentFile) {
                $('.fm_prev_name').each(function () {
                    if ($(this).html() == o.currentFile) {
                        $(this).parent().find('.fm_prev_overlay').trigger('click');
                        return false;
                    }
                });
                o.currentFile = null;
            }
        }

        $("body").append(
                '<div id="dialog_fm" class="fm_dialog" style="text-align: center" title="' + fmTranslate('File manager') + '">' +
                '<input class="focus_dummy" style="border:none;height: 1px;padding: 1px;width: 1px;background: transparent; display: flex;" type="button"/>' +
                '<div class="fm_iconbar ui-state-default ui-corner-all">' +
                '<div class="fm_bar_back_behind"></div>' +
                '<button id="fm_bar_back"    style="background-image: url(' + fmFolder + 'icon/circleLeftIcon.png)"                                                                     title="' + fmTranslate('Back') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/refresh.png"       id="fm_bar_refresh"          style="margin-left:40px"   class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Refresh') + '" />' +
                '<img src="' + fmFolder + 'icon/actions/folder-new-7.png"  id="fm_bar_addfolder"        style="margin-left:20px"   class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('New folder') + '" />' +
                '<img src="' + fmFolder + 'icon/actions/up.png"            id="fm_bar_add"              style=""                    class="fm_bar_icon ui-corner-all ui-state-default" title="' + fmTranslate('Upload') + '" />' +
                '<img src="' + fmFolder + 'icon/actions/down.png"          id="fm_bar_down"                                        class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Download') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/edit-rename.png"   id="fm_bar_rename"                                      class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Rename') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/delete.png"        id="fm_bar_del"                                         class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Delete') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/list.png"          id="fm_bar_list"             style=" margin-left:20px"  class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('List view') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/icons.png"         id="fm_bar_prev"                                        class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Preview') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/play.png"          id="fm_bar_play"             style=" margin-left:20px"  class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Play') + '"/>' +
                '<img src="' + fmFolder + 'icon/actions/stop.png"          id="fm_bar_stop"                                        class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fmTranslate('Stop') + '"/>' +
                '<button  id="fm_bar_all" class="fm_bar_all" title="' + fmTranslate('Show all files') + '"></button>' +
                '</div>' +
                '<div class="fm_path ui-state-default no_background">' +
                '</div>' +
                '<div class="fm_files ui-state-default no_background">' +
                '</div>' +
                '<div class="fm_buttonbar">' +
                '<div id="fm_save_wrap">' +
                '<div>' + fmTranslate('File name:') + '</div>' +
                '<input type="text" id="fm_inp_save">' +
                '</div>' +
                '<div id="fm_btn_wrap">' +
                '<button id="fm_btn_save" >' + fmTranslate('Save') + '</button>' +
                '<button id="fm_btn_open" >' + fmTranslate('Open') + '</button>' +
                '<button id="fm_btn_cancel" >' + fmTranslate('Cancel') + '</button>' +
                '</div>' +
                '</div>' +
                '</div>');

        $("#dialog_fm").dialog({
            height:    $(window).height() - 100,
            width:     835,
            minWidth:  672,
            minHeight: 300,
            resizable: true,
            modal:     true,
            close: function () {
                $("#dialog_fm").remove();
            }
        });
        // Set z-index of dialog
        if (o.zindex !== null) $('div[aria-describedby="dialog_fm"]').css({'z-index': o.zindex});

        if (o.mode == "show") {
            $(".fm_buttonbar").hide();
        }
        if (o.mode == "save") {
            $("#fm_btn_open").hide();
        }
        if (o.mode == "open") {
            $("#fm_save_wrap").hide();
            $("#fm_btn_save").hide();
        }

        $(".fm_bar_icon").button();
        $("#fm_bar_back")
            .button()
            .click(function () {
                var path_arry = o.path.split("/");
                path_arry.pop();
                path_arry.pop();
                if (path_arry.length === 0) {
                    o.path = '';
                } else {
                    o.path = path_arry.join('/') + '/';
                }

                if (o.path == o.root) {
                    $("#fm_bar_back").trigger('mouseleave');
                    $("#fm_bar_back").button("option", "disabled", true);
                }

                load(o.path);
            });

//        $("#fm_bar_play, #fm_bar_stop, #fm_bar_down").button('disable');

        if (document.getElementById("script_scrollbar")) {
            $(".fm_files").wrap('<div id="fm_scroll_pane" class="ui-state-default no_background"></div>');

            $(".fm_files").css({
                minHeight: "100%",
                height: "auto",
                width: "calc(100% - 4px)",
                border: "none"
            });

            $("#fm_scroll_pane").perfectScrollbar({
                wheelSpeed: 40,
                suppressScrollX: true
            });
        }
        if (!o.folderFilter) {
            $('#fm_bar_folder').addClass('ui-state-error');
        }

        load(o.path);

        $("#fm_bar_all")
            .button({
                icons: {
                    primary: "ui-icon-gear"
                }
            })
            .click(function () {

                $(this).toggleClass('ui-state-error');
                if ($(this).hasClass('ui-state-error')) {

                    $(".fm_fileFilter").show();
                    $(".fm_folderFilter").show();
                    if (o.view == "prev") {
                        $(".fm_fileFilter").css({display: "inline-table"});
                    }
                } else {
                    $(".fm_fileFilter").hide();
                    if (o.folderFilter) {
                        $(".fm_folderFilter").hide();
                    }
                }
                $(this).removeClass("ui-state-focus");
            });

        $(".fm_bar_icon")
            .mouseenter(function () {
                $(this).addClass("ui-state-focus");
            })
            .mouseleave(function () {
                $(this).removeClass("ui-state-focus");
            })
            .click(function () {
                var id = $(this).attr("id");


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_refresh") {
                    load(o.path);
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_add") {

                    $('#dialog_fm').append(
                            '<div id="dialog_fm_add" title="' + fmTranslate("Upload to") + ' ' + $(".fm_path").text() + '">' +
                            '<div id="fm_add_dropzone" ondragover="return false" class="dropzone ui-corner-all ui-state-highlight">' +
                            '<p class="fm_dropbox_text">' + fmTranslate('Dropbox') + '<br>' + fmTranslate('Drop the files here') + ' </p>' +
                            '</div>' +
                            '<div class="fm_add_buttonbar">' +
                            '    <button id="btn_fm_add_ok">' + fmTranslate('Upload') + '</button>' +
                            '    <button id="btn_fm_add_close" >' + fmTranslate('Close') + '</button>' +
                            '</div>' +
                            '<input type="file" id="fm_open_file" style="height: 0; width: 0 "/>' +
                            '</div>');

                    $('#dialog_fm_add').dialog({
                        dialogClass: "dialog_fm_add",
                        resizable: false,
                        draggable: false,
                        close: function () {
                            $('#dialog_fm_add').remove();
                            load(o.path);
                        }
                    });

                    var files = [];

                    $("#fm_dropbox_text").click(function () {
                        $("#fm_open_file").trigger("click");
                    });

                    $('#fm_add_dropzone').bind('drop', function (e) {
                        try {

                            $.each(e.dataTransfer.files, function () {
                                files.push(this);
                            });

                            $('.dialog_fm_add > *').css({cursor: "wait"});

                            read(o, files, uploadArray);
                            return false;
                        }
                        catch (err) {
                            alert(err);
                            return false;
                        }
                    });
                    try {
                        $("#btn_fm_add_ok").button().click(function () {
                            function upload() {
                                try {
                                    fmConn.writeFile64(o.path + uploadArray[0].name, uploadArray[0].value.split('base64,')[1], function (err, data) {

                                        // TODO Leerzeichem im Dateinmaen Berucksichtigen (da in classen keine leertzeichen sein dürfen)
                                        var class_name = uploadArray[0].name.split(".")[0].replace(" ", "_");
                                        $("." + class_name).remove();

                                        uploadArray.shift();
                                        if (uploadArray.length > 0) {
                                            upload();
                                        } else {
                                            $('.dialog_fm_add > *').css({cursor: "default"});
                                        }

                                    });

                                } catch
                                    (err) {
                                    console.log(err);
                                    $('.dialog_fm_add > *').css({cursor: "default"});
                                }
                            }

                            $('.dialog_fm_add > *').css({cursor: "wait"});
                            upload();
                        });

                        $("#btn_fm_add_close").button().click(function () {
                            $('#dialog_fm_add').remove();
                            load(o.path);
                        });
                    } catch (err) {
                        alert(err);
                    }
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_addfolder") {
                    try {

                        $('#dialog_fm').append(
                                '<div id="dialog_fm_folder" style="text-align:center" title="' + fmTranslate('New folder') + '">' +
                                '<br>' +
                                '<input type="text" id="fm_inp_folder" style="width: 360px" value=""/>' +
                                '<br><br><button style="width: 150px;" id="fm_btn_folder">' + fmTranslate('OK') + '</button>' +
                                '</div>');

                        $('#dialog_fm_folder').dialog({
                            dialogClass: "dialog_fm_rename",
                            resizable: false,
                            draggable: false,
                            modal: true,
                            close: function () {
                                $('#dialog_fm_folder').remove();
                            }
                        });

                        $("#fm_btn_folder").button().click(function () {
                            var new_folder = $("#fm_inp_folder").val();
                            $('#dialog_fm_folder').remove();

                            if (new_folder !== '' || new_folder !== undefined) {
                                fmConn.mkdir(o.path + new_folder, function (err) {
                                    if (err) {
                                        console.log(err);
                                        alert(fmTranslate('Cannot create folder'));
                                    } else {
                                        load(o.path);
                                    }
                                });
                            }
                        });
                    } catch (err) {
                        alert(err);
                    }

                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_down") {
                    try {
                        fmConn.readFile64(o.path + selFile, function (err, data) {
                            console.log(data);
                            $("body").append('<a id="fm_download" href=" data:' + data.mime + ';base64,' + data.data + '" download="' + selFile + '"></a>');
                            document.getElementById('fm_download').click();
                            document.getElementById('fm_download').remove();
                        });
                    } catch (err) {
                        alert(err);
                    }
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_rename") {
                    try {
                        $('#dialog_fm').append(
                                '<div id="dialog_fm_rename" style="text-align:center" title="' + fmTranslate('Neuer Name') + '">' +
                                '<br>' +
                                '<input type="text" id="fm_inp_rename" style="width: 360px" value="' + selFile + '"/>' +
                                '<br><br><button style="width: 150px;" id="fm_btn_rename">' + fmTranslate('OK') + '</button>' +
                                '</div>');

                        $('#dialog_fm_rename').dialog({
                            dialogClass: "dialog_fm_rename",
                            resizable: false,
                            draggable: false,
                            modal: true,
                            close: function () {
                                $('#dialog_fm_rename').remove();
                            }
                        });

                        $("#fm_btn_rename").button().click(function () {
                            var new_name = $("#fm_inp_rename").val();
                            $('#dialog_fm_rename').remove();

                            if (new_name !== "" || new_name !== undefined) {
                                fmConn.renameFile(o.path + selFile, o.path + new_name, function (err) {
                                    if (err) {
                                        console.log(err);
                                        alert(fmTranslate('Cannot rename'));
                                    } else {
                                        load(o.path);
                                    }
                                });
                            }
                        });
                    } catch (err) {
                        alert(err);
                    }
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_del") {
                    try {
                        fmConn.unlink(o.path + selFile, function (err) {
                            if (err) {
                                console.log(err);
                                alert(fmTranslate('Delete failed'));
                            }
                            load(o.path);
                        });
                    } catch (err) {
                        alert('ordner \n' + err);
                    }

                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_list") {
                    o.view = "table";
                    build(o);
                }
                if (id == "fm_bar_prev") {
                    o.view = "prev";
                    build(o);
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_play") {
                    if (document.getElementById('fm_sound_play')) {
                        document.getElementById('fm_sound_play').remove();
                    }
                    $("#dialog_fm").append('<audio id="fm_sound_play" src="' + o.path.split(o.root)[1] + selFile + '"></audio>');
                    document.getElementById('fm_sound_play').play();

                }
                if (id == "fm_bar_stop") {
                    document.getElementById('fm_sound_play').remove();
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

                $(this).effect("highlight");
            });


        $("#fm_btn_cancel").button().click(function () {
            $("#dialog_fm").remove();
        });

        $("#fm_btn_open").button().click(function () {
            $("#dialog_fm").remove();
            return callback({
                path: o.path,
                file: selFile
            }, o.userArg);
        });
        $("#fm_btn_save").button().click(function () {
            var file = $("#fm_inp_save").val();
            $("#dialog_fm").remove();
            return callback({
                path: o.path,
                file: file
            }, o.userArg);
        });
    };
})
(jQuery);

jQuery.fn.sortElements = (function () {
    var sort = [].sort;
    return function (comparator, getSortable) {
        getSortable = getSortable || function () {
            return this;
        };
        var placements = this.map(function () {
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
            // Since the element itself will change position, we have
            // to have some way of storing it's original position in
            // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
            return function () {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
//                Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function (i) {
            placements[i].call(getSortable.call(this));
        });
    };
})();


