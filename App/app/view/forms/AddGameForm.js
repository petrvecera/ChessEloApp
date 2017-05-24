/*
 * File: app/view/forms/AddGameForm.js
 *
 * This file was generated by Sencha Architect
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 6.5.x Modern library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 6.5.x Modern. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

/*
    Added Ext.Toast to the requires because we are using it in the viewcontroller
*/
Ext.define('Enif.view.forms.AddGameForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.forms.addgameform',

    requires: [
        'Enif.view.forms.AddGameFormViewModel',
        'Enif.view.forms.AddGameFormViewController',
        'Ext.field.Date',
        'Ext.picker.Date',
        'Ext.form.FieldSet',
        'Ext.field.ComboBox',
        'Ext.Toast'
    ],

    controller: 'forms.addgameform',
    viewModel: {
        type: 'forms.addgameform'
    },
    itemId: 'addForm',
    maxWidth: 600,
    header: false,
    titleAlign: 'center',
    defaultListenerScope: true,

    items: [
        {
            xtype: 'datefield',
            id: 'timestampPicker',
            name: 'timestamp',
            margin: 10,
            label: 'Date of match',
            value: new Date(),
            picker: {
                xtype: 'datepicker',
                title: 'My Panel'
            }
        },
        {
            xtype: 'fieldset',
            id: 'players_fieldset',
            layout: 'hbox',
            items: [
                {
                    xtype: 'combobox',
                    flex: 1,
                    itemId: 'mycombobox',
                    name: 'playerWhite',
                    margin: '0 10 0 0',
                    modelValidation: true,
                    label: 'White Player',
                    editable: false,
                    displayField: 'name',
                    store: 'PlayerData',
                    valueField: 'uid',
                    queryMode: 'local',
                    listeners: {
                        change: 'onMycomboboxChange'
                    }
                },
                {
                    xtype: 'combobox',
                    flex: 1,
                    itemId: 'mycombobox1',
                    name: 'playerBlack',
                    margin: '0 0 0 10',
                    modelValidation: true,
                    label: 'Black Player',
                    editable: false,
                    displayField: 'name',
                    store: 'PlayerData',
                    valueField: 'uid',
                    queryMode: 'local',
                    listeners: {
                        change: 'onMycombobox1Change'
                    }
                }
            ]
        },
        {
            xtype: 'fieldset',
            layout: 'hbox',
            items: [
                {
                    xtype: 'combobox',
                    flex: 1,
                    id: 'wonCombo',
                    name: 'result',
                    margin: '0 10 0 0',
                    label: 'Won',
                    value: 'white',
                    editable: false,
                    displayField: 'text',
                    options: [
                        {
                            text: 'White',
                            value: 'white'
                        },
                        {
                            text: 'Black',
                            value: 'black'
                        },
                        {
                            text: 'Draw',
                            value: 'draw'
                        }
                    ],
                    valueField: 'value'
                },
                {
                    xtype: 'combobox',
                    flex: 1,
                    name: 'timeout',
                    margin: '0 0 0 10',
                    label: 'Run out of time',
                    labelMinWidth: 120,
                    value: false,
                    editable: false,
                    options: [
                        {
                            text: 'No',
                            value: false
                        },
                        {
                            text: 'Yes',
                            value: true
                        }
                    ],
                    valueField: 'value'
                }
            ]
        }
    ],

    onMycomboboxChange: function(combobox, newValue, oldValue, eOpts) {
        this.comboChange();
    },

    onMycombobox1Change: function(combobox, newValue, oldValue, eOpts) {
        this.comboChange();
    },

    comboChange: function() {
        let whiteName = Ext.first('combobox[name=playerWhite]').getSelection();
        let blackName = Ext.first('combobox[name=playerBlack]').getSelection();

        whiteName = whiteName ? whiteName.get('name') : "";
        blackName = blackName ? blackName.get('name') : "";



        Ext.first('#wonCombo').setOptions([
            {
                text: whiteName + " (White)",
                value: 'white'
            },
            {
                text: blackName + " (Black)",
                value: 'black'
            },
            {
                text: "Draw",
                value: 'draw'
            }
        ]);
    }

});