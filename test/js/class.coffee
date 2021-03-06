{collect} = require '../..'
{expect} = require 'chai'

describe 'class', ->
  it 'define', ->
    result = collect [
      { path: 'simple.js', file: 'simple.js', data: """
/**
 * A simple class
 *
 * Lorem ipsum dolor sit amet
 * @class
 */
function Simple() {
}
""" }
    ]
    expect(result.classes).to.have.length 1
    expect(result.classes[0].description).to.be.eql
      summary: '<p>A simple class</p>\n'
      body: '<p>Lorem ipsum dolor sit amet</p>\n'
      full: '<p>A simple class</p>\n<p>Lorem ipsum dolor sit amet</p>\n'

  it 'instance method', ->
    result = collect [
      { path: 'simple.js', file: 'simple.js', data: """
/**
 * A simple class
 * @class
 */
function Simple() {
}

/**
 * Say hello
 *
 * Lorem ipsum dolor sit amet
 */
Simple.prototype.hello = function (msg) {
};
""" }
    ]
    expect(result.classes).to.have.length 1
    expect(result.classes[0].properties).to.have.length 1
    expect(result.classes[0].properties[0].description).to.be.eql
      summary: '<p>Say hello</p>\n'
      body: '<p>Lorem ipsum dolor sit amet</p>\n'
      full: '<p>Say hello</p>\n<p>Lorem ipsum dolor sit amet</p>\n'
    expect(result.classes[0].properties[0].static).to.be.eql false
    expect(result.classes[0].properties[0].ctx).to.be.eql
      type: 'method'
      name: 'hello'
      fullname: 'Simple::hello'

  it 'instance property', ->
    result = collect [
      { path: 'simple.js', file: 'simple.js', data: """
/**
 * A simple class
 * @class
 */
function Simple() {
}

/** 
 * Module name
 *
 * Lorem ipsum dolor sit amet
 */
Simple.prototype.name = 'default';
""" }
    ]
    expect(result.classes).to.have.length 1
    expect(result.classes[0].properties).to.have.length 1
    expect(result.classes[0].properties[0].description).to.be.eql
      summary: '<p>Module name</p>\n'
      body: '<p>Lorem ipsum dolor sit amet</p>\n'
      full: '<p>Module name</p>\n<p>Lorem ipsum dolor sit amet</p>\n'
    expect(result.classes[0].properties[0].static).to.be.eql false
    expect(result.classes[0].properties[0].ctx).to.be.eql
      type: 'property'
      name: 'name'
      fullname: 'Simple::name'

  it 'class method', ->
    result = collect [
      { path: 'simple.js', file: 'simple.js', data: """
/**
 * A simple class
 * @class
 */
function Simple() {
}

/**
 * Create an instance
 *
 * Lorem ipsum dolor sit amet
 */
Simple.create = function (name) {
};
""" }
    ]
    expect(result.classes).to.have.length 1
    expect(result.classes[0].properties).to.have.length 1
    expect(result.classes[0].properties[0].description).to.be.eql
      summary: '<p>Create an instance</p>\n'
      body: '<p>Lorem ipsum dolor sit amet</p>\n'
      full: '<p>Create an instance</p>\n<p>Lorem ipsum dolor sit amet</p>\n'
    expect(result.classes[0].properties[0].static).to.be.eql true
    expect(result.classes[0].properties[0].ctx).to.be.eql
      type: 'method'
      name: 'create'
      fullname: 'Simple.create'

  it 'class property', ->
    result = collect [
      { path: 'simple.js', file: 'simple.js', data: """
/**
 * A simple class
 * @class
 */
function Simple() {
}

/**
 * Default name
 *
 * Lorem ipsum dolor sit amet
 */
Simple.default_name = 'default';
""" }
    ]
    expect(result.classes).to.have.length 1
    expect(result.classes[0].properties).to.have.length 1
    expect(result.classes[0].properties[0].description).to.be.eql
      summary: '<p>Default name</p>\n'
      body: '<p>Lorem ipsum dolor sit amet</p>\n'
      full: '<p>Default name</p>\n<p>Lorem ipsum dolor sit amet</p>\n'
    expect(result.classes[0].properties[0].static).to.be.eql true
    expect(result.classes[0].properties[0].ctx).to.be.eql
      type: 'property'
      name: 'default_name'
      fullname: 'Simple.default_name'

  it 'constructor', ->
    result = collect [
      { path: 'simple.js', file: 'simple.js', data: """
/**
 * A simple class
 * @class
 * @param {String} msg Message
 */
function Simple(msg) {
}
""" }
    ]
    expect(result.classes).to.have.length 1
    expect(result.classes[0].params).to.have.length 1
    expect(result.classes[0].params[0]).to.be.eql
      type: 'param'
      types: ['String']
      name: 'msg'
      description: 'Message'
    expect(result.classes[0].properties).to.have.length 0
