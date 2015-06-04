module.exports = function(grunt) {
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: {
          'build/math.js': ['src/math.coffee']
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['lib/**/*.js', 'src/**/*.js', 'build/**/*.js'],
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: ['src/*.coffee', 'src/*.js'],
      tasks: ['coffee', 'concat', 'uglify']
    }
  });
  
  // Load the plugins.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  // Default task(s).
  grunt.registerTask('default', ['coffee', 'concat', 'uglify']);

};