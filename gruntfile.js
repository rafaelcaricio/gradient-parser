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
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', [
    'mochaTest'
  ]);
};
