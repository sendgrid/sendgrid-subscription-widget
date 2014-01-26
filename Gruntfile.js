module.exports = function(grunt) {
  // Build Location
  var target = "build";
  if(grunt.option('dist')){
    var target = "dist";
  }
  if(grunt.option('test')){
    var target = "tests/widget";
  }

  // Define Sauce Lab Browsers
  var browsers = [{
        browserName: "firefox",
        platform: "Linux"
    }, {
        browserName: "chrome",
        platform: "XP"
    }, {
        browserName: "chrome",
        platform: "linux"
    }, {
        browserName: "internet explorer",
        platform: "Windows 8",
        version: "10"
    }, {
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "9"
    },
    {
        browserName: "internet explorer",
        platform: "Windows XP",
        version: "8"
    }
  ];


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: grunt.file.readJSON('config.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
    target: target,
    subscribeURL: "sendgrid.com/newsletter/addRecipientFromWidget",
    
    replace: {
      build: {
        src: ['src/widget.js'],
        dest: '<%= target %>/',
        replacements: [
          {
            from: 'CSS_URL',
            to: '"<%if (target === "dist") { %><%= config.DISTRIBUTION_CSS %><% }else{ %><%= config.CSS_URL %><% } %>"'
          },
          {
            from: '<%= subscribeURL %>',
            to: '<%if (target === "tests/widget") { %><%= config.TEST_URL %><% }else{ %><%= subscribeURL %><% } %>'
          }
        ]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>\n'
      },
      build: {
        src: '<%= target %>/widget.js',
        dest: '<%= target %>/widget.min.js'
      }
    },
    cssmin: {
      options: {
            banner: '<%= banner %>'
      },
      build: {
          src: 'src/widget.css',
          dest: '<%= target %>/widget.min.css'
      }
    },
    connect: {
      server: {
        options: {
          base: "",
          port: 9999
        }
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ["http://127.0.0.1:9999/tests/index.html"],
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID,
          concurrency: 3,
          browsers: browsers,
          testname: "tests",
          tags: ["master"]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');

  // Default task(s).
  grunt.registerTask('default', ['replace', 'uglify', 'cssmin']);
  grunt.registerTask('cloud-test', ['connect', 'replace', 'uglify', 'cssmin', 'saucelabs-qunit']);

};