// Generated by CoffeeScript 1.7.1
(function() {
  var Renderer, fs, jade, markdown, render, resolve;

  fs = require('fs');

  jade = require('jade');

  markdown = require('marked');

  resolve = require('path').resolve;

  Renderer = (function() {
    function Renderer(result, options) {
      var content, e, external_types, theme, type, url;
      this.result = result;
      this.options = options;
      this.output_dir = resolve(options.project_dir, options.output || 'doc');
      theme = 'default';
      this.resources_dir = resolve(__dirname, '../themes', theme, 'resources');
      this.templates_dir = resolve(__dirname, '../themes', theme, 'templates');
      this.types = {
        Object: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object',
        Boolean: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean',
        String: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String',
        Array: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array',
        Number: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number',
        Date: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date',
        Function: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function',
        RegExp: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp',
        Error: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error',
        undefined: 'https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/undefined'
      };
      if (external_types = options['external-types']) {
        if (typeof external_types === 'string') {
          try {
            content = fs.readFileSync(external_types, 'utf-8').trim();
            try {
              external_types = JSON.parse(content);
            } catch (_error) {
              e = _error;
              console.log("external-types: Invalid JSON file");
            }
          } catch (_error) {
            e = _error;
            console.log("external-types: Cannot open " + options['external-types']);
          }
        }
        if (typeof external_types === 'object') {
          for (type in external_types) {
            url = external_types[type];
            this.types[type] = url;
          }
        }
      }
    }

    Renderer.prototype.makeMissingLink = function(type, place) {
      var txt;
      if (place == null) {
        place = '';
      }
      txt = this.result.ids[type] ? "'" + type + "' link is ambiguous" : "'" + type + "' link does not exist";
      console.log(txt + (" " + place));
      return "<span class='missing-link'>" + type + "</span>";
    };

    Renderer.prototype.makeTypeLink = function(rel_path, type, place) {
      var getlink, res;
      if (place == null) {
        place = '';
      }
      if (!type) {
        return type;
      }
      getlink = (function(_this) {
        return function(type) {
          var filename, html_id, link;
          if (_this.types[type]) {
            link = _this.types[type];
          } else if (_this.result.ids[type] && _this.result.ids[type] !== 'DUPLICATED ENTRY') {
            filename = _this.result.ids[type].filename + '.html';
            html_id = _this.result.ids[type].html_id;
            link = "" + rel_path + filename + "#" + html_id;
          } else {
            return _this.makeMissingLink(type, place);
          }
          return "<a href='" + link + "'>" + type + "</a>";
        };
      })(this);
      if (res = type.match(/\[(.*)\]\((.*)\)/)) {
        this.types[res[1]] = res[2];
        return "<a href='" + res[2] + "'>" + res[1] + "</a>";
      }
      if (res = type.match(/(.*?)<(.*)>/)) {
        return "" + (this.makeTypeLink(rel_path, res[1])) + "&lt;" + (this.makeTypeLink(rel_path, res[2])) + "&gt;";
      } else {
        return getlink(type);
      }
    };

    Renderer.prototype.makeSeeLink = function(rel_path, str) {
      var filename, html_id;
      if (this.result.ids[str]) {
        filename = this.result.ids[str].filename + '.html';
        html_id = this.result.ids[str].html_id;
        str = "<a href='" + rel_path + filename + "#" + html_id + "'>" + str + "</a>";
      }
      return str;
    };

    Renderer.prototype.convertLink = function(rel_path, str) {
      if (!str) {
        return '';
      }
      str = str.replace(/\[\[#([^\[\]]+)\]\]/g, (function(_this) {
        return function(_, $1) {
          var filename, html_id;
          if (_this.result.ids[$1] && _this.result.ids[$1] !== 'DUPLICATED ENTRY') {
            filename = _this.result.ids[$1].filename + '.html';
            html_id = _this.result.ids[$1].html_id;
            return "<a href='" + rel_path + filename + "#" + html_id + "'>" + $1 + "</a>";
          } else {
            return _this.makeMissingLink($1);
          }
        };
      })(this));
      return str;
    };

    Renderer.prototype.copyResources = function(source, target, callback) {
      var exec;
      exec = require('child_process').exec;
      return exec("rm -rf " + target + "/* ; mkdir -p " + target + " ; cp -a " + source + "/* " + target, function() {
        return callback();
      });
    };

    Renderer.prototype.renderOne = function(jade_options, template, output) {
      jade_options.result = this.result;
      if (!jade_options.makeTypeLink) {
        jade_options.makeTypeLink = this.makeTypeLink.bind(this);
      }
      jade_options.makeSeeLink = this.makeSeeLink.bind(this);
      jade_options.convertLink = this.convertLink.bind(this);
      jade_options.github = this.options.github;
      jade_options.cache = true;
      return jade.renderFile("" + this.templates_dir + "/" + template + ".jade", jade_options, (function(_this) {
        return function(error, result) {
          var output_file;
          if (error) {
            return console.error(error.stack);
          }
          output_file = "" + _this.output_dir + "/" + output + ".html";
          return fs.writeFile(output_file, result, function(error) {
            if (error) {
              return console.error('failed to create ' + output_file);
            }
            if (!_this.options.quite) {
              return console.log(output_file + ' is created');
            }
          });
        };
      })(this));
    };

    Renderer.prototype.renderReadme = function() {
      return fs.readFile("" + (this.options.readme || this.options.project_dir) + "/README.md", 'utf-8', (function(_this) {
        return function(error, content) {
          var jade_options;
          if (content) {
            content = markdown(content);
          }
          jade_options = {
            rel_path: './',
            name: 'README',
            content: content,
            type: 'home'
          };
          return _this.renderOne(jade_options, 'extra', 'index');
        };
      })(this));
    };

    Renderer.prototype.renderGuides = function() {
      if (this.result.guides.length === 0) {
        return;
      }
      try {
        fs.mkdirSync("" + this.output_dir + "/guides");
      } catch (_error) {}
      return this.result.guides.forEach((function(_this) {
        return function(guide) {
          var content, jade_options;
          content = guide.content;
          if (content) {
            content = markdown(content);
          }
          jade_options = {
            rel_path: '../',
            name: guide.name,
            content: content,
            type: 'guides'
          };
          return _this.renderOne(jade_options, 'extra', guide.filename);
        };
      })(this));
    };

    Renderer.prototype.renderPages = function() {
      var jade_options;
      if (this.result.pages.length > 0) {
        jade_options = {
          rel_path: './',
          name: 'Pages',
          type: 'pages'
        };
        return this.renderOne(jade_options, 'pages', 'pages');
      }
    };

    Renderer.prototype.renderRESTApis = function() {
      var jade_options;
      if (this.result.restapis.length > 0) {
        jade_options = {
          rel_path: './',
          name: 'REST APIs',
          type: 'restapis'
        };
        return this.renderOne(jade_options, 'restapis', 'restapis');
      }
    };

    Renderer.prototype.renderClasses = function() {
      if (this.result.classes.length === 0) {
        return;
      }
      try {
        fs.mkdirSync("" + this.output_dir + "/classes");
      } catch (_error) {}
      return this.result.classes.forEach((function(_this) {
        return function(klass) {
          var jade_options, properties;
          properties = klass.properties.sort(function(a, b) {
            if (a.ctx.name < b.ctx.name) {
              return -1;
            } else {
              return 1;
            }
          });
          jade_options = {
            rel_path: '../',
            name: klass.ctx.name,
            klass: klass,
            properties: properties,
            type: 'classes',
            makeTypeLink: function(path, type) {
              return _this.makeTypeLink(path, type, "(in " + klass.defined_in + ")");
            }
          };
          return _this.renderOne(jade_options, 'class', klass.filename);
        };
      })(this));
    };

    Renderer.prototype.renderModules = function() {
      if (this.result.modules.length === 0) {
        return;
      }
      try {
        fs.mkdirSync("" + this.output_dir + "/modules");
      } catch (_error) {}
      return this.result.modules.forEach((function(_this) {
        return function(module) {
          var jade_options, properties;
          properties = module.properties.sort(function(a, b) {
            if (a.ctx.name < b.ctx.name) {
              return -1;
            } else {
              return 1;
            }
          });
          jade_options = {
            rel_path: '../',
            name: module.ctx.name,
            module_data: module,
            properties: properties,
            type: 'modules'
          };
          return _this.renderOne(jade_options, 'module', module.filename);
        };
      })(this));
    };

    Renderer.prototype.renderFeatures = function() {
      if (this.result.features.length === 0) {
        return;
      }
      try {
        fs.mkdirSync("" + this.output_dir + "/features");
      } catch (_error) {}
      return this.result.features.forEach((function(_this) {
        return function(feature) {
          var jade_options;
          jade_options = {
            rel_path: '../',
            name: feature.name,
            feature: feature,
            type: 'features'
          };
          return _this.renderOne(jade_options, 'feature', feature.filename);
        };
      })(this));
    };

    Renderer.prototype.renderFiles = function() {
      if (this.result.files.length === 0) {
        return;
      }
      try {
        fs.mkdirSync("" + this.output_dir + "/files");
      } catch (_error) {}
      return this.result.files.forEach((function(_this) {
        return function(file) {
          var jade_options;
          jade_options = {
            rel_path: '../',
            name: file.name,
            file: file,
            type: 'files'
          };
          return _this.renderOne(jade_options, 'file', file.filename);
        };
      })(this));
    };

    Renderer.prototype.run = function() {
      return this.copyResources(this.resources_dir, this.output_dir, (function(_this) {
        return function() {
          _this.renderReadme();
          _this.renderGuides();
          _this.renderPages();
          _this.renderRESTApis();
          _this.renderClasses();
          _this.renderModules();
          _this.renderFeatures();
          return _this.renderFiles();
        };
      })(this));
    };

    return Renderer;

  })();

  render = function(result, options) {
    var renderer;
    renderer = new Renderer(result, options);
    return renderer.run();
  };

  module.exports = render;

}).call(this);