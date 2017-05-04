/*
 * File: app/store/WinsByColor.js
 *
 * This file was generated by Sencha Architect version 4.2.0.
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
    This store data are calculated in the PlayerData store
*/
Ext.define('Enif.store.WinsByColor', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.data.field.String',
        'Ext.data.field.Integer'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'WinsByColor',
            fields: [
                {
                    type: 'string',
                    name: 'color'
                },
                {
                    type: 'int',
                    name: 'wins'
                }
            ]
        }, cfg)]);
    }
});