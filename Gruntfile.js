module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        appName: 'app', // main angular module
        src: 'extension/src/',
        appSrc: '<%= src %>/**/*.js',
        buildDir: 'extension/build',
        tmp: '.build-cache',
        appBuild: '<%= buildDir %>/<%= pkg.name  %>',
        templateSrc: '<%= src %>/**/*.html',
        templateBuild: '<%= tmp %>/templates.js',
        bowerBuild: '<%= buildDir %>/bower_components.js',

        concat: {
            app: {
                src: [
                    '<%= appSrc %>',
                    '<%= templateBuild %>'
                ],
                dest: '<%= tmp %>/<%= appBuild %>.js'
            },
            bower: {
                src: [
                    'bower_components/angular/angular.js',
                    'bower_components/angular-ui-router/release/angular-ui-router.js',
                ],
                dest: '<%= bowerBuild %>'
            },
            options: {
                stripBanners: true,
            }
        },
        sass: {
            dist: {
                files: {
                    '<%= buildDir %>/<%= pkg.name %>.css': '<%= src %>/app.scss'
                },
                options: {
                    style: 'compressed',
                }
            }
        },
        ngtemplates: {
            app: {
                src: '<%= templateSrc %>',
                dest: '<%= templateBuild %>',
                options: {
                    module: 'app',
                    htmlmin: {
                        collapseBooleanAttributes:      true,
                        collapseWhitespace:             true,
                        removeAttributeQuotes:          true,
                        removeComments:                 true,
                        removeRedundantAttributes:      true,
                        removeScriptTypeAttributes:     true,
                        removeStyleLinkTypeAttributes:  true
                    }
                }
            }
        },
        ngAnnotate: {
            app: {
                files: {
                    '<%= appBuild %>.js': ['<%= tmp %>/<%= appBuild %>.js']
                }
            }
        },
        uglify: {
            options: {
                sourceMap: true,
            },
            app: {
                files: {
                    '<%= appBuild %>.min.js': ['<%= appBuild %>.js']
                }
            }
        },
        watch: {
            app: {
                files: ['<%= appSrc %>'],
                tasks: ['concat:app', 'ngAnnotate', 'uglify']
            },
            bower: {
                files: ['<%= concat.bower.src  %>'],
                tasks: ['concat:bower']
            },
            css: {
                files: ['<%= src %>/**/*.scss'],
                tasks: ['sass']
            },
            html: {
                files: ['<%= templateSrc %>'],
                tasks: ['ngtemplates', 'concat:app', 'uglify']
            }
        },
        clean: ['<%= tmp %>', '<%= buildDir %>']
    });

    require('time-grunt')(grunt);

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['newer:ngtemplates', 'newer:concat',
                       'newer:ngAnnotate', 'newer:uglify', 'sass']);
};
