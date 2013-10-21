module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
    uglify: {
      options: {
        banner: '<%= banner %>\n'
      },
      build: {
        src: 'src/widget.js',
        dest: 'build/widget.min.js'
      }
    },
    cssmin: {
      options: {
            banner: '<%= banner %>'
      },
      build: {
          src: 'src/widget.css',
          dest: 'build/widget.min.css'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "cssmin" task.
  grunt.loadNpmTasks('grunt-css');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};