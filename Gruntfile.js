'use strict';

var LIVERELOAD_PORT = 35730;
var SERVER_PORT = 9001;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
    var target = grunt.option('target') || '';
    var config = {
        src: 'src',
        dist: 'dist',
        tmp: '.tmp'
    }

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        config: config,
        bake: {
            dist: {
                options: {
                    basePath: '<%= config.src %>/',
                    content: '<%= config.src %>/data/receptes.json',
                    transforms: {
                        join: function(str, joinValue) {
                            return str.join(joinValue);
                        },
                        upper: function(str) {
                            return String(str).toUpperCase();
                        },
                        capitalize: function(str) {
                            return String(str).charAt(0).toUpperCase() + String(str).slice(1);
                        },
                        slugify: function(str) {
                            const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
                            const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
                            const p = new RegExp(a.split('').join('|'), 'g')

                            return str.toString().toLowerCase()
                                .replace(/\s+/g, '-')           // Replace spaces with -
                                .replace(p, c =>
                                    b.charAt(a.indexOf(c)))     // Replace special chars
                                .replace(/&/g, '-and-')         // Replace & with 'and'
                                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                                .replace(/^-+/, '')             // Trim - from start of text
                                .replace(/-+$/, '')             // Trim - from end of text
                        }
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.src %>/',
                    src: [
                        '{,*/,**/}*.html',
                        '!includes/{,*/,**/}*.html'
                    ],
                    dest: '<%= config.dist %>/'
                }]
            }
        },
        clean: {
            dist: [
                '<%= config.tmp %>/',
                '<%= config.dist %>/'
            ]
        },
        connect: {
            options: {
                port: grunt.option('port') || SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                // hostname: 'localhost',
                hostname: '0.0.0.0',
                livereload: LIVERELOAD_PORT
            },
            livereload: {
                options: {
                    //keepalive: true,
                    base: [config.dist],
                    open: {
                        target: 'http://localhost:<%= connect.options.port %>'
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, config.dist)
                        ];
                    }
                }
            }
        },
        copy: {
            scripts: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.src %>/scripts/',
                        src: [
                            '{,*/,**/}*.js'
                        ],
                        dest: '<%= config.dist %>/scripts/'
                    }
                ]
            },
            styles: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.tmp %>/styles/',
                        src: [
                            '{,*/,**/}*.css'
                        ],
                        dest: '<%= config.dist %>/styles/'
                    }
                ]
            }
        },
        stylus: {
            compile: {
                options: {
                    sourcemap: {
                        inline: true
                    },
                    compress: false,
                    'include css': true
                },
                files: {
                    '<%= config.tmp %>/styles/main.css': '<%= config.src %>/styles/main.styl'
                }
            }
        },
        postcss: {
            options: {
                map: true, // inline sourcemaps
                sourcesContent: true,
                processors: [
                    // require('postcssfixer')({browsers: 'last 2 versions'}) // add vendor prefixes
                    require("autoprefixer")({
                        browsers: ["> 0%", "ie 8-10", "Android >= 2.3"]
                    }) // add vendor prefixes
                ]
            },
            dist: {
                src: "<%= config.tmp %>/styles/main.css"
            }
        },
        prompt: {
            target: {
                options: {
                    questions: [
                        {
                            config: 'what-to-do',
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'What do you want to do?',
                            default: 'local', // default value if nothing is entered
                            choices: [
                                {
                                    name: 'Develop in a localhost server [> grunt local]',
                                    value: 'local'
                                },
                                {
                                    name: 'Build app [> grunt build]',
                                    value: 'build'
                                }
                            ]
                        }
                    ]
                }
            }
        },
        watch: {
            options: {
                spawn: false,
                livereload: LIVERELOAD_PORT
            },
            pages: {
                files: [
                    '<%= config.src %>/{,*/,**/}*.html',
                    '<%= config.src %>/data/{,*/,**/}*.json'
                ],
                tasks: [
                    'bake'
                ]
            },
            styles: {
                files: [
                    '<%= config.src %>/styles/{,*/,**/}*.styl'
                ],
                tasks: [
                    'stylus:compile',
                    'postcss',
                    'copy:styles'
                ]
            }
        }
    });

    grunt.registerTask('tasks', function () {
        grunt.task.run([
            'prompt',
            'what-to-do'
        ]);
    });

    grunt.registerTask('what-to-do', function (a, b) {
        grunt.task.run([grunt.config('what-to-do')]);
    });

    grunt.registerTask('default', function(target) {
        grunt.task.run(['tasks']);
    });

    grunt.registerTask('local', function (target) {
        if (typeof target === 'undefined') {
            target = 'local';
        }

        grunt.task.run([
            'clean',
            'stylus:compile',
            'postcss',
            'bake',
            'copy',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('build', function (target) {
        if (typeof target === 'undefined') {
            target = 'build';
        }

        grunt.task.run([

        ]);
    });
};
