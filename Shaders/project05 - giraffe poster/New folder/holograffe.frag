#version 400

in float gLightIntensity;

void
main( )
{	
	gl_FragColor = vec4( gLightIntensity * vec3(0., 0.730 * 100., 0.844* 100.), 1. );
}