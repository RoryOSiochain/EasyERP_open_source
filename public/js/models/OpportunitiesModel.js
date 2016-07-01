﻿define([
    'Backbone',
    'Underscore',
    'moment',
    'Validation',
    'constants'
], function (Backbone, _, moment, Validation, CONSTANTS) {
    'use strict';

    var OpportunityModel = Backbone.Model.extend({
        idAttribute: '_id',
        defaults   : {
            isOpportunitie : true,
            name           : '',
            expectedRevenue: {
                value   : 0,
                currency: '$',
                progress: ''
            },

            company: {
                id  : '',
                name: ''
            },

            contactName: {
                first: '',
                last : ''
            },

            customer: {
                id  : '',
                name: ''
            },

            address: {
                street : '',
                city   : '',
                state  : '',
                zip    : '',
                country: ''
            },

            email: '',

            phones: {
                mobile: '',
                phone : '',
                fax   : ''
            },

            func         : '',
            salesPerson  : null,
            salesTeam    : null,
            internalNotes: '',

            nextAction: {
                date: null,
                desc: ''
            },

            expectedClosing: null,
            priority       : 'Trivial',
            categories     : '',
            active         : true,
            optout         : false,
            reffered       : '',
            workflow       : ''
        },

        urlRoot: function () {
            return CONSTANTS.URLS.OPPORTUNITIES;
        },

        initialize: function () {
            this.on('invalid', function (model, errors) {
                var msg;

                if (errors.length > 0) {
                    msg = errors.join('\n');

                    App.render({
                        type   : 'error',
                        message: msg
                    });
                }
            });
        },

        parse: function (response) {
            if (!response.data) {
                if (response.creationDate) {
                    response.creationDate = moment(response.creationDate).format('DD MMM, YYYY');
                }

                if (response.expectedClosing) {
                    response.expectedClosing = moment(response.expectedClosing).format('DD MMM, YYYY');
                }

                if (response.nextAction) {
                    response.nextAction.date = moment(response.nextAction.date).format('DD MMM, YYYY');
                }

                if (response.convertedDate) {
                    response.convertedDate = moment(response.convertedDate).format('DD MMM, YYYY');
                }

                if (response.createdBy) {
                    response.createdBy.date = moment(response.createdBy.date).format('DD MMM, YYYY, H:mm:ss');
                }

                if (response.editedBy) {
                    response.editedBy.date = moment(response.editedBy.date).format('DD MMM, YYYY, H:mm:ss');
                }

                if (response.notes) {
                    _.map(response.notes, function (note) {
                        note.date = moment(note.date).format('DD MMM, YYYY, H:mm:ss');
                        return note;
                    });
                }

                if (response.attachments) {
                    _.map(response.attachments, function (attachment) {
                        attachment.uploadDate = moment(attachment.uploadDate).format('DD MMM, YYYY, H:mm:ss');
                        return attachment;
                    });
                }
            }
            return response;
        },

        validate: function (attrs) {
            var errors = [];
            Validation.checkGroupsNameField(errors, true, attrs.name, 'Subject');
            if (attrs.expectedClosing && attrs.nextAction) {
                Validation.checkFirstDateIsGreater(errors, attrs.expectedClosing, 'expected closing date', attrs.nextAction.date, 'Next action date');
            }
            Validation.checkCountryCityStateField(errors, false, attrs.address.country, 'Country');
            Validation.checkCountryCityStateField(errors, false, attrs.address.state, 'State');
            Validation.checkCountryCityStateField(errors, false, attrs.address.city, 'City');
            Validation.checkMoneyField(errors, false, attrs.expectedRevenue.value, 'Expected revenue');
            if (errors.length > 0) {
                return errors;
            }
        }
    });
    return OpportunityModel;
});
