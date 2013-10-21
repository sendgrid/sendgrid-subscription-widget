module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: grunt.file.readJSON('config.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
    
    replace: {
      build: {
        src: ['src/widget.js'],
        dest: 'build/',
        replacements: [
          {
            from: 'CSS_URL',
            to: '"<%= config.CSS_URL %>"'
          }
        ]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>\n'
      },
      build: {
        src: 'build/widget.js',
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

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-text-replace');

  // Default task(s).
  grunt.registerTask('default', ['replace', 'uglify', 'cssmin']);

};