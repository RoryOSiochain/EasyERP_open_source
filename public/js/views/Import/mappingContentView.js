define([
    'Backbone',
    'jQuery',
    'Underscore',
    'text!templates/Import/FieldsTemplate.html',
    'views/Import/previewContentView',
    'constants/importMapping',
    'constants',
    'dataService',
    'common'
], function (Backbone, $, _, ContentTemplate, PreviewView, importMapping, CONSTANTS, dataService, common) {
    'use strict';

    var mappingContentView = Backbone.View.extend({
        el                    : '#content-holder',
        contentTemplate       : _.template(ContentTemplate),

        events: {
            'click #clickToReset': 'resetForm',
            'click .stageBtn': 'goToPreview',
            'click ._importListTabs' : 'changeTab',
            'click .cleanButton' : 'clean'
        },

        initialize: function () {
            var url = '/importFile/imported';
            var self = this;

            this.logFile = {};


            dataService.getData(url,{},function(data) {
                self.data = data;
                self.render(self.data);
            });
        },

        resetForm: function() {
            this.render(this.data);
        },

        clean: function(e) {
            var $field = $(e.target).closest('div').find('.secondColumn');
            var $cleanButton = $(e.target).closest('div').find('.cleanButton');
            $field.text('');
            $field.data('name', '');
            $field.addClass('empty');
            $field.closest('._rowItem').addClass('emptyRow');
            $field.removeClass('dbFieldItemDrag');
            $cleanButton.hide();
        },

        changeTab: function(e, $tab) {
            var $thisEl = this.$el;
            if (e) {
                $tab = $(e.target);
            }
            $thisEl.find('.tabItem').removeClass('active');
            $thisEl.find('.fieldsItems').removeClass('active');
            $thisEl.find('.fieldsItems[data-tab=' + $tab.data('tab') + ']').addClass('active');
            $tab.addClass('active');
        },

        goToPreview: function () {
            var $thisEl = this.$el;
            var url = '/importFile/imported';
            var $dbContentBlock = $thisEl.find('#dbContentBlock');
            var fieldsObject = {};
            var $content = $dbContentBlock.find('.content');

            for (var i = 0; i < $content.length; i++) {
                var firstColumnVal = $($content[i]).find('.firstColumn').data('name');
                var secondColumnVal = $($content[i]).find('.secondColumn').data('name');
                if (secondColumnVal) {
                    fieldsObject[firstColumnVal] = secondColumnVal;
                }
            }

            dataService.postData(url, fieldsObject, function(err, data) {
                if (err) {
                    return alert(err.responseText)
                }
                alert('post is successfull');
            });
        },

        findKeyByValue: function(obj, value) {
            var result;

            _.each(obj, function(item, key) {
                if (item === value) {
                    result = key;
                }
            });


            return result
        },

        draggableDBFields: function() {
            var self = this;
            var fieldsBlock;

            $('.dbFieldItem').droppable({
                accept   : '.dbFieldItemDrag, .fieldItem',
                tolerance: 'pointer',

                drop     : function (event, ui) {
                    var $droppable = $(this).closest('div');
                    var $draggable = ui.draggable;
                    var draggableName = $draggable.data('name');
                    var droppableName = $droppable.data('name');
                    var draggableParentName = $draggable.data('parent');
                    var droppableParentName = $droppable.data('parent');

                    if (($draggable.attr('class').indexOf('dbFieldItem') === -1) && (_.values(self.logFile).indexOf(droppableName)) !== -1) {

                        if (droppableParentName === 'customers' || droppableParentName === 'employees') {
                            delete self.logFile[self.findKeyByValue(self.logFile, droppableName)];

                            self.$el.find('.fieldsItems[data-tab=' + droppableParentName + ']')
                                .find('ul')
                                .append('<li><div class="fieldItem" data-parent="' + droppableParentName + '" style="cursor: pointer"  data-name="' + droppableName + '">' + droppableName +'</div></li>')
                                .find('div[data-name="' + droppableName +'"]')
                                .draggable({
                                    revert: true,
                                    helper: 'clone',
                                    start: function(){
                                        $(this).hide();
                                    },
                                    stop: function(){
                                        $(this).show()
                                    }
                                });
                        }
                    }

                    self.logFile[droppableName] = draggableName;
                    $droppable.removeClass('empty');
                    $droppable.closest('._rowItem').removeClass('emptyRow');
                    $droppable.text(draggableName);
                    $droppable.data('name', draggableName);

                    if ($draggable.attr('class').indexOf('dbFieldItem') !== -1) {

                        if (!droppableName.length) {
                            $droppable.addClass('dbFieldItemDrag');

                            $draggable.draggable({
                                disabled: true
                            });

                            $droppable.draggable({
                                revert: true,
                                disabled: false
                            });

                            $droppable.siblings('.cleanButton').show();

                            $draggable.siblings('.cleanButton').hide();
                            $draggable.closest('._rowItem').addClass('emptyRow');
                            $draggable.addClass('empty');
                        }

                        $droppable.data('parent', draggableParentName);
                        $draggable.data('parent', droppableParentName);

                        $draggable.text(droppableName);
                        $draggable.data('name', droppableName);
                    } else {
                        $draggable.draggable({
                            revert: false
                        });
                        if (!droppableName.length) {
                            $draggable.draggable({
                                disabled: true
                            });
                            $droppable.addClass('dbFieldItemDrag');
                            $droppable.draggable({
                                revert  : true,
                                disabled: false
                            });
                            $droppable.siblings('.cleanButton').show();
                        }

                        $droppable.data('parent', draggableParentName);
                        $draggable.remove();
                    }
                },

                over: function (event, ui) {
                    var $droppable = $(this).closest('div');

                    $droppable.closest('._rowItem').addClass('hoverRow');
                },

                deactivate: function (event, ui) {
                    var $droppable = $(this).closest('div');

                    $droppable.closest('._rowItem').removeClass('hoverRow');
                },

                out: function (event, ui) {
                    var $draggable = ui.draggable;
                    var $droppable = $(this).closest('div');

                    $draggable.draggable({
                        revert: true
                    });

                    $droppable.closest('._rowItem').removeClass('hoverRow');
                }
            });
        },

        render: function (data) {
            var $thisEl = this.$el;
            var self = this;

            $thisEl.find('#contentBlock').html(this.contentTemplate({
                content: data.result,
                fields: importMapping
            }));

            this.draggableDBFields();

            $thisEl.find('.dbFieldItemDrag').draggable({
                revert: true
            });

            $thisEl.find('.fieldItem').draggable({
                revert: true,
                helper: 'clone',
                start: function(){
                    $(this).hide();
                },
                stop: function(){
                    $(this).show()
                }
            });

            $thisEl.find('.empty').siblings('.cleanButton').hide();
            $thisEl.find('.empty').closest('._rowItem').addClass('emptyRow');
            this.changeTab(null, $thisEl.find('.tabItem[data-tab="customers"]'));
        }
    });

    return mappingContentView;
});