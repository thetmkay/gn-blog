module.exports = function(grunt) {

//	require('load-grunt-tasks')(grunt);

	require('load-grunt-subtasks')(grunt,{
			base:['./..', './node_modules']
	});

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            dev: {
				src:'env.json',
                NODE_ENV: 'development'
            },
            prod: {
				src:'env.json',
                NODE_ENV: 'production'
            }
        },
        watch: {
            server: {
                files: ['*.js', 'json/*.json']
            },
            compass: {
                files: ['src/scss/*.scss', 'src/scss/_*.scss'],
                tasks: ['compass']
            }      
        },
        nodemon: {
            all: {
                script: 'server.js'
            }
        },
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            prod: {
                tasks: ['nodemon', 'watch']
            }
        },
        compass: {
            all: {
                options: {
                    sassDir: 'src/scss',
                    cssDir: 'public/css',
                }
            }
        }
    });

    grunt.registerTask('build', [ 'compass']);
    grunt.registerTask('default', ['env:dev', 'build', 'concurrent:dev']);
    grunt.registerTask('production', ['env:prod', 'build', 'concurrent:prod']);
    grunt.registerTask('sub:build', ['build']);
    grunt.registerTask('sub:watch', ['watch:compass']);

}
