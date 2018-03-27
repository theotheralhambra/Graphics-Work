#version 330
in float gLightIntensity;


void
main( )
{
	gl_FragColor = vec4(  gLightIntensity*vec3(0., 1., 0.), 1.  );
}
