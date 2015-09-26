/* jshint node:true */
module.exports = function( grunt ) {
	'use strict';

	grunt.initConfig({
		wget: {
			resources: {
				files: {
					'resources/woothemes-sensei.pot': 'https://raw.githubusercontent.com/woothemes/sensei/master/lang/woothemes-sensei.pot',
				}
			}
		},

		shell: {
			options: {
				stdout: true,
				stderr: true
			},
			txpush: {
				command: 'tx push -s' // push the resources
			},
			txpull: {
				command: 'tx pull -a -f' // pull the .po files
			}
		},

		potomo: {
			options: {
				poDel: false
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'languages/',
					src: ['*.po'],
					dest: 'languages/',
					ext: '.mo',
					nonull: true
				}]
			}
		}
	});

	// Load NPM tasks to be used here
	grunt.loadNpmTasks( 'grunt-shell' );
	grunt.loadNpmTasks( 'grunt-wget' );
	grunt.loadNpmTasks( 'grunt-potomo' );

	// Register tasks
	grunt.registerTask( 'default', function () {
		grunt.log.writeln( "\n ############################################ " );
		grunt.log.writeln( " ###### Sensei Language Pack Generator ###### " );
		grunt.log.writeln( " ############################################ \n" );
		grunt.log.writeln( " # Commands: \n" );
		grunt.log.writeln( " grunt compile    =  Gets the Transifex translations, compiles the .mo files and generates zip files " );
		grunt.log.writeln( " grunt resources  =  Gets the Sensei core .pot files and pushes on Transifex " );
	});

	grunt.registerTask( 'resources', [
		'wget:resources',
		'shell:txpush'
	]);

	grunt.registerTask( 'update_translations', [
		'shell:txpull',
		'potomo'
	]);

	grunt.registerTask( 'compress', function () {
		var fs    = require( 'fs' ),
			files = fs.readdirSync( 'languages/' ),
			done  = this.async();

		files.forEach( function ( file ) {
			var lang = file.replace( /(^woothemes-sensei-)(.+)(.po)/, '$2' );
			if ( lang !== file ) {
				var dest = 'packages/' + lang + '.zip';
				var zip  = new require('node-zip')();
				zip.file( 'woothemes-sensei-' + lang + '.po', fs.readFileSync( 'languages/woothemes-sensei-' + lang + '.po' ) );
				zip.file( 'woothemes-sensei-' + lang + '.mo', fs.readFileSync( 'languages/woothemes-sensei-' + lang + '.mo' ) );

				var data = zip.generate({
					base64: false,
					compression: 'DEFLATE'
				});
				fs.writeFileSync( dest, data, 'binary' );
				grunt.log.writeln( ' -> ' + lang + ': ' + dest + ' file created successfully' );
			}
		});

		done();
	});

	grunt.registerTask( 'compile', [
		'update_translations',
		'compress'
	]);

};
