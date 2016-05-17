define(["dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/form/DateTextBox",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "dojo/text!application/AComboBoxWidget/templates/AComboBoxWidget.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, DateTextBox, 
        Deferred, all, 
        query,
        AComboBox, 
        domClass, domAttr, domStyle, domConstruct, event
    ) {
    var Widget = declare("esri.dijit.AComboBox", [_WidgetBase, _TemplatedMixin], {
        // defaults
        templateString: AComboBox,

        options: {
            visible: true,
            selectedIndex: 0,
            expanded: false
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.set("ComboItems", defaults.items);
            this.set("SelectedIndex", defaults.selectedIndex);
            this.domNode = srcRefNode;
            this.set('expanded', defaults.expanded);
        },

        startup: function () {
            this._init();
        },

        _init: function () {
//             this.inputControl.onfocus = lang.hitch(this, function() { 
//                 this._expandCombo(false);
//             });
            this.inputControl.onblur = lang.hitch(this, function() { 
                this._expandCombo(true);
            });
            this.ListItems.innerHTML= '';
            for(var i=0; i<this.ComboItems.length; i++) {
                var item = this.ComboItems[i];
                var itemId = this.id+'_listbox__option__'+i;

                var li = domConstruct.create("li", {
                    id: itemId,
                    role:"option",
                    tabindex: 0,
                    value: item.value,
                    'data-index':i,
                    innerHTML: item.name,
                    class: (i === this.SelectedIndex) ? 'selected' : '',
                    'aria-selected': (i === this.SelectedIndex) ? 'true' : 'false',
                });
                on(li, 'click', lang.hitch(this, this.selectItem));
                
                domConstruct.place(li, this.ListItems);

                // this.ListItems.innerHTML+= '<li role="option" tabindex="-1" aria-selected="'+
                // (i === this.SelectedIndex ? 'true" class="selected' : 'false')+
                // '" id="'+itemId+'" value="'+item.value+'" onclick="this.selectItem(this);" data-index="'+i+'">'+item.name+'</li>';

                if(i === this.SelectedIndex) {
                    this._setSelectedIndex(i);
                }
            }

        },

        selectItem : function(ev) {
            this._setSelectedIndex(ev.currentTarget.dataset.index);
        },

        _setSelectedIndex : function(index) {
            var item = this.ComboItems[index];
            var itemId = this.id+'_listbox__option__'+index;
            this.SelectedIndex = index;
            domAttr.set(this.inputControl, 'aria-activedescendant', itemId);
            domAttr.set(this.inputControl, 'value', item.name);
            this.selectedItem = item.name;
            this.selectedValue = item.value;

            var oldSelectedNode = document.querySelector('#'+this.id+' .selected');
            if(oldSelectedNode) {
                domAttr.set(oldSelectedNode, 'class', '');
                domAttr.set(oldSelectedNode, 'aria-selected', 'false');
            }
            
            var node = document.querySelector('#'+itemId);
            domAttr.set(node, 'class', 'selected');
            domAttr.set(node, 'aria-selected', 'true');
            node.scrollIntoView(false);
            return item;
        },

        expandCombo : function(ev) {
            var display = domStyle.get(this.popup_container,'display') !== 'none';
            this._expandCombo(display);
        },

        _expandCombo : function(expand) {
            domStyle.set(this.popup_container,'display', expand ? 'none' : '');
            domAttr.set(this.inputControl, 'aria-expanded', (!expand)+'');
            this.expanded = expand;
        },

        navigateCombo : function(ev) {
            // console.log('keyDown', ev);
            switch(ev.keyIdentifier) {
                case "Down" :
                    if(this.SelectedIndex < this.ComboItems.length-1) {
                        this._setSelectedIndex(++this.SelectedIndex);
                    }
                    ev.preventDefault = true;
                    break;
                case "Up" :
                    if(this.SelectedIndex > 0) {
                        this._setSelectedIndex(--this.SelectedIndex);
                    }
                    ev.preventDefault = true;
                    break;
                case "Home" :
                    this._setSelectedIndex(0);
                    ev.preventDefault = true;
                    break;
                case "End" :
                    this._setSelectedIndex(this.ComboItems.length-1);
                    ev.preventDefault = true;
                    break;
            }
        },

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.AComboBox", Widget, esriNS);
    }
    return Widget;
});
