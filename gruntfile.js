'use strict';

module.exports = function (grunt) {
  var config = {
    app: '.',
    dist: '.'
  };

  grunt.initConfig({
    config: config,
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['spec/**/*.js']
      }
    },
    concat: {
      release: {
        files: {
          'build/node.js': ['lib/parser.js', 'index.js'],
          'build/web.js': ['lib/parser.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', [
    'concat',
    'mochaTest'
  ]);
};
