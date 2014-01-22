module.exports = function(grunt) {

  var target = "build";
  if(grunt.option('dist')){
    var target = "dist";
  }
  if(grunt.option('test')){
    var target = "tests/widget";
  }

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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-text-replace');

  // Default task(s).
  grunt.registerTask('default', ['replace', 'uglify', 'cssmin']);

};