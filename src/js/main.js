import Vue from '../../bower_components/vue/dist/vue';

class XComponent{
  constructor(el, type){
    if(elements){
      this._el = elements.filter(obj =>{
        return obj.elname === el && obj.type === type;
      })[0]
    }
  }
}

class XField extends XComponent{
  notValid(_hint){
    this._report.clear()
    this._report.set('state', false)
    this._report.set('hint', _hint)
  }

  get report(){
    return this._report
  }

  get formElement(){
    return this._formElement
  }
}

class XPass extends XField{
  constructor(el){
    super(el, 'xpass')
  }

  validate(comp){

    this._report = new Map()//report Map

    this._el.rules.forEach(rule =>{
      switch (rule.rule){
        case '8char': comp.text.length < 8  && this.notValid(rule.warn)
          break
        case 'is_match' : !comp.text.match(`${rule.exp}`) && this.notValid(rule.warn)
          break
        case 'notempty' : comp.text === '' && this.notValid(rule.warn)
          break
        case 'compare' : this.compare(comp, rule)
          break
      }
        
    })
    this._report.size == 0 ? this._report.set('state', true) : this._report
  }

  compare(_comp, _rule){

    this._link = _comp.$parent.$children.find(e=>{return e.elname === _rule.link})

    if(_rule.roll == 'parent'){
      if(this._link.text == _comp.text){
        this._link.state = true
        this._link.hint = ''
      }else{
        this._link.state = false;
        this._link.hint = _rule.warn
      }
    }else{
      this._link.text != _comp.text && this.notValid(_rule.warn)
    }
  }
}

class XMail extends XField{
  constructor(el){
    super(el, 'xmail')
  }

  validate(comp){

    this._report = new Map()//report Map

    this._el.rules.forEach(rule =>{
      switch (rule.rule){
        case 'is_valid' : !comp.text.match("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$") && this.notValid(rule.warn)
          break
        case 'is_not_empty' : comp.text === '' && this.notValid(rule.warn)
          break
      }
        
    })
    this._report.size == 0 ? this._report.set('state', true) : this._report
  }
}

class XNumber extends XField{
  constructor(el){
    super(el, 'xnumber')
  }

  validate(comp){

    this._report = new Map()//report Map

    this._el.rules.forEach(rule =>{
      switch (rule.rule){
        case 'is_valid' : !comp.text.match("^([0-9\(\)\/\+ \-]*)$") && this.notValid(rule.warn)
          break
        case 'is_not_empty' : comp.text === '' && this.notValid(rule.warn)
          break
      }
        
    })
    this._report.size == 0 ? this._report.set('state', true) : this._report
  }
}

class XCustomeField extends XField{
  constructor(el){
    super(el, 'xcustome')
  }
  validate(comp){

    this._report = new Map()//report Map

    this._el.rules.forEach(rule =>{
      switch (rule.rule){
        case 'is_match' : !comp.text.match(`${rule.exp}`) && this.notValid(rule.warn)
          break
        case 'is_not_empty' : comp.text === '' && this.notValid(rule.warn)
          break
      }
        
    })
    this._report.size == 0 ? this._report.set('state', true) : this._report
  }
}

class XSelect extends XField{
  constructor(el){
    super(el, 'xselect')
  }
  validate(comp){

    this._report = new Map()//report Map

    this._el.rules.forEach(rule =>{
      switch (rule.rule){
        case 'is_match' : !comp.text.match(`${rule.exp}`) && this.notValid(rule.warn)
          break
        case 'is_not_empty' : comp.text === '' && this.notValid(rule.warn)
          break
      }
        
    })
    this._report.size == 0 ? this._report.set('state', true) : this._report
  }

  getItems(){
    return this._el.items;
  }
}

// }
//////////////////////{{  VUE PART  }}//////////////////////

Vue.component('x-button', {
  name: 'xbutton',
  template:
 `<button :class="[xclass, 'xbutton']" @click.prevent="click" @dblclick="dblclick">
    <slot></slot>
  </button>`,
  props: {
    elname: String,
    xclass: String,
  },
  data: function(){
    return {
      elObject: ''
    }
  },
  methods:{
    click: function(){
      this.elObject.methods.click && this.elObject.el.methods.click()
    },
    dblclick: function(){
      this.elObject.methods.dblclick && this.elObject.el.methods.dblclick()
    }
  },
  created: function(){
    this.elObject = new XComponent(this.elname, 'xbutton')
  }
})

//
//  XGROUP
//

Vue.component('x-group', {
  name: 'xgroup',
  template:
  `<div class="container">
    <slot></slot>
  </div>`,
})

//
//  XFORM
//

Vue.component('x-form', {
  name: 'xform',
  template: 
 `<form action="action" method="post">
    <slot></slot>
    <div :class="[valid ? xclass : 'faded', 'xbutton']" active="true" @click="submit">
      {{value}}
    </div>
  </form>`,
  props:{
    xclass: String,
    elname: String,
    action: String,
    value: String,
    method: {
      default: 'post',
      type: String
    },
  },
  data: function(){
    return {
      elObject: '',
      active: Boolean,
      valid: false
    }
  },
  methods: {
    getValidationReports: function(){
      this.valid = true
      this.$children.forEach(el =>{
        if(el.elObject._el && el.elObject._el.rules){//filter only the elements that have rules
          if(!el.state){//filter only the elements that the report 'false'
            this.valid = false
          }
        }
      })
      return this.valid
    },
    submit: function(){
      this.getValidationReports() && this.$el.submit()
    }
  },
  created: function(){
    this.elObject = new XComponent(this.elname, 'xform')
  }
})

//
//  XPASSWORD
//

Vue.component('x-pass', {
  template:
 `<div :class="[state.toString() && 'field-indicator', (state.toString() && state) && 'field-indicator-valid', 'field']">
    <div :class="[state.toString() && 'msg-on',state && 'msg-off', 'msg']">
      {{hint && hint}}
    </div>
    <input type="password" :placeholder="placeholder" v-model="text"/>
  </div>`,
  props:{
    elname: String,
    placeholder: String
  },
  data: function(){
    return {
      text: '',
      elObject: '',
      state: '',
      hint: '',
      listner: '',
    }
  },
  watch: {
    text: function(){
      this.elObject.validate(this)
      this.state = this.elObject.report.get('state')
      this.hint = this.elObject.report.get('hint')
    },
    state: function(){
      this.$parent.$el.localName === 'form' && this.$parent.getValidationReports()
    }
  },
  created: function(){
    this.elObject = new XPass(this.elname)
  }
})

//
// XMAIL
//

Vue.component('x-mail', {
  template:
 `<div :class="[state.toString() && 'field-indicator', (state.toString() && state) && 'field-indicator-valid', 'field']">
    <div :class="[state.toString() && 'msg-on',state && 'msg-off', 'msg']">
      {{hint && hint}}
    </div>
    <input :placeholder="placeholder" v-model="text"/>
  </div>`,
  props:{
    elname: String,
    placeholder: String
  },
  data: function(){
    return {
      text: '',
      elObject: '',
      state: '',
      hint: '',
      listner: '',
    }
  },
  watch: {
    text: function(){
      this.elObject.validate(this)
      this.state = this.elObject.report.get('state')
      this.hint = this.elObject.report.get('hint')
    },
    state: function(){
      this.$parent.$el.localName === 'form' && this.$parent.getValidationReports()
    }
  },
  created: function(){
    this.elObject = new XMail(this.elname)
  }
})

//
// XNUMBER
//

Vue.component('x-number', {
  template:
 `<div :class="[state.toString() && 'field-indicator', (state.toString() && state) && 'field-indicator-valid', 'field']">
    <div :class="[state.toString() && 'msg-on',state && 'msg-off', 'msg']">
      {{hint && hint}}
    </div>
    <input :placeholder="placeholder" v-model="text"/>
  </div>`,
  props:{
    elname: String,
    placeholder: String
  },
  data: function(){
    return {
      text: '',
      elObject: '',
      state: '',
      hint: '',
      listner: '',
    }
  },
  watch: {
    text: function(){
      this.elObject.validate(this)
      this.state = this.elObject.report.get('state')
      this.hint = this.elObject.report.get('hint')
    },
    state: function(){
      this.$parent.$el.localName === 'form' && this.$parent.getValidationReports()
    }
  },
  created: function(){
    this.elObject = new XNumber(this.elname)
  }
})
//
// XCUSTOMEFIELD
//

Vue.component('x-custome', {
  template:
 `<div :class="[state.toString() && 'field-indicator', (state.toString() && state) && 'field-indicator-valid', 'field']">
    <div :class="[state.toString() && 'msg-on',state && 'msg-off', 'msg']">
      {{hint && hint}}
    </div>
    <input :placeholder="placeholder" v-model="text"/>
  </div>`,
  props:{
    elname: String,
    placeholder: String
  },
  data: function(){
    return {
      text: '',
      elObject: '',
      state: '',
      hint: '',
      listner: '',
    }
  },
  watch: {
    text: function(){
      this.elObject.validate(this)
      this.state = this.elObject.report.get('state')
      this.hint = this.elObject.report.get('hint')
    },
    state: function(){
      this.$parent.$el.localName === 'form' && this.$parent.getValidationReports()
    }
  },
  created: function(){
    this.elObject = new XCustomeField(this.elname)
  }
})

//
// XSELECT
//

Vue.component('x-select', {
  template:
 `<div :class="[state.toString() && 'field-indicator', (state.toString() && state) && 'field-indicator-valid', 'field']">
    <div :class="[state.toString() && 'msg-on',state && 'msg-off', 'msg']">
      {{hint && hint}}
    </div>
    <input list="browsers" :placeholder="placeholder" v-model="text">
      <datalist id="browsers">
          <option v-for="item in items" :value="item.value">{{item.extra}}</option>
      </datalist>
    </input>
  </div>`,
  props:{
    elname: String,
    placeholder: String
  },
  data: function(){
    return {
      text: '',
      elObject: '',
      state: '',
      hint: '',
      listner: '',
      items: '',
    }
  },
  watch: {
    text: function(){
      this.elObject.validate(this)
      this.state = this.elObject.report.get('state')
      this.hint = this.elObject.report.get('hint')
    },
    state: function(){
      this.$parent.$el.localName === 'form' && this.$parent.getValidationReports()
    }
  },
  created: function(){
    this.elObject = new XSelect(this.elname)
    this.items = this.elObject.getItems();
  }
})

//
// DROP DOWN
//

Vue.component('x-dropdown', {
  template: `<div class="xdropdown"><div class="xdropdown-item-container"></div><slot></slot></div>`,
})

//
// DROP DOWN(item)
//

Vue.component('x-item', {
  template: `<div class="xitem"><slot></slot></div>`,
})


//
// DROP DOWN TREE(item)
//

Vue.component('item', {
  name: 'item',
  template:
 `<li>
    <div id="item">
      <div class="head" @click="toggle">
        <span :class="[model.children ? ['parent',[open ? 'arrow-down' : 'arrow-right']] : 'child']" v-html="model.template"></span>
      </div>
      <transition name="slide-fade">
        <ul v-show="open" v-if="isFolder">
          <item v-for="child in model.children" :model="child"></item>
        </ul>
      </transition>
    </div>
  </li>`,
  props: {
    model: Object
  },
  data: function () {
    return {
      open: true,
      active: true
    }
  },
  methods:{
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
    }
  }
})

//
// DROP DOWN TREE
//

Vue.component('dropdown', {
  name: 'dropdown',
  template:
 `<div id="dropdown">
    <ul>
      <item :model="object"></item>
    </ul>
  </div>`,
  props:{
    model: String
  },
  data: function () {
    return {
      open: false,
      object: ''
    }
  },
  methods:{
    togleOpen: function(){
      console.log('click')
      this.open = (this.open ? false : true)
    }
  },
  created(){
    this.object = JSON.parse(this.model)
  }
})

//////////////////////{{  DEVETOOLS STYLES  }}//////////////////////

let style={
  l:'font-size: 25px;color: #ffeb3b;',
  t:'color: #2196f3;font-size: 25px;',
  mod:'color: #aaa;font-size: 20px;'
}

//////////////////////{{  MAIN VUE INSTANCE  }}//////////////////////

new Vue({
  el: '#container',
  created(){
     console.log('%c<%cx-components%c>\n%cDevelopment Mode', style.l,style.t,style.l,style.mod)
     console.log('Find more about x-components https://x-components.org')
  }
})